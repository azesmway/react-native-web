import { lazy, Suspense } from 'react'
const MapHotelScreen = lazy(() => import('screen-chat-web/src/chat/components/map'))

export default function Index() {
  return (
    <Suspense fallback={null}>
      <MapHotelScreen />
    </Suspense>
  )
}
