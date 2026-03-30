import { lazy, Suspense } from 'react'
const GeoMapScreen = lazy(() => import('screen-map-web'))

export default function Index() {
  return (
    <Suspense fallback={null}>
      <GeoMapScreen />
    </Suspense>
  )
}
