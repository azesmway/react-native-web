import { lazy, Suspense } from 'react'
const NewsScreen = lazy(() => import('screen-news-web'))

export default function Index() {
  return (
    <Suspense fallback={null}>
      <NewsScreen />
    </Suspense>
  )
}
