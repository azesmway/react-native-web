import isEmpty from 'lodash/isEmpty'
import uniqBy from 'lodash/uniqBy'
import { Keyboard, Linking, Platform } from 'react-native'

export const LOGIN_REQUEST = 'LOGIN_REQUEST'
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS'
export const LOGIN_FAIL = 'LOGIN_FAIL'

const GLOBAL_OBJ = Platform.OS === 'web' ? window : global

export const getRNPickerSelect = (towns, townAgent, user, stylesCurrent) => {
  return null
}

export const setRealmCounries = countries => {
  return null
}

export const setRealmHotels = (id_country, hotels) => {
  return null
}

export const setRealmPlaces = (id_country, places) => {
  return null
}

export const setRealmHobby = hobby => {
  return null
}

export const setRealmAgents = agents => {
  return null
}

export const getRealmCountries = () => {
  return null
}

export const getRealmHotels = id_country => {
  return null
}

export const getRealmPlaces = id_country => {
  return null
}

export const getRealmHobby = () => {
  return null
}

export const getRealmAgents = () => {
  return null
}

export const initCrashlytics = () => {
  return null
}

export const initImageResizer = () => {
  return null
}

export const initPdf = () => {
  return null
}

export const isHasNotch = () => {
  return false
}

export const initPermissionsAndroid = () => {
  return null
}

export const getImagesCamera = () => {
  return null
}

export const initRNShare = () => {
  return null
}

export const getCookie = async () => {
  const cookie = await import('react-cookies')

  return cookie
}

export const trainingAndSendImages = async (id_post_mes, body, images, token, android_id_install, cmp, isConnected, setMessagesOffline) => {
  const { getAppConstants } = GLOBAL_OBJ.onlinetur.storage
  const { chatServicePost } = await import('app-services-web')

  let img = []
  let img_min = []
  const urls = await sendResizeUploadImage(id_post_mes, images, token, android_id_install, isConnected)

  if (isConnected) {
    for (const item of urls) {
      if (item.image) {
        img.push({
          is_send: 1,
          path: item.image,
          date: item.exifDateTime,
          latitude: item.exifLatitude,
          longitude: item.exifLongitude
        })

        img_min.push({
          is_send: 1,
          path: item.image_min,
          date: item.exifDateTime,
          latitude: item.exifLatitude,
          longitude: item.exifLongitude
        })
      }
    }

    body.append('img', JSON.stringify(img))
    body.append('img_min', JSON.stringify(img_min))

    return await chatServicePost.fetchImgMassageWeb(body)
  } else {
    let object = {}
    body.forEach((value, key) => (object[key] = value))
    const path = getAppConstants().url_main + getAppConstants().url_api3_path

    setMessagesOffline([
      {
        id: new Date().getTime(),
        message: JSON.stringify(object),
        url: path + '/add_chat_image.php',
        imgs: urls
      }
    ])

    return {
      code: 0
    }
  }
}

export const trainingAndSendImages360 = async (body, item) => {
  const { chatServicePost } = await import('app-services-web')
  let img = []
  let img_min = []

  if (item.image) {
    img.push({
      path: item.image,
      date: item.exifDateTime,
      latitude: item.exifLatitude,
      longitude: item.exifLongitude,
      is_image360: 1
    })

    img_min.push({
      path: item.image_min,
      date: item.exifDateTime,
      latitude: item.exifLatitude,
      longitude: item.exifLongitude,
      is_image360: 1
    })
  }

  body.append('img', JSON.stringify(img))
  body.append('img_min', JSON.stringify(img_min))

  return await chatServicePost.fetchImgMassageWeb(body)
}

