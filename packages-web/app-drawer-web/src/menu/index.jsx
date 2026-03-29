import { useEffect, useMemo, useRef, useState } from 'react'
import { connect } from 'react-redux'

import LeftMenu from './LeftMenu'
import { Dimensions, Platform } from 'react-native'

export default function LeftMenuComponent(props) {
  const [isLoading, setLoading] = useState(true)
  const module = useRef(undefined)

  const loadModules = async () => {
    // Parallel imports for better performance
    const [store, utils, { appcore }, { Icon, ListItem }, { Divider }, mobileModule, { chatServiceGet }, cookies, { isMobile }, { Path, Circle, Rect, G, Defs, ClipPath }] = await Promise.all([
      import('app-store-web'),
      import('app-utils-web'),
      import('app-core-web'),
      import('react-native-elements'),
      import('react-native-paper'),
      import('app-mobile-web'),
      import('app-services-web'),
      import('react-cookies'),
      import('react-device-detect'),
      import('react-native-svg')
    ])

    const getIsMobile = () => {
      const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
      const { IS_MOBILE } = GLOBAL_OBJ.onlinetur.constants
      const { width } = Dimensions.get('window')
      return isMobile || width < IS_MOBILE
    }

    // Single assignment instead of multiple spread operations
    module.current = {
      store,
      firebase: utils.firebase,
      withRouter: utils.withRouter,
      t: utils.t,
      SvgIcon: utils.SvgIcon,
      appcore,
      Icon,
      ListItem,
      Divider,
      mobile: mobileModule.mobile,
      chatServiceGet,
      isMobile: getIsMobile(),
      cookies: cookies.default,
      Path,
      Circle,
      Rect,
      G,
      Defs,
      ClipPath
    }
  }

  useEffect(() => {
    loadModules().then(() => setLoading(false))
  }, [])

  // Memoize Redux connector to prevent recreation on every render
  const LeftMenuWithProps = useMemo(() => {
    if (isLoading || !module.current) return null

    const { appAction, appSelector, drawerAction, filterAction, filterSelector, newsSelector, userAction, userSelector, nappAction } = module.current.store

    const mapStateToProps = state => ({
      currentCategory: filterSelector.getSelectCategory(state),
      filter: filterSelector.getFilter(state),
      user: userSelector.getUser(state),
      referral: appSelector.getRef(state),
      news: newsSelector.getNews(state)
    })

    const mapDispatchToProps = dispatch => ({
      logOut: data => {
        dispatch(userAction.setUser(data.user))
        dispatch(filterAction.setFilter(data.filter))
      },
      openDrawer: data => dispatch(drawerAction.openDrawer(false)),
      setFilter: data => dispatch(filterAction.setFilter(data)),
      setLocationPath: data => dispatch(appAction.setLocationPath(data)),
      setModalAlert: data => dispatch(nappAction.setModalAlert(data)),
      setModalLogin: data => dispatch(nappAction.setModalLogin(data))
    })

    const withRouter = module.current.withRouter
    return withRouter(connect(mapStateToProps, mapDispatchToProps)(LeftMenu))
  }, [isLoading])

  if (isLoading || !LeftMenuWithProps) {
    return null
  }

  return <LeftMenuWithProps {...props} utils={module.current} />
}
