/**
 * -----------------------------------------------------------------------
 *  Author      : Alexey Zolotarеv
 *  E-mail      : azesm@me.com
 * -----------------------------------------------------------------------
 */

import isString from 'lodash/isString'
import { Platform } from 'react-native'

const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
const { getAppConfig, getAppConstants, getChatComponent, getSelectCategory } = GLOBAL_OBJ.onlinetur.storage

export const getError = async (url, code) => {
  const { mobile } = await import('app-mobile-web')
  const { getState } = await import('app-store-web')
  const { t } = await import('app-utils-web')
  const state = getState()

  if (!state.offline.offline) {
    let errorCode = 'с сервером #'

    if (url.indexOf('beta.distant-office.ru') > -1) {
      errorCode += '2'
    } else if (url.indexOf('onlinetur.ru') > -1) {
      errorCode += '1'
    } else if (url.indexOf('zagrebon.com') > -1) {
      errorCode += '3'
    }

    if (Platform.OS !== 'web') {
      const chat = getChatComponent()
      if (code === 'ECONNABORTED') {
        chat.setState({ textSnackbar: t('common.notConnect') + '\n' + errorCode })
      } else {
        chat.setState({ textSnackbar: t('common.errorServer') + '\n' + errorCode })
      }
    } else {
      if (code === 'ECONNABORTED') {
        mobile.notifyOffline(t('common.notConnect') + '\n' + errorCode).then()
      } else {
        mobile.notifyOffline(t('common.errorServer') + '\n' + errorCode).then()
      }
    }
  }
}
/**
 * Запрос для всех GET
 * @param url
 * @returns {Promise<any>}
 */
export const fetch = async url => {
  const axios = await import('axios')
  const { getState } = await import('app-store-web')

  return new Promise((resolve, reject) => {
    try {
      const lang = getState().app.appLangInterface
      // getAppLang() ? getAppLang() : 'ru'
      const app = Platform.OS === 'ios' ? '11' : Platform.OS === 'web' ? '12' : '12'
      const cat = getSelectCategory()
      const user = getState().user.user
      url += '&category_id=' + (cat.id ? cat.id : '1') + '&lg=' + lang + '&app=' + app

      if (user && user.device && user.device.token) {
        url += '&apid=' + user.id_user + (user.is_sotr === 1 ? '&agn=2' : '')
      }

      url += '&site=' + (Platform.OS === 'web' ? getAppConfig().siteName : Platform.OS === 'ios' ? 'ios' : 'android')

      axios.default
        .get(url, {
          timeout: 30000
        })
        .then(response => {
          if (response && response.status === 200 && !isString(response.data)) {
            resolve(response.data)
          } else {
            setTimeout(() => {
              getError(response.config.url, 'ERROR_SERVER')
            }, 500)

            resolve([])
          }
        })
        .catch(error => {
          getError(error.config.url, error.code)

          resolve([])
        })
    } catch (error) {
      resolve([])
    }
  })
}

/**
 * Получение списка категорий
 * @returns {Promise<any>}
 */
// async categoryList(android_id_install, token) {
//   const deviceId = android_id_install !== 'null' && android_id_install !== 'undefined' && android_id_install ? android_id_install : ''
//   const path = getAppConstants().url_main + getAppConstants().url_api3_path
//   const url = `${path}/get_list_categories.php?android_id_install=${deviceId}&token=${token}`
//
//   return await fetch(url)
// }

//     return await props.dispatch(appApi.endpoints.getDataPosts.initiate({
//       android_id_install: android_id_install,
//       token: token,
//       fcmToken: fcmToken,
//       category: category
//     })).unwrap()
/**
 * Получение данных по выбранной категории
 * @returns {Promise<any>}
 */
