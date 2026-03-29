import { useEffect, useRef, useState } from 'react'
import { connect } from 'react-redux'

import Request from './Request'
import { Dimensions, Platform } from 'react-native'

export default function RequestComponent(props) {
  const [isLoading, setLoading] = useState(true)
  const module = useRef(undefined)

  const loadModules = async () => {
    const store = await import('app-store-web')

    module.current = {
      store: store
    }

    const { withRouter, theme, t, moment } = await import('app-utils-web')
    module.current = {
      ...module.current,
      withRouter: withRouter,
      theme: theme,
      t: t,
      moment: moment
    }

    const { chatServiceGet, chatServicePost } = await import('app-services-web')
    module.current = {
      ...module.current,
      chatServiceGet: chatServiceGet,
      chatServicePost: chatServicePost
    }

    const { Button, DefaultTheme, Dialog, Paragraph, Portal, TextInput } = await import('react-native-paper')
    module.current = {
      ...module.current,
      Button: Button,
      DefaultTheme: DefaultTheme,
      Dialog: Dialog,
      Paragraph: Paragraph,
      Portal: Portal,
      TextInput: TextInput
    }

    const { ListItem, Tooltip } = await import('react-native-elements')
    module.current = {
      ...module.current,
      Tooltip: Tooltip,
      ListItem: ListItem
    }

    const Alert = await import('@blazejkustra/react-native-alert')
    module.current = {
      ...module.current,
      Alert: Alert.default
    }

    const { isMobile } = await import('react-device-detect')

    const getIsMobile = () => {
      const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
      const { IS_MOBILE } = GLOBAL_OBJ.onlinetur.constants
      const { width } = Dimensions.get('window')

      return isMobile || width < IS_MOBILE
    }

    module.current = {
      ...module.current,
      isMobile: getIsMobile()
    }
  }

  useEffect(() => {
    loadModules().then(() => setLoading(false))
  }, [])

  if (isLoading) {
    return <></>
  }

  const { store, withRouter } = module.current

  const mapStateToProps = state => ({})

  const mapDispatchToProps = dispatch => ({})

  const RequestWithProps = withRouter(connect(mapStateToProps, mapDispatchToProps)(Request))

  return <RequestWithProps {...props} utils={module.current} />
}
