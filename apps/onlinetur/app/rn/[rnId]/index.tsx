import { Redirect, usePathname } from 'expo-router'
import { lazy, Suspense } from 'react'
const RatingScreen = lazy(() => import('screen-rating-web'))

export default function Index() {
  const pathname = usePathname()

  if (pathname === '/rn/0') {
    return <Redirect href={'/rn/1'} />
  }

  return (
    <Suspense fallback={null}>
      <RatingScreen rating={'final'} />
    </Suspense>
  )
}
