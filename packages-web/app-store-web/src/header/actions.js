import * as types from './actionTypes'

export function setHeaderParams(data) {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: types.CHANGE_HEADER_PARAMS, headerParams: data })
    } catch (error) {
      console.error(error)
    }
  }
}
