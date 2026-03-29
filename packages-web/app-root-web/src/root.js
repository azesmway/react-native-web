import { useLocalSearchParams, usePathname, useSegments } from 'expo-router'
import isEmpty from 'lodash/isEmpty'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Platform } from 'react-native'
import { connect } from 'react-redux'
import { dismissNotification } from 'reapop'

import AppRootWeb from './AppRootWeb'

export function useAppLocation() {
  const pathname = usePathname()
  const params = useLocalSearchParams()
  const segments = useSegments()

  return useMemo(() => {
    // Определяем hash в зависимости от платформы
    let hash = ''

    if (Platform.OS === 'web') {
      // На вебе берем из document.location
      hash = document.location.hash || ''
    } else {
      // В нативном Expo Router hash может храниться в разных местах
      // Обычно в параметрах как специальный ключ
      hash = params['#'] || params.hash || ''
    }

    // Очищаем hash от символа # для единообразия
    const cleanHash = hash.startsWith('#') ? hash.slice(1) : hash

    // Собираем search строку из параметров
    const searchString =
      Object.keys(params).length > 0
        ? '?' +
          new URLSearchParams(
            Object.entries(params)
              .filter(([key]) => !['#', 'hash'].includes(key)) // Исключаем hash ключи
              .map(([k, v]) => [k, String(v)])
          ).toString()
        : ''

    // Формируем полный href
    const href = pathname + searchString + (cleanHash ? `#${cleanHash}` : '')

    return {
      pathname,
      params,
      segments,
      // @ts-ignore
      hash: cleanHash,
      hashWithSymbol: cleanHash ? `#${cleanHash}` : '',
      search: searchString,
      href,
      // Для полной совместимости с веб-объектом Location
      // @ts-ignore
      get hash() {
        return this.hashWithSymbol
      }
    }
  }, [pathname, params, segments])
}

// Move module loading outside component to avoid recreating on each render
const loadModules = async () => {
  // Use Promise.all to load modules in parallel where possible
  const [store, controllers, core, mobile, services, utils, storeExports, VKID, cookies, Toast, Alert, queryString] = await Promise.all([
    import('app-store-web'),
    import('app-controller-web'),
    import('app-core-web'),
    import('app-mobile-web'),
    import('app-services-web'),
    import('app-utils-web'),
    import('app-store-web'),
    import('@vkid/sdk'),
    import('react-cookies'),
    import('react-native-toast-notifications'),
    import('@blazejkustra/react-native-alert'),
    import('query-string')
  ])

  const { webController, webEventController } = controllers
  const { appcore, functions } = core
  const { AppData, chatServiceGet, chatServicePost, postVK, init, rtkQuery } = services
  const { withRouter, firebase, getLocale, matchPath, t, setLocale } = utils
  const { dispatch, appApi } = storeExports

  return {
    store,
    withRouter,
    VKID,
    mobile: mobile.mobile,
    webController,
    webEventController,
    core: appcore,
    functions,
    Toast: Toast.default,
    queryString,
    services: {
      AppData,
      chatServiceGet,
      chatServicePost,
      postVK
    },
    utils: {
      firebase: firebase.default,
      getLocale,
      matchPath,
      setLocale,
      t
    },
    rootprops: {
      Alert: Alert.default,
      init,
      appCore: appcore,
      chatServiceGet,
      chatServicePost,
      rtkQuery,
      dispatch,
      appApi,
      mobile: mobile.mobile,
      firebase,
      matchPath,
      cookies: cookies.default,
      b64toBlob: mobile.mobile.b64toBlob,
      getFormData: mobile.mobile.getFormData
    }
  }
}

// Memoize selectors to avoid recreating on each render
const createMapStateToProps = selectors => {
  const { appSelector, catSelector, countriesSelector, filterSelector, messagesSelector, newsSelector, ratingSelector, userSelector } = selectors

  return state => ({
    filter: filterSelector.getFilter(state),
    currentCategory: filterSelector.getSelectCategory(state),
    categories: catSelector.getCategories(state),
    user: userSelector.getUser(state),
    userVK: userSelector.getVK(state),
    notifyNews: userSelector.getNotifyNews(state),
    userMenu: newsSelector.getUserMenu(state),
    countries: countriesSelector.getAllCountries(state),
    allCountries: countriesSelector.getAllCountries(state),
    news: newsSelector.getNews(state),
    appLangInterface: appSelector.getAppLangInterface(state),
    ratingFilter: ratingSelector.getRatingFilter(state),
    appCount: appSelector.getAppCount(state),
    offline: messagesSelector.getOfflineMode(state),
    androidIdInstall: appSelector.getAndroidIdInstall(state),
    messagesOffline: messagesSelector.getMessagesOffline(state),
    isPostVK: userSelector.isPostVK(state),
    isPostGroupVK: userSelector.isPostGroupVK(state),
    urlPost: userSelector.getUrlPost(state),
    isFriendVK: userSelector.isFriendVK(state),
    locationPath: appSelector.getLocationPath(state),
    fcmToken: userSelector.getFcmToken(state),
    expoToken: userSelector.getExpoToken(state),
    device: appSelector.getDevice(state)
  })
}

