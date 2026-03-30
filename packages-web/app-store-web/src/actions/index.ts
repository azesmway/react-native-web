import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface ActionsState {
  listActions: any[]
}

const initialState: ActionsState = {
  listActions: []
}

const actionsSlice = createSlice({
  name: 'actions',
  initialState,
  reducers: {
    setAllActions(state, action: PayloadAction<any[]>) {
      state.listActions = action.payload
    }
  }
})

const actionsAction = actionsSlice.actions

// Selectors
const actionsSelector = {
  getAllActions: (state: any) => state.actions.listActions
}

export { actionsAction, actionsSelector }
export default actionsSlice.reducer
