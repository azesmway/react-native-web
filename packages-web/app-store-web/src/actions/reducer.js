import Immutable from 'seamless-immutable'

import * as types from './actionTypes'

const initialState = Immutable({
  listActions: []
})

export default function reduce(state = initialState, action = {}) {
  switch (action.type) {
    case types.CHANGE_ACTIONS:
      return {
        ...state,
        listActions: action.listActions
      }
    default:
      return state
  }
}

export function getAllActions(state) {
  return state.actions.listActions
}