// Optimize setInitData to batch dispatches
const createMapDispatchToProps = actions => {
  const { appAction, catAction, chatAction, countriesAction, filterAction, messagesAction, newsAction, ratingAction, userAction } = actions

  return dispatch => ({
    setUser: data => dispatch(userAction.setUser(data)),
    setInitData: data => {
      // Batch all dispatches together
      const dispatches = []

      if (!isEmpty(data.chatCategories)) {
        dispatches.push(catAction.setCategories(data.chatCategories))
      }
      if (!isEmpty(data.currentCategory)) {
        dispatches.push(filterAction.setSelectCategory(data.currentCategory))
      }
      if (!isEmpty(data.chat?.countries)) {
        dispatches.push(chatAction.setCountries(data.chat.countries))
      }
      if (!isEmpty(data.chat?.hobby)) {
        dispatches.push(chatAction.setHobby(data.chat.hobby))
      }
      if (!isEmpty(data.chat?.hotels)) {
        dispatches.push(chatAction.setHotels(data.chat.hotels))
      }
      if (!isEmpty(data.chat?.agent)) {
        dispatches.push(chatAction.setAgent(data.chat.agent))
      }
      if (!isEmpty(data.chat?.agentTowns)) {
        dispatches.push(userAction.setAgentTowns(data.chat.agentTowns))
      }
      if (!isEmpty(data.filter)) {
        dispatches.push(filterAction.setFilter(data.filter))
      }

      dispatches.forEach(action => dispatch(action))
    },
    setAgent: data => dispatch(chatAction.setAgent(data)),
    setAgentTowns: data => dispatch(userAction.setAgentTowns(data)),
    setCategories: data => dispatch(catAction.setCategories(data)),
    setFilter: data => dispatch(filterAction.setFilter(data)),
    setCountries: data => dispatch(chatAction.setCountries(data)),
    setHotels: data => dispatch(chatAction.setHotels(data)),
    setHobby: data => dispatch(chatAction.setHobby(data)),
    setPlaces: data => dispatch(chatAction.setPlaces(data)),
    setNews: data => {
      dispatch(newsAction.setMenu(data.menu))
      dispatch(newsAction.setNews(data.news))
    },
    setAndroidIdInstall: data => dispatch(appAction.setAndroidIdInstall(data)),
    setRef: data => dispatch(appAction.setRef(data)),
    setAllCountries: data => dispatch(countriesAction.setAllCountries(data)),
    setAllAgent: data => dispatch(countriesAction.setAllAgent(data)),
    clearNotification: data => dispatch(dismissNotification(data)),
    setAppLangInterface: data => dispatch(appAction.setAppLangInterface(data)),
    changeRatingFilter: data => dispatch(ratingAction.changeRatingFilter(data)),
    changeCriteria: data => dispatch(ratingAction.changeCriteria(data)),
    setSelectCategory: data => dispatch(filterAction.setSelectCategory(data)),
    setAppCount: data => dispatch(appAction.setAppCount(data)),
    removeMessageOffline: data => dispatch(messagesAction.removeMessageOffline(data)),
    changeOfflineMode: data => dispatch(messagesAction.changeOfflineMode(data)),
    changeMessageOffline: data => dispatch(messagesAction.changeMessageOffline(data)),
    setChatOpenIdMessage: data => dispatch(chatAction.setChatOpenIdMessage(data)),
    setVK: data => dispatch(userAction.setVK(data)),
    setNewsNew: data => dispatch(newsAction.setNewsNew(data)),
    changeMyRatingLocal: data => dispatch(ratingAction.changeMyRatingLocal(data)),
    changeMyRatingServer: data => dispatch(ratingAction.changeMyRatingServer(data)),
    setLocationPath: data => dispatch(appAction.setLocationPath(data)),
    setAllHobby: data => dispatch(countriesAction.setAllHobby(data)),
    setFcmToken: data => dispatch(userAction.setFcmToken(data)),
    setExpoToken: data => dispatch(userAction.setExpoToken(data)),
    setDevice: data => dispatch(appAction.setDevice(data)),
    setContentInternet: data => dispatch(appAction.setConnect(data))
  })
}

export default function AppRootWebComponent(props) {
  const location = useAppLocation()
  const [isLoading, setLoading] = useState(true)
  const moduleRef = useRef(null)

  useEffect(() => {
    loadModules()
      .then(modules => {
        moduleRef.current = modules
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to load modules:', err)
        setLoading(false)
      })
  }, [])

  // Memoize the connected component to avoid recreation
  const ConnectedComponent = useMemo(() => {
    if (!moduleRef.current) return null

    const { store, withRouter } = moduleRef.current
    const {
      appAction,
      appSelector,
      catAction,
      catSelector,
      chatAction,
      countriesAction,
      countriesSelector,
      filterAction,
      filterSelector,
      messagesAction,
      messagesSelector,
      newsAction,
      newsSelector,
      ratingAction,
      ratingSelector,
      userAction,
      userSelector
    } = store

    const mapStateToProps = createMapStateToProps({
      appSelector,
      catSelector,
      countriesSelector,
      filterSelector,
      messagesSelector,
      newsSelector,
      ratingSelector,
      userSelector
    })

    const mapDispatchToProps = createMapDispatchToProps({
      appAction,
      catAction,
      chatAction,
      countriesAction,
      filterAction,
      messagesAction,
      newsAction,
      ratingAction,
      userAction
    })

    return withRouter(connect(mapStateToProps, mapDispatchToProps)(AppRootWeb))
  }, [isLoading])

  if (isLoading || !ConnectedComponent) {
    return null
  }

  return <ConnectedComponent {...props} location={location} utils={moduleRef.current} />
}
