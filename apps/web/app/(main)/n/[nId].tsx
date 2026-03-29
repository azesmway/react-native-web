import { lazy, Suspense } from 'react'
const NewsScreen = lazy(() => import('screen-news-web'))
export default function NewsPage() {
  return <Suspense fallback={null}><NewsScreen /></Suspense>
}
