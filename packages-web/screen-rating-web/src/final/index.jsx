import { useEffect, useRef, useState } from 'react'
import { Dimensions, Platform } from 'react-native'
import { connect } from 'react-redux'

import FinalHotels from './Final'

export default function FinalHotelsComponent(props) {
  const [isLoading, setLoading] = useState(true)
  const module = useRef(undefined)

  const loadModules = async () => {
    const [
      store,
      { withRouter, theme, t, moment, matchPath, getObjectAssign },
      { rtkQuery, chatServiceGet, AppData },
      { mobile },
      { default: Alert },
      { default: queryString },
      { SearchBar, Switch, Icon, ListItem, CheckBox, Header, Tooltip, Tab },
      { Modal, Portal, List, ProgressBar, SegmentedButtons, TextInput, Button, FAB },
      { isMobile },
      { ScrollableTabBar, ScrollableTabView },
      { default: Geolocation }
    ] = await Promise.all([
      import('app-store-web'),
      import('app-utils-web'),
      import('app-services-web'),
      import('app-mobile-web'),
      import('@blazejkustra/react-native-alert'),
      import('query-string'),
      import('react-native-elements'),
      import('react-native-paper'),
      import('react-device-detect'),
      import('@valdio/react-native-scrollable-tabview'),
      import('@react-native-community/geolocation')
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
      t,
      moment,
      matchPath,
      getObjectAssign,
      rtkQuery,
      chatServiceGet,
      AppData,
      mobile,
      Alert,
      queryString,
      Icon,
      ListItem,
      Header,
      Modal,
      Portal,
      List,
      ProgressBar,
      SegmentedButtons,
      TextInput,
      Button,
      isMobile: getIsMobile(),
      ScrollableTabBar,
      ScrollableTabView,
      Fab,
      IconButton,
      Geolocation,
      SearchBar,
      Switch,
      CheckBox,
      Tooltip,
      Tab
    }
  }

  useEffect(() => {
    if (isLoading) {
      loadModules().then(() => setLoading(false))
    }
  }, [isLoading])

  if (isLoading) {
    return <></>
  }

  const { store, withRouter } = module.current

  const mapStateToProps = state => ({
    countries: store.countriesSelector.getAllCountries(state),
    filter: store.ratingSelector.getRatingFilter(state),
    alertHotels: store.ratingSelector.getAlertHotels(state),
    criteria: store.ratingSelector.getCriteria(state),
    user: store.userSelector.getUser(state),
    selectSearch: store.filterSelector.getSelectSearch(state),
    currentCategory: store.filterSelector.getSelectCategory(state),
    listHotelsCache: store.ratingSelector.getSaveRatingCache(state),
    selectedRatingCategory: store.ratingSelector.getSelectedRatingCategory(state),
    hotels: store.ratingSelector.getHotels(state),
    editRating: store.ratingSelector.getEditRating(state)
  })

  const mapDispatchToProps = dispatch => ({
    changeRatingFilter: data => dispatch(store.ratingAction.changeRatingFilter(data)),
    setSelectSearch: data => dispatch(store.filterAction.setSelectSearch(data)),
    setHotels: data => dispatch(store.ratingAction.changeHotels(data)),
    setSaveRatingCache: data => dispatch(store.ratingAction.setSaveRatingCache(data)),
    setHeaderParams: data => dispatch(store.headerAction.setHeaderParams(data)),
    setFooterBar: data => dispatch(store.nappAction.setFooterBar(data)),
    setSelectedRatingCategory: data => dispatch(store.ratingAction.setSelectedRatingCategory(data)),
    setEditRating: data => dispatch(store.ratingAction.setEditRating(data)),
    setModalLogin: data => dispatch(store.nappAction.setModalLogin(data))
  })

  const FinalHotelsWithStore = withRouter(connect(mapStateToProps, mapDispatchToProps)(FinalHotels))

  return <FinalHotelsWithStore {...props} utils={module.current} />
}
