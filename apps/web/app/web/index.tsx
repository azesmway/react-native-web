import { lazy, Suspense } from 'react'
const WebPageScreen = lazy(() => import('screen-chat-web/src/chat/components/web'))

export default function Index() {
  return (
    <Suspense fallback={null}>
      <WebPageScreen />
    </Suspense>
  )
}