// dataList = async (android_id_install, token, fcmToken, category, short = true) => {
//   const path = getAppConstants().url_main + getAppConstants().url_api3_path
//   const user = getState().user.user
//   const deviceId = android_id_install !== 'null' && android_id_install !== 'undefined' && android_id_install ? android_id_install : ''
//   const sh = short ? '&short=1' : ''
//
//   let url = `${path}/get_list_posts.php?token=${token}&push_id=${fcmToken ? fcmToken : ''}&del=0&android_id_install=${deviceId}&id_categories=${category}${sh}`
//
//   if (user && user.device && user.device.token) {
//     url = `${path}/get_list_posts.php?token=${token}&push_id=${fcmToken ? fcmToken : ''}&del=0&android_id_install=${deviceId}&id_categories=${category}${sh}`
//   }
//
//   return await fetch(url)
// }
//
// /**
//  * Получение данных по выбранной категории для агента
//  * @returns {Promise<any>}
//  */
// async dataAgentList(android_id_install, token, fcmToken, category) {
//   const path = getAppConstants().url_main + getAppConstants().url_api3_path
//   const deviceId = android_id_install !== 'null' && android_id_install !== 'undefined' && android_id_install ? android_id_install : ''
//   let url = `${path}/get_list_posts.php?token=${token}&sotr_chat=1&del=0&tip_chat=1&push_id=${fcmToken ? fcmToken : ''}&android_id_install=${deviceId}&id_categories=${category}`
//
//   return await fetch(url)
// }

/**
 * Получение данных по отелям выбранного чата
 * @returns {Promise<any>}
 */
export const dataHotelsList = async (android_id_install = '', country = '', sotr_chat = '', category_id) => {
  const deviceId = android_id_install !== 'null' && android_id_install !== 'undefined' && android_id_install ? android_id_install : ''
  let url = `${getAppConstants().url_beta}/hotels.php?json=2&v=2&country=${
    country && String(country) !== 'null' ? country : ''
  }&sotr_chat=${sotr_chat}&del=0&android_id_install=${deviceId}&id_categories=${category_id}`

  return await fetch(url)
}

/**
 * Получение данных по местам выбранного чата
 * @returns {Promise<any>}
 */
export const dataPlacesList = async (android_id_install, country, sotr_chat = '', category_id, latitude = '', longitude = '') => {
  const deviceId = android_id_install !== 'null' && android_id_install !== 'undefined' && android_id_install ? android_id_install : ''
  // eslint-disable-next-line max-len
  let url = `${getAppConstants().url_beta}/places.php?json=1&country=${country}&withsub=1&sotr_chat=${sotr_chat}&del=0&android_id_install=${deviceId}&id_categories=${category_id}&lat=${latitude}&lon=${longitude}`

  return await fetch(url)
}

/**
 * Получение данных по местам выбранного чата
 * @returns {Promise<any>}
 */
export const getJsonRequest = async (url, body) => {
  let urlNew = url + '?' + body.toString()

  return await fetch(urlNew)
}

/**
 * Авторизация на сервере и получение данных
 * @returns {Promise<any>}
 */

export const registerOnServer = async (idToken, uniqueId, referal = '', authType = '', fcmToken = '', expoToken = '', device = '') => {
  const deviceId = uniqueId !== 'null' && uniqueId !== 'undefined' && uniqueId ? uniqueId : ''
  const path = getAppConstants().url_main + getAppConstants().url_api3_path
  let url = ''

  if (authType === 'apple') {
    url = `${path}/auth_firebase.php?android_id_install=${deviceId}&idToken=${idToken}&referrer=${referal}&push_id=${fcmToken}&expo_push_id=${expoToken}${device}`
  } else if (authType === 'android') {
    url = `${path}/auth.php?android_id_install=${deviceId}&token=${idToken}&referrer=${referal}&push_id=${fcmToken}&expo_push_id=${expoToken}${device}`
  } else if (authType === 'quick') {
    url = `${path}/auth.php?android_id_install=${deviceId}&token=${idToken}&referrer=${referal}&push_id=${fcmToken}&expo_push_id=${expoToken}${device}`
  } else if (authType === 'web') {
    url = `${path}/auth_firebase.php?idToken=${idToken}&referrer=${referal}&old_android_id=${uniqueId}&push_id=${fcmToken}&expo_push_id=${expoToken}${device}`
  } else if (authType === 'email') {
    url = `${path}/auth_firebase.php?idToken=${idToken}&referrer=${referal}&old_android_id=${uniqueId}&push_id=${fcmToken}&expo_push_id=${expoToken}${device}`
  } else if (authType === 'fast') {
    url = `${path}/auth_fast.php?email=${uniqueId}&hash=${idToken}&name=${referal}&push_id=${fcmToken}&expo_push_id=${expoToken}${device}`
  }

  return await fetch(url, {
    method: 'get',
    credentials: 'include'
  })
  // .then(data => data.json())
  // .catch(error => error.message)
}

