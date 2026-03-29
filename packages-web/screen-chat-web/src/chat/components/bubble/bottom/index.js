import { useEffect, useRef, useState } from 'react'
import { connect } from 'react-redux'

import BubbleBottom from './BubbleBottom'
import { Dimensions, Platform } from 'react-native'

export default function BubbleBottomComponent(props) {
  const [isLoading, setLoading] = useState(true)
  const module = useRef(undefined)

  const loadModules = async () => {
    const store = await import('app-store-web')

    module.current = {
      store: store
    }

    const { withRouter, t, theme } = await import('app-utils-web')
    module.current = {
      ...module.current,
      withRouter: withRouter,
      t: t,
      theme: theme
    }

    const { chatServicePost } = await import('app-services-web')
    module.current = {
      ...module.current,
      chatServicePost: chatServicePost
    }

    const { Icon } = await import('react-native-elements')
    module.current = {
      ...module.current,
      Icon: Icon
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

  const mapStateToProps = state => ({
    user: store.userSelector.getUser(state),
    isConnect: store.appSelector.getConnect(state),
    offline: store.messagesSelector.getOfflineMode(state),
    filter: store.filterSelector.getFilter(state)
  })

  const mapDispatchToProps = dispatch => ({
    setChatReplyMessage: data => dispatch(store.chatAction.setChatReplyMessage(data)),
    setFilter: data => dispatch(store.filterAction.setFilter(data))
  })

  const BubbleBottomWithProps = withRouter(connect(mapStateToProps, mapDispatchToProps)(BubbleBottom))

  return <BubbleBottomWithProps {...props} utils={module.current} />
}
