import * as types from './actionTypes'

export function setUser(user) {
  return (dispatch, getState) => {
    dispatch({ type: types.USER_SET, user: user })
  }
}

export function setVK(vk) {
  return (dispatch, getState) => {
    dispatch({ type: types.USER_VK_SET, userVK: vk })
  }
}

export function setGroupVK(userGroupVK) {
  return (dispatch, getState) => {
    dispatch({ type: types.USER_GROUP_VK_SET, userGroupVK: userGroupVK })
  }
}

export function setNotifyNews(notifyNews) {
  return (dispatch, getState) => {
    dispatch({ type: types.USER_NOTIFYNEWS, notifyNews: notifyNews })
  }
}

export function setUrlPost(post) {
  return (dispatch, getState) => {
    dispatch({ type: types.USER_URL_POST, urlPost: post })
  }
}

export function setPostVK(post) {
  return (dispatch, getState) => {
    dispatch({ type: types.USER_POST_VK, isPostVK: post })
  }
}

export function setPostGroupVK(post) {
  return (dispatch, getState) => {
    dispatch({ type: types.USER_POST_GROUP_VK, isPostGroupVK: post })
  }
}

export function setFriendVK(data) {
  return (dispatch, getState) => {
    dispatch({ type: types.USER_FRIEND_VK, isFriendVK: data })
  }
}

export function setAgentTowns(data) {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: types.CHANGE_AGENT_TOWNS, chatAgentTowns: data })
    } catch (error) {
      console.error(error)
    }
  }
}

export function setIosToken(iosToken) {
  return (dispatch, getState) => {
    dispatch({ type: types.USER_SET_IOS_TOKEN, iosToken: iosToken })
  }
}

export function setFcmToken(fcmToken) {
  return (dispatch, getState) => {
    dispatch({ type: types.USER_SET_FCM_TOKEN, fcmToken: fcmToken })
  }
}

export function setExpoToken(expoToken) {
  return (dispatch, getState) => {
    dispatch({ type: types.USER_SET_EXPO_TOKEN, expoToken: expoToken })
  }
}

export function setPasswordSotr(passwordSotr) {
  return (dispatch, getState) => {
    dispatch({ type: types.USER_SOTR_PASSWORD, passwordSotr: passwordSotr })
  }
}

export function setVKTitle(title) {
  return (dispatch, getState) => {
    dispatch({ type: types.USER_VK_TITLE, vkTitle: title })
  }
}