export const getStartAppReg = async (uniqueId, referrer = '') => {
  const path = getAppConstants().url_main + getAppConstants().url_api3_path
  const deviceId = uniqueId !== 'null' && uniqueId !== 'undefined' && uniqueId ? uniqueId : ''

  return await fetch(`${path}/ref.php?android_id_install=${deviceId}&referrer=${referrer}`)
}

/**
 * Получаем список радиостанций с сервера
 * @returns {Promise<any>}
 */
export const getStation = async () => {
  return await fetch(getAppConstants().url_radio + '?_dc2=' + new Date().getTime().toString())
}

export const fetchCategoryNews = async (token, android_id_install, id_categories) => {
  const deviceId = android_id_install !== 'null' && android_id_install !== 'undefined' && android_id_install ? android_id_install : ''
  const path = getAppConstants().url_main + getAppConstants().url_api3_path
  let url = `${path}/get_list_news.php?token=${token}&del=0&android_id_install=${deviceId}&id_categories=${id_categories}`

  return await fetch(url)
}

export const fetchCategoryNewsBG = async (token, android_id_install, id_categories) => {
  const path = getAppConstants().url_main + '/api/chat_v3'
  const deviceId = android_id_install !== 'null' && android_id_install !== 'undefined' && android_id_install ? android_id_install : ''
  let url = `${path}/get_list_news.php?token=${token}&del=0&android_id_install=${deviceId}&id_categories=${id_categories}`

  return await fetch(url)
}

export const changeTypeNews = async (token, android_id_install, id, is_check) => {
  const deviceId = android_id_install !== 'null' && android_id_install !== 'undefined' && android_id_install ? android_id_install : ''
  const path = getAppConstants().url_main + getAppConstants().url_api3_path
  let url = `${path}/checked_news_list.php?token=${token}&del=0&android_id_install=${deviceId}&id=${id}&is_check=${is_check}`

  return await fetch(url)
}

export const fetchWarning = async (token, android_id_install, id, is_warning) => {
  const deviceId = android_id_install !== 'null' && android_id_install !== 'undefined' && android_id_install ? android_id_install : ''
  const path = getAppConstants().url_main + getAppConstants().url_api3_path
  let isWarning = is_warning === 1 ? 0 : 1
  let url = `${path}/warning_chat.php?token=${token}&android_id_install=${deviceId}&id_chat=${id}&tip=${isWarning}`

  return await fetch(url)
}

export const fetchBan = async (token, android_id_install, id_user, is_ban) => {
  const deviceId = android_id_install !== 'null' && android_id_install !== 'undefined' && android_id_install ? android_id_install : ''
  const path = getAppConstants().url_main + getAppConstants().url_api1_path
  let isBan = is_ban === 1 ? 0 : 1
  let url = `${path}/ban_chat.php?token=${token}&android_id_install=${deviceId}&id_user=${id_user}&tip=${isBan}`

  return await fetch(url)
}

export const getJsonNews = async url => {
  return await fetch(url)
}

export const fetchComplain = async (token, android_id_install) => {
  const deviceId = android_id_install !== 'null' && android_id_install !== 'undefined' && android_id_install ? android_id_install : ''
  const path = getAppConstants().url_main + getAppConstants().url_api3_path
  let url = `${path}/claim.php?token=${token}&android_id_install=${deviceId}`

  return await fetch(url)
}

export const fetchBlock = async (token, android_id_install, id) => {
  const deviceId = android_id_install !== 'null' && android_id_install !== 'undefined' && android_id_install ? android_id_install : ''
  const path = getAppConstants().url_main + getAppConstants().url_api3_path
  let url = `${path}/block_user.php?token=${token}&android_id_install=${deviceId}&id_user=${id}&tip=1`

  return await fetch(url)
}

