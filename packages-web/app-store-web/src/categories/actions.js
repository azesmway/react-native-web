import * as types from './actionTypes'

export function setCategories(chatCategories) {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: types.CATEGORIES_FETCH, chatCategories: chatCategories })
    } catch (error) {
      console.error(error)
    }
  }
}

// export function selectCategory(category) {
//   return (dispatch, getState) => {
//     dispatch({ type: types.CATEGORY_SELECTED, selectCategory: category })
//   }
// }
//
// export function changeNameSelectCategory(name) {
//   return (dispatch, getState) => {
//     let state = getState()
//     if (state.categories && state.categories.selectCategory) {
//       state.categories.selectCategory.name = name
//       dispatch({ type: types.CATEGORY_CHANGE_NAME, selectCategory: state.categories.selectCategory })
//     }
//   }
// }
