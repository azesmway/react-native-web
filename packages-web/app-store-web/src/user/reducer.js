import Immutable from 'seamless-immutable'

import * as types from './actionTypes'

const initialState = Immutable({
  user: {},
  userVK: {},
  userGroupVK: [],
  vkTitle: {
    news: '',
    overview: '',
    announces: ''
  },
  notifyNews: false,
  urlPost: '2',
  isPostVK: false,
  isPostGroupVK: false,
  isFriendVK: false,
  chatAgentTowns: [],
  iosToken: null,
  fcmToken: '',
  expoToken: '',
  passwordSotr: ''
})

export default function reduce(state = initialState, action = {}) {
  switch (action.type) {
    case types.USER_SET:
      return {
        ...state,
        user: action.user
      }
    case types.USER_VK_SET:
      return {
        ...state,
        userVK: action.userVK
      }
    case types.USER_GROUP_VK_SET:
      return {
        ...state,
        userGroupVK: action.userGroupVK
      }
    case types.USER_NOTIFYNEWS:
      return {
        ...state,
        notifyNews: action.notifyNews
      }
    case types.USER_URL_POST:
      return {
        ...state,
        urlPost: action.urlPost
      }
    case types.CHANGE_AGENT_TOWNS:
      return {
        ...state,
        chatAgentTowns: action.chatAgentTowns
      }
    case types.USER_POST_VK:
      return {
        ...state,
        isPostVK: action.isPostVK
      }
    case types.USER_POST_GROUP_VK:
      return {
        ...state,
        isPostGroupVK: action.isPostGroupVK
      }
    case types.USER_FRIEND_VK:
      return {
        ...state,
        isFriendVK: action.isFriendVK
      }
    case types.USER_SET_IOS_TOKEN:
      return {
        ...state,
        iosToken: action.iosToken
      }
    case types.USER_SET_FCM_TOKEN:
      return {
        ...state,
        fcmToken: action.fcmToken
      }
    case types.USER_SOTR_PASSWORD:
      return {
        ...state,
        passwordSotr: action.passwordSotr
      }
    case types.USER_VK_TITLE:
      return {
        ...state,
        vkTitle: action.vkTitle
      }
    case types.USER_SET_EXPO_TOKEN:
      return {
        ...state,
        expoToken: action.expoToken
      }
    default:
      return state
  }
}

export function getUser(state) {
  return state.user.user
}

export function getVK(state) {
  return state.user.userVK
}

export function getGroupVK(state) {
  return state.user.userGroupVK
}

export function getNotifyNews(state) {
  return state.user.notifyNews
}

export function getUrlPost(state) {
  return state.user.urlPost
}

export function isPostVK(state) {
  return state.user.isPostVK
}

export function isPostGroupVK(state) {
  return state.user.isPostGroupVK
}

export function getAgentTowns(state) {
  return state.user.chatAgentTowns
}

export function isFriendVK(state) {
  return state.user.isFriendVK
}

export function getIosToken(state) {
  return state.user.iosToken
}

export function getFcmToken(state) {
  return state.user.fcmToken
}

export function getExpoToken(state) {
  return state.user.expoToken
}

export function getPasswordSotr(state) {
  return state.user.passwordSotr
}

export function getVKTitle(state) {
  return state.user.vkTitle
}
