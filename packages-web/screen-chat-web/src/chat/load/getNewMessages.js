import compact from 'lodash/compact'
import split from 'lodash/split'
import { Platform } from 'react-native'

const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
const { getAppConstants, getChatComponent, messagesIds } = GLOBAL_OBJ.onlinetur.storage

const getNewMessages = async (newMessageId, filterChat, userData, pathname, add = false, utils) => {
  const { chatServiceGet, testResponse, errorTextResponse, convertRequestWeb, convertRequest, t } = utils

  const url = getAppConstants().url_main + getAppConstants().url_api3_path + getAppConstants().req_chat
  const android_id_install = userData && userData.id_user && userData.android_id_install !== 'undefined' && userData.android_id_install ? userData.android_id_install : ''
  const token = userData && userData.id_user ? userData.device.token : ''
  let result = {}
  result.data = []
  const { selectedCountry, selectedHotel, selectedPlace, selectedHobby, chatAgent, selectedFav, selectedAgent, selectCategory, searchFav, idUserFav } = filterChat

  if (!add && newMessageId === -1) {
    return result
  }

  let hobbyId = chatAgent ? selectedAgent : selectedHobby
  let hotelId = selectedHotel !== '-1' ? selectedHotel * 1 + 100000 : '-1'
  let id_post = selectedCountry && String(selectedCountry) !== 'undefined' ? selectedCountry : '-1'

  let fav = ''
  let fav_search = ''
  let userFav = '-1'

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
  body.append('tip', 'new')
  body.append('id_post', id_post)
  body.append('id_hotel', hotelId)
  body.append('id_hobbi', hobbyId)
  body.append('first_id', newMessageId)

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

  if (!jsonData || jsonData.length === 0) {
    return result
  }

  let newUniq = jsonData.filter(function (item) {
    return messagesIds().indexOf(item.id) === -1
  })

  if (newUniq.length === 0) {
    return result
  }

  result.newMessageId = newUniq && newUniq.length > 0 ? newUniq[newUniq.length - 1].id : -1

  if (Platform.OS === 'web') {
    result.data = await convertRequestWeb(newUniq)
  } else {
    result.data = await convertRequest(newUniq)
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
}

export default getNewMessages
