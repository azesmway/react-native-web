import * as types from './actionTypes'
import { EDIT_RATING } from './actionTypes'

export function changeHotels(hotels) {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: types.CHANGE_HOTELS, hotels: hotels })
    } catch (error) {
      console.error(error)
    }
  }
}

export function changeMyRatingLocal(myRatingLocal) {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: types.CHANGE_RATING_LOCAL, myRatingLocal: myRatingLocal })
    } catch (error) {
      console.error(error)
    }
  }
}

export function changeMyRatingServer(myRatingServer) {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: types.CHANGE_RATING_SERVER, myRatingServer: myRatingServer })
    } catch (error) {
      console.error(error)
    }
  }
}

export function changeRatingTime(time) {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: types.CHANGE_TIME, time: time })
    } catch (error) {
      console.error(error)
    }
  }
}

export function changeRatingFilter(filter) {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: types.CHANGE_FILTER, filter: filter })
    } catch (error) {
      console.error(error)
    }
  }
}

export function changeAlertHotels(alertHotels) {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: types.CHANGE_ALERT_HOTELS, alertHotels: alertHotels })
    } catch (error) {
      console.error(error)
    }
  }
}

export function changeAlertMyHotels(alertMyHotels) {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: types.CHANGE_ALERT_MYHOTELS, alertMyHotels: alertMyHotels })
    } catch (error) {
      console.error(error)
    }
  }
}

export function changeCriteria(criteriaRating) {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: types.CHANGE_CRITERIA, criteriaRating: criteriaRating })
    } catch (error) {
      console.error(error)
    }
  }
}

export function setSaveRatingCache(saveRatingCache) {
  return async (dispatch, getState) => {
    try {
      const state = getState()
      let ratingCache = null

      if (saveRatingCache) {
        if (state.rating.saveRatingCache) {
          ratingCache = { ...state.rating.saveRatingCache, ...saveRatingCache }
        } else {
          ratingCache = { ...saveRatingCache }
        }
      }
      dispatch({ type: types.SAVE_RATING_CACHE, saveRatingCache: ratingCache })
    } catch (error) {
      console.error(error)
    }
  }
}

export function setSelectedRatingCategory(selectedRatingCategory) {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: types.CHANGE_SELECTED_RATING_CATEGORY, selectedRatingCategory: selectedRatingCategory })
    } catch (error) {
      console.error(error)
    }
  }
}

export function setChangeMyRating(changeMyRating) {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: types.CHANGE_MY_RATING, changeMyRating: changeMyRating })
    } catch (error) {
      console.error(error)
    }
  }
}

export function setEditRating(editRating) {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: types.EDIT_RATING, editRating: editRating })
    } catch (error) {
      console.error(error)
    }
  }
}
