import * as types from './actionTypes'

export function setModalCategory(modal) {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: types.NAP_CHANGE_MODAL_CATEGORY, modalCategory: modal })
    } catch (error) {
      console.error(error)
    }
  }
}

export function setModalAlert(modal) {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: types.NAP_CHANGE_MODAL_ALERT, modalAlert: modal })
    } catch (error) {
      console.error(error)
    }
  }
}

export function setModalLogin(modal) {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: types.NAP_CHANGE_MODAL_LOGIN, modalLogin: modal })
    } catch (error) {
      console.error(error)
    }
  }
}

export function setModalRequest(modal) {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: types.NAP_CHANGE_MODAL_REQUEST, modalRequest: modal })
    } catch (error) {
      console.error(error)
    }
  }
}

export function setStatusBar(modal) {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: types.NAP_CHANGE_STATUSBAR, statusBar: modal })
    } catch (error) {
      console.error(error)
    }
  }
}

export function setFooterBar(modal) {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: types.NAP_CHANGE_FOOTERBAR, footerBar: modal })
    } catch (error) {
      console.error(error)
    }
  }
}
