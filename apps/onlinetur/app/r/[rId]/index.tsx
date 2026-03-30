import { Redirect, usePathname } from 'expo-router'
import { lazy, Suspense } from 'react'
const RatingScreen = lazy(() => import('screen-rating-web'))

export default function Index() {
  const pathname = usePathname()

  if (pathname === '/r/0') {
    return <Redirect href="/r/1" />
  }

  return (
    <Suspense fallback={null}>
      <RatingScreen rating="all" />
    </Suspense>
  )
}
