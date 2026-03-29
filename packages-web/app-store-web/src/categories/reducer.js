import Immutable from 'seamless-immutable'

import * as types from './actionTypes'

const initialState = Immutable({
  chatCategories: [],
  // selectCategory: undefined,
  fetchCategoryError: undefined
})

export default function reduce(state = initialState, action = {}) {
  switch (action.type) {
    case types.CATEGORIES_FETCH:
      return {
        ...state,
        chatCategories: action.chatCategories
      }
    // case types.CATEGORY_SELECTED:
    //   return {
    //     ...state,
    //     selectCategory: action.selectCategory
    //   }
    case types.CATEGORIES_FETCH_ERROR:
      return {
        ...state,
        fetchCategoryError: action.fetchCategoryError
      }
    case types.CATEGORY_CHANGE_NAME:
      return {
        ...state,
        selectCategory: action.selectCategory
      }
    default:
      return state
  }
}

export function getCategories(state) {
  return state.categories.chatCategories
}

// export function getSelectedCategory(state) {
//   return state.categories.selectCategory
// }
//
// export function getSelectedCategoryName(state) {
//   if (state.categories.selectCategory && state.categories.selectCategory.name) {
//     return state.categories.selectCategory.name
//   } else {
//     return undefined
//   }
// }

export function getFetchCategoryError(state) {
  return state.categories.fetchCategoryError
}
