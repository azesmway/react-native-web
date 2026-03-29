import { useEffect, useRef, useState } from 'react'
import { connect } from 'react-redux'

import WebPage from './WebPage'

export default function ModalYoutubeComponent(props) {
  const [isLoading, setLoading] = useState(true)
  const module = useRef(undefined)

  const loadModules = async () => {
    const store = await import('app-store-web')

    module.current = {
      store: store
    }

    const { withRouter, t } = await import('app-utils-web')
    module.current = {
      ...module.current,
      withRouter: withRouter,
      t: t
    }

    const { WebView } = await import('react-native-web-webview')
    module.current = {
      ...module.current,
      WebView: WebView
    }

    const Alert = await import('@blazejkustra/react-native-alert')
    module.current = {
      ...module.current,
      Alert: Alert.default
    }
  }

  useEffect(() => {
    loadModules().then(() => setLoading(false))
  }, [])

  if (isLoading) {
    return <></>
  }

  const { store, withRouter } = module.current

  const mapStateToProps = state => ({
    user: store.userSelector.getUser(state)
  })

  const mapDispatchToProps = dispatch => ({
    setUser: data => dispatch(store.userAction.setUser(data)),
    setHeaderParams: data => dispatch(store.headerAction.setHeaderParams(data)),
    setFooterBar: data => dispatch(store.nappAction.setFooterBar(data))
  })

  const WebPageWithProps = withRouter(connect(mapStateToProps, mapDispatchToProps)(WebPage))

  return <WebPageWithProps {...props} utils={module.current} />
}
