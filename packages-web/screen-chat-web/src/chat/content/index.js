import { useEffect, useMemo, useRef, useState } from 'react'
import { Dimensions, Platform } from 'react-native'
import { connect } from 'react-redux'

import ChatContent from './ChatContent'

export default function ChatContentComponent(props) {
  const [isLoading, setLoading] = useState(true)
  const module = useRef(undefined)

  useEffect(() => {
    const loadModules = async () => {
      const [store, { withRouter, theme, moment }, { GiftedChat }, { isMobile }] = await Promise.all([
        import('app-store-web'),
        import('app-utils-web'),
        import('react-native-gifted-chat'),
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
        moment,
        GiftedChat,
        isMobile: getIsMobile()
      }
    }

    loadModules().then(() => setLoading(false))
  }, [])

  const mapStateToProps = useMemo(() => {
    if (!module.current?.store) return () => ({})

    const { chatSelector, userSelector } = module.current.store

    return state => ({
      messages: chatSelector.getChatMessages(state),
      isScrollToBottom: chatSelector.getChatScrollToBottom(state),
      user: userSelector.getUser(state),
      isBottomList: chatSelector.getChatBottomList(state),
      heightInput: chatSelector.getHeightInput(state),
      images: chatSelector.getChatImages(state),
      replyMessage: chatSelector.getChatReplyMessage(state),
      images360: chatSelector.getChatImages360(state)
    })
  }, [isLoading])

  const mapDispatchToProps = useMemo(() => {
    if (!module.current?.store) return () => ({})

    const { chatAction } = module.current.store

    return dispatch => ({
      setChatCountNewMessages: data => dispatch(chatAction.setChatCountNewMessages(data)),
      setChatBottomList: data => dispatch(chatAction.setChatBottomList(data)),
      setChatRendered: data => dispatch(chatAction.setChatRendered(data))
    })
  }, [isLoading])

  const ChatContentWithProps = useMemo(() => {
    if (isLoading || !module.current?.withRouter) return null

    return module.current.withRouter(connect(mapStateToProps, mapDispatchToProps)(ChatContent))
  }, [isLoading, mapStateToProps, mapDispatchToProps])

  if (isLoading || !ChatContentWithProps) {
    return null
  }

  return <ChatContentWithProps {...props} utils={module.current} />
}