export const sendAuthApple = async (android_id_install, token, email, name) => {
  const deviceId = android_id_install !== 'null' && android_id_install !== 'undefined' && android_id_install ? android_id_install : ''
  const path = getAppConstants().url_main + getAppConstants().url_api3_path
  let fio = encodeURI(name)
  let referrer = ''
  let url = `${path}/auth_apple.php?android_id_install=${deviceId}&apple_id=${token}&email=${email}&name=${fio}&referrer=${referrer}`

  return await fetch(url)
}

export const sendAuthCodeApple = async (android_id_install, token, email, code, name) => {
  const deviceId = android_id_install !== 'null' && android_id_install !== 'undefined' && android_id_install ? android_id_install : ''
  const path = getAppConstants().url_main + getAppConstants().url_api3_path
  let fio = encodeURI(name)
  let referrer = ''
  let url = `${path}/auth_apple.php?android_id_install=${deviceId}&apple_id=${token}&email=${email}&name=${fio}&referrer=${referrer}&code=${code}`

  return await fetch(url)
}

export const fetchSetStatusPush = async (fcmToken = '', expoToken = '', token, android_id_install, id_post, id_hotel, id_hobbi, status, tip_chat = 0) => {
  const deviceId = android_id_install !== 'null' && android_id_install !== 'undefined' && android_id_install ? android_id_install : ''
  const path = getAppConstants().url_main + getAppConstants().url_api3_path
  let url = `${path}/set_status.php?token=${token}&android_id_install=${deviceId}&id_post=${id_post}&id_hotel=${id_hotel}&id_hobbi=${id_hobbi}&status=${status}&push_id=${
    fcmToken ? fcmToken : ''
  }&expo_push_id=${expoToken ? expoToken : ''}&tip_chat=${tip_chat}`

  return await fetch(url)
}

export const fetchCheckNotify = async (android_id_install, token) => {
  const deviceId = android_id_install !== 'null' && android_id_install !== 'undefined' && android_id_install ? android_id_install : ''
  const path = getAppConstants().url_main + getAppConstants().url_api3_path
  let url = `${path}/get_notyf_chat.php?token=${token}&android_id_install=${deviceId}`

  return await fetch(url)
}

export const setAgentPassword = async (android_id_install, token, code) => {
  const deviceId = android_id_install !== 'null' && android_id_install !== 'undefined' && android_id_install ? android_id_install : ''
  const path = getAppConstants().url_main + getAppConstants().url_api3_path
  const url = `${path}/setsotruser.php?pass=${code}&token=${token}&android_id_install=${deviceId}`

  return await fetch(url)
}

export const getViewHotel = async (idHotels, android_id_install, token) => {
  const path = getAppConstants().url_hotel
  const url = path + '?action=h_desc&huid=' + idHotels

  return await fetch(url)
}

export const getViewHotelPhoto = async idHotel => {
  const path = getAppConstants().url_main + getAppConstants().url_api3_path
  const url = path + '/get_images_like_hotel.php?id_hotel=' + idHotel

  return await fetch(url)
}

export const getViewPlace = async (idPlace, android_id_install, token) => {
  const path = getAppConstants().url_place
  const url = path + '?action=p_desc&puid=' + idPlace
  return await fetch(url)
}

export const getViewHotelPay = async (idHotel, android_id_install, token, id_categories) => {
  const deviceId = android_id_install !== 'null' && android_id_install !== 'undefined' && android_id_install ? android_id_install : ''
  const path = getAppConstants().url_main + getAppConstants().url_api3_path + getAppConstants().url_hotel_pay
  const url = path + `?android_id_install=${deviceId}&token=${token}&id_hotel=${idHotel}&id_categories=${id_categories}`

  return await fetch(url)
}

