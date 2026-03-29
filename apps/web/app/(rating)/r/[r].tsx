import { lazy, Suspense } from 'react'
const RatingScreen = lazy(() => import('screen-rating-web'))
export default function RatingPage() {
  return <Suspense fallback={null}><RatingScreen /></Suspense>
}