export const sendResizeUploadImage = async (id_post_mes, images, token, android_id_install, isConnected) => {
  const { moment } = await import('app-utils-web')
  const { parse } = await import('exifr/src/core.mjs')
  let result = []
  let newWidth, newHeight

  for (const img of images) {
    if (img.fileName && img.fileName.toLowerCase().indexOf('.pdf') > -1) {
      if (img.width > img.height) {
        newWidth = 1028
        newHeight = img.height / (img.width / newWidth)
        newHeight = newHeight - (newHeight % 1)
      } else {
        newHeight = 1028
        newWidth = img.width / (img.height / newHeight)
        newWidth = newWidth - (newWidth % 1)
      }

      let nm = await makePdf(id_post_mes, img, newWidth, newHeight, token, android_id_install)
      result.push({
        exifDateTime: '',
        exifLatitude: -1,
        exifLongitude: -1,
        image: nm.path,
        image_min: nm.path
      })
    } else if (img.camera) {
      if (isConnected) {
        let nm = await makeCamera(id_post_mes, img.uri, token, android_id_install)

        nm.exifDateTime = ''
        nm.exifLatitude = -1
        nm.exifLongitude = -1

        result.push(nm)
      } else {
        result.push({
          id: new Date().getTime(),
          image: img.uri,
          id_post: id_post_mes,
          exifDateTime: '',
          exifLatitude: -1,
          exifLongitude: -1
        })
      }
    } else {
      if (img.width > img.height) {
        newWidth = 1028
        newHeight = img.height / (img.width / newWidth)
        newHeight = newHeight - (newHeight % 1)
      } else {
        newHeight = 1028
        newWidth = img.width / (img.height / newHeight)
        newWidth = newWidth - (newWidth % 1)
      }

      let e = {}

      try {
        e = await parse(img)
      } catch (e) {
        console.log('Error exifr', e)
      }

      if (isConnected) {
        let nm = await makeResize(id_post_mes, img, newWidth, newHeight, token, android_id_install)

        nm.exifDateTime = e && e.DateTimeOriginal ? moment(e.DateTimeOriginal).format('YYYY-MM-DD hh:mm:ss') : ''
        nm.exifLatitude = e && e.latitude ? e.latitude : -1
        nm.exifLongitude = e && e.longitude ? e.longitude : -1

        result.push(nm)
      } else {
        const image = await resizeFile(img, newWidth, newHeight, 'JPEG', 60, 0, 'JPEG')

        result.push({
          id: new Date().getTime(),
          image: image,
          id_post: id_post_mes,
          exifDateTime: e && e.DateTimeOriginal ? moment(e.DateTimeOriginal).format('YYYY-MM-DD hh:mm:ss') : '',
          exifLatitude: e && e.latitude ? e.latitude : -1,
          exifLongitude: e && e.longitude ? e.longitude : -1
        })
      }
    }
  }

  return result
}

export const makePdf = async (id_post_mes, img, newWidth, newHeight, token, android_id_install) => {
  const { chatServicePost } = await import('app-services-web')
  const body = new FormData()
  body.append('token', token)
  body.append('android_id_install', android_id_install)
  body.append('id_post', id_post_mes)
  body.append('tip', 7)
  body.append('file', img)

  return await chatServicePost.fetchChatPdfUploadWeb(body)
}

export const makeResize = async (id_post_mes, img, newWidth, newHeight, token, android_id_install) => {
  const { chatServicePost } = await import('app-services-web')
  const image = await resizeFile(img, newWidth, newHeight, 'JPEG', 60, 0, 'JPEG')
  let block = image.split(';')
  let contentType = block[0].split(':')[1] // In this case "image/gif"
  let realData = block[1].split(',')[1] // In this case "R0lGODlhPQBEAPeoAJosM...."

  let blob = b64toBlob(realData, contentType)

  const body = new FormData()
  body.append('token', token)
  body.append('android_id_install', android_id_install)
  body.append('id_post', id_post_mes)
  body.append('file', blob)

  return await chatServicePost.fetchChatImgUploadWeb(body)
}

export const makeCamera = async (id_post_mes, image, token, android_id_install) => {
  const { chatServicePost } = await import('app-services-web')
  let block = image.split(';')
  let contentType = block[0].split(':')[1] // In this case "image/gif"
  let realData = block[1].split(',')[1] // In this case "R0lGODlhPQBEAPeoAJosM...."

  let blob = b64toBlob(realData, contentType)

  const body = new FormData()
  body.append('token', token)
  body.append('android_id_install', android_id_install)
  body.append('id_post', id_post_mes)
  body.append('file', blob)

  return await chatServicePost.fetchChatImgUploadWeb(body)
}

