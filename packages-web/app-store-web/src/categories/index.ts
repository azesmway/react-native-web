import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface CategoriesState {
  chatCategories: any[]
  fetchCategoryError?: any
}

const initialState: CategoriesState = {
  chatCategories: [],
  fetchCategoryError: undefined
}

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    setCategories(state, action: PayloadAction<any[]>) {
      state.chatCategories = action.payload
    },
    setFetchCategoryError(state, action: PayloadAction<any>) {
      state.fetchCategoryError = action.payload
    }
  }
})

const catAction = categoriesSlice.actions

// Selectors
const catSelector = {
  getCategories: (state: any) => state.categories.chatCategories,
  getFetchCategoryError: (state: any) => state.categories.fetchCategoryError
}

export { catAction, catSelector }
export default categoriesSlice.reducer
