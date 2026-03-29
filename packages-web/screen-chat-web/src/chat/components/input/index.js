import { useEffect, useMemo, useRef, useState } from 'react'
import { Dimensions, Platform } from 'react-native'
import { connect } from 'react-redux'

import InputToolbar from './InputToolbar'

export default function InputToolbarComponent(props) {
  const [isLoading, setLoading] = useState(true)
  const module = useRef(undefined)

  const loadModules = async () => {
    // Parallel imports where dependencies allow
    const [
      store,
      { withRouter, theme, t },
      { mobile },
      { SvgXml },
      { CameraView, CameraType, useCameraPermissions },
      { Modal, Portal },
      { isMobile },
      Alert,
      Geolocation,
      EmojiPickerModal,
      { emojiData },
      Clipboard
      // { MarkdownTextInput, parseExpensiMark }
    ] = await Promise.all([
      import('app-store-web'),
      import('app-utils-web'),
      import('app-mobile-web'),
      import('react-native-svg'),
      import('expo-camera'),
      import('react-native-paper'),
      import('react-device-detect'),
      import('@blazejkustra/react-native-alert'),
      import('@react-native-community/geolocation'),
      import('@hiraku-ai/react-native-emoji-picker'),
      import('@hiraku-ai/react-native-emoji-picker'),
      import('@react-native-clipboard/clipboard')
      // import('@expensify/react-native-live-markdown')
    ])

    const getIsMobile = () => {
      const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
      const { IS_MOBILE } = GLOBAL_OBJ.onlinetur.constants
      const { width } = Dimensions.get('window')
      return isMobile || width < IS_MOBILE
    }

    // Single assignment instead of multiple spreads
    module.current = {
      store,
      withRouter,
      theme,
      t,
      mobile,
      SvgXml,
      CameraView,
      CameraType,
      useCameraPermissions,
      Modal,
      Portal,
      isMobile: getIsMobile(),
      Alert: Alert.default,
      Geolocation: Geolocation.default,
      EmojiPickerModal: EmojiPickerModal.default,
      emojiData: emojiData,
      Clipboard: Clipboard.default
      // MarkdownTextInput: MarkdownTextInput,
      // parseExpensiMark: parseExpensiMark
    }
  }

  useEffect(() => {
    loadModules().then(() => setLoading(false))
  }, [])

  // Memoize selectors and dispatch functions
  const ConnectedInputToolbar = useMemo(() => {
    if (isLoading || !module.current) {
      return null
    }

    const { store, withRouter } = module.current

    const mapStateToProps = state => ({
      filter: store.filterSelector.getFilter(state),
      user: store.userSelector.getUser(state),
      textMessage: store.chatSelector.getChatTextMessage(state),
      imagesLength: store.chatSelector.getChatImagesLength(state),
      images360: store.chatSelector.getChatImages360(state),
      isSendMessage: store.chatSelector.getChatSendMessage(state),
      replyMessage: store.chatSelector.getChatReplyMessage(state),
      images: store.chatSelector.getChatImages(state),
      heightInput: store.chatSelector.getHeightInput(state)
    })

    const mapDispatchToProps = dispatch => ({
      setChatTextMessage: data => dispatch(store.chatAction.setChatTextMessage(data)),
      setChatSendMessage: data => dispatch(store.chatAction.setChatSendMessage(data)),
      setHeightInput: data => dispatch(store.chatAction.setHeightInput(data)),
      setChatImages: data => dispatch(store.chatAction.setChatImages(data)),
      setModalLogin: data => dispatch(store.nappAction.setModalLogin(data)),
      setSendMessageAI: data => dispatch(store.chatAction.setSendMessageAI(data))
    })

    return withRouter(connect(mapStateToProps, mapDispatchToProps)(InputToolbar))
  }, [isLoading])

  if (isLoading || !ConnectedInputToolbar) {
    return null
  }

  return <ConnectedInputToolbar {...props} utils={module.current} />
}
