import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface VKTitle {
  news: string
  overview: string
  announces: string
}

interface UserState {
  user: Record<string, any>
  userVK: Record<string, any>
  userGroupVK: any[]
  vkTitle: VKTitle
  notifyNews: boolean
  urlPost: string
  isPostVK: boolean
  isPostGroupVK: boolean
  isFriendVK: boolean
  chatAgentTowns: any[]
  iosToken: string | null
  fcmToken: string
  expoToken: string
  passwordSotr: string
}

const initialState: UserState = {
  user: {},
  userVK: {},
  userGroupVK: [],
  vkTitle: { news: '', overview: '', announces: '' },
  notifyNews: false,
  urlPost: '2',
  isPostVK: false,
  isPostGroupVK: false,
  isFriendVK: false,
  chatAgentTowns: [],
  iosToken: null,
  fcmToken: '',
  expoToken: '',
  passwordSotr: ''
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<Record<string, any>>) {
      state.user = action.payload
    },
    setVK(state, action: PayloadAction<Record<string, any>>) {
      state.userVK = action.payload
    },
    setGroupVK(state, action: PayloadAction<any[]>) {
      state.userGroupVK = action.payload
    },
    setNotifyNews(state, action: PayloadAction<boolean>) {
      state.notifyNews = action.payload
    },
    setUrlPost(state, action: PayloadAction<string>) {
      state.urlPost = action.payload
    },
    setPostVK(state, action: PayloadAction<boolean>) {
      state.isPostVK = action.payload
    },
    setPostGroupVK(state, action: PayloadAction<boolean>) {
      state.isPostGroupVK = action.payload
    },
    setFriendVK(state, action: PayloadAction<boolean>) {
      state.isFriendVK = action.payload
    },
    setAgentTowns(state, action: PayloadAction<any[]>) {
      state.chatAgentTowns = action.payload
    },
    setIosToken(state, action: PayloadAction<string | null>) {
      state.iosToken = action.payload
    },
    setFcmToken(state, action: PayloadAction<string>) {
      state.fcmToken = action.payload
    },
    setExpoToken(state, action: PayloadAction<string>) {
      state.expoToken = action.payload
    },
    setPasswordSotr(state, action: PayloadAction<string>) {
      state.passwordSotr = action.payload
    },
    setVKTitle(state, action: PayloadAction<VKTitle>) {
      state.vkTitle = action.payload
    }
  }
})

// userAction, userSelector
const userAction = userSlice.actions

// Selectors
const userSelector = {
  getUser: (state: any) => state.user.user,
  getVK: (state: any) => state.user.userVK,
  getGroupVK: (state: any) => state.user.userGroupVK,
  getNotifyNews: (state: any) => state.user.notifyNews,
  getUrlPost: (state: any) => state.user.urlPost,
  isPostVK: (state: any) => state.user.isPostVK,
  isPostGroupVK: (state: any) => state.user.isPostGroupVK,
  isFriendVK: (state: any) => state.user.isFriendVK,
  getAgentTowns: (state: any) => state.user.chatAgentTowns,
  getIosToken: (state: any) => state.user.iosToken,
  getFcmToken: (state: any) => state.user.fcmToken,
  getExpoToken: (state: any) => state.user.expoToken,
  getPasswordSotr: (state: any) => state.user.passwordSotr,
  getVKTitle: (state: any) => state.user.vkTitle
}

export { userAction, userSelector }
export default userSlice.reducer
