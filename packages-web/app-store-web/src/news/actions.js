import isEmpty from 'lodash/isEmpty'

import * as types from './actionTypes'

export function setNews(news) {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: types.NEWS_FETCH, news: news })
    } catch (error) {
      console.error(error)
    }
  }
}

export function setNewsHotel(news) {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: types.NEWS_FETCH_HOTEL, newsHotel: news })
    } catch (error) {
      console.error(error)
    }
  }
}

export function setNewsAdd(news) {
  return async (dispatch, getState) => {
    const state = getState()
    try {
      if (!isEmpty(news)) {
        let arr = []
        for (let i = 0; i < news.length; i++) {
          const n = state.news.news.filter(item => {
            return news[i].id === item.id
          })
          if (n.length === 0 && news[i].deleted !== 1) {
            arr.push(news[i])
          }
        }
        dispatch({ type: types.NEWS_FETCH, news: state.news.news.concat(arr) })
      }
    } catch (error) {
      console.error(error)
    }
  }
}

export function setNewsNew(news) {
  return async (dispatch, getState) => {
    const state = getState()
    try {
      if (news && news.length > 0) {
        let arr = []
        for (let i = 0; i < news.length; i++) {
          const n = state.news.news.filter(item => {
            return news[i].id === item.id
          })
          if (n.length === 0 && news[i].deleted !== 1) {
            arr.push(news[i])
          }
        }
        dispatch({ type: types.NEWS_FETCH, news: arr.concat(state.news.news) })
      }
    } catch (error) {
      console.error(error)
    }
  }
}

export function setNewsPost(newsId) {
  return async (dispatch, getState) => {
    const state = getState()
    try {
      // const index = helpers.findWithAttr(state.news.news, 'id', newsId)
      const n = JSON.parse(JSON.stringify(state.news.news))
      // n[index].vkontakte = true

      dispatch({ type: types.NEWS_FETCH, news: n })
    } catch (error) {
      console.error(error)
    }
  }
}

export function setNewsGroupPost(newsId) {
  return async (dispatch, getState) => {
    const state = getState()
    try {
      // const index = helpers.findWithAttr(state.news.news, 'id', newsId)
      const n = JSON.parse(JSON.stringify(state.news.news))
      // n[index].vkontakteGroup = true

      dispatch({ type: types.NEWS_FETCH, news: n })
    } catch (error) {
      console.error(error)
    }
  }
}

export function setArticle(article) {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: types.SET_ARTICLE, article: article })
    } catch (error) {
      console.error(error)
    }
  }
}

export function setMenu(menu) {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: types.SET_MENU, menu: menu })
    } catch (error) {
      console.error(error)
    }
  }
}

export function setUserMenu(menu) {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: types.SET_USER_MENU, userMenu: menu })
    } catch (error) {
      console.error(error)
    }
  }
}

export function setLoadingNews(loading) {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: types.NEWS_FETCH_FINISH, loadingNews: loading })
    } catch (error) {
      console.error(error)
    }
  }
}
