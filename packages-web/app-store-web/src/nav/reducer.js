import Immutable from 'seamless-immutable'

import * as types from './actionTypes'

const initialState = Immutable({
  nav_path: []
})

export default function reduce(state = initialState, action = {}) {
  switch (action.type) {
    case types.SET_PATHNAME:
      return {
        ...state,
        nav_path: action.nav_path
      }
    default:
      return state
  }
}

export function getNavPath(state) {
  if (state) {
    return state.nav.nav_path
  }

  return undefined
}
