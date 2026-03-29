import * as types from './actionTypes'

const initialState = {
  modalCategory: false,
  modalAlert: false,
  modalLogin: false,
  modalRequest: false,
  statusBar: {},
  footerBar: {}
}

export default function reduce(state = initialState, action = {}) {
  switch (action.type) {
    case types.NAP_CHANGE_MODAL_CATEGORY:
      return {
        ...state,
        modalCategory: action.modalCategory
      }
    case types.NAP_CHANGE_MODAL_ALERT:
      return {
        ...state,
        modalAlert: action.modalAlert
      }
    case types.NAP_CHANGE_MODAL_LOGIN:
      return {
        ...state,
        modalLogin: action.modalLogin
      }
    case types.NAP_CHANGE_MODAL_REQUEST:
      return {
        ...state,
        modalRequest: action.modalRequest
      }
    case types.NAP_CHANGE_STATUSBAR:
      return {
        ...state,
        statusBar: action.statusBar
      }
    case types.NAP_CHANGE_FOOTERBAR:
      return {
        ...state,
        footerBar: action.footerBar
      }
    default:
      return state
  }
}

export function getModalCategory(state) {
  return state.napp.modalCategory
}

export function getModalAlert(state) {
  return state.napp.modalAlert
}

export function getModalLogin(state) {
  return state.napp.modalLogin
}

export function getModalRequest(state) {
  return state.napp.modalRequest
}

export function getStatusBar(state) {
  return state.napp.statusBar
}

export function getFooterBar(state) {
  return state.napp.footerBar
}
