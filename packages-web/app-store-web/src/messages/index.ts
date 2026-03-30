import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import orderBy from 'lodash/orderBy'

interface MessagesState {
  msg: any[]
  offline: boolean
}

const initialState: MessagesState = {
  msg: [],
  offline: false
}

const messagesSlice = createSlice({
  name: 'offline',
  initialState,
  reducers: {
    setMessagesOffline(state, action: PayloadAction<any>) {
      state.msg = state.msg.concat(action.payload)
    },
    changeMessageOffline(state, action: PayloadAction<any>) {
      const filtered = state.msg.filter(msg => msg.id !== action.payload.id)
      state.msg = [action.payload, ...filtered]
    },
    removeMessageOffline(state, action: PayloadAction<string | number>) {
      state.msg = state.msg.filter(msg => msg.id !== action.payload)
    },
    changeOfflineMode(state, action: PayloadAction<boolean>) {
      if (state.offline !== action.payload) {
        state.offline = action.payload
      }
    }
  }
})

// messagesAction, messagesSelector
const messagesAction = messagesSlice.actions

// Selectors
const messagesSelector = {
  getMessagesOffline: (state: any) => orderBy(state.offline.msg, 'id', 'asc'),
  getOfflineMode: (state: any) => state.offline.offline
}

export { messagesAction, messagesSelector }
export default messagesSlice.reducer
