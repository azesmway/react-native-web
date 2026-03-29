import { useEffect, useMemo, useRef, useState } from 'react'
import { Dimensions, Platform } from 'react-native'
import { connect } from 'react-redux'

import RightHeader from './right'

export default function RightHeaderComponent(props) {
  const [isLoading, setLoading] = useState(true)
  const module = useRef(undefined)

  const loadModules = async () => {
    // Parallel imports for better performance
    const [
      store,
      { withRouter, theme, t, matchPath, firebase, SvgIcon },
      { chatServiceGet },
      { appcore },
      { isMobile },
      { CheckBox, Icon, SearchBar },
      { Menu, MenuOption, MenuOptions, MenuTrigger },
      { ActionFilter },
      { Modal, Portal, Badge, Drawer },
      Alert,
      { Path, Circle, Rect, G, Defs, ClipPath }
    ] = await Promise.all([
      import('app-store-web'),
      import('app-utils-web'),
      import('app-services-web'),
      import('app-core-web'),
      import('react-device-detect'),
      import('react-native-elements'),
      import('react-native-popup-menu'),
      import('app-controller-web'),
      import('react-native-paper'),
      import('@blazejkustra/react-native-alert'),
      import('react-native-svg')
    ])

    const getIsMobile = () => {
      const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
      const { IS_MOBILE } = GLOBAL_OBJ.onlinetur.constants
      const { width } = Dimensions.get('window')
      return isMobile || width < IS_MOBILE
    }

    // Single assignment instead of multiple spread operations
    module.current = {
      store,
      appApi: store.appApi,
      dispatch: store.dispatch,
      SvgIcon,
      Path,
      G,
      Defs,
      ClipPath,
      Rect,
      Circle,
      withRouter,
      theme,
      matchPath,
      t,
      firebase,
      chatServiceGet,
      appcore,
      isMobile: getIsMobile(),
      Icon,
      CheckBox,
      SearchBar,
      Menu,
      MenuOption,
      MenuOptions,
      MenuTrigger,
      Badge,
      Drawer,
      ActionFilter,
      Modal,
      Portal,
      Alert: Alert.default
    }
  }

  useEffect(() => {
    loadModules().then(() => setLoading(false))
  }, [])

  // Memoize Redux connector to prevent recreation on every render
  const RightHeaderWithStore = useMemo(() => {
    if (isLoading || !module.current) return null

    const { store, withRouter } = module.current

    const mapStateToProps = state => ({
      filter: store.filterSelector.getFilter(state),
      currentCategory: store.filterSelector.getSelectCategory(state),
      user: store.userSelector.getUser(state),
      hobby: store.chatSelector.getHobby(state),
      places: store.chatSelector.getPlaces(state),
      hotels: store.chatSelector.getHotels(state),
      countries: store.countriesSelector.getAllCountries(state),
      agent: store.countriesSelector.getAllAgent(state),
      userMenu: store.newsSelector.getUserMenu(state),
      menu: store.newsSelector.getMenu(state),
      urlPost: store.userSelector.getUrlPost(state)
    })

    const mapDispatchToProps = dispatch => ({
      setFilter: data => dispatch(store.filterAction.setFilter(data)),
      logOut: data => {
        dispatch(store.userAction.setUser(data.user))
        dispatch(store.filterAction.setFilter(data.filter))
      },
      setNews: data => {
        dispatch(store.newsAction.setMenu(data.menu))
        dispatch(store.newsAction.setNews(data.news))
      },
      setCategories: data => dispatch(store.catAction.setCategories(data)),
      setAllCountries: data => dispatch(store.countriesAction.setAllCountries(data)),
      setAllAgent: data => dispatch(store.countriesAction.setAllAgent(data)),
      setUser: data => dispatch(store.userAction.setUser(data)),
      setAgentTowns: data => dispatch(store.userAction.setAgentTowns(data)),
      changeOfflineMode: data => dispatch(store.messagesAction.changeOfflineMode(data)),
      changeMyRatingLocal: data => dispatch(store.ratingAction.changeMyRatingLocal(data)),
      changeMyRatingServer: data => dispatch(store.ratingAction.changeMyRatingServer(data)),
      setSelectHotel: data => dispatch(store.filterAction.setSelectHotel(data)),
      setSelectPlace: data => dispatch(store.filterAction.setSelectPlace(data)),
      setModalAlert: data => dispatch(store.nappAction.setModalAlert(data)),
      setModalRequest: data => dispatch(store.nappAction.setModalRequest(data)),
      setStatusBar: data => dispatch(store.nappAction.setStatusBar(data)),
      setModalLogin: data => dispatch(store.nappAction.setModalLogin(data))
    })

    return withRouter(connect(mapStateToProps, mapDispatchToProps)(RightHeader))
  }, [isLoading])

  if (isLoading || !RightHeaderWithStore) {
    return null
  }

  return <RightHeaderWithStore {...props} utils={module.current} />
}
