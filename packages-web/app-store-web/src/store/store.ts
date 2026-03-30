import storage from '@react-native-async-storage/async-storage'
import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import { reducer as notificationsReducer } from 'reapop'
import { persistReducer, persistStore } from 'redux-persist'

// Slice reducers
import actionsReducer from '../actions'
import { appApi, useGetCategoryListQuery, useGetDataPostsAgentQuery, useGetDataPostsQuery, useGetRatingCategoryQuery, useGetUserCrossQuery } from '../api/app/apiapp'
import appReducer from '../app'
import categoriesReducer from '../categories'
import chatReducer from '../chat'
import countriesReducer from '../countries'
import drawerReducer from '../drawer'
import filterReducer from '../filter'
import headerReducer from '../header'
import messagesReducer from '../messages'
import nappReducer from '../napp'
import newsReducer from '../news'
import ratingReducer from '../rating'
import userReducer from '../user'

// Slice actions & selectors (backward compat)
export { actionsAction, actionsSelector } from '../actions'
export { appAction, appSelector } from '../app'
export { catAction, catSelector } from '../categories'
export { chatAction, chatSelector } from '../chat'
export { countriesAction, countriesSelector } from '../countries'
export { drawerAction, drawerSelector } from '../drawer'
export { filterAction, filterSelector } from '../filter'
export { headerAction, headerSelector } from '../header'
export { messagesAction, messagesSelector } from '../messages'
export { nappAction, nappSelector } from '../napp'
export { newsAction, newsSelector } from '../news'
export { ratingAction, ratingSelector } from '../rating'
export { userAction, userSelector } from '../user'

// RTK Query
export { appApi, useGetCategoryListQuery, useGetDataPostsAgentQuery, useGetDataPostsQuery, useGetRatingCategoryQuery, useGetUserCrossQuery }

const persistConfig = {
  key: 'root',
  storage,
  blacklist: ['chat', 'actions', 'napp', 'header', appApi.reducerPath]
}

export const rootReducer = combineReducers({
  notifications: notificationsReducer(),
  categories: categoriesReducer,
  drawer: drawerReducer,
  filter: filterReducer,
  user: userReducer,
  chat: chatReducer,
  news: newsReducer,
  countries: countriesReducer,
  app: appReducer,
  rating: ratingReducer,
  actions: actionsReducer,
  napp: nappReducer,
  offline: messagesReducer,
  header: headerReducer,
  [appApi.reducerPath]: appApi.reducer
})

const persistedReducer = persistReducer(persistConfig, rootReducer)

const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      immutableCheck: false,
      serializableCheck: false
    }).concat(appApi.middleware)
})

const persistor = persistStore(store)
const dispatch = store.dispatch
const getState = store.getState

setupListeners(store.dispatch)

export { dispatch, getState, persistor, store }

// Types
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

// Typed hooks — используй вместо useSelector/useDispatch напрямую
export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
