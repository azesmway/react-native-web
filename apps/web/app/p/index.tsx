import { lazy, Suspense } from 'react'
const ProfizonScreen = lazy(() => import('app-profizon-web'))

export default function Index() {
  return (
    <Suspense fallback={null}>
      <ProfizonScreen />
    </Suspense>
  )
}
