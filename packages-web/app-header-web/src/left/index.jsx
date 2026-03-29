import { useEffect, useMemo, useRef, useState } from 'react'
import { Dimensions, Platform } from 'react-native'
import { connect } from 'react-redux'

import LeftHeader from './left'

export default function LeftHeaderComponent(props) {
  const [isLoading, setLoading] = useState(true)
  const module = useRef(undefined)

  const loadModules = async () => {
    // Parallel imports for better performance
    const [store, { withRouter, theme, t, matchPath }, { Icon }, { isMobile }, Svg, { Path }] = await Promise.all([
      import('app-store-web'),
      import('app-utils-web'),
      import('react-native-elements'),
      import('react-device-detect'),
      import('react-native-svg'),
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
      withRouter,
      theme,
      matchPath,
      t,
      Icon,
      isMobile: getIsMobile(),
      Path,
      Svg: Svg.default
    }
  }

  useEffect(() => {
    loadModules().then(() => setLoading(false))
  }, [])

  // Memoize Redux connector to prevent recreation on every render
  const LeftHeaderWithStore = useMemo(() => {
    if (isLoading || !module.current) return null

    const { store, withRouter } = module.current

    const mapStateToProps = state => ({
      user: store.userSelector.getUser(state),
      filter: store.filterSelector.getFilter(state),
      currentCategory: store.filterSelector.getSelectCategory(state),
      categories: store.catSelector.getCategories(state),
      openDrawer: store.drawerSelector.getOpenDrawer(state)
    })

    const mapDispatchToProps = dispatch => ({
      setFilter: data => dispatch(store.filterAction.setFilter(data)),
      setHotels: data => dispatch(store.chatAction.setHotels(data)),
      setDrawer: data => dispatch(store.drawerAction.openDrawer(data)),
      setModalTheme: (visible, data) => dispatch(store.chatAction.setModalTheme(visible, data))
    })

    return withRouter(connect(mapStateToProps, mapDispatchToProps)(LeftHeader))
  }, [isLoading])

  if (isLoading || !LeftHeaderWithStore) {
    return null
  }

  return <LeftHeaderWithStore {...props} utils={module.current} />
}
