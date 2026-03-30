import { usePathname } from 'expo-router'
import { lazy, Suspense } from 'react'
const ChatScreen = lazy(() => import('screen-chat-web'))

export default function Index() {
  const pathname = usePathname()

  return (
    <Suspense fallback={null}>
      <ChatScreen mini={pathname.includes('/mini')} text={''} />
    </Suspense>
  )
}
