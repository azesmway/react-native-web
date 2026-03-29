import { lazy, Suspense } from 'react'

const WebPageScreen = lazy(() => import('screen-chat-web/src/chat/components/web'))

const AppHeader = lazy(() => import('app-header-web'))
const StatusBar = lazy(() => import('app-statusbar-web'))
const Modals = lazy(() => import('app-ui-web'))
const Footer = lazy(() => import('app-footer-web'))

export default function Index(props: any) {
  return (
    <>
      <Suspense>
        <AppHeader />
      </Suspense>
      <Suspense>
        <StatusBar />
      </Suspense>
      <Suspense>
        <WebPageScreen />
      </Suspense>
      <Suspense>
        <Footer />
      </Suspense>
      <Suspense>
        <Modals />
      </Suspense>
    </>
  )
}
