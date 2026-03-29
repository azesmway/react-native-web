import { useEffect, useRef, useState } from 'react'
import { connect } from 'react-redux'

import CarouselImages from './Carousel'

const mapStateToProps = () => ({})
const mapDispatchToProps = () => ({})

const loadModules = async () => {
  const [store, { withRouter }, { default: ImageLoad }, { Carousel }] = await Promise.all([
    import('app-store-web'),
    import('app-utils-web'),
    import('react-native-image-placeholder'),
    import('react-responsive-carousel')
  ])

  return { store, withRouter, ImageLoad, Carousel }
}

export default function CarouselImagesComponent(props) {
  const [isLoading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const modulesRef = useRef(null)
  const CarouselImagesWithPropsRef = useRef(null)

  useEffect(() => {
    loadModules()
      .then(modules => {
        modulesRef.current = modules
        CarouselImagesWithPropsRef.current = modules.withRouter(connect(mapStateToProps, mapDispatchToProps)(CarouselImages))
        setLoading(false)
      })
      .catch(setError)
  }, [])

  if (error) {
    console.error('CarouselImagesComponent: failed to load modules', error)
    return null
  }

  if (isLoading) return null

  const CarouselImagesWithProps = CarouselImagesWithPropsRef.current

  return <CarouselImagesWithProps {...props} utils={modulesRef.current} />
}
