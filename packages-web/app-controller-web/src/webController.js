/**
 * -----------------------------------------------------------------------
 *  Author      : Alexey Zolotarеv
 *  E-mail      : azesm@me.com
 * -----------------------------------------------------------------------
 */

import compact from 'lodash/compact'
import isEmpty from 'lodash/isEmpty'
import split from 'lodash/split'
import queryString from 'query-string'
import { Platform } from 'react-native'

const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
const { PATH_MATCH } = GLOBAL_OBJ.onlinetur.constants
const { getAppConstants, getAuthLink, setAuthLink, setOpenCurrentMessageId } = GLOBAL_OBJ.onlinetur.storage

class webController {
  constructor(component, props) {
    this.c = component
    this.rootprops = props
  }

  initMessaging = async () => {
    const { firebase } = this.rootprops
    const { user, setUser, clearNotification } = this.c.props

    clearNotification()
    this.c.setState({ pushNotification: false })

    if (firebase.messaging.isSupported()) {
      const messaging = firebase.messaging()
      messaging
        .getToken()
        .then(currentToken => {
          if (currentToken) {
            let obj = Object.assign({}, user)
            obj.fcmToken = currentToken
            setUser(obj)
          } else {
            console.log('No Token available')
          }
        })
        .catch(error => {
          console.log('An error ocurred while retrieving token. ', error)
        })
    }
  }

  breakMessaging = () => {
    const { user, setUser } = this.c.props

    this.c.setState({ pushNotification: false })
    let data = Object.assign({}, user)
    data.notification = false

    setUser(data)
  }

  getChatParams = async (id, user = {}) => {
    const { chatServiceGet } = this.rootprops

    if (isEmpty(user)) {
      user = this.c.props.user
    }

    let url = '/'
    let token = user && user.device && user.device.token ? user.device.token : ''
    let android_id_install = user && user.android_id_install ? user.android_id_install : ''
    const result = await chatServiceGet.fetchChatParams(id, token, android_id_install)

    if (result.code === 0) {
      return result
    }

    return url
  }

  setUrlAndFilter = req => {
    const { filter, setFilter } = this.c.props
    const data = Object.assign({}, filter)

    data.selectedCountry = '-1'
    data.selectedHotel = '-1'
    data.selectedHobby = '-1'
    data.selectedPlace = '-1'
    data.selectedCountryName = ''
    data.selectedHotelName = ''
    data.selectedHobbyName = ''
    data.selectedPlaceName = ''
    data.searchFav = ''
    data.idUserFav = '0'
    data.nameUserFav = ''
    data.chatAgent = null
    data.selectedAgent = '-1'
    data.selectedAgentName = ''

    this.c.startLink = ''

    if (req.tip_chat === 1) {
      this.c.startLink += '/a/' + req.id_interes
    }

    if (req.id_post) {
      this.c.startLink += '/y/' + req.id_post
      data.selectedCountry = String(req.id_post)
      data.selectedCountryName = String(req.name_strana)
    }

    if (req.id_otel && req.id_otel > 0) {
      this.c.startLink += '/h/' + (req.id_otel - 100000)
    }

    if (req.id_otel && req.id_otel < 0) {
      this.c.startLink += '/p/' + (req.id_otel + 100000)
    }

    if (req.id_hotel && req.id_hotel > 0 && !this.c.startLink.includes('/h/')) {
      this.c.startLink += '/h/' + (req.id_hotel - 100000)
      data.selectedHotel = Number(req.id_hotel) - 100000
      data.selectedHotelName = req.name_hotel_kurrot ? String(req.name_hotel_kurrot) : ''
    }

    if (req.id_hotel && req.id_hotel < -1 && !this.c.startLink.includes('/p/')) {
      this.c.startLink += '/p/' + (req.id_hotel + 100000) * -1
      data.selectedPlace = (Number(req.id_hotel) + 100000) * -1
      data.selectedPlaceName = req.name_hotel_kurrot ? String(req.name_hotel_kurrot) : ''
    }

    if (req.id_interes && req.tip_chat === 0) {
      this.c.startLink += '/b/' + req.id_interes
    }

    if (req.id_hobbi && req.id_hobbi !== -1 && !this.c.startLink.includes('/b/')) {
      this.c.startLink += '/b/' + req.id_hobbi
      data.selectedHotel = Number(req.id_hobbi)
    }

    setFilter(data)
  }

