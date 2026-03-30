import { lazy, Suspense } from 'react'
const ActionsScreen = lazy(() => import('screen-actions-web'))

export default function Index() {
  return (
    <Suspense fallback={null}>
      <ActionsScreen />
    </Suspense>
  )
}
