import { useEffect, useMemo, useRef, useState } from 'react'
import { Dimensions, Platform } from 'react-native'
import { connect } from 'react-redux'

import MessageText from './MessageText'

export default function MessageTextComponent(props) {
  const [isLoading, setLoading] = useState(true)
  const module = useRef(undefined)

  const loadModules = async () => {
    const [store, { withRouter, theme, t }, ParsedText, Communications, { isMobile }, { Markdown }, Clipboard] = await Promise.all([
      import('app-store-web'),
      import('app-utils-web'),
      import('react-native-parsed-text'),
      import('react-native-communications'),
      import('react-device-detect'),
      import('react-native-remark'),
      import('@react-native-clipboard/clipboard')
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
      ParsedText: ParsedText.default,
      Communications: Communications.default,
      isMobile: getIsMobile(),
      Markdown: Markdown,
      Clipboard: Clipboard.default
    }
  }

  useEffect(() => {
    loadModules().then(() => setLoading(false))
  }, [])

  const MessageTextWithProps = useMemo(() => {
    if (isLoading || !module.current) return null

    const { withRouter } = module.current
    const mapStateToProps = state => ({})
    const mapDispatchToProps = dispatch => ({})

    return withRouter(connect(mapStateToProps, mapDispatchToProps)(MessageText))
  }, [isLoading])

  if (isLoading) {
    return null
  }

  return <MessageTextWithProps {...props} utils={module.current} />
}
