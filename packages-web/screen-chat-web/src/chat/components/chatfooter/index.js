import { useEffect, useRef, useState } from 'react'
import { Dimensions, Platform } from 'react-native'
import { connect } from 'react-redux'

import ChatFooter from './ChatFooter'

// Вынесено за пределы компонента — не пересоздаётся при каждом рендере
const getIsMobile = isMobile => {
  const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
  const { IS_MOBILE } = GLOBAL_OBJ.onlinetur.constants
  const { width } = Dimensions.get('window')
  return isMobile || width < IS_MOBILE
}

// Все импорты загружаются параллельно через Promise.all
const loadModules = async () => {
  const [store, { withRouter, t, theme }, { Icon }, { isMobile }] = await Promise.all([
    import('app-store-web'),
    import('app-utils-web'),
    import('react-native-elements'),
    import('react-device-detect')
  ])

  return { store, withRouter, t, theme, Icon, isMobile: getIsMobile(isMobile) }
}

// Вынесено за пределы компонента — стабильные функции, не зависят от рендера
const createMapStateToProps = store => state => ({
  images: store.chatSelector.getChatImages(state),
  replyMessage: store.chatSelector.getChatReplyMessage(state),
  images360: store.chatSelector.getChatImages360(state)
})

const createMapDispatchToProps = store => dispatch => ({
  setChatImages360: data => dispatch(store.chatAction.setChatImages360(data)),
  setChatImages: data => dispatch(store.chatAction.setChatImages(data)),
  setHeightInput: data => dispatch(store.chatAction.setHeightInput(data))
})

export default function ChatFooterComponent(props) {
  const [isLoading, setLoading] = useState(true)
  const moduleRef = useRef(null)
  // Кешируем обёрнутый компонент, чтобы не пересоздавать его на каждый рендер
  const connectedComponentRef = useRef(null)

  useEffect(() => {
    loadModules().then(modules => {
      moduleRef.current = modules
      setLoading(false)
    })
  }, [])

  if (isLoading) return null

  const { store, withRouter } = moduleRef.current

  if (!connectedComponentRef.current) {
    connectedComponentRef.current = withRouter(connect(createMapStateToProps(store), createMapDispatchToProps(store))(ChatFooter))
  }

  const ChatFooterWithProps = connectedComponentRef.current

  return <ChatFooterWithProps {...props} utils={moduleRef.current} />
}
