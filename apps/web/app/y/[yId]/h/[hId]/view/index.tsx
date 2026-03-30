import { lazy, Suspense } from 'react'
const ViewHotelScreen = lazy(() => import('screen-chat-web/src/chat/components/hotel'))

export default function Index() {
  return (
    <Suspense fallback={null}>
      <ViewHotelScreen />
    </Suspense>
  )
}
