import * as types from './actionTypes'

export function setCountries(chatCountries) {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: types.CHANGE_COUNTRIES, chatCountries: chatCountries })
    } catch (error) {
      console.error(error)
    }
  }
}

export function setHotels(chatHotels) {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: types.CHANGE_HOTELS, chatHotels: chatHotels })
    } catch (error) {
      console.error(error)
    }
  }
}

export function setPlaces(chatPlaces) {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: types.CHANGE_PLACES, chatPlaces: chatPlaces })
    } catch (error) {
      console.error(error)
    }
  }
}

export function setHobby(chatHobby) {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: types.CHANGE_HOBBY, chatHobby: chatHobby })
    } catch (error) {
      console.error(error)
    }
  }
}

export function setAgent(chatAgent) {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: types.CHANGE_AGENT, chatAgent: chatAgent })
    } catch (error) {
      console.error(error)
    }
  }
}

export function setShareData(shareData) {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: types.CHANGE_SHARED, shareData: shareData })
    } catch (error) {
      console.error(error)
    }
  }
}

export function setShareDataNotAuth(shareDataNotAuth) {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: types.CHANGE_SHARED_NOT_AUTH, shareDataNotAuth: shareDataNotAuth })
    } catch (error) {
      console.error(error)
    }
  }
}

export function setChatTheme(chatTheme) {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: types.CHANGE_CHAT_THEME, chatTheme: chatTheme })
    } catch (error) {
      console.error(error)
    }
  }
}

export function setModalTheme(visible) {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: types.CHANGE_MODAL_THEME, modalTheme: visible })
    } catch (error) {
      console.error(error)
    }
  }
}

export function setChatImages(images) {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: types.CHANGE_CHAT_IMAGES, images: images })
    } catch (error) {
      console.error(error)
    }
  }
}

export function setChatMessages(messages) {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: types.CHANGE_CHAT_MESSAGES, messages: messages })
    } catch (error) {
      console.error(error)
    }
  }
}

export function setChatMessagesOld(messages) {
  return async (dispatch, getState) => {
    try {
      const state = getState()
      dispatch({ type: types.CHANGE_CHAT_MESSAGES_OLD, messages: messages.concat(state.chat.messages) })
    } catch (error) {
      console.error(error)
    }
  }
}

export function setChatMessagesNew(messages) {
  return async (dispatch, getState) => {
    try {
      const state = getState()
      dispatch({ type: types.CHANGE_CHAT_MESSAGES_NEW, messages: state.chat.messages.concat(messages) })
    } catch (error) {
      console.error(error)
    }
  }
}

export function setChatScrollToBottom(isScrollToBottom) {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: types.CHANGE_CHAT_SCROLL_TO_BOTTOM, isScrollToBottom: isScrollToBottom })
    } catch (error) {
      console.error(error)
    }
  }
}

export function setChatCountNewMessages(countNewMessages) {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: types.CHANGE_CHAT_COUNT_NEW_MESSAGES, countNewMessages: countNewMessages })
    } catch (error) {
      console.error(error)
    }
  }
}

export function setChatRendered(chatRendered) {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: types.CHANGE_CHAT_RENDERED, chatRendered: chatRendered })
    } catch (error) {
      console.error(error)
    }
  }
}

export function setChatReplyMessage(replyMessage) {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: types.CHANGE_CHAT_REPLY_MESSAGE, replyMessage: replyMessage })
    } catch (error) {
      console.error(error)
    }
  }
}

export function setChatBottomList(isBottomList) {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: types.CHANGE_CHAT_BOTTOM_LIST, isBottomList: isBottomList })

      if (isBottomList === false) {
        dispatch({ type: types.CHANGE_CHAT_SCROLL_TO_BOTTOM, isScrollToBottom: false })
      }
    } catch (error) {
      console.error(error)
    }
  }
}

export function setChatTextMessage(textMessage) {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: types.CHANGE_CHAT_TEXT_MESSAGE, textMessage: textMessage })
    } catch (error) {
      console.error(error)
    }
  }
}

export function setChatImages360(images360) {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: types.CHANGE_CHAT_IMAGE360, images360: images360 })
    } catch (error) {
      console.error(error)
    }
  }
}

export function setChatSendMessage(isSendMessage) {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: types.CHANGE_CHAT_SEND_MESSAGE, isSendMessage: isSendMessage })
    } catch (error) {
      console.error(error)
    }
  }
}

export function setChatOpenIdMessage(openIdMessage) {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: types.CHANGE_CHAT_OPEN_ID_MESSAGE, openIdMessage: openIdMessage })
    } catch (error) {
      console.error(error)
    }
  }
}

export function willUnmount() {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: types.CHANGE_CHAT_BOTTOM_LIST, isBottomList: true })
      dispatch({ type: types.CHANGE_CHAT_SCROLL_TO_BOTTOM, isScrollToBottom: true })
      dispatch({ type: types.CHANGE_CHAT_COUNT_NEW_MESSAGES, countNewMessages: 0 })
      dispatch({ type: types.CHANGE_CHAT_RENDERED, chatRendered: false })
    } catch (error) {
      console.error(error)
    }
  }
}

export function setModalFilter(modalFilter) {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: types.CHANGE_CHAT_MODAL_FILTER, modalFilter: modalFilter })
    } catch (error) {
      console.error(error)
    }
  }
}

export function setModalUser(modalUser) {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: types.CHANGE_CHAT_MODAL_USER, modalUser: modalUser })
    } catch (error) {
      console.error(error)
    }
  }
}

export function setImagesView(imagesView) {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: types.CHANGE_CHAT_IMAGES_VIEW, imagesView: imagesView })
    } catch (error) {
      console.error(error)
    }
  }
}

export function setHeightInput(heightInput) {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: types.CHANGE_CHAT_HEIGHT_INPUT, heightInput: heightInput })
    } catch (error) {
      console.error(error)
    }
  }
}

export function setModalContact(modalContact) {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: types.CHANGE_CHAT_MODAL_CONTACT, modalContact: modalContact })
    } catch (error) {
      console.error(error)
    }
  }
}

export function setSendMessageAI(sendMessageAI) {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: types.CHANGE_CHAT_SEND_MESSAGE_AI, sendMessageAI: sendMessageAI })
    } catch (error) {
      console.error(error)
    }
  }
}
