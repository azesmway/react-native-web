import { lazy, Suspense } from 'react'

const Article = lazy(() => import('screen-article-web'))

const AppHeader = lazy(() => import('app-header-web'))
const StatusBar = lazy(() => import('app-statusbar-web'))
const Modals = lazy(() => import('app-ui-web'))
const Footer = lazy(() => import('app-footer-web'))

export default function Index() {
  return (
    <>
      <Suspense>
        <AppHeader />
      </Suspense>
      <Suspense>
        <StatusBar />
      </Suspense>
      <Suspense>
        <Article />
      </Suspense>
      <Suspense>
        <Footer />
      </Suspense>
      <Suspense>
        <Modals />
      </Suspense>
    </>
  )
}