export const postPdf = async (postUrl, path, file, user, id_post_mes, token, android_id_install) => {
  const { chatServicePost } = await import('app-services-web')
  let block = file.split(';')
  let contentType = block[0].split(':')[1] // In this case "image/gif"
  let realData = block[1].split(',')[1] // In this case "R0lGODlhPQBEAPeoAJosM...."

  let blob = b64toBlob(realData, contentType)

  postUrl = path + '/set_pdf.php'
  let body = new FormData()
  body.append('token', user.device.token)
  body.append('android_id_install', user.android_id_install)
  body.append('id_post', id_post_mes)
  body.append('tip', 7)
  body.append('file', blob)

  return await chatServicePost.onPostMessagePDF(body, postUrl)
}

export const resizeFile = async (img, newWidth, newHeight, format, quality, rotation, output) => {
  const Resizer = await import('react-image-file-resizer')

  return new Promise(resolve => {
    Resizer.default.imageFileResizer(
      img.file,
      newWidth,
      newHeight,
      format,
      quality,
      rotation,
      uri => {
        resolve(uri)
      },
      output
    )
  })
}

export const b64toBlob = (b64Data, contentType, sliceSize) => {
  contentType = contentType || ''
  sliceSize = sliceSize || 512

  var byteCharacters = atob(b64Data)
  var byteArrays = []

  for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    var slice = byteCharacters.slice(offset, offset + sliceSize)

    var byteNumbers = new Array(slice.length)
    for (var i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i)
    }

    var byteArray = new Uint8Array(byteNumbers)

    byteArrays.push(byteArray)
  }

  return new Blob(byteArrays, { type: contentType })
}

// response_type
export const handleLogin = async setVK => {
  const { Auth } = await import('@vkid/sdk')

  Auth.login(r => {
    if (r.session) {
      setVK(r.session)
    } else {
      console.log('Ошибка авторизации')
    }
  }, 8192)
}

export const handleLogout = async (setVK, access_token) => {
  const { Auth } = await import('@vkid/sdk')

  Auth.logout(access_token)
  setVK({})
}

export const publicVKWall = userVK => {
  // VK.Api.call('wall.post', { owner_id: userVK.user.id, message: 'Пробная новость для размещения в ВК' }, r => {
  //   try {
  //     console.log('r.response', r.response)
  //   } catch (e) {
  //     console.error(e)
  //   }
  // })
  const message = 'Пробная новость для размещения в ВК'
  const url = `https://api.vk.com/method/wall.post?owner_id=${userVK.user.id}&message=${message}&access_token=${userVK.sig}&v=5.124`

  return fetch(url)
    .then(jsondata => jsondata.json())
    .catch(error => error)
}

export const initFirebase = async () => {
  const { firebase } = await import('app-utils-web')

  return firebase
}

export const testConnection = async () => {
  const { dispatch, messagesAction, appAction } = await import('app-store-web')
  const { getAppConfig } = GLOBAL_OBJ.onlinetur.storage

  try {
    const connected = await fetch(getAppConfig().homepage + '/generate_204?_dc=' + new Date().getTime())

    if (connected && connected.status === 200) {
      await dispatch(messagesAction.changeOfflineMode(false))
      await dispatch(appAction.setConnect(true))
      return true
    }
  } catch (e) {
    await dispatch(messagesAction.changeOfflineMode(true))
    await dispatch(appAction.setConnect(false))
    return false
  }
}

export const getFormData = object => {
  const formData = new FormData()
  Object.keys(object).forEach(key => formData.append(key, object[key]))

  return formData
}

