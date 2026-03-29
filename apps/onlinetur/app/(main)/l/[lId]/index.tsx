import { lazy, Suspense } from 'react'
const ArticleScreen = lazy(() => import('screen-article-web'))
export default function ArticlePage() {
  return <Suspense fallback={null}><ArticleScreen /></Suspense>
}
