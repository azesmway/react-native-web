import * as types from './actionTypes'

export function setAllActions(listActions) {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: types.CHANGE_ACTIONS, listActions: listActions })
    } catch (error) {
      console.error(error)
    }
  }
}