export const notifyOffline = async (message = '') => {
  const { dispatch } = await import('app-store-web')
  const { notify } = await import('reapop')

  dispatch(
    notify({
      title: 'Внимание',
      dismissible: true,
      dismissAfter: 7000,
      status: 'error',
      message: message !== '' ? message : 'Ваше сообщение будет доставлено после возобновления связи с инетрнетом.',
      position: 'top-center'
    })
  )
}

export const initVKLogin = () => {
  return null
}

export const setGeoIcon = async (chat, bubble, currentMessage, days_pos) => {
  const { store } = await import('app-store-web')
  const messages = store.getState().chat.messages

  chat.setState(
    state => {
      let geo = new Map(state.geo)
      let ind = messages.findIndex(x => x.id === currentMessage._id)
      messages[ind].days_pos = days_pos

      geo.set(currentMessage._id, days_pos)

      return { geo }
    },
    () => {
      bubble.setGeoImage(days_pos)
    }
  )
}

export const sendCoord = async (chat, bubble, currentMessage, user, utils) => {
  const { Alert, t, Geolocation, chatServicePost } = utils
  const { device, android_id_install } = user

  if (!device) {
    Alert.alert(t('common.attention'), t('common.notAuth'))

    return
  }

  let txt = t('core.mobile.user')

  if (currentMessage.id_hotel < 0) {
    txt += t('core.mobile.resort')
  } else {
    txt += t('core.mobile.hotel')
  }

  Alert.alert(
    txt + currentMessage.name_hotel,
    t('core.mobile.confirm'),
    [
      {
        text: t('common.cancel'),
        onPress: () => console.log('Cancel Pressed'),
        style: 'destructive'
      },
      {
        text: t('common.confirm'),
        style: 'destructive',
        onPress: async () => {
          if (isEmpty(user)) {
            Alert.alert(t('common.attention'), t('common.notAuth'))
            return
          }

          Geolocation.getCurrentPosition(async info => {
            if (info.coords.latitude > 0 && info.coords.longitude > 0) {
              let body = new FormData()
              body.append('token', device.token)
              body.append('android_id_install', android_id_install)
              body.append('id_chat', currentMessage.id)
              body.append('latitude', info.coords.latitude)
              body.append('longitude', info.coords.longitude)
              const a = await chatServicePost.fetchData(body)

              if (!a) {
                Alert.alert(t('common.attention'), t('core.mobile.notLocation'))
                return
              }

              if (a.code === 2) {
                Alert.alert(t('common.errorTitle'), t('core.mobile.far'))
              } else if (a.code !== 0) {
                Alert.alert(t('common.errorTitle'), t('core.mobile.notConfirm'))
              } else {
                setGeoIcon(chat, bubble, currentMessage, a.code)
                Alert.alert(currentMessage.id_user !== user.id_user ? t('core.mobile.current') : '', t('core.mobile.yesConfirm'))
              }

              this.locationSubscription && this.locationSubscription()
            } else {
              Alert.alert(t('common.attention'), t('core.mobile.notLocation'))
            }
          })
        }
      }
    ],
    { cancelable: false }
  )
}

export const openLinkPhone = tel => {
  let phoneNumber

  if (Platform.OS === 'android' || Platform.OS === 'web') {
    phoneNumber = `tel:${tel}`
  } else {
    phoneNumber = `telprompt:${tel}`
  }

  Linking.openURL(phoneNumber)
}

export const openLinkSms = tel => {
  let phoneNumber

  if (Platform.OS === 'android') {
    phoneNumber = `sms:${tel}`
  } else {
    phoneNumber = `sms:${tel}`
  }
  Linking.openURL(phoneNumber)
}

export const addContact = async contact => {
  if (Platform.OS === 'web') {
    toast.show('В браузере добавить контакт не возможно. Используйте мобильную версию.', {
      type: 'danger',
      placement: 'top',
      animationType: 'zoom-in',
      onPress: id => {
        toast.hide(id)
      }
    })

    return
  }

  const Contacts = await import('react-native-contacts')
  const tel = {}
  tel.label = 'mobile'
  tel.number = contact.phones[0]

  let newPerson = {
    familyName: contact.name,
    phoneNumbers: []
  }
  newPerson.phoneNumbers.push(tel)

  Contacts.default.openContactForm(newPerson)
}

