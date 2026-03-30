import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface HeaderState {
  headerParams: Record<string, any>
}

const initialState: HeaderState = {
  headerParams: {}
}

const headerSlice = createSlice({
  name: 'header',
  initialState,
  reducers: {
    setHeaderParams(state, action: PayloadAction<Record<string, any>>) {
      state.headerParams = action.payload
    }
  }
})

// headerAction, headerSelector
const headerAction = headerSlice.actions

// Selectors
const headerSelector = {
  getHeaderParams: (state: any) => state.header.headerParams
}

export { headerAction, headerSelector }
export default headerSlice.reducer
