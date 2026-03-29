import * as types from './actionTypes'

const initialState = {
  headerParams: {}
}

export default function reduce(state = initialState, action = {}) {
  switch (action.type) {
    case types.CHANGE_HEADER_PARAMS:
      return {
        ...state,
        headerParams: action.headerParams
      }
    default:
      return state
  }
}

export function getHeaderParams(state) {
  return state.header.headerParams
}

