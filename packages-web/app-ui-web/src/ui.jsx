import { usePathname } from 'expo-router'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Dimensions, Platform } from 'react-native'
import { connect } from 'react-redux'

import Modals from './modals'

export default function WebDrawerComponent(props) {
  const [isLoading, setLoading] = useState(true)
  const module = useRef(undefined)
  const pathname = usePathname()

  const loadModules = async () => {
    // Parallel imports for all independent modules
    const [store, { Modal, Portal }, { Header, Icon, ListItem }, { t, theme }, { isMobile }, { chatServiceGet, chatServicePost, rtkQuery }, Clipboard, cookies, Alert, ParsedText] = await Promise.all([
      import('app-store-web'),
      import('react-native-paper'),
      import('react-native-elements'),
      import('app-utils-web'),
      import('react-device-detect'),
      import('app-services-web'),
      import('@react-native-clipboard/clipboard'),
      import('react-cookies'),
      import('@blazejkustra/react-native-alert'),
      import('react-native-parsed-text')
    ])

    const getIsMobile = () => {
      const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
      const { IS_MOBILE } = GLOBAL_OBJ.onlinetur.constants
      const { width } = Dimensions.get('window')
      return isMobile || width < IS_MOBILE
    }

    // Single object assignment
    module.current = {
      store,
      Modal,
      Portal,
      Header,
      Icon,
      ListItem,
      theme,
      t,
      isMobile: getIsMobile(),
      chatServiceGet,
      chatServicePost,
      rtkQuery,
      Clipboard: Clipboard.default,
      cookies: cookies.default,
      Alert: Alert.default,
      ParsedText: ParsedText.default
    }
  }

  useEffect(() => {
    loadModules().then(() => setLoading(false))
  }, [])

  // Memoize the connected component
  const ModalsWithProps = useMemo(() => {
    if (isLoading || !module.current) return null

    const { store } = module.current

    const mapStateToProps = state => ({
      modalCategory: store.nappSelector.getModalCategory(state),
      modalAlert: store.nappSelector.getModalAlert(state),
      modalLogin: store.nappSelector.getModalLogin(state),
      modalRequest: store.nappSelector.getModalRequest(state),
      user: store.userSelector.getUser(state),
      categories: store.catSelector.getCategories(state),
      currentCategory: store.filterSelector.getSelectCategory(state),
      androidIdInstall: store.appSelector.getAndroidIdInstall(state),
      filter: store.filterSelector.getFilter(state)
    })

    const mapDispatchToProps = dispatch => ({
      setModalCategory: data => dispatch(store.nappAction.setModalCategory(data)),
      setModalAlert: data => dispatch(store.nappAction.setModalAlert(data)),
      setModalLogin: data => dispatch(store.nappAction.setModalLogin(data)),
      setModalRequest: data => dispatch(store.nappAction.setModalRequest(data)),
      setFilter: data => dispatch(store.filterAction.setFilter(data)),
      setUser: data => dispatch(store.userAction.setUser(data)),
      setAgent: data => dispatch(store.chatAction.setAgent(data)),
      setAgentTowns: data => dispatch(store.userAction.setAgentTowns(data))
    })

    return connect(mapStateToProps, mapDispatchToProps)(Modals)
  }, [isLoading])

  if (isLoading || !ModalsWithProps) {
    return null
  }

  return <ModalsWithProps {...props} utils={module.current} pathname={pathname} />
}
