import { useEffect, useRef, useState } from 'react'
import { Dimensions, Platform } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'

import LeftHeader from './left'

function LeftHeaderWithStore(props) {
  const { store, useWithRouter } = props.utils
  const dispatch = useDispatch()

  const enhancedProps = {
    ...useWithRouter(props),
    user: useSelector(store.userSelector.getUser),
    filter: useSelector(store.filterSelector.getFilter),
    currentCategory: useSelector(store.filterSelector.getSelectCategory),
    categories: useSelector(store.catSelector.getCategories),
    openDrawer: useSelector(store.drawerSelector.getOpenDrawer),
    setFilter: data => dispatch(store.filterAction.setFilter(data)),
    setHotels: data => dispatch(store.chatAction.setHotels(data)),
    setDrawer: data => dispatch(store.drawerAction.openDrawer(data)),
    setModalTheme: data => dispatch(store.chatAction.setModalTheme(data))
  }

  return <LeftHeader {...enhancedProps} />
}

export default function LeftHeaderComponent(props) {
  const [isLoading, setLoading] = useState(true)
  const module = useRef(undefined)

  const loadModules = async () => {
    const [store, { useWithRouter, theme, t, matchPath }, { Icon }, { isMobile }, { default: Svg }, { Path }] = await Promise.all([
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

    module.current = {
      store,
      useWithRouter,
      theme,
      matchPath,
      t,
      Icon,
      isMobile: getIsMobile(),
      Path,
      Svg
    }
  }

  useEffect(() => {
    loadModules().then(() => setLoading(false))
  }, [])

  if (isLoading) {
    return null
  }

  return <LeftHeaderWithStore {...props} utils={module.current} />
}
