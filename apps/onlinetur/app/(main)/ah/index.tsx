import { lazy, Suspense } from 'react'
const ActionsScreen = lazy(() => import('screen-actions-web'))
export default function ActionsPage() {
  return <Suspense fallback={null}><ActionsScreen /></Suspense>
}
