/**
 * -----------------------------------------------------------------------
 *  Author      : Alexey Zolotarеv
 *  E-mail      : azesm@me.com
 * -----------------------------------------------------------------------
 */

import isObject from 'lodash/isObject'
import { Platform } from 'react-native'

// import axios from '../axiosGet'

const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
const { getAppConstants } = GLOBAL_OBJ.onlinetur.storage

const wait = timeout => {
  return new Promise(resolve => setTimeout(resolve, timeout))
}

export const fetchVK = async url => {
  const axios = await import('axios')

  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    try {
      const response = await axios.get(url)

      if (response.status === 200 && isObject(response.data)) {
        resolve(response.data)
      } else {
        resolve([])
      }
    } catch (error) {
      resolve([])
    }
  })
}

export const postJQuery = async (access_token, user_id, arr) => {
  const Alert = await import('@blazejkustra/react-native-alert')

  for (let i = 0; i < arr.length; i++) {
    let success = false
    $.ajax({
      url: 'https://api.vk.com/method/wall.post',
      method: 'post',
      headers: {
        Authorization: 'Bearer ' + access_token
      },
      data: {
        owner_id: user_id,
        message: arr[i].message,
        attachments: arr[i].url,
        state: 'dj29fnsadjsd82',
        access_token: access_token,
        v: '5.199'
      },
      dataType: 'jsonp',
      success: data => {
        if (data && data.response && !success) {
          success = true
          Alert.default.alert('Внимание!', 'Постинг в ВК активирован удачно!')
        }
      },
      error: (xhr, textStatus, error) => {
        console.log('xhr.statusText', xhr.statusText)
        console.log('textStatus', textStatus)
        console.log('error', error)
      }
    })

    wait(3000).then()
  }
}

export const getJQuery = (access_token, user_id) => {
  return new Promise(resolve => {
    $.ajax({
      url: 'https://api.vk.com/method/groups.get?user_id=' + user_id + '&access_token=' + access_token + '&v=5.199&extended=1&filter=admin,editor,moder',
      method: 'get',
      headers: {
        Authorization: 'Bearer ' + access_token
      },
      dataType: 'jsonp',
      success: data => {
        resolve(data)
      },
      error: (xhr, textStatus, error) => {
        console.log('xhr.statusText', xhr.statusText)
        console.log('textStatus', textStatus)
        console.log('error', error)
        resolve(error)
      }
    })
  })
}

export const postWall = (access_token, user_id, arr, groupVK = []) => {
  if (groupVK.length > 0) {
    for (let j = 0; j < groupVK.length; j++) {
      const id = '-' + groupVK[j].trim().replace('club', '')
      postJQuery(access_token, id, arr)
    }
  } else {
    postJQuery(access_token, user_id, arr)
  }
}

export const postVKWeb = async (userVK, setVK, user_id, arr, groupVK = []) => {
  const { t } = await import('app-utils-web')
  const Alert = await import('@blazejkustra/react-native-alert')
  const { Auth } = await import('@vkid/sdk')

  if (userVK.access_token) {
    let now = new Date()
    let today = new Date(userVK.date)
    today.setHours(today.getHours() + 1)

    if (today > now) {
      postWall(userVK.access_token, user_id, arr, groupVK)
    } else {
      Auth.refreshToken(userVK.refresh_token, userVK.vk.device_id)
        .then(async result => {
          if (result.access_token) {
            const newUserVK = JSON.parse(JSON.stringify(userVK))
            newUserVK.access_token = result.access_token
            newUserVK.refresh_token = result.refresh_token
            newUserVK.date = new Date()
            setVK(newUserVK)

            postWall(result.access_token, user_id, arr, groupVK)
          }
        })
        .catch(error => {
          console.log('refreshToken error', error)
        })
    }
  } else {
    Alert.default.alert(t('common.attention'), 'Вы не авторизованы в ВК')
  }
}

export const getVKGroupsWeb = async (userVK, setVK) => {
  const { Auth } = await import('@vkid/sdk')

  return new Promise(resolve => {
    let now = new Date()
    let today = new Date(userVK.date)
    today.setHours(today.getHours() + 1)

    if (today > now) {
      getJQuery(userVK.access_token, userVK.user_id).then(groups => resolve(groups))
    } else {
      if (userVK && userVK.refresh_token && userVK.vk && userVK.vk.device_id) {
        Auth.refreshToken(userVK.refresh_token, userVK.vk.device_id)
          .then(async result => {
            if (result.access_token) {
              const newUserVK = JSON.parse(JSON.stringify(userVK))
              newUserVK.access_token = result.access_token
              newUserVK.refresh_token = result.refresh_token
              newUserVK.date = new Date()
              setVK(newUserVK)

              getJQuery(result.access_token, userVK.user_id).then(groups => resolve(groups))
            }
          })
          .catch(error => {
            resolve(error)
          })
      }
    }
  })
}

export const postVK = async (link, message) => {
  const { mobile } = await import('app-mobile-web')

  const VKLogin = mobile.initVKLogin()
  const isLoggedIn = await VKLogin.isLoggedIn()

  if (isLoggedIn) {
    const auth = await VKLogin.getAccessToken()
    const url = `https://api.vk.com/method/wall.post?owner_id=${auth.user_id}&message=${message}&attachments=${link}&access_token=${auth.access_token}&copyright=${link}&v=5.199`

    return await fetchVK(url)
  }
}

export const postGroupVK = async (owner_id, link, message) => {
  const { mobile } = await import('app-mobile-web')
  const VKLogin = mobile.initVKLogin()
  const isLoggedIn = await VKLogin.isLoggedIn()

  if (isLoggedIn) {
    const auth = await VKLogin.getAccessToken()
    const url = `https://api.vk.com/method/wall.post?owner_id=${owner_id}&message=${message}&attachments=${link}&access_token=${auth.access_token}&copyright=${link}&v=5.199`

    return await fetchVK(url)
  }
}

export const getSuggestionsVK = async auth => {
  // eslint-disable-next-line max-len
  const url = `https://api.vk.com/method/friends.getSuggestions?access_token=${auth.access_token}&v=5.199&fields=first_name,last_name,friend_status,last_seen,online,deactivated,status,verified,relation,bdate,email,city,domain,nickname,photo_100,sex,is_friend,screen_name`

  return await fetchVK(url)
}

export const getGroupsVK = async (auth, id) => {
  const url = `https://api.vk.com/method/groups.get?user_id=${id}&access_token=${auth.access_token}&v=5.199&extended=1&filter=admin,editor,moder`

  return await fetchVK(url)
}

export const addFriendsVK = async (id, access_token) => {
  const url = `https://api.vk.com/method/friends.add?user_id=${id}&access_token=${access_token}&v=5.199`

  return await fetchVK(url)
}

export const getAddUserVK = async (token, uniqueId) => {
  const path = getAppConstants().url_main + getAppConstants().url_vk_api
  const url = `${path}?android_id_install=${uniqueId}&token=${token}`

  return await fetchVK(url)
}
