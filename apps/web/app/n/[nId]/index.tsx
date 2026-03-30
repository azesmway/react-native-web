import { lazy, Suspense } from 'react'
const Article = lazy(() => import('screen-article-web'))

export default function Index() {
  return (
    <Suspense fallback={null}>
      <Article />
    </Suspense>
  )
}
