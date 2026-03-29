import Immutable from 'seamless-immutable'

import * as types from './actionTypes'

const initialState = Immutable({
  openDrawer: false,
  authOpen: true,
  renderApp: false
})

export default function reduce(state = initialState, action = {}) {
  switch (action.type) {
    case types.DRAWER_OPEN:
      return {
        ...state,
        openDrawer: action.openDrawer
      }
    case types.AUTH_OPEN:
      return {
        ...state,
        authOpen: action.authOpen
      }
    case types.RENDER_APP:
      return {
        ...state,
        renderApp: action.renderApp
      }
    default:
      return state
  }
}

export function getOpenDrawer(state) {
  if (state) {
    return state.drawer.openDrawer
  }
  return undefined
}

export function getOpenAuth(state) {
  if (state) {
    return state.drawer.authOpen
  }
  return undefined
}

export function getRenderApp(state) {
  if (state) {
    return state.drawer.renderApp
  }
  return undefined
}