  openLinkMessage = async (startLink, history, data = {}, isEmpty) => {
    const { cookies } = this.rootprops

    const { user, setChatOpenIdMessage, setModalLogin } = this.c.props
    const req = compact(split(startLink, '/'))
    cookies.save('message', req[1], { path: '/' })

    if (isEmpty) {
      const result = await this.getChatParams(req[1])
      this.setUrlAndFilter(result)

      setModalLogin && setModalLogin(true)
    } else {
      const result = await this.getChatParams(req[1], data)
      this.setUrlAndFilter(result)

      setOpenCurrentMessageId(Number(req[1]))
      setChatOpenIdMessage(true)

      history(this.c.startLink)

      // if (url.indexOf('/y/') > -1) {
      //   setOpenCurrentMessageId(Number(req[1]))
      //   setChatOpenIdMessage(true)
      //
      //   history(url)
      // } else if (url.indexOf('/a/') > -1 && user.is_sotr === 1) {
      //   setOpenCurrentMessageId(Number(req[1]))
      //   setChatOpenIdMessage(true)
      //
      //   history(url)
      // } else {
      //   AlertWeb.alert('Ошибка!', 'У Вас нет доступа к выбранному чату!')
      //   history('/')
      // }
    }
  }

  isEmptyUser = async (location, history, match = null) => {
    const { matchPath, cookies } = this.rootprops

    const { setUser, filter, search, pathname, setModalLogin } = this.c.props
    const { url } = match ? match : { url: '/' }
    let code

    if (location.hash !== '') {
      code = location.hash.replace('#', '')
      this.c.startLink = pathname.replace('#' + code, '')
      cookies.save('sotrCode', code, { path: '/' })
    }

    if ('c' in search) {
      this.c.startLink = pathname
      const ref = search.c
      cookies.save('referal', ref, { path: '/' })
    }

    if ('idToken' in search) {
      this.c.startLink = pathname
      let token = search.idToken
      await this.c.autoLogin(token)

      return
    }

    if (this.c.startLink.includes('/m/') || pathname.includes('/m/')) {
      let link = this.c.startLink.indexOf('/m/') > -1 ? this.c.startLink : pathname
      await this.openLinkMessage(link, history, {}, true)

      return
    }

    if (url.indexOf('/view') === -1 && url.indexOf('/h/') === -1 && url.indexOf('/n/') === -1) {
      this.c.startLink = url

      if (
        url.indexOf('/mini') === -1 &&
        url.indexOf('/mr') === -1 &&
        url.indexOf('/r') === -1 &&
        url.indexOf('/ah') === -1 &&
        url.indexOf('/l') === -1 &&
        url.indexOf('/y') === -1 &&
        url.indexOf('/voice') === -1 &&
        url.indexOf('/oauth') === -1 &&
        url.indexOf('/s') === -1 &&
        url.indexOf('/w') === -1 &&
        url.indexOf('/g') === -1 &&
        !('fast' in search)
      ) {
        if (url !== '/' && url !== '/auth') {
          setModalLogin && setModalLogin(true)
        }
      }
      // else {
      //   setTimeout(() => {
      //     history(url)
      //   }, 300)
      // }
      // }
    } else {
      match = matchPath(
        {
          path: PATH_MATCH,
          exact: true,
          strict: false
        },
        pathname
      )

      if (match && match.params.y && Number(match.params.y) !== Number(filter.selectedCountry)) {
        // history(url.replace(match.params.y, filter.selectedCountry))
      } else {
        // history(url)
      }
    }
  }

  isNotEmptyUser = async (location, history, user, setUser) => {
    const { cookies, matchPath, chatServiceGet, Alert } = this.rootprops
    const { filter, locationPath, setLocationPath, pathname, search } = this.c.props

    if (locationPath !== '') {
      history(locationPath)
      setLocationPath('')

      return
    }

    if (pathname.indexOf('/mini') > -1) {
      // history(pathname)

      return
    }

    if (location.hash !== '') {
      let code = location.hash.replace('#', '')
      this.c.startLink = pathname.replace('#' + code, '')
      const sotr = await chatServiceGet.fetchSetSotr(code, user.device.token, user.android_id_install)

      if (sotr.code === 0) {
        let obj = Object.assign({}, user)
        obj.is_sotr = 1
        setUser(obj)
      }
    }

    if ('c' in search) {
      this.c.startLink = pathname
      const ref = search.c
      cookies.save('referal', ref, { path: '/' })
    }

    if (this.c.startLink.includes('/m/') || pathname.includes('/m/')) {
      let link = this.c.startLink.includes('/m/') ? this.c.startLink : pathname
      await this.openLinkMessage(link, history, user, false)

      return
    }

    if (this.c.startLink !== '') {
      if (this.c.startLink.indexOf('/a/') > -1) {
        if (user.is_sotr === 1) {
          // history(this.c.startLink)
        } else {
          Alert.alert('Ошибка!', 'У Вас нет доступа к выбранному чату!')

          history('/')
        }
      } else {
        let url = this.c.startLink
        const match = matchPath(
          {
            path: PATH_MATCH,
            exact: true,
            strict: false
          },
          this.c.startLink
        )

        if (match && match.params.y && Number(match.params.y) !== Number(filter.selectedCountry) && Number(filter.selectedCountry) !== -1) {
          if (filter.selectedCountry !== '-1' || Number(filter.selectedCountry) !== -1) {
            // history(url.replace(match.params.y, filter.selectedCountry))
          } else {
            // history(url)
          }
        } else {
          // history(url)
        }
      }
      this.c.startLink = ''
    } else {
      let url = pathname
      const match = matchPath(
        {
          path: PATH_MATCH,
          exact: true,
          strict: false
        },
        pathname
      )

      if (match && match.params.y && Number(match.params.y) !== Number(filter.selectedCountry) && Number(filter.selectedCountry) !== -1) {
        if ((filter.selectedCountry !== '-1' || Number(filter.selectedCountry) !== -1) && Number(filter.selectedAgent === -1)) {
          // history(url.replace(match.params.y, filter.selectedCountry))
        } else {
          // history(url)
        }
      } else {
        // history(url)
      }
    }
  }

