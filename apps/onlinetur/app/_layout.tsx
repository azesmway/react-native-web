import 'react-native-gesture-handler'

import { ThemeProvider } from '@react-navigation/native'
import Constants from 'expo-constants'
import { manufacturer, modelName, osVersion } from 'expo-device'
import { useFonts } from 'expo-font'
import { SplashScreen, Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import React, { lazy, Suspense, useEffect, useState } from 'react'
import { Platform, useColorScheme } from 'react-native'
import { EdgeInsets, useSafeAreaInsets } from 'react-native-safe-area-context'

const GLOBAL_OBJ = Platform.OS === 'web' ? window : global

// Lazy loaded components
const TopScreenComponent = lazy(() => import('app-top-web'))
const AppRootComponent = lazy(() => import('app-root-web'))
const AppDrawerComponent = lazy(() => import('app-drawer-web'))

// Props interface for wrapper components
interface WrapperProps {
  children: React.ReactNode
}

// Memoized wrapper components
const TopScreenComponentLoad = React.memo<WrapperProps>(({ children }) => (
  <Suspense fallback={null}>
    <TopScreenComponent>{children}</TopScreenComponent>
  </Suspense>
))

const AppRootComponentLoad = React.memo<WrapperProps>(({ children }) => (
  <Suspense fallback={null}>
    <AppRootComponent>{children}</AppRootComponent>
  </Suspense>
))

const AppDrawerComponentLoad = React.memo<WrapperProps>(({ children }) => (
  <Suspense fallback={null}>
    <AppDrawerComponent>{children}</AppDrawerComponent>
  </Suspense>
))

TopScreenComponentLoad.displayName = 'TopScreenComponentLoad'
AppRootComponentLoad.displayName = 'AppRootComponentLoad'

// Device info initialization helper
const initializeDeviceInfo = () => ({
  manufacturer,
  phone_model: modelName,
  vers_os: osVersion,
  vers_app: Constants.expoConfig?.version,
  url: `&manufacturer=${manufacturer}&phone_model=${modelName}&vers_os=${osVersion}&vers_app=${Constants.expoConfig?.version}`
})

// Window setup helper
const setupWindowObject = async (safeAreaInsets: EdgeInsets) => {
  const appcore = await import('app-core-web')

  Object.assign(GLOBAL_OBJ, {
    onlinetur: {
      storage: appcore.storage,
      constants: appcore.constants,
      device: initializeDeviceInfo(),
      theme: appcore.theme,
      params: {},
      props: {},
      state: {},
      ratingHotels: [],
      chatRef: {},
      currentComponent: {}
    }
  })

  const { setAppConfig, setSafeAreaInsets } = (GLOBAL_OBJ as any).onlinetur.storage

  setSafeAreaInsets(safeAreaInsets)
  // @ts-ignore
  setAppConfig(Constants.expoConfig?.onlinetur)
}

export default function RootLayout() {
  const colorScheme = useColorScheme()
  const [isLoading, setLoading] = useState(false)
  const safeAreaInsets = useSafeAreaInsets()

  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf')
  })

  // Handle splash screen
  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync()
    }
  }, [loaded])

  // Initialize app data
  useEffect(() => {
    setupWindowObject(safeAreaInsets).then(() => {
      setLoading(true)
    })
  }, [])

  if (!isLoading) {
    return null
  }

  const { theme } = (GLOBAL_OBJ as any).onlinetur

  return (
    <TopScreenComponentLoad>
      <AppRootComponentLoad children={undefined} />
      <StatusBar style={colorScheme === 'light' ? 'dark' : 'light'} />
      <ThemeProvider value={colorScheme === 'light' ? theme.light : theme.dark}>
        <AppDrawerComponentLoad>
          <Stack
            screenOptions={{
              headerShown: true,
              headerShadowVisible: true,
              title: '',
              headerStyle: {
                // @ts-ignore
                height: 50
              }
            }}
          />
        </AppDrawerComponentLoad>
      </ThemeProvider>
    </TopScreenComponentLoad>
  )
}