function createUUID() {
  var s = []
  var hexDigits = '0123456789ABCDEF'
  for (var i = 0; i < 24; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1)
  }
  s[12] = '4' // bits 12-15 of the time_hi_and_version field to 0010
  s[16] = hexDigits.substr((s[16] & 0x3) | 0x8, 1) // bits 6-7 of the clock_seq_hi_and_reserved to 01

  var uuid = s.join('')
  return uuid
}

export const convertDMSToDD = (degrees, minutes, seconds, direction) => {
  var dd = degrees + minutes / 60 + seconds / 3600
  if (direction === 'S' || direction === 'W') {
    dd = dd * -1
  }
  return dd
}

export const convertExif = async item => {
  let selectedLocation = {}

  if (item.exif) {
    let latitude = item.exif.GPSLatitude || (item.exif['{GPS}'] && item.exif['{GPS}'].Latitude)
    let longitude = item.exif.GPSLongitude || (item.exif['{GPS}'] && item.exif['{GPS}'].Longitude)

    if (latitude && longitude) {
      if (latitude.toString().includes('/') || latitude.toString().includes(',')) {
        let splittedLatitude = latitude.split(',').map(d => eval(d))
        let splittedLongitude = longitude.split(',').map(d => eval(d))

        if (splittedLatitude && splittedLatitude.length && splittedLongitude && splittedLongitude.length) {
          let finalLatitude = convertDMSToDD(...splittedLatitude, item.exif.GPSLatitudeRef)
          let finalLongitude = convertDMSToDD(...splittedLongitude, item.exif.GPSLongitudeRef)
          if (finalLatitude && finalLongitude) {
            selectedLocation = {
              lat: finalLatitude,
              lng: finalLongitude
            }
          }
        }
      }
    }
  }

  return selectedLocation
}

export const setExifImages = async images => {
  try {
    for (let i = 0; i < images.length; i++) {
      if (Platform.OS === 'ios') {
        let date = images[i].exif && images[i].exif['{Exif}'] && images[i].exif['{Exif}'].DateTimeOriginal ? images[i].exif['{Exif}'].DateTimeOriginal : ''

        if (date !== '') {
          let date_new = date.split(' ')
          images[i].exifDateTime = date_new[0].replace(new RegExp(':', 'g'), '-') + ' ' + date_new[1]
        } else {
          images[i].exifDateTime = ''
        }

        images[i].exifLatitude = images[i].exif && images[i].exif['{GPS}'] && images[i].exif['{GPS}'].Latitude ? images[i].exif['{GPS}'].Latitude : -1
        images[i].exifLongitude = images[i].exif && images[i].exif['{GPS}'] && images[i].exif['{GPS}'].Longitude ? images[i].exif['{GPS}'].Longitude : -1
        images[i].is_send = 0
        images[i].localIdentifier = createUUID()
      } else if (Platform.OS === 'android') {
        let date = images[i].exif && images[i].exif.DateTime ? images[i].exif.DateTime : ''

        if (date !== '') {
          let date_new = date.split(' ')
          images[i].exifDateTime = date_new[0].replace(new RegExp(':', 'g'), '-') + ' ' + date_new[1]
        } else {
          images[i].exifDateTime = ''
        }

        const img = await convertExif(images[i])

        images[i].exifLatitude = img.lat ? img.lat : -1
        images[i].exifLongitude = img.lng ? img.lng : -1
        images[i].is_send = 0
        images[i].localIdentifier = createUUID()
      } else {
        images[i].exifDateTime = images[i].exifDateTime ? images[i].exifDateTime : ''
        images[i].exifLatitude = images[i].exifLatitude ? images[i].exifLatitude : -1
        images[i].exifLongitude = images[i].exifLongitude ? images[i].exifLongitude : -1
        images[i].is_send = 0
        images[i].localIdentifier = createUUID()
      }
    }
  } catch (e) {
    console.log('setExifImages ERROR', e)
  }

  return images
}

