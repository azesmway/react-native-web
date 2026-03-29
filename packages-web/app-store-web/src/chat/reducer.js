import * as types from './actionTypes'
import { Platform } from 'react-native'

const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
const { HEIGHT_INPUT } = GLOBAL_OBJ.onlinetur.constants

const initialState = {
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
  replyMessage: {
    replyId: null,
    id_parent: '',
    name_parent: '',
    msg_parent: '',
    id_post: ''
  },
  isBottomList: true,
  textMessage: '',
  isSendMessage: false,
  openIdMessage: false,
  onReached: {
    isEndReached: false,
    isStartReached: false
  },
  modalFilter: {},
  modalUser: {},
  modalContact: {},
  imagesView: {},
  heightInput: HEIGHT_INPUT,
  sendMessageAI: 0
}

export default function reduce(state = initialState, action = {}) {
  switch (action.type) {
    case types.CHANGE_COUNTRIES:
      return {
        ...state,
        chatCountries: action.chatCountries ? action.chatCountries : []
      }
    case types.CHANGE_HOTELS:
      return {
        ...state,
        chatHotels: action.chatHotels ? action.chatHotels : []
      }
    case types.CHANGE_PLACES:
      return {
        ...state,
        chatPlaces: action.chatPlaces ? action.chatPlaces : []
      }
    case types.CHANGE_HOBBY:
      return {
        ...state,
        chatHobby: action.chatHobby ? action.chatHobby : []
      }
    case types.CHANGE_AGENT:
      return {
        ...state,
        chatAgent: action.chatAgent ? action.chatAgent : []
      }
    case types.CHANGE_SHARED:
      return {
        ...state,
        shareData: action.shareData ? action.shareData : []
      }
    case types.CHANGE_SHARED_NOT_AUTH:
      return {
        ...state,
        shareDataNotAuth: action.shareDataNotAuth ? action.shareDataNotAuth : []
      }
    case types.CHANGE_CHAT_THEME:
      return {
        ...state,
        chatTheme: action.chatTheme
      }
    case types.CHANGE_MODAL_THEME:
      return {
        ...state,
        modalTheme: action.modalTheme
      }
    case types.CHANGE_CHAT_IMAGES:
      return {
        ...state,
        images: action.images
      }
    case types.CHANGE_CHAT_MESSAGES:
      return {
        ...state,
        messages: action.messages
      }
    case types.CHANGE_CHAT_MESSAGES_OLD:
      return {
        ...state,
        messages: action.messages
      }
    case types.CHANGE_CHAT_MESSAGES_NEW:
      return {
        ...state,
        messages: action.messages
      }
    case types.CHANGE_CHAT_SCROLL_TO_BOTTOM:
      return {
        ...state,
        isScrollToBottom: action.isScrollToBottom
      }
    case types.CHANGE_CHAT_COUNT_NEW_MESSAGES:
      return {
        ...state,
        countNewMessages: action.countNewMessages
      }
    case types.CHANGE_CHAT_RENDERED:
      return {
        ...state,
        chatRendered: action.chatRendered
      }
    case types.CHANGE_CHAT_REPLY_MESSAGE:
      return {
        ...state,
        replyMessage: action.replyMessage
      }
    case types.CHANGE_CHAT_BOTTOM_LIST:
      return {
        ...state,
        isBottomList: action.isBottomList
      }
    case types.CHANGE_CHAT_TEXT_MESSAGE:
      return {
        ...state,
        textMessage: action.textMessage
      }
    case types.CHANGE_CHAT_IMAGE360:
      return {
        ...state,
        images360: action.images360
      }
    case types.CHANGE_CHAT_SEND_MESSAGE:
      return {
        ...state,
        isSendMessage: action.isSendMessage
      }
    case types.CHANGE_CHAT_OPEN_ID_MESSAGE:
      return {
        ...state,
        openIdMessage: action.openIdMessage
      }
    case types.CHANGE_CHAT_MODAL_FILTER:
      return {
        ...state,
        modalFilter: action.modalFilter
      }
    case types.CHANGE_CHAT_MODAL_USER:
      return {
        ...state,
        modalUser: action.modalUser
      }
    case types.CHANGE_CHAT_IMAGES_VIEW:
      return {
        ...state,
        imagesView: action.imagesView
      }
    case types.CHANGE_CHAT_HEIGHT_INPUT:
      return {
        ...state,
        heightInput: action.heightInput
      }
    case types.CHANGE_CHAT_MODAL_CONTACT:
      return {
        ...state,
        modalContact: action.modalContact
      }
    case types.CHANGE_CHAT_SEND_MESSAGE_AI:
      return {
        ...state,
        sendMessageAI: action.sendMessageAI
      }
    default:
      return state
  }
}

export function getCountries(state) {
  return state.chat.chatCountries
}

export function getHotels(state) {
  return state.chat.chatHotels
}

export function getPlaces(state) {
  return state.chat.chatPlaces
}

export function getHobby(state) {
  return state.chat.chatHobby
}

export function getAgent(state) {
  return state.chat.chatAgent
}

export function getShareData(state) {
  return state.chat.shareData
}

export function getShareDataNotAuth(state) {
  return state.chat.shareDataNotAuth
}

export function getChatTheme(state) {
  return state.chat.chatTheme
}

export function getModalTheme(state) {
  return state.chat.modalTheme
}

export function getChatImages(state) {
  return state.chat.images
}

export function getChatImagesLength(state) {
  return state.chat.images.length
}

export function getChatMessages(state) {
  return state.chat.messages
}

export function getChatScrollToBottom(state) {
  return state.chat.isScrollToBottom
}

export function getChatCountNewMessages(state) {
  return state.chat.countNewMessages
}

export function getChatRendered(state) {
  return state.chat.chatRendered
}

export function getChatReplyMessage(state) {
  return state.chat.replyMessage
}

export function getChatBottomList(state) {
  return state.chat.isBottomList
}

export function getChatMessagesLength(state) {
  return state.chat.messages.length
}

export function getChatTextMessage(state) {
  return state.chat.textMessage
}

export function getChatImages360(state) {
  return state.chat.images360
}

export function getChatSendMessage(state) {
  return state.chat.isSendMessage
}

export function getChatOpenIdMessage(state) {
  return state.chat.openIdMessage
}

export function getModalFilter(state) {
  return state.chat.modalFilter
}

export function getModalUser(state) {
  return state.chat.modalUser
}

export function getImagesView(state) {
  return state.chat.imagesView
}

export function getHeightInput(state) {
  return state.chat.heightInput
}

export function getModalContact(state) {
  return state.chat.modalContact
}

export function getSendMessageAI(state) {
  return state.chat.sendMessageAI
}
