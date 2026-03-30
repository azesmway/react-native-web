import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface AppState {
  appVersion: string | null
  userName: string | null
  openDialogHotel: boolean
  appLang: string
  appLangInterface: string
  androidIdInstall: string | null
  referral: any
  appPath: string | null
  appReload: boolean
  count: number
  isConnect: boolean
  idCategory: number
  agreement: boolean
  locationPath: string
  device: Record<string, any>
  unauthCount: number
}

const initialState: AppState = {
  appVersion: null,
  userName: null,
  openDialogHotel: true,
  appLang: 'ru',
  appLangInterface: 'ru',
  androidIdInstall: null,
  referral: null,
  appPath: null,
  appReload: false,
  count: 0,
  isConnect: false,
  idCategory: 0,
  agreement: false,
  locationPath: '',
  device: {},
  unauthCount: 0
}

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setAppVersion(state, action: PayloadAction<string>) {
      state.appVersion = action.payload
    },
    setUserName(state, action: PayloadAction<string>) {
      state.userName = action.payload
    },
    setOpenDialogHotel(state, action: PayloadAction<boolean>) {
      state.openDialogHotel = action.payload
    },
    setAppLang(state, action: PayloadAction<string>) {
      state.appLang = action.payload
    },
    setAppLangInterface(state, action: PayloadAction<string>) {
      state.appLangInterface = action.payload
    },
    setAndroidIdInstall(state, action: PayloadAction<string>) {
      state.androidIdInstall = action.payload
    },
    setRef(state, action: PayloadAction<any>) {
      state.referral = action.payload
    },
    setPath(state, action: PayloadAction<string>) {
      state.appPath = action.payload
    },
    setAppReload(state, action: PayloadAction<boolean>) {
      state.appReload = action.payload
    },
    setAppCount(state, action: PayloadAction<number>) {
      state.count = action.payload
    },
    setConnect(state, action: PayloadAction<boolean>) {
      if (state.isConnect !== action.payload) state.isConnect = action.payload
    },
    setIdCategory(state, action: PayloadAction<number>) {
      state.idCategory = action.payload
    },
    setChatAgreement(state, action: PayloadAction<boolean>) {
      state.agreement = action.payload
    },
    setLocationPath(state, action: PayloadAction<string>) {
      state.locationPath = action.payload
    },
    setDevice(state, action: PayloadAction<Record<string, any>>) {
      state.device = action.payload
    },
    setUnauthCount(state, action: PayloadAction<number>) {
      state.unauthCount = action.payload
    }
  }
})

const appAction = appSlice.actions

// Selectors
const appSelector = {
  getAppVersion: (state: any) => state.app.appVersion,
  getUserName: (state: any) => state.app.userName,
  getOpenDialogHotel: (state: any) => state.app.openDialogHotel,
  getAppLang: (state: any) => state.app.appLang,
  getAppLangInterface: (state: any) => state.app.appLangInterface,
  getAndroidIdInstall: (state: any) => state.app.androidIdInstall,
  getRef: (state: any) => state.app.referral,
  getPath: (state: any) => state.app.appPath,
  getAppReload: (state: any) => state.app.appReload,
  getAppCount: (state: any) => state.app.count,
  getConnect: (state: any) => state.app.isConnect,
  getIdCategory: (state: any) => state.app.idCategory,
  getChatAgreement: (state: any) => state.app.agreement,
  getLocationPath: (state: any) => state.app.locationPath,
  getDevice: (state: any) => state.app.device,
  getUnauthCount: (state: any) => state.app.unauthCount
}

export { appAction, appSelector }
export default appSlice.reducer
