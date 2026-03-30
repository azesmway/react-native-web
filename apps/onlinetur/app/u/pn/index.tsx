import { lazy, Suspense } from 'react'
const UserScreen = lazy(() => import('screen-user-web'))

export default function Index() {
  return (
    <Suspense fallback={null}>
      <UserScreen screen={'pushnews'} />
    </Suspense>
  )
}
