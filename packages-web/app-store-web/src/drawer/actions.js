import * as types from './actionTypes'

export function openDrawer(open) {
  return (dispatch, getState) => {
    dispatch({ type: types.DRAWER_OPEN, openDrawer: open })
  }
}

export function openAuth(open) {
  return (dispatch, getState) => {
    dispatch({ type: types.AUTH_OPEN, openAuth: open })
  }
}

export function renderApp(open) {
  return (dispatch, getState) => {
    dispatch({ type: types.RENDER_APP, renderApp: open })
  }
}
