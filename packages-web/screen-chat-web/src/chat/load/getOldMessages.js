import compact from 'lodash/compact'
import isEmpty from 'lodash/isEmpty'
import split from 'lodash/split'
import { Platform } from 'react-native'

const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
const { getAppConstants, getChatComponent, messagesIds, addToMessagesIds } = GLOBAL_OBJ.onlinetur.storage

const getOldMessages = async (oldMessageId, newMessageId, filterChat, userData, pathname, hobby, nullMessageView, agent, utils) => {
  const { chatServiceGet, testResponse, errorTextResponse, convertRequestWeb, convertRequest, t } = utils

  const url = getAppConstants().url_main + getAppConstants().url_api3_path + getAppConstants().req_chat
  const android_id_install = userData && userData.id_user && userData.android_id_install !== 'undefined' && userData.android_id_install ? userData.android_id_install : ''
  const token = userData && userData.id_user ? userData.device.token : ''
  let result = {}
  result.isLoading = false
  result.data = []
  result.oldMessageId = '-1'
  result.newMessageId = '-1'
  const {
    selectedCountry,
    selectedCountryName,
    selectedHotel,
    selectedHotelName,
    selectedPlace,
    selectedPlaceName,
    selectedHobby,
    selectedHobbyName,
    chatAgent,
    selectedFav,
    selectedAgent,
    selectCategory,
    searchFav,
    idUserFav
  } = filterChat
  let hotelId = selectedHotel !== '-1' ? selectedHotel * 1 + 100000 : '-1'
  let hobbyId = chatAgent ? selectedAgent : selectedHobby
  let id_post = selectedCountry && String(selectedCountry) !== 'undefined' ? selectedCountry : '-1'

  let fav = ''
  let fav_search = ''
  let userFav = '-1'

  try {
    if (searchFav !== undefined && searchFav !== null && searchFav !== 'undefined') {
      userFav = '0'
      if (searchFav === '22') {
        fav = '22'
        userFav = idUserFav
      } else if (searchFav === '4') {
        fav = '4'
        userFav = idUserFav
      } else {
        fav = searchFav !== '' ? '3' : selectedFav
      }
      fav_search = searchFav
    } else {
      fav = ''
      fav_search = ''
    }

    if (pathname.indexOf('/y/') > -1) {
      id_post = selectedCountry && String(selectedCountry) !== 'undefined' ? selectedCountry : '-1'
    }

    if (selectedPlace !== '-1') {
      hotelId = selectedPlace * -1 - 100000
    }

    if (selectedFav === '1') {
      hobbyId = '-1'
      fav = '1'
      id_post = '-1'
    }

    const path = compact(split(pathname, '/'))

    if (path[0] === 'b') {
      fav = '6'
    }

    let body = new URLSearchParams()
    body.append('token', token)
    body.append('android_id_install', android_id_install)
    body.append('tip', 'old')
    body.append('id_post', id_post)
    body.append('id_hotel', hotelId)
    body.append('id_hobbi', hobbyId)
    body.append('first_id', oldMessageId)

    if (chatAgent && selectedFav !== '1') {
      body.append('sotr_chat', '1')
      body.append('tip_chat', '1')
    } else if (selectedFav === '1') {
      body.append('tip_chat', '-1')
    }

    body.append('fav', fav)
    body.append('fav_id_user', userFav)
    body.append('fav_search', fav_search)
    body.append('ios', '1')
    body.append('is_online', '1')
    body.append('del', '0')
    body.append('id_categories', selectCategory.id)

    let jsonData = await chatServiceGet.getJsonRequest(url, body)

    if (testResponse(jsonData)) {
      result.isErrorServerText = errorTextResponse(jsonData)
      result.isErrorServer = true

      const chat = getChatComponent()
      chat.setState({ textSnackbar: t('common.errorServer') + '\n' + 'с сервером #1' })

      return result
    }

    if (selectedFav !== '1' && searchFav === '' && ((nullMessageView && jsonData.length < 20) || jsonData.length === 0)) {
      let txt
      if (hobbyId !== '-1') {
        const h = hobby.filter(function (item) {
          return Number(item.id) === Number(hobbyId)
        })

        if (!isEmpty(h[0]) && !isEmpty(h[0].msg)) {
          txt = h[0].msg.replace(/↵|\n|\r/g, '')

          if (txt.indexOf('{country}')) {
            txt = txt.replace('{country}', selectedCountryName)
          }
        } else {
          const h = agent.filter(function (item) {
            return Number(item.id) === Number(hobbyId)
          })

          if (!isEmpty(h[0]) && !isEmpty(h[0].msg)) {
            txt = h[0].msg.replace(/↵|\n|\r/g, '')
          } else {
            txt = t('chat.load.getOldMessages.themeInfo') + selectedHobbyName
          }
        }
      } else {
        if (selectedCountryName !== '' && selectedHotelName === '' && selectedPlaceName === '') {
          txt = t('chat.load.getOldMessages.themeCountry').replace('{type}', 'стране') + selectedCountryName + t('chat.load.getOldMessages.themeCountry2')
        } else if (selectedHotelName !== '') {
          txt = t('chat.load.getOldMessages.themeCountry').replace('{type}', 'отелю') + selectedHotelName + t('chat.load.getOldMessages.themeCountry2')
        } else if (selectedPlaceName !== '') {
          txt = t('chat.load.getOldMessages.themeCountry').replace('{type}', 'курорту') + selectedPlaceName + t('chat.load.getOldMessages.themeCountry2')
        }
      }

      let info = t('chat.load.getOldMessages.nullMessage')

      const nullMessage = {
        id: -10000,
        msg: txt,
        name: info,
        city: '',
        id_id: -1,
        is_moderator: 0,
        is_admin: 1,
        day: null,
        is_pay: null,
        is_pay_maggi: null,
        img_path: '',
        image_hash: '',
        tip: 1,
        img_chat: '',
        img_chat_min: '',
        id_user: -1,
        img: '\ud83d\udc9d',
        date_create: new Date(),
        del: 0,
        id_otel: 0,
        id_interes: 0,
        name_hotel: '',
        name_hobbi: '',
        tip_chat: 0,
        dt: '',
        is_owner: false,
        dt_create: new Date(),
        is_ban: 0,
        this_month: 0,
        last_month: 0,
        id_parent: 0,
        id_user_parent: 0,
        msg_parent: '',
        bottom_text: '',
        id_post: selectedCountry && String(selectedCountry) !== 'undefined' ? selectedCountry : '-1',
        is_warning: 0,
        warning_message: '',
        is_like: false,
        cnt_like: 0,
        cnt_rating: 0,
        is_favorite: false,
        cnt_favorite: 0,
        name_parent: '',
        is_pay_sch: 0,
        cnt_reply: 0,
        is_edit: false,
        post_title: '',
        days_pos: 0,
        date_pos: new Date(),
        summ: '0',
        rash_like: '0',
        prih_like: '0',
        hashtag: ''
      }

      jsonData.unshift(nullMessage)
    }

    result.oldMessageId = jsonData[0].id

    if (newMessageId === -1) {
      result.newMessageId = jsonData[0].id
    }

    const oldUniq = jsonData.filter(function (item) {
      return messagesIds().indexOf(item.id) === -1
    })

    if (oldUniq.length === 0) {
      return result
    }

    await addToMessagesIds(oldUniq)

    if (Platform.OS === 'web') {
      result.data = await convertRequestWeb(oldUniq)
    } else {
      result.data = await convertRequest(oldUniq)
    }

    // let newData = []
    //
    // for (let i = 0; i < result.data.length; i++) {
    //   if (result.data[i].tip === 5) {
    //     const action = await chatServiceGet.dataListAction(android_id_install, token, result.data[i].id)
    //
    //     if (action.code === 0 && action.promo) {
    //       result.data[i].ad = action
    //       newData.push(result.data[i])
    //     }
    //   } else {
    //     newData.push(result.data[i])
    //   }
    // }
    //
    // result.data = newData

    return result
  } catch (e) {
    result.isErrorServerText = e.message
    result.isErrorServer = true

    return result
  }
}

export default getOldMessages
