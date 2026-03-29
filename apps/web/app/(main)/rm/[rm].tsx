import { lazy, Suspense } from 'react'
const UserScreen = lazy(() => import('screen-user-web'))
export default function RemovePage() {
  return <Suspense fallback={null}><UserScreen /></Suspense>
}
