import isEmpty from 'lodash/isEmpty'
import md5 from 'md5'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ImageBackground, Platform, ScrollView, View } from 'react-native'

import chat from '../images/chat-pngrepo-com-3.png'
import earth from '../images/earth_globe_com.png'
import bg from '../images/i.webp'
import MainMenu from './MainMenu'

const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
const { getAppConstants } = GLOBAL_OBJ.onlinetur.storage

// Constants extracted outside component
const OVERLAY_STYLE = {
  position: 'absolute',
  width: '100%',
  height: '100%',
  opacity: 0.5,
  backgroundColor: '#fff'
}

const SCROLL_STYLE = {
  width: '100%',
  padding: 0,
  flex: 1
}

const SCROLL_CONTENT_STYLE = { alignItems: 'center' }

const IMAGE_BG_STYLE = { width: '100%', height: '100%' }

// Helper function to build themes object
const buildThemesObject = (user, fcmToken, expoToken, device) => {
  const themes = { chat: {} }

  if (!isEmpty(user)) {
    themes.token = user.device?.token || ''
    themes.android_id_install = user.android_id_install
  } else {
    themes.token = ''
    themes.android_id_install = ''
  }

  themes.fcmToken = fcmToken
  themes.expoToken = expoToken
  themes.device = device

  return themes
}

// Helper function to generate URL order
const generateUrlOrder = user => {
  const baseUrl = `${getAppConstants().url_main_link}/myorder.php`

  if (isEmpty(user)) {
    return `${baseUrl}?un=&ue=&uk=&dg=15&fo=1&nsh=1`
  }

  const txtMd5 = md5(user.login + 'sdlkgfls').substring(0, 4)
  const urlLogin = encodeURI(user.login)
  const urlEmail = encodeURI(user.my_name)

  let url = `${baseUrl}?un=${urlEmail}&ue=${urlLogin}&uk=${txtMd5}&dg=15&fo=1&nsh=1`

  if (user.phone) {
    url += `&ut=${user.phone}`
  }

  return url
}

const MainScreen = props => {
  const {
    user,
    setHeaderParams,
    setFooterBar,
    history,
    filter,
    currentCategory,
    setModalCategory,
    setModalLogin,
    utils,
    setFilter,
    setThemes,
    setHotels,
    setPlaces,
    setNews,
    userMenu,
    setIdCategory,
    fcmToken,
    expoToken,
    device,
    ratingCategories,
    theme
  } = props

  const [state, setState] = useState({
    openAlert: false,
    radio: false,
    htmlTop: '',
    htmlBottom: '',
    visibleModal: false
  })

  const loginTimeoutRef = useRef(null)

  // Memoized URL order generation
  const urlOrder = useMemo(() => generateUrlOrder(user), [user])

  // Callbacks
  const alertMessage = useCallback((titleAlert, bodyAlert, shareCode, isShareReferal, password) => {
    setState(prev => ({
      ...prev,
      openAlert: true,
      titleAlert,
      bodyAlert,
      shareCode,
      isShareReferal,
      password
    }))
  }, [])

  const onHandlerRadio = useCallback(() => {
    setState(prev => ({ ...prev, radio: !prev.radio }))
  }, [])

  const closeModalFilter = useCallback(() => {
    GLOBAL_OBJ.onlinetur.state = {}
    GLOBAL_OBJ.onlinetur.currentComponent = {}
    setModalCategory(false)
  }, [setModalCategory])

  const onSelect = useCallback(
    async (category, index = 0) => {
      const { AppData } = utils

      setState(prev => ({ ...prev, visibleCategory: false }))
      setHotels([])

      const themes = buildThemesObject(user, fcmToken, expoToken, device)

      const data = {
        ...filter,
        selectCategory: category,
        selectedCountry: category.default_id_filter_root,
        selectedCountryName: category.default_title_filter_root
      }

      const countriesResult = await AppData.setAppCountriesBackground(themes, category)
      setThemes(countriesResult.chat)

      // Run in parallel
      await Promise.all([
        AppData.setAppHotelsBackground(countriesResult.chat.countries, category.default_id_filter_root, countriesResult.android_id_install, category.id).then(setHotels),
        AppData.setAppPlacesBackground(countriesResult.chat.countries, category.default_id_filter_root, countriesResult.android_id_install, category.id).then(setPlaces),
        AppData.setAppNewsBackground(user, category, userMenu, 0, false, '', fcmToken, expoToken, device).then(setNews)
      ])

      setFilter(data)
      setIdCategory(index)
    },
    [utils, user, fcmToken, expoToken, device, filter, setHotels, setThemes, setPlaces, setNews, userMenu, setFilter, setIdCategory]
  )

  const openModalFilter = useCallback(() => {
    GLOBAL_OBJ.onlinetur.state = state
    GLOBAL_OBJ.onlinetur.currentComponent = { alertMessage, onHandlerRadio, openModalFilter, onSelect, closeModalFilter }
    setModalCategory(true)
  }, [state, setModalCategory, alertMessage, onHandlerRadio, onSelect, closeModalFilter])

  const openLogin = useCallback(() => {
    if (!user?.id_user) {
      setModalLogin(true)
    }
  }, [user, setModalLogin])

  const getParams = useCallback(() => {
    const params = {
      screen: 'main',
      user,
      onHandlerRadio,
      radio: state.radio,
      openModalFilter
    }

    setHeaderParams(params)

    const selectedCountry = Number(filter.selectedCountry) === -1 ? currentCategory.default_id_filter_root : filter.selectedCountry

    setFooterBar({
      type: 'curved',
      screen: 'main',
      position: 'CENTER',
      leftIcon: {
        img: chat,
        name: 'ЧАТЫ',
        onPress: () => history(`/y/${selectedCountry}`)
      },
      centerIcon: {
        type: 'feather',
        icon: 'bar-chart-2',
        onPress: () => history('/r/0')
      },
      rightIcon: {
        type: 'evilicon',
        img: earth,
        name: 'НОВОСТИ',
        size: 24,
        onPress: () => history('/l')
      }
    })
  }, [user, state.radio, onHandlerRadio, openModalFilter, setHeaderParams, filter, currentCategory, setFooterBar, history])

  // Effects
  useEffect(() => {
    getParams()
    GLOBAL_OBJ.onlinetur.currentComponent = {
      openModalFilter,
      closeModalFilter,
      onSelect
    }
    loginTimeoutRef.current = setTimeout(openLogin, 3000)

    return () => {
      if (loginTimeoutRef.current) {
        clearTimeout(loginTimeoutRef.current)
      }
      setHeaderParams({})
      setFooterBar({})
    }
  }, [])

  // Update header/footer when dependencies change
  useEffect(() => {
    getParams()
  }, [getParams])

  return (
    <ImageBackground source={bg} resizeMode="cover" style={IMAGE_BG_STYLE}>
      <View style={OVERLAY_STYLE} />
      <ScrollView style={SCROLL_STYLE} contentContainerStyle={SCROLL_CONTENT_STYLE}>
        <MainMenu
          history={history}
          currentCategory={currentCategory}
          filter={filter}
          urlOrder={urlOrder}
          user={user}
          ratingCategories={ratingCategories}
          theme={theme}
          utils={utils}
          isMobile={utils.isMobile}
          setModalLogin={setModalLogin}
        />
      </ScrollView>
    </ImageBackground>
  )
}

export default React.memo(MainScreen)