export const fetchHotelsBeside = async (token = '', android_id_install = '', lat, lon, sotr_chat = '', category_id) => {
  const deviceId = android_id_install !== 'null' && android_id_install !== 'undefined' && android_id_install ? android_id_install : ''
  const path = getAppConstants().url_beta
  let url = `${path}/hotels.php?json=2&v=2&lat=${lat}&lon=${lon}&token=${token}&sotr_chat=${sotr_chat}&del=0&android_id_install=${deviceId}&id_categories=${category_id}`

  return await fetch(url)
}

export const fetchGetArticle = async (id, android_id_install, token) => {
  const deviceId = android_id_install !== 'null' && android_id_install !== 'undefined' && android_id_install ? android_id_install : ''
  const path = getAppConstants().url_main + getAppConstants().url_api3_path
  let url = `${path}/onews.php?id_news=${id}&android_id_install=${deviceId}&token=${token}&ios=1`

  return await fetch(url)
}

export const fetchLikeNews = async (id, user, like) => {
  const deviceId = user.android_id_install !== 'null' && user.android_id_install !== 'undefined' && !user.android_id_install ? user.android_id_install : ''
  const path = getAppConstants().url_main + getAppConstants().url_api3_path
  let url = `${path}/olike.php?android_id_install=${deviceId}&token=${user.device.token}&id_news=${id}&ball=${like}`

  return await fetch(url)
}

export const fetchAddPost = async (token, android_id_install, title, id, id_country, category) => {
  const deviceId = android_id_install !== 'null' && android_id_install !== 'undefined' && android_id_install ? android_id_install : ''
  const path = getAppConstants().url_main + getAppConstants().url_api3_path
  title = encodeURI(title)
  let url = `${path}/add_post_hotel.php?android_id_install=${deviceId}&token=${token}&title=${title}&id=${id}&id_country=${id_country}&id_categories=${category}`

  return await fetch(url)
}

export const fetchSetSotr = async (code, token, uniqueId) => {
  const deviceId = uniqueId !== 'null' && uniqueId !== 'undefined' && uniqueId ? uniqueId : ''
  const path = getAppConstants().url_main + getAppConstants().url_api3_path
  let url = `${path}/setsotruser.php?pass=${code}&token=${token}&android_id_install=${deviceId}`

  return await fetch(url)
}

export const setSotrTown = async (city, token, uniqueId) => {
  const deviceId = uniqueId !== 'null' && uniqueId !== 'undefined' && uniqueId ? uniqueId : ''
  const path = getAppConstants().url_main + getAppConstants().url_api3_path
  let url = `${path}/setsotruser.php?city=${city}&token=${token}&android_id_install=${deviceId}`

  return await fetch(url)
}

export const fetchChatParams = async id => {
  const path = getAppConstants().url_main + getAppConstants().url_api3_path
  let url = `${path}/get_info_title.php?id_chat=${id}`

  return await fetch(url)
}

export const dataHotelsListWithPage = async (android_id_install = '', country = '', sotr_chat = '', page = 0, size = 300, category_id) => {
  const deviceId = android_id_install !== 'null' && android_id_install !== 'undefined' && android_id_install ? android_id_install : ''
  let url = `${getAppConstants().url_beta}/hotels.php?json=2&v=2&page=${page}&size=${size}&country=${
    country && String(country) !== 'null' ? country : '-1'
  }&sotr_chat=${sotr_chat}&del=0&android_id_install=${deviceId}&id_categories=${category_id}`

  return await fetch(url)
}

export const dataHotelsListSearch = async (android_id_install = '', country, sotr_chat = '', page = 0, size = 300, pattern = '') => {
  const deviceId = android_id_install !== 'null' && android_id_install !== 'undefined' && android_id_install ? android_id_install : ''

  let url = `${getAppConstants().url_beta}/hotels.php?json=2&v=2&pattern=${pattern}&page=${page}&size=${size}&country=${country}&sotr_chat=${sotr_chat}&del=0&android_id_install=${deviceId}`

  return await fetch(url)
}

export const dataHotelsRatingSearch = async (android_id_install = '', country, sotr_chat = '', page = 0, size = 300, pattern = '') => {
  let url = `${getAppConstants().url_rating}?action=get_top_rate&cuid=&puid=&lim=${size}&ofs=0&hclass=&pattern=${pattern}&add=1&category_id=1&lg=ru&app=12`

  return await fetch(url)
}

