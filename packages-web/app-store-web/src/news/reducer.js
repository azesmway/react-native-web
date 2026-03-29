import Immutable from 'seamless-immutable'

import * as types from './actionTypes'

const initialState = Immutable({
  menu: [],
  userMenu: [],
  news: [],
  newsHotel: [],
  article: {},
  loadingNews: false
})

export default function reduce(state = initialState, action = {}) {
  switch (action.type) {
    case types.NEWS_FETCH:
      return {
        ...state,
        news: action.news
      }
    case types.NEWS_FETCH_HOTEL:
      return {
        ...state,
        newsHotel: action.newsHotel
      }
    case types.SET_ARTICLE:
      return {
        ...state,
        article: action.article
      }
    case types.SET_MENU:
      return {
        ...state,
        menu: action.menu
      }
    case types.NEWS_NULL:
      return {
        ...state,
        news: []
      }
    case types.SET_USER_MENU:
      return {
        ...state,
        userMenu: action.userMenu
      }
    case types.NEWS_FETCH_FINISH:
      return {
        ...state,
        loadingNews: action.loadingNews
      }
    default:
      return state
  }
}

export function getNews(state) {
  return state.news.news
}

export function getNewsHotel(state) {
  return state.news.newsHotel
}

export function getArticle(state) {
  return state.news.article
}

export function getMenu(state) {
  return state.news.menu
}

export function getUserMenu(state) {
  return state.news.userMenu
}

export function isLoadingNews(state) {
  return state.news.loadingNews
}
