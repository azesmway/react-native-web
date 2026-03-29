import { useEffect, useMemo, useRef, useState } from 'react'
import { Dimensions, Platform } from 'react-native'
import { connect } from 'react-redux'

import MessageVideo from './MessageVideo'

export default function MessageVideoComponent(props) {
  const [isLoading, setLoading] = useState(true)
  const module = useRef(undefined)

  const loadModules = async () => {
    const [store, { withRouter, theme, t, VideoUrl }, { WebView }, { isMobile }] = await Promise.all([
      import('app-store-web'),
      import('app-utils-web'),
      import('react-native-webview'),
      import('react-device-detect')
    ])

    const getIsMobile = () => {
      const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
      const { IS_MOBILE } = GLOBAL_OBJ.onlinetur.constants
      const { width } = Dimensions.get('window')

      return isMobile || width < IS_MOBILE
    }

    module.current = {
      store,
      withRouter,
      theme,
      t,
      VideoUrl,
      WebView,
      isMobile: getIsMobile()
    }
  }

  useEffect(() => {
    loadModules().then(() => setLoading(false))
  }, [])

  const MessageVideoWithProps = useMemo(() => {
    if (isLoading || !module.current) return null

    const { store, withRouter } = module.current

    const mapStateToProps = state => ({})

    const mapDispatchToProps = dispatch => ({})

    return withRouter(connect(mapStateToProps, mapDispatchToProps)(MessageVideo))
  }, [isLoading])

  if (isLoading || !MessageVideoWithProps) {
    return null
  }

  return <MessageVideoWithProps {...props} utils={module.current} />
}
