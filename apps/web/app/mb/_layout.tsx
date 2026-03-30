import { Slot } from 'expo-router'
import { lazy, Suspense } from 'react'

const AppHeader = lazy(() => import('app-header-web'))
const StatusBar = lazy(() => import('app-statusbar-web'))
const Footer    = lazy(() => import('app-footer-web'))
const Modals    = lazy(() => import('app-ui-web'))

export default function Layout() {
  return (
    <>
      <Suspense fallback={null}><AppHeader /></Suspense>
      <Suspense fallback={null}><StatusBar /></Suspense>
      <Slot />
      <Suspense fallback={null}><Footer /></Suspense>
      <Suspense fallback={null}><Modals /></Suspense>
    </>
  )
}
