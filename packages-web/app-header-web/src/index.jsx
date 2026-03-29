import { useNavigation, usePathname, useRouter } from 'expo-router'
import { useCallback, useEffect, useMemo } from 'react'
import { useSelector } from 'react-redux'

import BackHeader from './back'
import CenterHeader from './center'
import LeftHeader from './left'
import RightHeader from './right'

const BACK_SCREENS = new Set(['article', 'map', 'web', 'pushchat', 'agent', 'business', 'pushnews', 'pushagent', 'langs', 'remove'])

const AppHeader = props => {
  const expoRouter = useRouter()
  const navigation = useNavigation()
  const pathname = usePathname()
  const params = useSelector(state => state.header.headerParams)

  // Memoize common props to prevent recreation
  const commonProps = useMemo(
    () => ({
      ...props,
      history: expoRouter.replace,
      pathname,
      params
    }),
    [props, expoRouter.replace, pathname, params]
  )

  const renderCenter = useCallback(() => {
    const showBack = BACK_SCREENS.has(params.screen)
    return showBack || params.openSearch ? null : <CenterHeader {...commonProps} />
  }, [params.openSearch, commonProps])

  const renderLeft = useCallback(() => {
    const showBack = BACK_SCREENS.has(params.screen)
    const HeaderComponent = showBack ? BackHeader : LeftHeader
    return <HeaderComponent {...commonProps} />
  }, [params.screen, commonProps])

  const renderRight = useCallback(() => {
    return params.openSearch ? null : <RightHeader {...commonProps} />
  }, [params.openSearch, commonProps])

  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerShadowVisible: true,
      headerTitleAlign: 'left',
      headerLeft: renderLeft,
      headerTitle: renderCenter,
      headerRight: renderRight,
      headerStyle: { backgroundColor: '#fff', height: 50 },
      headerLeftContainerStyle: { paddingLeft: 5 },
      headerRightContainerStyle: { paddingRight: 5 }
    })
  }, [navigation, renderLeft, renderCenter, renderRight])

  return null
}

export default AppHeader