export const getAuthUser = async () => {
  let url = `${getAppConstants().url_api_main}${getAppConstants().url_api}/auth_token.php`

  return await fetch(url, {
    method: 'get',
    headers: {
      Accept: 'application/json'
    },
    credentials: 'include'
  })
    .then(jsondata => jsondata.json())
    .catch(error => error)
}

/**
 * Получение данных по ациям
 * @returns {Promise<any>}
 */
export const dataListAction = async (android_id_install, token, id_chat) => {
  const deviceId = android_id_install !== 'null' && android_id_install !== 'undefined' && android_id_install ? android_id_install : ''
  const path = getAppConstants().url_main + getAppConstants().url_action
  let url = `${path}?token=${token}&android_id_install=${deviceId}&id_chat=${id_chat}`

  return await fetch(url)
}

/**
 * Получение данных по брони
 * @returns {Promise<any>}
 */
export const dataListRequest = async (android_id_install, token, id_chat) => {
  const deviceId = android_id_install !== 'null' && android_id_install !== 'undefined' && android_id_install ? android_id_install : ''
  const path = getAppConstants().url_main + getAppConstants().url_request
  let url = `${path}?token=${token}&android_id_install=${deviceId}&id_chat=${id_chat}`

  return await fetch(url)
}

export const setPromoBron = async (android_id_install, token, id_promo) => {
  const deviceId = android_id_install !== 'null' && android_id_install !== 'undefined' && android_id_install ? android_id_install : ''
  const path = getAppConstants().url_main + getAppConstants().url_promo
  let url = `${path}?token=${token}&android_id_install=${deviceId}&id_promo_user=-1&id_promo=${id_promo}&id_action=0&msg=`

  return await fetch(url)
}

export const getPromoBronUser = async (android_id_install, token) => {
  const deviceId = android_id_install !== 'null' && android_id_install !== 'undefined' && android_id_install ? android_id_install : ''
  const path = getAppConstants().url_main + getAppConstants().url_promo_user
  let url = `${path}?token=${token}&android_id_install=${deviceId}`

  return await fetch(url)
}

export const setPromoBronUser = async (android_id_install, token, id_promo_user, last, first, phone) => {
  const deviceId = android_id_install !== 'null' && android_id_install !== 'undefined' && android_id_install ? android_id_install : ''
  const path = getAppConstants().url_main + getAppConstants().url_promo_user_add
  let url = `${path}?token=${token}&android_id_install=${deviceId}&id_promo_user=${id_promo_user}&surname=${last}&firstname=${first}&phone=${phone}`

  return await fetch(url)
}

export const getPromoAction = async (android_id_install, token, id_categories) => {
  const deviceId = android_id_install !== 'null' && android_id_install !== 'undefined' && android_id_install ? android_id_install : ''
  const path = getAppConstants().url_main + '/api/chat_v3/get_promo_categ.php'
  let url = `${path}?token=${token}&android_id_install=${deviceId}&id_categories=${id_categories}`

  return await fetch(url)
}

export const getPromoActionRooms = async (android_id_install, token, id_hotel) => {
  const deviceId = android_id_install !== 'null' && android_id_install !== 'undefined' && android_id_install ? android_id_install : ''
  const path = getAppConstants().url_main + '/api/chat_v3/get_hotel_room.php'
  let url = `${path}?token=${token}&android_id_install=${deviceId}&id_hotel=${id_hotel}`

  return await fetch(url)
}

export const getPromoActionPeoples = async (android_id_install, token, id_hotel, id_room, id_food) => {
  const deviceId = android_id_install !== 'null' && android_id_install !== 'undefined' && android_id_install ? android_id_install : ''
  const path = getAppConstants().url_main + '/api/chat_v3/get_hotel_room_peoples.php'
  let url = `${path}?token=${token}&android_id_install=${deviceId}&id_hotel=${id_hotel}&id_room=${id_room}&id_food=${id_food}`

  return await fetch(url)
}

