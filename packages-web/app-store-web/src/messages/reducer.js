import orderBy from 'lodash/orderBy'
import Immutable from 'seamless-immutable'

import * as types from './actionTypes'

const initialState = Immutable({
  msg: [],
  offline: false
})

export default function reduce(state = initialState, action = {}) {
  switch (action.type) {
    case types.CHANGE_MESSAGES_OFFLINE:
      return {
        ...state,
        msg: action.msg ? action.msg : []
      }
    case types.REMOVE_MESSAGES_OFFLINE:
      return {
        ...state,
        msg: action.msg ? action.msg : []
      }
    case types.CHANGE_OFFLINE_MODE:
      return {
        ...state,
        offline: action.offline
      }
    default:
      return state
  }
}

export function getMessagesOffline(state) {
  return orderBy(state.offline.msg, 'id', 'asc')
}

export function getOfflineMode(state) {
  return state.offline.offline
}
