import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface DrawerState {
  openDrawer: boolean
  authOpen: boolean
  renderApp: boolean
}

const initialState: DrawerState = {
  openDrawer: false,
  authOpen: true,
  renderApp: false
}

const drawerSlice = createSlice({
  name: 'drawer',
  initialState,
  reducers: {
    openDrawer(state, action: PayloadAction<boolean>) {
      state.openDrawer = action.payload
    },
    openAuth(state, action: PayloadAction<boolean>) {
      state.authOpen = action.payload
    },
    renderApp(state, action: PayloadAction<boolean>) {
      state.renderApp = action.payload
    }
  }
})
// drawerAction, drawerSelector
const drawerAction = drawerSlice.actions

// Selectors
const drawerSelector = {
  getOpenDrawer: (state: any) => state.drawer?.openDrawer,
  getOpenAuth: (state: any) => state.drawer?.authOpen,
  getRenderApp: (state: any) => state.drawer?.renderApp
}

export { drawerAction, drawerSelector }
export default drawerSlice.reducer
