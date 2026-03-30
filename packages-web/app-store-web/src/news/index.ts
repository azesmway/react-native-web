import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface NewsState {
  menu: any[]
  userMenu: any[]
  news: any[]
  newsHotel: any[]
  article: Record<string, any>
  loadingNews: boolean
}

const initialState: NewsState = {
  menu: [],
  userMenu: [],
  news: [],
  newsHotel: [],
  article: {},
  loadingNews: false
}

const newsSlice = createSlice({
  name: 'news',
  initialState,
  reducers: {
    setNews(state, action: PayloadAction<any[]>) {
      state.news = action.payload
    },
    setNewsHotel(state, action: PayloadAction<any[]>) {
      state.newsHotel = action.payload
    },
    setArticle(state, action: PayloadAction<Record<string, any>>) {
      state.article = action.payload
    },
    setMenu(state, action: PayloadAction<any[]>) {
      state.menu = action.payload
    },
    setUserMenu(state, action: PayloadAction<any[]>) {
      state.userMenu = action.payload
    },
    setLoadingNews(state, action: PayloadAction<boolean>) {
      state.loadingNews = action.payload
    },
    clearNews(state) {
      state.news = []
    },
    // Complex actions
    setNewsAdd(state, action: PayloadAction<any[]>) {
      const existing = new Set(state.news.map((n: any) => n.id))
      const toAdd = action.payload.filter((n: any) => !existing.has(n.id) && n.deleted !== 1)
      state.news = [...state.news, ...toAdd]
    },
    setNewsNew(state, action: PayloadAction<any[]>) {
      const existing = new Set(state.news.map((n: any) => n.id))
      const toAdd = action.payload.filter((n: any) => !existing.has(n.id) && n.deleted !== 1)
      state.news = [...toAdd, ...state.news]
    }
  }
})

const newsAction = newsSlice.actions

// Selectors
const newsSelector = {
  getNews: (state: any) => state.news.news,
  getNewsHotel: (state: any) => state.news.newsHotel,
  getArticle: (state: any) => state.news.article,
  getMenu: (state: any) => state.news.menu,
  getUserMenu: (state: any) => state.news.userMenu,
  isLoadingNews: (state: any) => state.news.loadingNews
}

export { newsAction, newsSelector }
export default newsSlice.reducer
