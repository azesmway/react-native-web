import Immutable from 'seamless-immutable'

import * as types from './actionTypes'

const initialState = Immutable({
  filterChat: {
    selectedCountry: '-1',
    selectedHotel: '-1',
    selectedHobby: '-1',
    selectedPlace: '-1',

    selectedCountryName: '',
    selectedHotelName: '',
    selectedHobbyName: '',
    selectedPlaceName: '',

    selectedCountryHide: 0,
    selectedHotelHide: 0,
    selectedHobbyHide: 0,
    selectedPlaceHide: 0,

    selectedFav: '0',
    selectedFavName: '',

    searchFav: '',
    idUserFav: '0',
    nameUserFav: '',

    chatAgent: null,
    selectedAgent: '-1',
    selectedAgentName: '',

    selectCategory: {},
    selectSearch: {}
  },
  fileInstall: false,
  selectHotel: {},
  selectPlace: {}
})

export default function reduce(state = initialState, action = {}) {
  switch (action.type) {
    case types.FILTER_SELECTED:
      return {
        ...state,
        filterChat: action.filterChat
      }
    case types.FILE_INSTALL:
      return {
        ...state,
        fileInstall: action.fileInstall
      }
    case types.SELECT_HOTEL:
      return {
        ...state,
        selectHotel: action.selectHotel
      }
    case types.SELECT_PLACE:
      return {
        ...state,
        selectPlace: action.selectPlace
      }
    default:
      return state
  }
}

export function getFilter(state) {
  return state.filter.filterChat
}

export function getSelectCategory(state) {
  if (state && state.filter && state.filter.filterChat) {
    return state.filter.filterChat.selectCategory
  }

  return null
}

export function getSelectSearch(state) {
  if (state && state.filter && state.filter.filterChat) {
    return state.filter.filterChat.selectSearch
  }

  return null
}

export function getFileInstall(state) {
  return state.filter.fileInstall
}

export function getSelectHotel(state) {
  return state.filter.selectHotel
}

export function getSelectPlace(state) {
  return state.filter.selectPlace
}
