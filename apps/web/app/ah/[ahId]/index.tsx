import { lazy, Suspense } from 'react'
const ActionsHotelScreen = lazy(() => import('screen-ah-web'))

export default function Index() {
  return (
    <Suspense fallback={null}>
      <ActionsHotelScreen />
    </Suspense>
  )
}
