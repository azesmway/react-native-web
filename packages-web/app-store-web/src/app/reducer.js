import Immutable from 'seamless-immutable'

import * as types from './actionTypes'

const initialState = Immutable({
  appVersion: null,
  userName: null,
  openDialogHotel: true,
  appLang: 'ru',
  appLangInterface: 'ru',
  androidIdInstall: null,
  referral: null,
  appPath: null,
  appReload: false,
  count: 0,
  isConnect: false,
  idCategory: 0,
  agreement: false,
  locationPath: '',
  device: {},
  unauthCount: 0
})

export default function reduce(state = initialState, action = {}) {
  switch (action.type) {
    case types.CHANGE_VERSION:
      return {
        ...state,
        appVersion: action.appVersion
      }
    case types.CHANGE_NAME:
      return {
        ...state,
        userName: action.userName
      }
    case types.CHANGE_DIALOG:
      return {
        ...state,
        openDialogHotel: action.openDialogHotel
      }
    case types.CHANGE_LANG:
      return {
        ...state,
        appLang: action.appLang
      }
    case types.CHANGE_LANG_INTERFACE:
      return {
        ...state,
        appLangInterface: action.appLangInterface
      }
    case types.CHANGE_ID:
      return {
        ...state,
        androidIdInstall: action.androidIdInstall
      }
    case types.CHANGE_REF:
      return {
        ...state,
        referral: action.referral
      }
    case types.CHANGE_PATH:
      return {
        ...state,
        appPath: action.appPath
      }
    case types.CHANGE_APP_RELOAD:
      return {
        ...state,
        appReload: action.appReload
      }
    case types.CHANGE_APP_COUNT:
      return {
        ...state,
        count: action.count
      }
    case types.CHANGE_CONNECT:
      return {
        ...state,
        isConnect: action.isConnect
      }
    case types.CHANGE_CATEGORY:
      return {
        ...state,
        idCategory: action.idCategory
      }
    case types.CHANGE_CHAT_AGREEMENT:
      return {
        ...state,
        agreement: action.agreement
      }
    case types.CHANGE_LOCATION_PATH:
      return {
        ...state,
        locationPath: action.locationPath
      }
    case types.SET_DEVICE:
      return {
        ...state,
        device: action.device
      }
    case types.UNAUTH_COUNT:
      return {
        ...state,
        unauthCount: action.unauthCount
      }
    default:
      return state
  }
}

export function getAppVersion(state) {
  return state.app.appVersion
}

export function getUserName(state) {
  return state.app.userName
}

export function getOpenDialogHotel(state) {
  return state.app.openDialogHotel
}

export function getAppLang(state) {
  return state.app.appLang
}

export function getAppLangInterface(state) {
  return state.app.appLangInterface
}

export function getAndroidIdInstall(state) {
  return state.app.androidIdInstall
}

export function getRef(state) {
  return state.app.referral
}

export function getPath(state) {
  return state.app.appPath
}

export function getAppReload(state) {
  return state.app.appReload
}

export function getAppCount(state) {
  return state.app.count
}

export function getConnect(state) {
  return state.app.isConnect
}

export function getIdCategory(state) {
  return state.app.idCategory
}

export function getChatAgreement(state) {
  return state.app.agreement
}

export function getLocationPath(state) {
  return state.app.locationPath
}

export function getDevice(state) {
  return state.app.device
}

export function getUnauthCount(state) {
  return state.app.unauthCount
}
