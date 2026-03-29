import React from 'react'
import { Provider as ReduxProvider } from 'react-redux'
// @ts-ignore
import { PersistGate } from 'redux-persist/integration/react'

interface IndexProps {
  children: React.ReactNode
}

const Index: React.FC<IndexProps> = ({ children }) => {
  const [Providers, setProviders] = React.useState<React.FC<{ children: React.ReactNode }> | null>(null)

  React.useEffect(() => {
    const loadProviders = async () => {
      const [{ store, persistor }, { Provider }, { ToastProvider }, { MenuProvider }, { GestureHandlerRootView }] = await Promise.all([
        import('app-store-web'),
        import('react-native-paper'),
        import('react-native-toast-notifications'),
        import('react-native-popup-menu'),
        import('react-native-gesture-handler')
      ])

      // eslint-disable-next-line @typescript-eslint/no-shadow
      const ComposedProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => (
        <ReduxProvider store={store}>
          <PersistGate persistor={persistor}>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <Provider>
                <ToastProvider>
                  <MenuProvider>{children}</MenuProvider>
                </ToastProvider>
              </Provider>
            </GestureHandlerRootView>
          </PersistGate>
        </ReduxProvider>
      )

      setProviders(() => ComposedProviders)
    }

    loadProviders()
  }, [])

  if (!Providers) {
    return null // Or a loading spinner
  }

  return <Providers>{children}</Providers>
}

export default Index
