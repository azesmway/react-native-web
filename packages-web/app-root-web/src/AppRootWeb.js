import isArray from 'lodash/isArray'
import isEqual from 'lodash/isEqual'
import orderBy from 'lodash/orderBy'
import { Component } from 'react'
import { Platform, Text, View } from 'react-native'

const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
const { getAppConfig, getAppConstants, getAuthLink, setAppConfig, setAppLangInterface, setAuthLink, setStartAppChat } = GLOBAL_OBJ.onlinetur.storage
const { PATH_MATCH } = GLOBAL_OBJ.onlinetur.constants
const { device } = GLOBAL_OBJ.onlinetur

// Constants extracted outside component
const DEFAULT_FILTER_DATA = {
  selectedCountry: '-1',
  selectedHotel: '-1',
  selectedHobby: '-1',
  selectedPlace: '-1',
  selectedCountryName: '',
  selectedHotelName: '',
  selectedHobbyName: '',
  selectedPlaceName: '',
  selectedCountryHide: 0,
  selectedHotelHide: 0,
  selectedHobbyHide: 0,
  selectedPlaceHide: 0,
  selectedFav: '0',
  selectedFavName: '',
  chatAgent: false,
  selectedAgent: '-1',
  selectedAgentName: '-1',
  selectCategory: {}
}

const LOGOUT_FILTER_DATA = {
  ...DEFAULT_FILTER_DATA,
  searchFav: '',
  idUserFav: '0',
  nameUserFav: '',
  chatAgent: null,
  selectedAgent: '-1',
  selectedAgentName: '',
  selectCategory: {},
  selectSearch: {}
}

const VK_API_VERSION = '5.95'
const VK_API_VERSION_NEW = '5.199'
const TIME_CHECK_HOURS = [9, 15, 21]
const CONNECTION_CHECK_INTERVAL = 10000

const OFFLINE_STYLE = {
  width: '100%',
  height: 20,
  backgroundColor: 'red',
  alignItems: 'center'
}

const OFFLINE_TEXT_STYLE = {
  color: '#fff',
  fontSize: 16,
  fontWeight: 'bold'
}

class AppRootWeb extends Component {
  constructor(props) {
    super(props)

    const { webEventController, webController, rootprops } = this.props.utils

    Object.assign(this, new webEventController(this, rootprops))
    Object.assign(this, new webController(this, rootprops))

    setAuthLink(this.props.location.search)

    const { matchPath, t } = this.props.utils.utils
    const match = matchPath(this.props.pathname, {
      path: PATH_MATCH,
      exact: true,
      strict: false
    })

    this.state = {
      isLoading: true,
      loadingText: t('common.loading'),
      isOpenLogin: false,
      isOpenLoginOAuth: false,
      pushNotification: false,
      openAlert: false,
      isSotr: false,
      errorUrl: '',
      match: match,
      text: 'text' in this.props.search ? decodeURI(this.props.search.text) : undefined,
      openNullScreen: false
    }

    this.uniqueId = ''
    this.startLink = ''
  }

  // Extracted method for better readability
  handleLangChange = () => {
    const { switchLang } = this.props.utils.functions
    const { appLangInterface, setFilter } = this.props
    const { setLocale } = this.props.utils.utils

    setAppLangInterface(switchLang(appLangInterface))
    setLocale(appLangInterface)
    setFilter(DEFAULT_FILTER_DATA)
    this.openChatWithLink()
  }

  // Extracted method for offline message handling
  handleOfflineMessages = async () => {
    const { onPostMessage } = this.props.utils.services.chatServicePost
    const { testConnection, getFormData } = this.props.utils.mobile
    const { messagesOffline, removeMessageOffline, changeOfflineMode } = this.props

    for (const message of messagesOffline) {
      const isConnected = await testConnection()

      if (isConnected) {
        try {
          const result = message.imgs ? await this.postImage(message, message.imgs) : await onPostMessage(getFormData(JSON.parse(message.message)), message.url)

          if (result?.code === 0) {
            removeMessageOffline(message.id)
          }
        } catch (e) {
          changeOfflineMode(true)
          break // Exit loop on error
        }
      }
    }
  }

  // Extracted VK friends handling
  addVKFriend = (userId, accessToken) => {
    return new Promise((resolve, reject) => {
      $.ajax({
        url: `https://api.vk.com/method/friends.add?user_id=${userId}&access_token=${accessToken}&v=${VK_API_VERSION}`,
        method: 'get',
        headers: { Authorization: 'Bearer ' + accessToken },
        dataType: 'jsonp',
        success: data => resolve(data?.response),
        error: (xhr, textStatus, error) => {
          console.error('VK API Error:', { status: xhr.statusText, textStatus, error })
          reject(error)
        }
      })
    })
  }

