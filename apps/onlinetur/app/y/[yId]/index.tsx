import { Redirect, usePathname } from 'expo-router'
import { lazy, Suspense } from 'react'
const ChatScreen = lazy(() => import('screen-chat-web'))

export default function Index() {
  const pathname = usePathname()

  if (pathname === '/y/0') {
    return <Redirect href={'/y/26'} />
  }

  return (
    <Suspense fallback={null}>
      <ChatScreen mini={pathname.includes('/mini')} text={''} />
    </Suspense>
  )
}
