import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Platform } from 'react-native'

const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
// @ts-ignore
const HEIGHT_INPUT = GLOBAL_OBJ?.onlinetur?.constants?.HEIGHT_INPUT ?? 20

interface ReplyMessage {
  replyId: number | null
  id_parent: string
  name_parent: string
  msg_parent: string
  id_post: string
}

interface ChatState {
  chatCountries: any[]
  chatHotels: any[]
  chatPlaces: any[]
  chatHobby: any[]
  chatAgent: any[]
  shareData: any[]
  shareDataNotAuth: any[]
  chatTheme: number
  modalTheme: boolean
  images: any[]
  images360: any
  messages: any[]
  isScrollToBottom: boolean
  countNewMessages: number
  chatRendered: boolean
  replyMessage: ReplyMessage
  isBottomList: boolean
  textMessage: string
  isSendMessage: boolean
  openIdMessage: boolean
  onReached: { isEndReached: boolean; isStartReached: boolean }
  modalFilter: Record<string, any>
  modalUser: Record<string, any>
  modalContact: Record<string, any>
  imagesView: Record<string, any>
  heightInput: number
  sendMessageAI: number
}

const initialState: ChatState = {
  chatCountries: [],
  chatHotels: [],
  chatPlaces: [],
  chatHobby: [],
  chatAgent: [],
  shareData: [],
  shareDataNotAuth: [],
  chatTheme: 0,
  modalTheme: false,
  images: [],
  images360: null,
  messages: [],
  isScrollToBottom: true,
  countNewMessages: 0,
  chatRendered: false,
  replyMessage: { replyId: null, id_parent: '', name_parent: '', msg_parent: '', id_post: '' },
  isBottomList: true,
  textMessage: '',
  isSendMessage: false,
  openIdMessage: false,
  onReached: { isEndReached: false, isStartReached: false },
  modalFilter: {},
  modalUser: {},
  modalContact: {},
  imagesView: {},
  heightInput: HEIGHT_INPUT,
  sendMessageAI: 0
}

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setCountries(state, action: PayloadAction<any[]>) {
      state.chatCountries = action.payload ?? []
    },
    setHotels(state, action: PayloadAction<any[]>) {
      state.chatHotels = action.payload ?? []
    },
    setPlaces(state, action: PayloadAction<any[]>) {
      state.chatPlaces = action.payload ?? []
    },
    setHobby(state, action: PayloadAction<any[]>) {
      state.chatHobby = action.payload ?? []
    },
    setAgent(state, action: PayloadAction<any[]>) {
      state.chatAgent = action.payload ?? []
    },
    setShareData(state, action: PayloadAction<any[]>) {
      state.shareData = action.payload ?? []
    },
    setShareDataNotAuth(state, action: PayloadAction<any[]>) {
      state.shareDataNotAuth = action.payload ?? []
    },
    setChatTheme(state, action: PayloadAction<number>) {
      state.chatTheme = action.payload
    },
    setModalTheme(state, action: PayloadAction<boolean>) {
      state.modalTheme = action.payload
    },
    setChatImages(state, action: PayloadAction<any[]>) {
      state.images = action.payload
    },
    setChatImages360(state, action: PayloadAction<any>) {
      state.images360 = action.payload
    },
    setChatMessages(state, action: PayloadAction<any[]>) {
      state.messages = action.payload
    },
    setChatMessagesOld(state, action: PayloadAction<any[]>) {
      state.messages = [...action.payload, ...state.messages]
    },
    setChatMessagesNew(state, action: PayloadAction<any[]>) {
      state.messages = [...state.messages, ...action.payload]
    },
    setChatScrollToBottom(state, action: PayloadAction<boolean>) {
      state.isScrollToBottom = action.payload
    },
    setChatCountNewMessages(state, action: PayloadAction<number>) {
      state.countNewMessages = action.payload
    },
    setChatRendered(state, action: PayloadAction<boolean>) {
      state.chatRendered = action.payload
    },
    setChatReplyMessage(state, action: PayloadAction<ReplyMessage>) {
      state.replyMessage = action.payload
    },
    setChatBottomList(state, action: PayloadAction<boolean>) {
      state.isBottomList = action.payload
    },
    setChatTextMessage(state, action: PayloadAction<string>) {
      state.textMessage = action.payload
    },
    setChatSendMessage(state, action: PayloadAction<boolean>) {
      state.isSendMessage = action.payload
    },
    setChatOpenIdMessage(state, action: PayloadAction<boolean>) {
      state.openIdMessage = action.payload
    },
    setModalFilter(state, action: PayloadAction<Record<string, any>>) {
      state.modalFilter = action.payload
    },
    setModalUser(state, action: PayloadAction<Record<string, any>>) {
      state.modalUser = action.payload
    },
    setModalContact(state, action: PayloadAction<Record<string, any>>) {
      state.modalContact = action.payload
    },
    setImagesView(state, action: PayloadAction<Record<string, any>>) {
      state.imagesView = action.payload
    },
    setHeightInput(state, action: PayloadAction<number>) {
      state.heightInput = action.payload
    },
    setSendMessageAI(state, action: PayloadAction<number>) {
      state.sendMessageAI = action.payload
    },
    // Complex: reset scroll state
    resetScrollState(state) {
      state.isBottomList = true
      state.isScrollToBottom = true
      state.countNewMessages = 0
      state.chatRendered = false
    }
  }
})

// Selectors
const chatSelector = {
  getCountries: (state: any) => state.chat.chatCountries,
  getHotels: (state: any) => state.chat.chatHotels,
  getPlaces: (state: any) => state.chat.chatPlaces,
  getHobby: (state: any) => state.chat.chatHobby,
  getAgent: (state: any) => state.chat.chatAgent,
  getShareData: (state: any) => state.chat.shareData,
  getShareDataNotAuth: (state: any) => state.chat.shareDataNotAuth,
  getChatTheme: (state: any) => state.chat.chatTheme,
  getModalTheme: (state: any) => state.chat.modalTheme,
  getChatImages: (state: any) => state.chat.images,
  getChatImagesLength: (state: any) => state.chat.images.length,
  getChatImages360: (state: any) => state.chat.images360,
  getChatMessages: (state: any) => state.chat.messages,
  getChatScrollToBottom: (state: any) => state.chat.isScrollToBottom,
  getChatCountNewMessages: (state: any) => state.chat.countNewMessages,
  getChatRendered: (state: any) => state.chat.chatRendered,
  getChatReplyMessage: (state: any) => state.chat.replyMessage,
  getChatBottomList: (state: any) => state.chat.isBottomList,
  getChatTextMessage: (state: any) => state.chat.textMessage,
  getChatSendMessage: (state: any) => state.chat.isSendMessage,
  getChatOpenIdMessage: (state: any) => state.chat.openIdMessage,
  getModalFilter: (state: any) => state.chat.modalFilter,
  getModalUser: (state: any) => state.chat.modalUser,
  getModalContact: (state: any) => state.chat.modalContact,
  getImagesView: (state: any) => state.chat.imagesView,
  getHeightInput: (state: any) => state.chat.heightInput,
  getSendMessageAI: (state: any) => state.chat.sendMessageAI,
  getChatMessagesLength: (state: any) => state.chat.messages.length
}

const chatAction = chatSlice.actions

export { chatAction, chatSelector }
export default chatSlice.reducer
