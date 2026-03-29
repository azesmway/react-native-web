import storage from '@react-native-async-storage/async-storage'
import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import { reducer as notificationsReducer } from 'reapop'
import { persistReducer, persistStore } from 'redux-persist'

import { actionsAction, actionsSelector } from './actions'
import actionsReducer from './actions/reducer'
import { appApi, useGetCategoryListQuery, useGetDataPostsAgentQuery, useGetDataPostsQuery, useGetRatingCategoryQuery, useGetUserCrossQuery } from './api/app/apiapp'
import { appAction, appSelector } from './app'
import appReducer from './app/reducer'
import { catAction, catSelector } from './categories'
import categoriesReducer from './categories/reducer'
import { chatAction, chatSelector } from './chat'
import chatReducer from './chat/reducer'
import { countriesAction, countriesSelector } from './countries'
import countriesReducer from './countries/reducer'
import { drawerAction, drawerSelector } from './drawer'
import drawerReducer from './drawer/reducer'
import { filterAction, filterSelector } from './filter'
import filterReducer from './filter/reducer'
import { headerAction, headerSelector } from './header'
import headerReducer from './header/reducer'
import { messagesAction, messagesSelector } from './messages'
import messagesReducer from './messages/reducer'
import { nappAction, nappSelector } from './napp'
import nappReducer from './napp/reducer'
import { newsAction, newsSelector } from './news'
import newsReducer from './news/reducer'
import { ratingAction, ratingSelector } from './rating'
import ratingReducer from './rating/reducer'
import { userAction, userSelector } from './user'
import userReducer from './user/reducer'

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

const options = {
  reducer: persistedReducer,
  // @ts-ignore
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      immutableCheck: false,
      serializableCheck: false
    }).concat(appApi.middleware)
}

const store = configureStore(options)
const persistor = persistStore(store)
const dispatch = store.dispatch
const getState = store.getState

setupListeners(store.dispatch)

export {
  actionsAction,
  actionsSelector,
  appAction,
  appApi,
  appSelector,
  catAction,
  catSelector,
  chatAction,
  chatSelector,
  countriesAction,
  countriesSelector,
  dispatch,
  drawerAction,
  drawerSelector,
  filterAction,
  filterSelector,
  getState,
  headerAction,
  headerSelector,
  messagesAction,
  messagesSelector,
  nappAction,
  nappSelector,
  newsAction,
  newsSelector,
  persistor,
  ratingAction,
  ratingSelector,
  store,
  useGetCategoryListQuery,
  useGetDataPostsAgentQuery,
  useGetDataPostsQuery,
  useGetRatingCategoryQuery,
  useGetUserCrossQuery,
  userAction,
  userSelector
}

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch
