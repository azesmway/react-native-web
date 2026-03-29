import { useEffect, useMemo, useRef, useState } from 'react'
import { Dimensions, Platform } from 'react-native'
import { connect } from 'react-redux'

import BackHeader from './back'

export default function LeftHeaderComponent(props) {
  const [isLoading, setLoading] = useState(true)
  const module = useRef(undefined)

  const loadModules = async () => {
    const [store, { isMobile }, Svg, { G, Path }] = await Promise.all([import('app-store-web'), import('react-device-detect'), import('react-native-svg'), import('react-native-svg')])

    const getIsMobile = () => {
      const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
      const { IS_MOBILE } = GLOBAL_OBJ.onlinetur.constants
      const { width } = Dimensions.get('window')
      return isMobile || width < IS_MOBILE
    }

    module.current = {
      store,
      isMobile: getIsMobile(),
      Svg: Svg.default,
      G,
      Path
    }
  }

  useEffect(() => {
    loadModules().then(() => setLoading(false))
  }, [])

  const BackHeaderWithStore = useMemo(() => {
    if (isLoading || !module.current) return null

    const mapStateToProps = state => ({})

    const mapDispatchToProps = dispatch => ({})

    return connect(mapStateToProps, mapDispatchToProps)(BackHeader)
  }, [isLoading])

  if (isLoading || !BackHeaderWithStore) {
    return null
  }

  return <BackHeaderWithStore {...props} utils={module.current} />
}
