import { lazy, Suspense } from 'react'
const BonusScreen = lazy(() => import('screen-bonus-web'))
export default function BonusPage() {
  return <Suspense fallback={null}><BonusScreen /></Suspense>
}
