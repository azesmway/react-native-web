import { useEffect, useRef, useState } from 'react'

import SvgIcon from './SvgIcon'

export default function ViewPlaceComponent(props) {
  const [isLoading, setLoading] = useState(true)
  const module = useRef(undefined)

  const loadModules = async () => {
    const Svg = await import('react-native-svg')
    module.current = {
      ...module.current,
      Svg: Svg.default
    }
  }

  useEffect(() => {
    loadModules().then(() => setLoading(false))
  }, [])

  if (isLoading) {
    return <></>
  }

  return <SvgIcon {...props} utils={module.current} />
}
