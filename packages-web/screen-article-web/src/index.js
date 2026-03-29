import { useEffect, useMemo, useRef, useState } from 'react'
import { Dimensions, Platform } from 'react-native'
import { connect } from 'react-redux'

import Article from './Article'

export default function WebDrawerComponent(props) {
  const [isLoading, setLoading] = useState(true)
  const module = useRef(undefined)

  const loadModules = async () => {
    // Parallel imports for independent modules
    const [
      store,
      Alert,
      { webController, webEventController },
      { withRouter, theme, t, moment },
      { rtkQuery, chatServiceGet, AppData, init },
      { Icon, ListItem, Button },
      { RenderHTML },
      Lightbox,
      { isMobile },
      cookies,
      { appcore },
      { dispatch, appApi },
      ImageViewer,
      { Divider, List, Menu }
    ] = await Promise.all([
      import('app-store-web'),
      import('@blazejkustra/react-native-alert'),
      import('app-controller-web'),
      import('app-utils-web'),
      import('app-services-web'),
      import('react-native-elements'),
      import('react-native-render-html'),
      import('react-18-image-lightbox/src/react-image-lightbox'),
      import('react-device-detect'),
      import('react-cookies'),
      import('app-core-web'),
      import('app-store-web'),
      import('react-native-image-zoom-viewer'),
      import('react-native-paper')
    ])

    const getIsMobile = () => {
      const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
      const { IS_MOBILE } = GLOBAL_OBJ.onlinetur.constants
      const { width } = Dimensions.get('window')
      return isMobile || width < IS_MOBILE
    }

    // Single assignment instead of repeated spreads
    module.current = {
      store,
      Alert: Alert.default,
      webController,
      webEventController,
      withRouter,
      theme,
      t,
      moment,
      rtkQuery,
      chatServiceGet,
      AppData,
      init,
      Icon,
      ListItem,
      Button,
      RenderHTML,
      Lightbox: Lightbox.default,
      List,
      Divider,
      Menu,
      isMobile: getIsMobile(),
      cookies: cookies.default,
      appcore,
      dispatch,
      appApi,
      ImageViewer: ImageViewer.default
    }
  }

  useEffect(() => {
    loadModules().then(() => setLoading(false))
  }, [])

  // Memoize the connected component to avoid recreation on every render
  const ArticleWithProps = useMemo(() => {
    if (isLoading || !module.current) return null

    const { store, withRouter } = module.current

    const mapStateToProps = state => ({
      currentCategory: store.filterSelector.getSelectCategory(state),
      user: store.userSelector.getUser(state),
      userVK: store.userSelector.getVK(state),
      article: store.newsSelector.getArticle(state),
      news: store.newsSelector.getNews(state),
      urlPost: store.userSelector.getUrlPost(state),
      countries: store.chatSelector.getCountries(state)
    })

    const mapDispatchToProps = dispatch => ({
      setUser: data => dispatch(store.userAction.setUser(data)),
      setArticle: data => dispatch(store.newsAction.setArticle(data)),
      setVK: data => dispatch(store.userAction.setVK(data)),
      setLocationPath: data => dispatch(store.appAction.setLocationPath(data)),
      setModalLogin: data => dispatch(store.nappAction.setModalLogin(data)),
      setHeaderParams: data => dispatch(store.headerAction.setHeaderParams(data)),
      setModalAlert: data => dispatch(store.nappAction.setModalAlert(data)),
      setFooterBar: data => dispatch(store.nappAction.setFooterBar(data))
    })

    return withRouter(connect(mapStateToProps, mapDispatchToProps)(Article))
  }, [isLoading])

  if (isLoading || !ArticleWithProps) {
    return null
  }

  return <ArticleWithProps {...props} utils={module.current} />
}