export const addImagesToChat = (cmp, imgs) => {
  const { Alert, t } = cmp.props.utils
  const { images, setChatImages } = cmp.props

  if (images.length + imgs.length > 30) {
    Alert.alert(t('common.attention'), t('core.mobile.pic12'))
    return
  }

  if (images.length === 0) {
    setChatImages(imgs)
  } else {
    let addImg = images.concat(imgs)
    addImg = uniqBy(addImg, 'localIdentifier')
    setChatImages(addImg)
  }
}

export const getImagesVideo = async cmp => {
  const { Alert, t, requestMediaLibraryPermissionsAsync, launchImageLibraryAsync } = cmp.props.utils
  const { images, setChatImages } = cmp.props

  if (images.length > 30) {
    Alert.alert(t('common.attention'), t('core.mobile.pic12'))
    return
  }

  const permissionResult = await requestMediaLibraryPermissionsAsync()

  if (!permissionResult.granted) {
    toast.show('Доступ к галереи закрыт. Для выбора фото/видео требуется разрешение.', {
      type: 'danger',
      placement: 'top',
      animationType: 'zoom-in',
      onPress: id => {
        toast.hide(id)
      }
    })

    return
  }

  launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsMultipleSelection: true,
    quality: 1,
    exif: true
  }).then(imagesSelect => {
    if (imagesSelect.canceled) {
      return
    }

    setExifImages(imagesSelect.assets, cmp.props.utils).then(imgs => {
      if (imgs[0].exifLatitude === -1 && imgs[0].exifLongitude === -1) {
        addImagesToChat(cmp, imgs)

        return
      }

      Alert.alert(t('core.mobile.send'), '', [
        {
          text: t('common.yes'),
          onPress: async () => {
            addImagesToChat(cmp, imgs)
          }
        },
        {
          text: t('core.mobile.chatGeo'),
          onPress: async () => {
            let locations = {}

            locations.latitude = imgs[0].exifLatitude.toString()
            locations.longitude = imgs[0].exifLongitude.toString()

            addImagesToChat(cmp, imgs)

            await cmp.changeLocation(locations)
          }
        }
      ])
    })
  })
}

export const getImages360 = async cmp => {
  const { Alert, t, requestMediaLibraryPermissionsAsync, launchImageLibraryAsync } = cmp.props.utils
  const { images, setChatImages360 } = cmp.props

  if (images.length > 30) {
    Alert.alert(t('common.attention'), t('core.mobile.pic12'))
    return
  }

  const permissionResult = await requestMediaLibraryPermissionsAsync()

  if (!permissionResult.granted) {
    toast.show('Доступ к галереи закрыт. Для выбора фото/видео требуется разрешение.', {
      type: 'danger',
      placement: 'top',
      animationType: 'zoom-in',
      onPress: id => {
        toast.hide(id)
      }
    })
  }

  launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsMultipleSelection: false,
    quality: 1,
    exif: true
  }).then(imagesSelect => {
    if (imagesSelect.canceled) {
      return
    }

    setExifImages(imagesSelect.assets).then(imgs => {
      if (imgs[0].exifLatitude === -1 && imgs[0].exifLongitude === -1) {
        imgs[0].is_image360 = 1
        // addImagesToChat(cmp, imgs)
        setChatImages360(imgs[0])

        return
      }

      Alert.alert(t('core.mobile.send'), '', [
        {
          text: t('common.yes'),
          onPress: async () => {
            imgs[0].is_image360 = 1
            // addImagesToChat(cmp, imgs)
            setChatImages360(imgs[0])
          }
        },
        {
          text: t('core.mobile.chatGeo'),
          onPress: async () => {
            let locations = {}

            locations.latitude = imgs[0].exifLatitude.toString()
            locations.longitude = imgs[0].exifLongitude.toString()

            imgs[0].is_image360 = 1
            // addImagesToChat(cmp, imgs)
            setChatImages360(imgs[0])

            await cmp.changeLocation(locations)
          }
        }
      ])
    })
  })
}
