import { lazy, Suspense } from 'react'
const MainScreen = lazy(() => import('screen-main-web'))
export default function FavPage() {
  return <Suspense fallback={null}><MainScreen /></Suspense>
}
