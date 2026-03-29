import { useEffect, useMemo, useRef, useState } from 'react'
import { Dimensions, Platform } from 'react-native'
import { connect } from 'react-redux'

import MainScreen from './MainScreen'

export default function MainScreenComponent(props) {
  const [isLoading, setLoading] = useState(true)
  const module = useRef(undefined)

  const loadModules = async () => {
    const [store, utils, services, elements, deviceDetect] = await Promise.all([
      import('app-store-web'),
      import('app-utils-web'),
      import('app-services-web'),
      import('react-native-elements'),
      import('react-device-detect')
    ])

    const getIsMobile = () => {
      const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
      const { IS_MOBILE } = GLOBAL_OBJ.onlinetur.constants
      const { width } = Dimensions.get('window')
      return deviceDetect.isMobile || width < IS_MOBILE
    }

    module.current = {
      store,
      withRouter: utils.withRouter,
      theme: utils.theme,
      t: utils.t,
      AppData: services.AppData,
      ListItem: elements.ListItem,
      Icon: elements.Icon,
      isMobile: getIsMobile()
    }
  }

  useEffect(() => {
    loadModules().then(() => setLoading(false))
  }, [])

  const storeModules = useMemo(() => {
    if (!module.current?.store) return null

    return {
      appAction: module.current.store.appAction,
      appSelector: module.current.store.appSelector,
      catSelector: module.current.store.catSelector,
      chatAction: module.current.store.chatAction,
      chatSelector: module.current.store.chatSelector,
      countriesSelector: module.current.store.countriesSelector,
      filterAction: module.current.store.filterAction,
      filterSelector: module.current.store.filterSelector,
      messagesAction: module.current.store.messagesAction,
      messagesSelector: module.current.store.messagesSelector,
      newsAction: module.current.store.newsAction,
      newsSelector: module.current.store.newsSelector,
      ratingAction: module.current.store.ratingAction,
      ratingSelector: module.current.store.ratingSelector,
      userSelector: module.current.store.userSelector,
      nappAction: module.current.store.nappAction,
      headerAction: module.current.store.headerAction,
      countriesAction: module.current.store.countriesAction
    }
  }, [isLoading])

  const mapStateToProps = useMemo(() => {
    if (!storeModules) return () => ({})

    const { appSelector, filterSelector, userSelector, chatSelector, countriesSelector, newsSelector, ratingSelector, catSelector, messagesSelector } = storeModules

    return state => ({
      referral: appSelector.getRef(state),
      filter: filterSelector.getFilter(state),
      currentCategory: filterSelector.getSelectCategory(state),
      user: userSelector.getUser(state),
      themes: chatSelector.getCountries(state),
      agent: countriesSelector.getAllAgent(state),
      userMenu: newsSelector.getUserMenu(state),
      news: newsSelector.getNews(state),
      appLangInterface: appSelector.getAppLangInterface(state),
      ratingCategories: ratingSelector.getCriteria(state),
      idCategory: appSelector.getIdCategory(state),
      categories: catSelector.getCategories(state),
      offline: messagesSelector.getOfflineMode(state),
      fcmToken: userSelector.getFcmToken(state),
      expoToken: userSelector.getExpoToken(state),
      device: appSelector.getDevice(state)
    })
  }, [storeModules])

  const mapDispatchToProps = useMemo(() => {
    if (!storeModules) return () => ({})

    const { filterAction, chatAction, countriesAction, newsAction, ratingAction, appAction, messagesAction, nappAction, headerAction } = storeModules

    return dispatch => ({
      setFilter: data => dispatch(filterAction.setFilter(data)),
      setCurrentTheme: data => dispatch(filterAction.setFilter(data)),
      setThemes: data => {
        dispatch(chatAction.setCountries(data.countries))
        dispatch(chatAction.setHobby(data.hobby))
        dispatch(countriesAction.setAllCountries(data.countries))
        dispatch(countriesAction.setAllHobby(data.hobby))
      },
      setHotels: data => dispatch(chatAction.setHotels(data)),
      setPlaces: data => dispatch(chatAction.setPlaces(data)),
      setNews: data => {
        dispatch(newsAction.setMenu(data.menu))
        dispatch(newsAction.setNews(data.news))
      },
      changeCriteria: data => dispatch(ratingAction.changeCriteria(data)),
      setIdCategory: data => dispatch(appAction.setIdCategory(data)),
      changeOfflineMode: data => dispatch(messagesAction.changeOfflineMode(data)),
      setModalCategory: data => dispatch(nappAction.setModalCategory(data)),
      setModalAlert: data => dispatch(nappAction.setModalAlert(data)),
      setModalLogin: data => dispatch(nappAction.setModalLogin(data)),
      setHeaderParams: data => dispatch(headerAction.setHeaderParams(data)),
      setFooterBar: data => dispatch(nappAction.setFooterBar(data))
    })
  }, [storeModules])

  const MainScreenWithStore = useMemo(() => {
    if (isLoading || !module.current?.withRouter) return null
    return module.current.withRouter(connect(mapStateToProps, mapDispatchToProps)(MainScreen))
  }, [isLoading, mapStateToProps, mapDispatchToProps])

  if (isLoading || !MainScreenWithStore) {
    return null
  }

  return <MainScreenWithStore {...props} utils={module.current} />
}
