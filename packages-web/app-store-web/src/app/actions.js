import * as types from './actionTypes'

export function setAppVersion(appVersion) {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: types.CHANGE_VERSION, appVersion: appVersion })
    } catch (error) {
      console.error(error)
    }
  }
}

export function setUserName(name) {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: types.CHANGE_NAME, userName: name })
    } catch (error) {
      console.error(error)
    }
  }
}

export function setOpenDialogHotel(open) {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: types.CHANGE_DIALOG, openDialogHotel: open })
    } catch (error) {
      console.error(error)
    }
  }
}

export function setAppLang(lang) {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: types.CHANGE_LANG, appLang: lang })
    } catch (error) {
      console.error(error)
    }
  }
}

export function setAppLangInterface(lang) {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: types.CHANGE_LANG_INTERFACE, appLangInterface: lang })
    } catch (error) {
      console.error(error)
    }
  }
}

export function setAndroidIdInstall(androidIdInstall) {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: types.CHANGE_ID, androidIdInstall: androidIdInstall })
    } catch (error) {
      console.error(error)
    }
  }
}

export function setRef(referral) {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: types.CHANGE_REF, referral: referral })
    } catch (error) {
      console.error(error)
    }
  }
}

export function setPath(appPath) {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: types.CHANGE_PATH, appPath: appPath })
    } catch (error) {
      console.error(error)
    }
  }
}

export function setAppReload(appReload) {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: types.CHANGE_APP_RELOAD, appReload: appReload })
    } catch (error) {
      console.error(error)
    }
  }
}

export function setAppCount(count) {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: types.CHANGE_APP_COUNT, count: count })
    } catch (error) {
      console.error(error)
    }
  }
}

export function setConnect(isConnect) {
  return async (dispatch, getState) => {
    try {
      const state = getState()

      if (state.app.isConnect !== isConnect) {
        dispatch({ type: types.CHANGE_CONNECT, isConnect: isConnect })
      }
    } catch (error) {
      console.error(error)
    }
  }
}
export function setIdCategory(idCategory) {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: types.CHANGE_CATEGORY, idCategory: idCategory })
    } catch (error) {
      console.error(error)
    }
  }
}

export function setChatAgreement(agreement) {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: types.CHANGE_CHAT_AGREEMENT, agreement: agreement })
    } catch (error) {
      console.error(error)
    }
  }
}

export function setLocationPath(locationPath) {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: types.CHANGE_LOCATION_PATH, locationPath: locationPath })
    } catch (error) {
      console.error(error)
    }
  }
}

export function setDevice(device) {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: types.SET_DEVICE, device: device })
    } catch (error) {
      console.error(error)
    }
  }
}

export function setUnauthCount(unauthCount) {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: types.UNAUTH_COUNT, unauthCount: unauthCount })
    } catch (error) {
      console.error(error)
    }
  }
}