  // Extracted VK users handling
  handleVKFriends = async (userVK, user) => {
    const { getAddUserVK } = this.props.utils.services.postVK
    const { onPostVKUsers } = this.props.utils.services.chatServicePost

    const userVKAdd = await getAddUserVK(user.device.token, user.android_id_install)

    if (userVKAdd.code === 0 && userVKAdd.user) {
      const users = isArray(userVKAdd.user) ? userVKAdd.user : [userVKAdd.user]

      for (const vkUser of users) {
        if (vkUser.id) {
          await this.addVKFriend(vkUser.id, userVK.access_token)
        }
      }
    }

    // Check if it's time to get suggestions
    const now = new Date()
    const timeHour = now.getHours()
    const timeMinute = now.getMinutes()

    const shouldGetSuggestions = TIME_CHECK_HOURS.includes(timeHour) && timeMinute > 0 && timeMinute < 10

    if (shouldGetSuggestions) {
      this.getVKSuggestions(userVK, user, onPostVKUsers)
    }
  }

  // Extracted VK suggestions
  getVKSuggestions = (userVK, user, onPostVKUsers) => {
    $.ajax({
      // eslint-disable-next-line max-len
      url: `https://api.vk.com/method/friends.getSuggestions?access_token=${userVK.access_token}&v=${VK_API_VERSION_NEW}&fields=first_name,last_name,friend_status,last_seen,online,deactivated,status,verified,relation,bdate,email,city,domain,nickname,photo_100,sex,is_friend,screen_name`,
      method: 'get',
      headers: { Authorization: 'Bearer ' + userVK.access_token },
      dataType: 'jsonp',
      success: data => {
        if (data?.response?.items?.length > 0) {
          const body = new FormData()
          body.append('token', user.device.token)
          body.append('android_id_install', user.android_id_install)
          body.append('vk_user_owner', userVK.user_id)
          body.append('users', JSON.stringify(data.response.items))
          onPostVKUsers(body)
        }
      },
      error: (xhr, textStatus, error) => {
        console.error('VK Suggestions Error:', { status: xhr.statusText, textStatus, error })
      }
    })
  }

  // Extracted VK news posting
  handleVKNewsPosting = async () => {
    const { AppData, postVK } = this.props.utils.services
    const { t } = this.props.utils.utils
    const { setAppNewsBackground } = AppData
    const { postVKWeb } = postVK
    const { user, currentCategory, userMenu, news, setNewsNew, fcmToken, expoToken, userVK, isPostVK, urlPost } = this.props

    const result = await setAppNewsBackground(user, currentCategory, userMenu, 0, false, '', fcmToken, expoToken, device)

    if (result.news?.length > 0) {
      const newNews = result.news.filter(newsOne => !news.some(n => Number(n.id) === Number(newsOne.id)))

      if (newNews.length > 0) {
        const sortedNews = orderBy(newNews, 'id', 'desc')
        setNewsNew(sortedNews)

        if (isPostVK) {
          const notPosted = sortedNews.filter(item => item.vkontakte === false)

          if (notPosted.length > 0) {
            const ref = '?c=' + (user.referral?.code || '')
            const posts = notPosted.slice(0, 3).map(post => {
              let url = getAppConfig().homepage + '/n/' + post.id + ref

              if (urlPost === '1') {
                url = getAppConstants().url_news + '/i' + post.id
              }

              const message = post.type === 18 ? `🌴 ${t('screens.profile.vk.overview')}${getAppConstants().url_rf} ☀️` : `🌴 ${t('screens.profile.vk.news')}${getAppConfig().domainMain} ☀️`

              return { message, url }
            })

            await postVKWeb(userVK, this.props.setVK, userVK.user_id, posts)
          }
        }
      }
    }
  }

  // Setup connection monitoring
  setupConnectionMonitoring = () => {
    if (Platform.OS === 'web') {
      const isFirefox = navigator.userAgent.toLowerCase().includes('firefox')
      const isSafari = navigator.userAgent.toLowerCase().includes('safari')

      if (isFirefox || isSafari) {
        window.addEventListener('offline', this.updateConnectionStatus)
        window.addEventListener('online', this.updateConnectionStatus)
      } else if (navigator.connection) {
        navigator.connection.addEventListener('change', this.updateConnectionStatus)
      }

      this.interval = setInterval(this.updateConnectionStatus, CONNECTION_CHECK_INTERVAL)
    } else {
      this.updateConnectionStatus()
    }
  }

  // Cleanup connection monitoring
  cleanupConnectionMonitoring = () => {
    if (Platform.OS === 'web') {
      const isFirefox = navigator.userAgent.toLowerCase().includes('firefox')
      const isSafari = navigator.userAgent.toLowerCase().includes('safari')

      if (isFirefox || isSafari) {
        window.removeEventListener('offline', this.updateConnectionStatus)
        window.removeEventListener('online', this.updateConnectionStatus)
      } else if (navigator.connection) {
        navigator.connection.removeEventListener('change', this.updateConnectionStatus)
      }

      if (this.interval) {
        clearInterval(this.interval)
      }
    }
  }

