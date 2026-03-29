import * as types from './actionTypes'

export function setFriends(friends) {
  return (dispatch, getState) => {
    try {
      const state = getState()
      dispatch({ type: types.FRIENDS, friends: state.vk.friends.concat(friends) })
    } catch (error) {
      console.error(error)
    }
  }
}

export function setCount(count) {
  return (dispatch, getState) => {
    try {
      dispatch({ type: types.COUNT_DAY, count: count })
    } catch (error) {
      console.error(error)
    }
  }
}

export function setDayPost(date) {
  return (dispatch, getState) => {
    try {
      dispatch({ type: types.DAY_POST, day_post: date })
    } catch (error) {
      console.error(error)
    }
  }
}
