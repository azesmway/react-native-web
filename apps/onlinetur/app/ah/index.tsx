import { lazy, Suspense } from 'react'

const ActionsScreen = lazy(() => import('screen-actions-web'))

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
        <ActionsScreen />
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