  // Handle logout
  handleLogout = async () => {
    const { firebase } = this.props.utils.utils
    const { setCategories, setAllCountries, setAllAgent, setFilter, setUser, setAgentTowns, changeOfflineMode, changeMyRatingLocal, changeMyRatingServer, history } = this.props

    try {
      if (firebase) {
        await firebase.auth().signOut()
      }

      setCategories([])
      setAllCountries([])
      setAllAgent([])
      setFilter(LOGOUT_FILTER_DATA)
      setUser({})
      setAgentTowns([])
      changeOfflineMode(false)
      changeMyRatingLocal([])
      changeMyRatingServer([])

      // setTimeout(() => {
      //   history(getAppConfig().startPage)
      //   window.location.reload()
      // }, 1000)
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { user, offline, appLangInterface, pathname, search } = this.props
    const { isOpenLogin, openAlert, isOpenLoginOAuth, openNullScreen, isLoading } = this.state
    // Early return optimization
    if (
      isLoading !== nextState.isLoading ||
      pathname !== nextProps.pathname ||
      isOpenLogin !== nextState.isOpenLogin ||
      openAlert !== nextState.openAlert ||
      isOpenLoginOAuth !== nextState.isOpenLoginOAuth ||
      openNullScreen !== nextState.openNullScreen ||
      offline !== nextProps.offline ||
      appLangInterface !== nextProps.appLangInterface
    ) {
      return true
    }

    if ('logout' in search && pathname === '/' && pathname !== nextProps.pathname) {
      console.log('shouldComponentUpdate start', pathname, nextProps.pathname, search, nextProps.search)
      return true
    }

    return !isEqual(user, nextProps.user)
  }

  async componentDidUpdate(prevProps, prevState) {
    const { pathname, search } = this.props
    const { user, history, appLangInterface, offline } = this.props
    const { matchPath } = this.props.utils.utils

    if (prevProps.pathname !== pathname && 'logout' in prevProps.search) {
      this.openChatWithLink()
      return
    }

    const match = matchPath(this.props.pathname, {
      path: PATH_MATCH,
      exact: true,
      strict: false
    })

    // Early returns for specific routes
    if (match?.path.includes('/exauth')) return

    const url = getAppConfig().electornApp ? `/${getAppConfig().baseUrl.substring(0, getAppConfig().baseUrl.indexOf('Users')).split('/')[1]}/` : '/'

    if (prevProps.user.id_user && !user.id_user) {
      this.openChatWithLink()
      return
    }

    if (!match && prevProps.pathname !== url && pathname === url) {
      this.openChatWithLink()
      return
    }

    if (prevProps.appLangInterface !== appLangInterface) {
      this.handleLangChange()
      return
    }

    if (prevProps.pathname.indexOf('/oauth') > -1 && pathname === url) {
      this.closeLoginWindowOAuth()
      return
    }

    this.initFirebase()

    if (!prevProps.user.id_user && user.id_user) {
      if (user.referral?.ref_user?.id_hotel_manager && user.is_sotr === 0) {
        this.initFirebase()
        history('/y/0/h/' + user.referral.ref_user.id_hotel_manager)
      } else {
        this.openChatWithLink()
        this.initFirebase()
      }
      return
    }

    if (!prevProps.pathname.includes('/m/') && pathname.includes('/m/')) {
      await this.isNotEmptyUser(this.props.location, history, user, this.props.setUser)
      return
    }

    if (!user.device && pathname.indexOf('/auth') > -1 && !this.state.isOpenLogin) {
      this.authOpen()
      return
    }

    const oauthPaths = ['/s', '/y/', '/l', '/n/', '/w']
    if (!user.device && !this.state.isOpenLoginOAuth && oauthPaths.some(path => pathname.indexOf(path) > -1)) {
      this.authOpenOAuth()
      return
    }

    if (prevProps.offline === true && offline === false) {
      await this.handleOfflineMessages()
    }
  }

  componentDidMount = async () => {
    const { queryString, VKID } = this.props.utils
    const { getLocale, setLocale } = this.props.utils.utils
    const { switchLang } = this.props.utils.functions
    const { createUUID } = this.props.utils.core
    const { getStartAppReg } = this.props.utils.services.chatServiceGet
    const {
      history,
      appLangInterface,
      location,
      ratingFilter,
      changeRatingFilter,
      appCount,
      setAppCount,
      androidIdInstall,
      setAndroidIdInstall,
      setRef,
      setVK,
      userVK,
      isPostVK,
      isPostGroupVK,
      isFriendVK,
      search,
      user,
      setDevice,
      pathname
    } = this.props
    const { match } = this.state

    // Handle logout
    if ('logout' in search) {
      await this.handleLogout()
      return
    }

    if (!__DEV__) {
      VKID.Config.init({
        // @ts-ignore
        app: '52028515', // Идентификатор приложения.
        redirectUrl: 'https://web.onlinetur.ru/u', // Адрес для перехода после авторизации.
        state: 'dj29fnsadjsd82', // Произвольная строка состояния приложения.
        codeVerifier: 'FGH767Gd65', // Верификатор в виде случайной строки. Обеспечивает защиту передаваемых данных.
        scope: 'offline email phone wall groups friends', // Список прав доступа, которые нужны приложению.
        mode: VKID.ConfigAuthMode.InNewTab // По умолчанию авторизация открывается в новой вкладке.
      })
    }

    // Handle VK posting
    if (isPostVK || isPostGroupVK) {
      await this.handleVKNewsPosting()
    }

    // Handle VK friends
    if (isFriendVK && user.device) {
      await this.handleVKFriends(userVK, user)
    }

    // Handle VK auth
    if (match?.path.includes('/u') && !userVK.user_id) {
      try {
        const vk = queryString.parse(location.search)

        if (vk.code) {
          const result = await VKID.Auth.exchangeCode(vk.code, vk.device_id)

          setVK({
            ...result,
            vk,
            date: new Date()
          })
        }
      } catch (e) {
        console.error('VK auth error:', e)
      }
    }

    // Handle exauth routes
    if (match?.path.includes('/exauth')) {
      this.setState({
        isOpenLogin: 'full' in search || !('quick' in search),
        isOpenLoginOAuth: 'quick' in search,
        openNullScreen: false
      })
      return
    }

    // Setup connection monitoring
    this.setupConnectionMonitoring()

    // Setup language
    if (!appLangInterface) {
      const locale = getLocale()
      const lang = switchLang(locale)
      setAppLangInterface(lang)
      setLocale(lang)
    } else {
      const lang = switchLang(appLangInterface)
      setLocale(lang)
      setAppLangInterface(lang)
    }

    // Setup app count
    if (!appCount) {
      setAppCount(0)
    }

    // Setup category chat
    const config = getAppConfig()
    config.categoryChat = 'cat' in search ? Number(search.cat) : -1
    setAppConfig(config)

    // Setup service worker
    if ('serviceWorker' in navigator && !navigator.serviceWorker.onmessage) {
      navigator.serviceWorker.onmessage = event => {
        if (event?.data?.action === 'notificationclick') {
          history(event.data.openurl)
        } else {
          navigator.serviceWorker.getRegistrations().then(async registrations => {
            const reg = registrations[0]

            if (reg && event.data.notification?.title) {
              await reg.showNotification(event.data.notification.title, {
                body: event.data.notification.body,
                icon: getAppConstants().url_main + '/imgs_logo/logoonlinetur.png',
                data: event.data.data
              })
            }
          })
        }
      }
    }

    // Setup android ID
    const android_id_install = createUUID()

    if (!androidIdInstall) {
      if ('c' in search) {
        setRef(search.c)
        await getStartAppReg(android_id_install, search.c)
      }

      setAndroidIdInstall?.(android_id_install)
    }

    // Setup device
    setDevice({
      manufacturer: device.manufacturer,
      phone_model: device.phone_model,
      vers_os: device.vers_app,
      vers_app: device.vers_app,
      url: device.url
    })

    // Fast auth
    this.fastAuth()

    // Handle referrer
    if ('referrer' in search) {
      const { cookies } = this.props.utils
      cookies.save('referrer', search.referrer, { path: '/' })
    }

    // Setup rating filter
    if (!ratingFilter) {
      changeRatingFilter({
        selectedCountries: [],
        selectedPlaces: [],
        indexCategory: 0
      })
    }

    // Open chat with link
    const chatMatch = match || {
      isExact: true,
      params: {},
      path: '/',
      url: '/'
    }

    if (chatMatch.params?.y || chatMatch.params?.a) {
      setStartAppChat(true)
    }

    this.openChatWithLink(chatMatch)
  }

  componentWillUnmount() {
    this.cleanupConnectionMonitoring()
  }

  render() {
    const { Toast } = this.props.utils
    const { offline } = this.props

    return (
      <>
        <Toast ref={ref => (global.toast = ref)} />
        {offline && (
          <View style={OFFLINE_STYLE}>
            <Text style={OFFLINE_TEXT_STYLE}>{'Ошибка передачи данных. Возможно проблемы с интернетом.'}</Text>
          </View>
        )}
      </>
    )
  }
}

export default AppRootWeb
