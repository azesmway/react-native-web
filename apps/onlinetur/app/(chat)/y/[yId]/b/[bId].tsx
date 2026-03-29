import { lazy, Suspense } from 'react'
import { usePathname } from 'expo-router'

const ChatScreen = lazy(() => import('screen-chat-web'))

export default function ChatPage() {
  const pathname = usePathname()
  return (
    <Suspense fallback={null}>
      <ChatScreen mini={pathname.includes('/mini')} text="" />
    </Suspense>
  )
}
