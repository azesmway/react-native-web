import { useEffect, useMemo, useRef, useState } from 'react'
import { Dimensions, Platform } from 'react-native'
import { connect } from 'react-redux'

import Themes from './Themes'

export default function ThemesComponent(props) {
  const [isLoading, setLoading] = useState(true)
  const module = useRef(undefined)

  const loadModules = async () => {
    // Parallel imports for independent modules
    const [store, { withRouter, theme, t }, { mobile }, { rtkQuery, AppData }, { Modal, Portal, Badge }, { Icon, Header, ListItem }, { isMobile }] = await Promise.all([
      import('app-store-web'),
      import('app-utils-web'),
      import('app-mobile-web'),
      import('app-services-web'),
      import('react-native-paper'),
      import('react-native-elements'),
      import('react-device-detect')
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
      rtkQuery,
      AppData,
      Modal,
      Portal,
      Icon,
      Header,
      ListItem,
      Badge,
      isMobile: getIsMobile()
    }
  }

  useEffect(() => {
    loadModules().then(() => setLoading(false))
  }, [])

  // Memoize the connected component
  const ThemesWithProps = useMemo(() => {
    if (isLoading || !module.current) {
      return null
    }

    const { store, withRouter } = module.current

    const mapStateToProps = state => ({
      filter: store.filterSelector.getFilter(state),
      user: store.userSelector.getUser(state),
      currentCategory: store.filterSelector.getSelectCategory(state),
      modalTheme: store.chatSelector.getModalTheme(state),
      chatTheme: store.chatSelector.getChatTheme(state),
      countries: store.chatSelector.getCountries(state),
      fcmToken: store.userSelector.getFcmToken(state),
      expoToken: store.userSelector.getExpoToken(state),
      device: store.appSelector.getDevice(state)
    })

    const mapDispatchToProps = dispatch => ({
      setModalTheme: data => dispatch(store.chatAction.setModalTheme(data)),
      setChatTheme: data => dispatch(store.chatAction.setChatTheme(data)),
      setFilter: data => dispatch(store.filterAction.setFilter(data)),
      setHotels: data => dispatch(store.chatAction.setHotels(data)),
      setPlaces: data => dispatch(store.chatAction.setPlaces(data))
    })

    return withRouter(connect(mapStateToProps, mapDispatchToProps)(Themes))
  }, [isLoading])

  if (isLoading || !ThemesWithProps) {
    return null
  }

  return <ThemesWithProps {...props} utils={module.current} />
}