  initFirebase = async () => {
    const { firebase } = this.rootprops

    if (firebase.messaging.isSupported()) {
      this.c.setState({ pushNotification: true }, () => {})
    }
  }

  fastAuth = async () => {
    const { chatServiceGet } = this.rootprops
    const { location, setUser, setAndroidIdInstall, search } = this.c.props

    if ('fast' in search && getAuthLink() === '') {
      const fastLogin = queryString.parse(location.search.replace('?fast', ''))

      if (fastLogin.email && fastLogin.email !== '' && fastLogin.name && fastLogin.name !== '' && fastLogin.hash && fastLogin.hash !== '') {
        chatServiceGet.registerOnServer(fastLogin.hash, fastLogin.email, fastLogin.name, 'fast').then(async data => {
          if (data) {
            chatServiceGet.registerOnServer(data.token, data.android_id_install, '', 'web').then(async reg => {
              if (reg.code === 0) {
                if (!reg.img_path) {
                  reg.img_path = getAppConstants().url_main + '/images/user.png'
                } else if (reg.img_path.indexOf('stuzon') > -1) {
                  reg.img_path = reg.img_path.replace('https://stuzon.com/chat', getAppConstants().url_main)
                } else if (reg.img_path.indexOf('/a/') > -1) {
                  reg.img_path = reg.img_path.replace('/a/', '/').replace('www.', 'a.')
                }

                setUser(reg)
                setAuthLink('')

                if (setAndroidIdInstall) {
                  setAndroidIdInstall(reg.android_id_install)
                }
              }
            })
          }
        })
      }
    }

    setAuthLink(this.c.props.location.search)
  }

  getInitData = () => {
    const { user, countries } = this.c.props

    let initData = {}
    initData.chat = {}
    initData.filter = {}
    initData.user = {}
    initData.currentCategory = {}

    if (user && user.device) {
      initData.token = !isEmpty(user.device) ? user.device.token : ''
      initData.android_id_install = user.android_id_install
      initData.fcmToken = user.fcmToken
      initData.expoToken = user.expoToken
      initData.is_sotr = user.is_sotr
    } else {
      initData.token = ''
      initData.android_id_install = ''
      initData.fcmToken = ''
      initData.expoToken = ''
      initData.is_sotr = 0
    }

    if (countries && countries.length > 0) {
      initData.chat.countries = countries
    }

    return initData
  }

  updateConnectionStatus = async () => {
    const { mobile } = this.rootprops

    await mobile.testConnection()
  }

  postImage = async (msg, images) => {
    const { chatServicePost, getFormData, b64toBlob } = this.rootprops

    const { changeMessageOffline, changeOfflineMode } = this.c.props
    const m = JSON.parse(msg.message)
    m.img = m.img ? m.img : []
    m.img_min = m.img_min ? m.img_min : []

    for (let i = 0; i < images.length; i++) {
      let block = images[i].image.split(';')
      let contentType = block[0].split(':')[1] // In this case "image/gif"
      let realData = block[1].split(',')[1] // In this case "R0lGODlhPQBEAPeoAJosM...."

      let blob = b64toBlob(realData, contentType)

      const body = new FormData()
      body.append('token', m.token)
      body.append('android_id_install', m.android_id_install)
      body.append('id_post', images[i].id_post)
      body.append('file', blob)

      try {
        const imgres = await chatServicePost.fetchChatImgUploadWeb(body)

        if (imgres.code === 0) {
          m.img.push({
            path: imgres.image,
            date: images[i].exifDateTime,
            latitude: images[i].exifLatitude,
            longitude: images[i].exifLongitude
          })

          m.img_min.push({
            path: imgres.image_min,
            date: images[i].exifDateTime,
            latitude: images[i].exifLatitude,
            longitude: images[i].exifLongitude
          })

          msg.imgs = images.filter(img => img.id !== images[i].id)
          msg.message = JSON.stringify(m)
          changeMessageOffline(msg)
        }
      } catch (e) {
        changeOfflineMode(true)

        return false
      }
    }

    m.img = JSON.stringify(m.img)
    m.img_min = JSON.stringify(m.img_min)

    return await chatServicePost.fetchImgMassageWeb(getFormData(m))
  }
}

export default webController
