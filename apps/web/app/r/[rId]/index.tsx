import { Redirect, usePathname } from 'expo-router'
import { lazy, Suspense } from 'react'

const RatingScreen = lazy(() => import('screen-rating-web'))
const AppHeader = lazy(() => import('app-header-web'))
const StatusBar = lazy(() => import('app-statusbar-web'))
const Modals = lazy(() => import('app-ui-web'))
const Footer = lazy(() => import('app-footer-web'))

export default function Index() {
  const pathname = usePathname()

  if (pathname === '/r/0') {
    return <Redirect href="/r/1" />
  }

  return (
    <>
      <Suspense fallback={null}>
        <AppHeader />
      </Suspense>
      <Suspense fallback={null}>
        <StatusBar />
      </Suspense>
      <Suspense fallback={null}>
        <RatingScreen rating="all" />
      </Suspense>
      <Suspense fallback={null}>
        <Footer />
      </Suspense>
      <Suspense fallback={null}>
        <Modals />
      </Suspense>
    </>
  )
}
