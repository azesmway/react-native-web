import { useEffect, useMemo, useRef, useState } from 'react'
import { connect } from 'react-redux'

import ScrollBottom from './ScrollBottom'
import { Dimensions, Platform } from 'react-native'

export default function ScrollBottomComponent(props) {
  const [isLoading, setLoading] = useState(true)
  const module = useRef(undefined)

  const loadModules = async () => {
    // Parallel import all modules at once
    const [store, services, utils, core, elements, detect] = await Promise.all([
      import('app-store-web'),
      import('app-services-web'),
      import('app-utils-web'),
      import('app-core-web'),
      import('react-native-elements'),
      import('react-device-detect')
    ])

    const getIsMobile = () => {
      const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
      const { IS_MOBILE } = GLOBAL_OBJ.onlinetur.constants
      const { width } = Dimensions.get('window')
      return detect.isMobile || width < IS_MOBILE
    }

    // Single assignment instead of multiple spreads
    module.current = {
      store,
      rtkQuery: services.rtkQuery,
      chatServiceGet: services.chatServiceGet,
      AppData: services.AppData,
      init: services.init,
      withRouter: utils.withRouter,
      t: utils.t,
      testResponse: core.appcore.testResponse,
      convertRequestWeb: core.appcore.convertRequestWeb,
      errorTextResponse: core.appcore.errorTextResponse,
      convertRequest: core.appcore.convertRequest,
      Icon: elements.Icon,
      isMobile: getIsMobile()
    }
  }

  useEffect(() => {
    loadModules().then(() => setLoading(false))
  }, [])

  // Memoize mapStateToProps to prevent recreation on every render
  const mapStateToProps = useMemo(() => {
    if (!module.current?.store) return null

    const { store } = module.current

    return state => ({
      user: store.userSelector.getUser(state),
      filter: store.filterSelector.getFilter(state),
      isScrollToBottom: store.chatSelector.getChatScrollToBottom(state),
      countNewMessages: store.chatSelector.getChatCountNewMessages(state),
      chatRendered: store.chatSelector.getChatRendered(state),
      hobby: store.chatSelector.getHobby(state),
      agent: store.countriesSelector.getAllAgent(state),
      images: store.chatSelector.getChatImages(state),
      replyMessage: store.chatSelector.getChatReplyMessage(state),
      isBottomList: store.chatSelector.getChatBottomList(state),
      messagesLength: store.chatSelector.getChatMessagesLength(state),
      openIdMessage: store.chatSelector.getChatOpenIdMessage(state)
    })
  }, [isLoading])

  // Memoize mapDispatchToProps to prevent recreation on every render
  const mapDispatchToProps = useMemo(() => {
    if (!module.current?.store) return null

    const { store } = module.current

    return dispatch => ({
      setChatCountNewMessages: data => dispatch(store.chatAction.setChatCountNewMessages(data)),
      setChatMessages: data => dispatch(store.chatAction.setChatMessages(data)),
      setChatMessagesOld: data => dispatch(store.chatAction.setChatMessagesOld(data)),
      setChatMessagesNew: data => dispatch(store.chatAction.setChatMessagesNew(data)),
      setChatRendered: data => dispatch(store.chatAction.setChatRendered(data)),
      setChatScrollToBottom: data => dispatch(store.chatAction.setChatScrollToBottom(data)),
      setChatOpenIdMessage: data => dispatch(store.chatAction.setChatOpenIdMessage(data)),
      setChatBottomList: data => dispatch(store.chatAction.setChatBottomList(data)),
      willUnmount: () => dispatch(store.chatAction.willUnmount())
    })
  }, [isLoading])

  // Memoize connected component to prevent recreation on every render
  const ScrollBottomWithProps = useMemo(() => {
    if (!module.current?.withRouter || !mapStateToProps || !mapDispatchToProps) return null

    return module.current.withRouter(connect(mapStateToProps, mapDispatchToProps)(ScrollBottom))
  }, [isLoading, mapStateToProps, mapDispatchToProps])

  if (isLoading || !ScrollBottomWithProps) {
    return null
  }

  return <ScrollBottomWithProps {...props} utils={module.current} />
}
