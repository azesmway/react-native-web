import { useEffect, useMemo, useRef, useState } from 'react'
import { Dimensions, Platform } from 'react-native'
import { connect } from 'react-redux'

import MyHotels from './MyHotels'

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
      { CheckBox, Header, Icon, ListItem, Rating, Tooltip },
      { Modal, Portal, List, ProgressBar, SegmentedButtons, TextInput, Button, Snackbar, FAB },
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
      Icon,
      Rating,
      ListItem,
      Header,
      Tooltip,
      CheckBox,
      Modal,
      Portal,
      List,
      ProgressBar,
      SegmentedButtons,
      TextInput,
      Button,
      FAB,
      Snackbar,
      isMobile: getIsMobile(),
      ScrollableTabBar,
      ScrollableTabView
    }
  }

  useEffect(() => {
    loadModules().then(() => setLoading(false))
  }, [])

  // Memoize the connected component to prevent recreation
  const MyHotelsWithStore = useMemo(() => {
    if (isLoading || !module.current) return null

    const { store, withRouter } = module.current

    const mapStateToProps = state => ({
      myRatingLocal: store.ratingSelector.getMyRatingLocal(state),
      myRatingServer: store.ratingSelector.getMyRatingServer(state),
      hotels: store.ratingSelector.getHotels(state),
      countries: store.countriesSelector.getAllCountries(state),
      alertMyHotels: store.ratingSelector.getAlertMyHotels(state),
      criteria: store.ratingSelector.getCriteria(state),
      filter: store.ratingSelector.getRatingFilter(state),
      user: store.userSelector.getUser(state),
      selectedRatingCategory: store.ratingSelector.getSelectedRatingCategory(state),
      selectSearch: store.filterSelector.getSelectSearch(state),
      currentCategory: store.filterSelector.getSelectCategory(state),
      time: store.ratingSelector.getRatingTime(state),
      listHotelsCache: store.ratingSelector.getSaveRatingCache(state)
    })

    const mapDispatchToProps = dispatch => ({
      setHotels: data => dispatch(store.ratingAction.changeHotels(data)),
      changeMyRatingLocal: data => dispatch(store.ratingAction.changeMyRatingLocal(data)),
      changeMyRatingServer: data => dispatch(store.ratingAction.changeMyRatingServer(data)),
      changeRatingTime: data => dispatch(store.ratingAction.changeRatingTime(data)),
      changeAlertMyHotels: data => dispatch(store.ratingAction.changeAlertMyHotels(data)),
      changeRatingFilter: data => dispatch(store.ratingAction.changeRatingFilter(data)),
      setSelectedRatingCategory: data => dispatch(store.ratingAction.setSelectedRatingCategory(data)),
      setHeaderParams: data => dispatch(store.headerAction.setHeaderParams(data)),
      setFooterBar: data => dispatch(store.nappAction.setFooterBar(data)),
      setChangeMyRating: data => dispatch(store.ratingAction.setChangeMyRating(data))
    })

    return withRouter(connect(mapStateToProps, mapDispatchToProps)(MyHotels))
  }, [isLoading])

  if (isLoading || !MyHotelsWithStore) {
    return null
  }

  return <MyHotelsWithStore {...props} utils={module.current} />
}
