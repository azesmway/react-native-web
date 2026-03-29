import { useEffect, useRef, useState } from 'react'
import { connect } from 'react-redux'

import ModalYoutube from './ModalYoutube'

export default function ModalYoutubeComponent(props) {
  const [isLoading, setLoading] = useState(true)
  const module = useRef(undefined)

  const loadModules = async () => {
    const store = await import('app-store-web')

    module.current = {
      store: store
    }

    const { withRouter } = await import('app-utils-web')
    module.current = {
      ...module.current,
      withRouter: withRouter
    }

    const { Icon, Header } = await import('react-native-elements')
    module.current = {
      ...module.current,
      Icon: Icon,
      Header: Header
    }

    const { WebView } = await import('react-native-web-webview')
    module.current = {
      ...module.current,
      WebView: WebView
    }
  }

  useEffect(() => {
    loadModules().then(() => setLoading(false))
  }, [])

  if (isLoading) {
    return <></>
  }

  const { store, withRouter } = module.current

  const mapStateToProps = state => ({})

  const mapDispatchToProps = dispatch => ({})

  const ModalYoutubeWithProps = withRouter(connect(mapStateToProps, mapDispatchToProps)(ModalYoutube))

  return <ModalYoutubeWithProps {...props} utils={module.current} />
}
