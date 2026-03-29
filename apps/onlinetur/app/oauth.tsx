import { lazy, Suspense } from 'react'
const AppHeader  = lazy(() => import('app-header-web'))
const StatusBar  = lazy(() => import('app-statusbar-web'))
const Footer     = lazy(() => import('app-footer-web'))
const Modals     = lazy(() => import('app-ui-web'))
const MainScreen = lazy(() => import('screen-main-web'))
export default function AuthPage() {
  return (
    <>
      <Suspense fallback={null}><AppHeader /></Suspense>
      <Suspense fallback={null}><StatusBar /></Suspense>
      <Suspense fallback={null}><MainScreen /></Suspense>
      <Suspense fallback={null}><Footer /></Suspense>
      <Suspense fallback={null}><Modals /></Suspense>
    </>
  )
}