export const getPromoRequest = async (android_id_install, token, id_hotel) => {
  const deviceId = android_id_install !== 'null' && android_id_install !== 'undefined' && android_id_install ? android_id_install : ''
  const path = getAppConstants().url_main + '/api/chat_v3/get_promo.php'
  let url = `${path}?token=${token}&android_id_install=${deviceId}&id_hotel=${id_hotel}`

  return await fetch(url)
}

export const fetchUserViewArticle = async (id, id_user) => {
  const path = getAppConstants().url_news
  let url = `${path}/i${id}.json?u=${id_user}`

  return await fetch(url)
}

/**
 * Получаем данные по уведомлению в чате
 * @param token
 * @param uniqueId
 * @param id_post
 * @param id_hotel
 * @param id_hobbi
 * @param tip_chat
 * @returns {Promise<any>}
 */
export const getInfoChat = async (token, uniqueId, id_post, id_hotel, id_hobbi, tip_chat) => {
  const deviceId = uniqueId !== 'null' && uniqueId !== 'undefined' && uniqueId ? uniqueId : ''
  const path = getAppConstants().url_main + getAppConstants().url_api3_path
  let url = `${path}/get_info_chat.php?token=${token}&android_id_install=${deviceId}&id_post=${id_post}&id_hotel=${id_hotel}&id_hobbi=${id_hobbi}&tip_chat=${tip_chat}`

  return await fetch(url)
}

export const getListNotify = async (token, uniqueId) => {
  const deviceId = uniqueId !== 'null' && uniqueId !== 'undefined' && uniqueId ? uniqueId : ''
  const path = getAppConstants().url_main + getAppConstants().url_api3_path
  let url = `${path}/get_list_notyf.php?token=${token}&android_id_install=${deviceId}`

  return await fetch(url)
}

export const getReferalUser = async () => {
  const path = getAppConstants().url_main + getAppConstants().url_api3_path
  let url = `${path}/ref.php` + '?_dc=' + new Date().getTime().toString()

  return await fetch(url)
}

export const getRatingHotels = async url => {
  const path = getAppConstants().url_rating

  return await fetch(path + '?' + url)
}

export const getRatingPlaces = async counries_ids => {
  if (!counries_ids) {
    return []
  }
  const path = getAppConstants().url_places

  return await fetch(path + counries_ids)
}

export const getPlatforms = async id_category => {
  const path = getAppConstants().url_main + getAppConstants().url_api3_path + getAppConstants().url_platform

  return await fetch(path + id_category)
}

export const getRatingCategory = async id_category => {
  const path = getAppConstants().url_categories

  return await fetch(path)
}

export const getMyRating = async url => {
  const path = getAppConstants().url_rating

  return await fetch(path + '?' + url)
}

export const getPriceHotelsRatingId = async url => {
  return await fetch(url)
}

export const getPriceHotelsRatingList = async url => {
  return await fetch(url)
}

export const setMyRating = async url => {
  const path = getAppConstants().url_rating

  return await fetch(path + '?' + url)
}

export const getHTMLMain = async (token, uniqueId, page) => {
  const deviceId = uniqueId !== 'null' && uniqueId !== 'undefined' && uniqueId ? uniqueId : ''
  const path = getAppConstants().url_main + getAppConstants().url_api3_path + getAppConstants().url_html_main
  let url = `${path}?token=${token}&android_id_install=${deviceId}&id_categories=1&package=org.reactjs.native.OnlineTur&page=${page}`

  return await fetch(url)
}

export const getSortActions = async (token, uniqueId, id_category) => {
  const deviceId = uniqueId !== 'null' && uniqueId !== 'undefined' && uniqueId ? uniqueId : ''
  const path = getAppConstants().url_main + getAppConstants().url_api3_path + getAppConstants().url_actions
  let url = `${path}?token=${token}&android_id_install=${deviceId}&id_categories=${id_category}`

  return await fetch(url)
}

export const getListActions = async (token, uniqueId, id_category, limit, offset, sort) => {
  const deviceId = uniqueId !== 'null' && uniqueId !== 'undefined' && uniqueId ? uniqueId : ''
  const path = getAppConstants().url_main + getAppConstants().url_api3_path + getAppConstants().url_actions_list
  let url = `${path}?token=${token}&android_id_install=${deviceId}&id_categories=${id_category}&lim=${limit}&ofs=${offset}${sort}`

  return await fetch(url)
}

