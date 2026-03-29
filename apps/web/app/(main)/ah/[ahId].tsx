import { lazy, Suspense } from 'react'
const AhScreen = lazy(() => import('screen-ah-web'))
export default function ActionItemPage() {
  return <Suspense fallback={null}><AhScreen /></Suspense>
}
