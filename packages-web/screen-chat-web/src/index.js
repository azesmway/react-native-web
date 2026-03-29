import { useEffect, useMemo, useRef, useState } from 'react'
import { connect } from 'react-redux'

import Chat from './Chat'

export default function WebChatComponent(props) {
  const [isLoading, setLoading] = useState(true)
  const module = useRef(undefined)

  const loadModules = async () => {
    // Load all modules in parallel instead of sequentially
    const [store, { ActionSheetProvider }, { withRouter }] = await Promise.all([import('app-store-web'), import('@expo/react-native-action-sheet'), import('app-utils-web')])

    module.current = {
      store,
      ActionSheetProvider,
      withRouter
    }
  }

  useEffect(() => {
    loadModules().then(() => setLoading(false))
  }, [])

  // Memoize mapStateToProps to prevent recreation
  const mapStateToProps = useMemo(() => state => ({}), [])

  // Memoize mapDispatchToProps to prevent recreation and only create when store is available
  const mapDispatchToProps = useMemo(() => {
    if (!module.current?.store) return null

    const { store } = module.current

    return dispatch => ({
      setHeaderParams: data => dispatch(store.headerAction.setHeaderParams(data)),
      setFooterBar: data => dispatch(store.nappAction.setFooterBar(data))
    })
  }, [isLoading])

  // Memoize the connected component to prevent recreation on every render
  const ChatWithProps = useMemo(() => {
    if (isLoading || !module.current?.withRouter || !mapDispatchToProps) return null

    const { withRouter } = module.current
    return withRouter(connect(mapStateToProps, mapDispatchToProps)(Chat))
  }, [isLoading, mapStateToProps, mapDispatchToProps])

  if (isLoading || !ChatWithProps) {
    return null
  }

  return <ChatWithProps {...props} utils={module.current} />
}
