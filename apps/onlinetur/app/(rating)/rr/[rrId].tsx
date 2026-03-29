import { Redirect, useLocalSearchParams } from 'expo-router'
import { lazy, Suspense } from 'react'
const RatingScreen = lazy(() => import('screen-rating-web'))
export default function MyRatingPage() {
  const { rrId } = useLocalSearchParams<{ rrId: string }>()
  if (rrId === '0') return <Redirect href="/rr/1" />
  return <Suspense fallback={null}><RatingScreen rating="my" /></Suspense>
}
