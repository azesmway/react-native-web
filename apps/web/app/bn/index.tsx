import { lazy, Suspense } from 'react'
const BonusScreen = lazy(() => import('screen-bonus-web'))

export default function Index() {
  return (
    <Suspense fallback={null}>
      <BonusScreen />
    </Suspense>
  )
}
