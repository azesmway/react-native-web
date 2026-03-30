import { Redirect, usePathname } from 'expo-router'
import { lazy, Suspense } from 'react'

const RatingScreen = lazy(() => import('screen-rating-web'))

const AppHeader = lazy(() => import('app-header-web'))
const StatusBar = lazy(() => import('app-statusbar-web'))
const Modals = lazy(() => import('app-ui-web'))
const Footer = lazy(() => import('app-footer-web'))

export default function Index(props: any) {
  const pathname = usePathname()

  if (pathname === '/rn/0') {
    return <Redirect href={'/rn/1'} />
  }

  return (
    <>
      <Suspense>
        <AppHeader />
      </Suspense>
      <Suspense>
        <StatusBar />
      </Suspense>
      <Suspense>
        <RatingScreen rating={'all'} />
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
