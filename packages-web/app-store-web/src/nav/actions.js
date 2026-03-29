import * as types from './actionTypes'

export function setNavPath(path) {
  return (dispatch, getState) => {
    const state = getState()
    const nav = JSON.parse(JSON.stringify(state.nav.nav_path))

    if (!nav[0]) {
      nav.push(path)
    } else if (nav[nav.length - 1] !== path) {
      nav.push(path)
    }
    dispatch({ type: types.SET_PATHNAME, nav_path: nav })
  }
}

export function removeNavPath() {
  return (dispatch, getState) => {
    const state = getState()
    const nav = JSON.parse(JSON.stringify(state.nav.nav_path))

    dispatch({ type: types.SET_PATHNAME, nav_path: nav.slice(0, -1) })
  }
}
