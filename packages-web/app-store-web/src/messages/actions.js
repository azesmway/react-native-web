import * as types from './actionTypes'

export function setMessagesOffline(message) {
  return async (dispatch, getState) => {
    try {
      const state = getState()
      const messages = state.offline.msg.concat(message)
      dispatch({ type: types.CHANGE_MESSAGES_OFFLINE, msg: messages })
    } catch (error) {
      console.error(error)
    }
  }
}

export function changeMessageOffline(message) {
  return async (dispatch, getState) => {
    try {
      const state = getState()
      const messages = state.offline.msg.filter(msg => msg.id !== message.id)
      dispatch({ type: types.REMOVE_MESSAGES_OFFLINE, msg: [message].concat(messages) })
    } catch (error) {
      console.error(error)
    }
  }
}

export function removeMessageOffline(id) {
  return async (dispatch, getState) => {
    try {
      const state = getState()
      const messages = state.offline.msg.filter(msg => msg.id !== id)
      dispatch({ type: types.REMOVE_MESSAGES_OFFLINE, msg: messages })
    } catch (error) {
      console.error(error)
    }
  }
}

export function changeOfflineMode(offline) {
  return async (dispatch, getState) => {
    try {
      const state = getState()

      if (state.offline.offline !== offline) {
        dispatch({ type: types.CHANGE_OFFLINE_MODE, offline: offline })
      }
    } catch (error) {
      console.error(error)
    }
  }
}
