// import { Core, Storage } from 'app-core'
// import { chatServiceGet } from 'app-services'
// import { t } from 'app-utils'
import compact from 'lodash/compact'
import isString from 'lodash/isString'
import split from 'lodash/split'
import { Platform } from 'react-native'

const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
const { getAppConstants, getChatComponent, addToMessagesIds } = GLOBAL_OBJ.onlinetur.storage

const getLastMessages = async (first_id, filterChat, userData, pathname, utils) => {
  const { chatServiceGet, testResponse, errorTextResponse, convertRequestWeb, convertRequest, t } = utils
  const url = getAppConstants().url_main + getAppConstants().url_api3_path + getAppConstants().req_chat
  const android_id_install = userData && userData.id_user && userData.android_id_install !== 'undefined' && userData.android_id_install ? userData.android_id_install : ''
  const token = userData && userData.id_user ? userData.device.token : ''
  let result = {}
  result.data = []
  result.oldMessageId = '-1'
  result.newMessageId = '-1'
  const { selectedCountry, selectedHotel, selectedPlace, selectedHobby, chatAgent, selectedFav, selectedAgent, selectCategory, searchFav, idUserFav } = filterChat

  let hotelId = selectedHotel !== '-1' ? selectedHotel * 1 + 100000 : '-1'
  let hobbyId = chatAgent ? selectedAgent : selectedHobby
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
      first_id = '-1'
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
  body.append('tip', 'last')
  body.append('id_post', id_post)
  body.append('id_hotel', hotelId)
  body.append('id_hobbi', hobbyId)
  body.append('first_id', first_id)

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

  if (jsonData.length === 0) {
    return result
  }

  if (jsonData[0] && !isString(jsonData[0].id)) {
    result.oldMessageId = jsonData[0].id
  }

  if (jsonData && jsonData.length > 0 && !isString(jsonData[jsonData.length - 1].id)) {
    result.newMessageId = jsonData[jsonData.length - 1].id
  }

  let lastUniq = jsonData.filter(function (item) {
    return [].indexOf(item.id) === -1
  })

  if (lastUniq.length === 0) {
    return result
  }

  await addToMessagesIds(lastUniq)

  if (Platform.OS === 'web') {
    result.data = await convertRequestWeb(lastUniq)
  } else {
    result.data = await convertRequest(lastUniq)
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

export default getLastMessages
