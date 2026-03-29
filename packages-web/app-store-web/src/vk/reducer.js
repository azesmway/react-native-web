import Immutable from 'seamless-immutable'

import * as types from './actionTypes'

const initialState = Immutable({
  friends: [],
  count: 0,
  day_post: null
})

export default function reduce(state = initialState, action = {}) {
  switch (action.type) {
    case types.FRIENDS:
      return {
        ...state,
        friends: action.friends
      }
    case types.COUNT_DAY:
      return {
        ...state,
        count: action.count
      }
    case types.DAY_POST:
      return {
        ...state,
        day_post: action.day_post
      }
    default:
      return state
  }
}

export function getFriends(state) {
  return state.vk.friends
}

export function getCount(state) {
  return state.vl.count
}

export function getDayPost(state) {
  return state.vk.day_post
}
