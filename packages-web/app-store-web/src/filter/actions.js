import * as types from './actionTypes'

export function setFilter(filterChat) {
  return (dispatch, getState) => {
    // Storage.setMessagesIds()
    // Storage.setSelectCategory(filterChat.selectCategory)
    dispatch({ type: types.FILTER_SELECTED, filterChat: filterChat })
  }
}

export function setSelectCategory(category) {
  return (dispatch, getState) => {
    let state = getState()
    if (state.filter && state.filter.filterChat) {
      let s = Object.assign({}, state.filter.filterChat)
      s.selectCategory = {}
      s.selectCategory = category
      dispatch({ type: types.FILTER_SELECTED, filterChat: s })
    }
  }
}

export function setSelectSearch(search) {
  return (dispatch, getState) => {
    let state = getState()
    if (state.filter && state.filter.filterChat) {
      let s = Object.assign({}, state.filter.filterChat)
      s.selectSearch = {}
      s.selectSearch = search
      dispatch({ type: types.FILTER_SELECTED, filterChat: s })
    }
  }
}

export function setFileInstall(install) {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: types.FILE_INSTALL, fileInstall: install })
    } catch (error) {
      console.error(error)
    }
  }
}

export function setSelectHotel(selectHotel) {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: types.SELECT_HOTEL, selectHotel: selectHotel })
    } catch (error) {
      console.error(error)
    }
  }
}

export function setSelectPlace(selectPlace) {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: types.SELECT_PLACE, selectPlace: selectPlace })
    } catch (error) {
      console.error(error)
    }
  }
}
