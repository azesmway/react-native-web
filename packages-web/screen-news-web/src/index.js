import { useEffect, useMemo, useRef, useState } from 'react'
import { Dimensions, Platform } from 'react-native'
import { connect } from 'react-redux'

import News from './News'

export default function WebDrawerComponent(props) {
  const [isLoading, setLoading] = useState(true)
  const moduleRef = useRef(undefined)

  const loadModules = async () => {
    // Parallel import of all modules for faster loading
    const [store, { withRouter, theme, t, moment }, { rtkQuery, chatServiceGet, AppData }, { Checkbox, Divider, List, Menu }, { Icon, ListItem }, { isMobile }, Tts] = await Promise.all([
      import('app-store-web'),
      import('app-utils-web'),
      import('app-services-web'),
      import('react-native-paper'),
      import('react-native-elements'),
      import('react-device-detect'),
      import('react-native-tts')
    ])

    const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
    const { IS_MOBILE } = GLOBAL_OBJ.onlinetur.constants
    const { width } = Dimensions.get('window')
    const isMobileDevice = isMobile || width < IS_MOBILE

    // Single object assignment instead of multiple spreads
    moduleRef.current = {
      store,
      withRouter,
      theme,
      t,
      moment,
      rtkQuery,
      chatServiceGet,
      AppData,
      Checkbox,
      Divider,
      List,
      Menu,
      Icon,
      ListItem,
      isMobile: isMobileDevice,
      Tts: Tts.default
    }
  }

  useEffect(() => {
    loadModules().then(() => setLoading(false))
  }, [])

  // Memoize the connected component to prevent recreation on every render
  const NewsWithProps = useMemo(() => {
    if (isLoading || !moduleRef.current) return null

    const { store, withRouter } = moduleRef.current

    const mapStateToProps = state => ({
      currentCategory: store.filterSelector.getSelectCategory(state),
      user: store.userSelector.getUser(state),
      news: store.newsSelector.getNews(state),
      newsHotel: store.newsSelector.getNewsHotel(state),
      menu: store.newsSelector.getMenu(state),
      userMenu: store.newsSelector.getUserMenu(state),
      filter: store.filterSelector.getFilter(state),
      themes: store.chatSelector.getCountries(state),
      isConnect: store.appSelector.getConnect(state),
      offline: store.messagesSelector.getOfflineMode(state),
      device: store.appSelector.getDevice(state)
    })

    const mapDispatchToProps = dispatch => ({
      setNews: data => dispatch(store.newsAction.setNews(data)),
      setNewsHotel: data => dispatch(store.newsAction.setNewsHotel(data)),
      setNewsAdd: data => dispatch(store.newsAction.setNewsAdd(data)),
      setNewsNew: data => dispatch(store.newsAction.setNewsNew(data)),
      setArticle: data => dispatch(store.newsAction.setArticle(data)),
      setCategories: data => dispatch(store.catAction.setCategories(data)),
      setMenu: data => dispatch(store.newsAction.setMenu(data)),
      setHeaderParams: data => dispatch(store.headerAction.setHeaderParams(data)),
      setFooterBar: data => dispatch(store.nappAction.setFooterBar(data))
    })

    return withRouter(connect(mapStateToProps, mapDispatchToProps)(News))
  }, [isLoading])

  if (isLoading) {
    return null
  }

  return <NewsWithProps {...props} utils={moduleRef.current} />
}
