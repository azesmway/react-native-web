import { useEffect, useState } from 'react'
import { connect } from 'react-redux'

import ImageView from './ImageView'

const createMapStateToProps = store => state => ({
  imagesView: store.chatSelector.getImagesView(state)
})

const createMapDispatchToProps = store => dispatch => ({
  setImagesView: data => dispatch(store.chatAction.setImagesView(data))
})

let cachedModules = null
let ImageViewWithProps = null

async function loadModules() {
  if (cachedModules) return cachedModules

  const [store, { withRouter, moment }, { default: Lightbox }, { Icon }, { PanoramaView }] = await Promise.all([
    import('app-store-web'),
    import('app-utils-web'),
    import('react-18-image-lightbox/src/react-image-lightbox'),
    import('react-native-elements'),
    import('@lightbase/react-native-panorama-view')
  ])

  cachedModules = { store, withRouter, moment, Lightbox, Icon, PanoramaView }

  ImageViewWithProps = cachedModules.withRouter(connect(createMapStateToProps(store), createMapDispatchToProps(store))(ImageView))

  return cachedModules
}

loadModules().catch(console.error)

export default function ImageViewComponent(props) {
  const [modules, setModules] = useState(cachedModules)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (modules) return

    let cancelled = false

    loadModules()
      .then(mods => {
        if (!cancelled) setModules(mods)
      })
      .catch(err => {
        if (!cancelled) setError(err)
      })

    return () => {
      cancelled = true
    }
  }, [])

  if (error) {
    console.error('ImageViewComponent: failed to load modules', error)
    return null
  }

  if (!modules) return null

  return <ImageViewWithProps {...props} utils={modules} />
}
