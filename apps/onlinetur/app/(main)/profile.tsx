import { lazy, Suspense } from 'react'
const UserScreen = lazy(() => import('screen-user-web'))
export default function ProfilePage() {
  return <Suspense fallback={null}><UserScreen /></Suspense>
}
