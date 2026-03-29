import { lazy, Suspense } from 'react'
const MyBronScreen = lazy(() => import('screen-mybron-web'))
export default function MyBronItemPage() {
  return <Suspense fallback={null}><MyBronScreen /></Suspense>
}
