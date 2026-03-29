import { useEffect, useMemo, useRef, useState } from 'react'
import { Dimensions, Platform } from 'react-native'
import { connect } from 'react-redux'

import ListHotels from './ListHotels'

export default function StatusBarComponent(props) {
  const [isLoading, setLoading] = useState(true)
  const module = useRef(undefined)

  const loadModules = async () => {
    // Parallel imports for better performance
    const [
      store,
      { withRouter, theme, t, moment, matchPath, getObjectAssign },
      { rtkQuery, chatServiceGet, AppData },
      Alert,
      queryString,
      { SearchBar, Switch, Icon, ListItem, CheckBox, Header, Tooltip, Tab },
      { Modal, Portal, List, ProgressBar, SegmentedButtons, TextInput, FAB },
      IconFA,
      DatesClass,
      { isMobile },
      { ScrollableTabBar, ScrollableTabView }
    ] = await Promise.all([
      import('app-store-web'),
      import('app-utils-web'),
      import('app-services-web'),
      import('@blazejkustra/react-native-alert'),
      import('query-string'),
      import('react-native-elements'),
      import('react-native-paper'),
      import('react-native-vector-icons/FontAwesome'),
      import('react-native-dates'),
      import('react-device-detect'),
      import('@valdio/react-native-scrollable-tabview')
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
      moment,
      matchPath,
      getObjectAssign,
      rtkQuery,
      chatServiceGet,
      AppData,
      Alert: Alert.default,
      queryString,
      SearchBar,
      Switch,
      Icon,
      ListItem,
      Header,
      CheckBox,
      Tooltip,
      Tab,
      Modal,
      Portal,
      List,
      ProgressBar,
      SegmentedButtons,
      TextInput,
      FAB,
      IconFA: IconFA.default,
      DatesClass: DatesClass.default,
      isMobile: getIsMobile(),
      ScrollableTabBar,
      ScrollableTabView
    }
  }

  useEffect(() => {
    loadModules().then(() => setLoading(false))
  }, [])

  // Memoize the connected component to avoid recreating on every render
  const ListHotelsWithStore = useMemo(() => {
    if (isLoading || !module.current) return null

    const { store, withRouter } = module.current

    const mapStateToProps = state => ({
      countries: store.countriesSelector.getAllCountries(state),
      filter: store.ratingSelector.getRatingFilter(state),
      user: store.userSelector.getUser(state),
      selectSearch: store.filterSelector.getSelectSearch(state),
      currentCategory: store.filterSelector.getSelectCategory(state),
      hotels: store.ratingSelector.getHotels(state),
      time: store.ratingSelector.getRatingTime(state),
      listHotelsCache: store.ratingSelector.getSaveRatingCache(state)
    })

    const mapDispatchToProps = dispatch => ({
      changeRatingFilter: data => dispatch(store.ratingAction.changeRatingFilter(data)),
      setSelectSearch: data => dispatch(store.filterAction.setSelectSearch(data)),
      setHotels: data => dispatch(store.ratingAction.changeHotels(data)),
      setSaveRatingCache: data => dispatch(store.ratingAction.setSaveRatingCache(data)),
      setHeaderParams: data => dispatch(store.headerAction.setHeaderParams(data)),
      setFooterBar: data => dispatch(store.nappAction.setFooterBar(data)),
      setModalLogin: data => dispatch(store.nappAction.setModalLogin(data))
    })

    return withRouter(connect(mapStateToProps, mapDispatchToProps)(ListHotels))
  }, [isLoading])

  if (isLoading || !ListHotelsWithStore) {
    return null
  }

  return <ListHotelsWithStore {...props} utils={module.current} />
}
