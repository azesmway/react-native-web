import { Redirect, useLocalSearchParams } from 'expo-router'
import { lazy, Suspense } from 'react'
const RatingScreen = lazy(() => import('screen-rating-web'))
export default function FinalRatingPage() {
  const { rnId } = useLocalSearchParams<{ rnId: string }>()
  if (rnId === '0') return <Redirect href="/rn/1" />
  return <Suspense fallback={null}><RatingScreen rating="final" /></Suspense>
}
