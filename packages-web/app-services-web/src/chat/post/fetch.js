/**
 * -----------------------------------------------------------------------
 *  Author      : Alexey Zolotarеv
 *  E-mail      : azesm@me.com
 * -----------------------------------------------------------------------
 */
import { Platform } from 'react-native'

const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
const { getAppConstants } = GLOBAL_OBJ.onlinetur.storage

export const fetchImgUpload = async data => {
  const path = getAppConstants().url_main + getAppConstants().url_api3_path
  return fetch(path + '/setphoto.php', {
    method: 'POST',
    headers: {
      Accept: 'application/json'
      // 'Content-Type': 'multipart/form-data;'
    },
    body: data
  })
    .then(response => response.json())
    .catch(error => console.log('fetchImgUpload error', error))
}

export const onPostMessage = async (body, url) => {
  return fetch(url, {
    method: 'POST',
    body: body
  })
    .then(data => data.json())
    .catch(error => error)
}

export const onAddTheme = async (body, url) => {
  return fetch(url, {
    method: 'POST',
    body: body
  })
    .then(data => data.json())
    .catch(error => error)
}

export const onPostMessagePDF = async (body, url) => {
  return fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json'
    },
    body: body
  })
    .then(data => data.json())
    .catch(error => error)
}

export const fetchLike = async body => {
  const path = getAppConstants().url_main + getAppConstants().url_api3_path
  return fetch(path + '/set_like.php', {
    method: 'POST',
    body: body
  })
    .then(response => response.json())
    .catch(error => error)
}

export const fetchFavorite = async body => {
  const path = getAppConstants().url_main + getAppConstants().url_api1_path
  return fetch(path + '/set_fav.php', {
    method: 'POST',
    body: body
  })
    .then(response => response.json())
    .catch(error => error)
}

export const fetchData = async body => {
  const path = getAppConstants().url_main + getAppConstants().url_api3_path
  return fetch(path + '/set_coord.php', {
    method: 'post',
    headers: {
      'Content-type': 'multipart/form-data'
    },
    body: body
  })
    .then(data => data.json())
    .catch(error => error.message)
}

export const fetchPhoneData = async body => {
  const path = getAppConstants().url_main + getAppConstants().url_api3_path
  return fetch(path + '/edit_phone.php', {
    method: 'POST',
    body: body
  })
    .then(response => response.json())
    .catch(error => error)
}

export const fetchChatImgUpload = async data => {
  const path = getAppConstants().url_main + getAppConstants().url_api2_path

  return fetch(path + '/upload_photo.php', {
    method: 'POST',
    headers: {
      Accept: 'application/json'
    },
    body: data
  })
    .then(response => response.json())
    .catch(error => console.log('fetchChatImgUpload error', error))
}

export const fetchChatImgUploadWeb = async data => {
  const path = getAppConstants().url_main + getAppConstants().url_api2_path

  return fetch(path + '/upload_photo.php', {
    method: 'POST',
    headers: {
      Accept: 'application/json'
    },
    body: data
  })
    .then(response => response.json())
    .catch(error => console.log('fetchChatImgUpload error', error))
}

export const fetchChatPdfUploadWeb = async data => {
  const path = getAppConstants().url_main + getAppConstants().url_api3_path
  return fetch(path + '/set_pdf.php', {
    method: 'POST',
    headers: {
      Accept: 'application/json'
    },
    body: data
  })
    .then(response => response.json())
    .catch(error => console.log('fetchChatPdfUploadWeb error', error))
}

export const fetchImgMassage = async body => {
  const path = getAppConstants().url_main + getAppConstants().url_api3_path
  return fetch(path + '/add_chat_image.php', {
    method: 'POST',
    headers: {
      'Content-type': 'multipart/form-data'
    },
    body: body
  })
    .then(response => response.json())
    .catch(error => error.message)
}

export const fetchImgMassageWeb = async body => {
  const path = getAppConstants().url_main + getAppConstants().url_api3_path
  return fetch(path + '/add_chat_image.php', {
    method: 'POST',
    headers: {
      Accept: 'application/json'
    },
    body: body
  })
    .then(response => response.json())
    .catch(error => error.message)
}

export const fetchActionMassage = async (body, addPromo) => {
  let add = '/add_chat_image_promo.php'

  if (!addPromo) {
    add = '/edit_chat_promo.php'
  }
  const path = getAppConstants().url_main + getAppConstants().url_api3_path
  return fetch(path + add, {
    method: 'POST',
    headers: {
      Accept: 'application/json'
    },
    body: body
  })
    .then(response => response.json())
    .catch(error => error.message)
}

export const fetchActionRoomPeoples = async body => {
  let add = '/set_hotel_room_peoples.php'

  const path = getAppConstants().url_main + getAppConstants().url_api3_path
  return fetch(path + add, {
    method: 'POST',
    headers: {
      Accept: 'application/json'
    },
    body: body
  })
    .then(response => response.json())
    .catch(error => error.message)
}

export const fetchRequestMessage = async body => {
  let add = '/action_promo.php'

  const path = getAppConstants().url_main + getAppConstants().url_api3_path
  return fetch(path + add, {
    method: 'POST',
    headers: {
      Accept: 'application/json'
    },
    body: body
  })
    .then(response => response.json())
    .catch(error => error.message)
}

export const fetchUserName = async body => {
  const path = getAppConstants().url_main + getAppConstants().url_api1_path
  return fetch(path + '/new_name.php', {
    method: 'POST',
    body: body
  })
    .then(response => response.json())
    .catch(error => error)
}

export const onPostVKUsers = async body => {
  const url = getAppConstants().url_main + getAppConstants().url_vk_api_check

  return fetch(url, {
    method: 'POST',
    body: body
  })
    .then(data => data.json())
    .catch(error => error)
}
export const postComplainMessage = async body => {
  const url = getAppConstants().url_main + getAppConstants().url_api3_path + getAppConstants().url_claim

  return fetch(url, {
    method: 'POST',
    body: body
  })
    .then(data => data.json())
    .catch(error => error)
}

export const postDataAuth = async body => {
  let add = '/auth_back.php'

  const path = getAppConstants().url_auth + getAppConstants().url_auth_api3
  return fetch(path + add, {
    method: 'POST',
    headers: {
      Accept: 'application/json'
    },
    body: body
  })
    .then(response => response.json())
    .catch(error => error.message)
}

export const postVKRefreshToken = async body => {
  return fetch('https://id.vk.com/oauth2/auth', {
    method: 'POST',
    headers: {
      Accept: 'application/x-www-form-urlencoded'
    },
    body: body
  })
    .then(data => data.json())
    .catch(error => error)
}
