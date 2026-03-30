import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface NappState {
  modalCategory: boolean
  modalAlert: boolean
  modalLogin: boolean
  modalRequest: boolean
  statusBar: Record<string, any>
  footerBar: Record<string, any>
}

const initialState: NappState = {
  modalCategory: false,
  modalAlert: false,
  modalLogin: false,
  modalRequest: false,
  statusBar: {},
  footerBar: {}
}

const nappSlice = createSlice({
  name: 'napp',
  initialState,
  reducers: {
    setModalCategory(state, action: PayloadAction<boolean>) {
      state.modalCategory = action.payload
    },
    setModalAlert(state, action: PayloadAction<boolean>) {
      state.modalAlert = action.payload
    },
    setModalLogin(state, action: PayloadAction<boolean>) {
      state.modalLogin = action.payload
    },
    setModalRequest(state, action: PayloadAction<boolean>) {
      state.modalRequest = action.payload
    },
    setStatusBar(state, action: PayloadAction<Record<string, any>>) {
      state.statusBar = action.payload
    },
    setFooterBar(state, action: PayloadAction<Record<string, any>>) {
      state.footerBar = action.payload
    }
  }
})

// nappAction, nappSelector
const nappAction = nappSlice.actions

// Selectors
const nappSelector = {
  getModalCategory: (state: any) => state.napp.modalCategory,
  getModalAlert: (state: any) => state.napp.modalAlert,
  getModalLogin: (state: any) => state.napp.modalLogin,
  getModalRequest: (state: any) => state.napp.modalRequest,
  getStatusBar: (state: any) => state.napp.statusBar,
  getFooterBar: (state: any) => state.napp.footerBar
}

export { nappAction, nappSelector }
export default nappSlice.reducer