export const getListHotelActions = async (token, uniqueId, id_category, id_hotel, limit, offset, sort = '') => {
  const deviceId = uniqueId !== 'null' && uniqueId !== 'undefined' && uniqueId ? uniqueId : ''
  const path = getAppConstants().url_main + getAppConstants().url_api3_path + getAppConstants().url_hotel_actions_list
  let url = `${path}?token=${token}&android_id_install=${deviceId}&id_categories=${id_category}&id_hotel=${id_hotel}&lim=${limit}&ofs=${offset}` + sort

  return await fetch(url)
}

export const getPush = async (token, uniqueId, type, id_chat) => {
  const deviceId = uniqueId !== 'null' && uniqueId !== 'undefined' && uniqueId ? uniqueId : ''
  let push = getAppConstants().url_push
  let idChat = ''
  if (type === 'me_msg' || type === 'me_like') {
    push = getAppConstants().url_push_me
    idChat = '&id_chat=' + id_chat
  }
  const path = getAppConstants().url_main + getAppConstants().url_api3_path + push
  let url = `${path}?token=${token}&android_id_install=${deviceId}` + idChat

  return await fetch(url)
}

export const getHeadlessPush = async (token, uniqueId, type, id_chat) => {
  const deviceId = uniqueId !== 'null' && uniqueId !== 'undefined' && uniqueId ? uniqueId : ''
  let push = '/get_notyf_chat.php'
  let idChat = ''

  if (type === 'me_msg' || type === 'me_like') {
    push = '/get_notyf_me_chat.php'
    idChat = '&id_chat=' + id_chat
  }

  const path = getAppConstants().url_main + '/api/chat_v3' + push
  let url = `${path}?token=${token}&android_id_install=${deviceId}` + idChat

  return await fetch(url)
}

export const getListMyBron = async (token, uniqueId, sort = '') => {
  const deviceId = uniqueId !== 'null' && uniqueId !== 'undefined' && uniqueId ? uniqueId : ''
  const path = getAppConstants().url_main + getAppConstants().url_api3_path + getAppConstants().url_my_bron
  let url = `${path}?token=${token}&android_id_install=${deviceId}` + sort

  return await fetch(url)
}

export const getHotelsContent = async ids => {
  const path = getAppConstants().url_hotel + '?action=h_desc&&huid=' + ids.join(',')

  return await fetch(path)
}

export const sendCodeRemove = async (token, uniqueId, code = '') => {
  const deviceId = uniqueId !== 'null' && uniqueId !== 'undefined' && uniqueId ? uniqueId : ''
  const path = getAppConstants().url_main + getAppConstants().url_api3_path
  let url

  if (code === '') {
    url = `${path}/del_account.php?token=${token}&android_id_install=${deviceId}&start=1`
  } else {
    url = `${path}/del_account.php?token=${token}&android_id_install=${deviceId}&code=${code}`
  }

  return await fetch(url)
}

export const getRegionByGeo = async (zoom, region) => {
  const path = getAppConstants().url_get_region
  const url = `${path}index.php?v=1.1&fn=objects&z=${zoom}&b=${region}&p=1`

  return await fetch(url)
}

export const savePointsRating = async (categories, points, user_id, hash) => {
  const path = getAppConstants().url_rating
  const url = `${path}?action=criteria_weight&rlist=${categories}&points=${points}&user_id=${user_id}&hash=${hash}`

  return await fetch(url)
}

export const getPointsRating = async (categories, points, user_id, hash) => {
  const path = getAppConstants().url_rating
  const url = `${path}?action=criteria_weight&user_id=${user_id}&hash=${hash}`

  return await fetch(url)
}

export const getUserCross = async (logout = false) => {
  const path = getAppConstants().url_auth + getAppConstants().url_auth_api3 + getAppConstants().url_cross + '?_dc=' + new Date().getTime() + (logout ? '&logout=1' : '')

  return await fetch(path)
}
