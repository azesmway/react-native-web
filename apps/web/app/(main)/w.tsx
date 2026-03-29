import { lazy, Suspense } from 'react'
const MainScreen = lazy(() => import('screen-main-web'))
export default function WebPage() {
  return <Suspense fallback={null}><MainScreen /></Suspense>
}
