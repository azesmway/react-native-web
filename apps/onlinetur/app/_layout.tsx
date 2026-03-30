import { ThemeProvider } from '@react-navigation/native'
import Constants from 'expo-constants'
import { manufacturer, modelName, osVersion } from 'expo-device'
import { useFonts } from 'expo-font'
import { SplashScreen, Stack } from 'expo-router'
import React, { lazy, Suspense, useEffect, useState } from 'react'
import { useColorScheme } from 'react-native'

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
const setupWindowObject = async () => {
  const appcore = await import('app-core-web')

  Object.assign(window, {
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

  const { setAppConfig } = (window as any).onlinetur.storage
  // @ts-ignore
  setAppConfig(Constants.expoConfig?.onlinetur)
}

export default function RootLayout() {
  const colorScheme = useColorScheme()
  const [isLoading, setLoading] = useState(false)
  const [open, setOpen] = useState(true)

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
    setupWindowObject().then(() => {
      setLoading(true)
    })
  }, [])

  if (!isLoading) {
    return null
  }

  const { theme } = (window as any).onlinetur

  return (
    <TopScreenComponentLoad>
      <AppRootComponentLoad children={undefined} />
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
