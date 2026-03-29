import Immutable from 'seamless-immutable'

import * as types from './actionTypes'

const initialState = Immutable({
  hotels: [],
  myRatingLocal: [],
  myRatingServer: [],
  time: '',
  filter: {
    selectedCountries: [],
    selectedPlaces: [],
    indexCategory: 0
  },
  alertHotels: null,
  alertMyHotels: null,
  criteriaRating: [],
  saveRatingCache: null,
  selectedRatingCategory: 0,
  changeMyRating: false,
  editRating: true
})

export default function reduce(state = initialState, action = {}) {
  switch (action.type) {
    case types.CHANGE_HOTELS:
      return {
        ...state,
        hotels: action.hotels
      }
    case types.CHANGE_RATING_LOCAL:
      return {
        ...state,
        myRatingLocal: action.myRatingLocal
      }
    case types.CHANGE_RATING_SERVER:
      return {
        ...state,
        myRatingServer: action.myRatingServer
      }
    case types.CHANGE_TIME:
      return {
        ...state,
        time: action.time
      }
    case types.CHANGE_FILTER:
      return {
        ...state,
        filter: action.filter
      }
    case types.CHANGE_ALERT_HOTELS:
      return {
        ...state,
        alertHotels: action.alertHotels
      }
    case types.CHANGE_ALERT_MYHOTELS:
      return {
        ...state,
        alertMyHotels: action.alertMyHotels
      }
    case types.CHANGE_CRITERIA:
      return {
        ...state,
        criteriaRating: action.criteriaRating
      }
    case types.SAVE_RATING_CACHE:
      return {
        ...state,
        saveRatingCache: action.saveRatingCache
      }
    case types.CHANGE_SELECTED_RATING_CATEGORY:
      return {
        ...state,
        selectedRatingCategory: action.selectedRatingCategory
      }
    case types.CHANGE_MY_RATING:
      return {
        ...state,
        changeMyRating: action.changeMyRating
      }
    case types.EDIT_RATING:
      return {
        ...state,
        editRating: action.editRating
      }
    default:
      return state
  }
}

export function getHotels(state) {
  return state.rating.hotels
}

export function getMyRatingLocal(state) {
  return state.rating.myRatingLocal
}

export function getMyRatingServer(state) {
  return state.rating.myRatingServer
}

export function getRatingTime(state) {
  return state.rating.time
}

export function getRatingFilter(state) {
  return state.rating.filter
}

export function getAlertHotels(state) {
  return state.rating.alertHotels
}

export function getAlertMyHotels(state) {
  return state.rating.alertMyHotels
}

export function getCriteria(state) {
  return state.rating.criteriaRating
}

export function getSaveRatingCache(state) {
  return state.rating.saveRatingCache
}

export function getSelectedRatingCategory(state) {
  return state.rating.selectedRatingCategory
}

export function getChangeMyRating(state) {
  return state.rating.changeMyRating
}

export function getEditRating(state) {
  return state.rating.editRating
}
