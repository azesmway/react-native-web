import { useEffect, useMemo, useRef, useState } from 'react'
import { Dimensions, Platform } from 'react-native'
import { connect } from 'react-redux'

import PreModeration from './PreModeration'

export default function PreModerationComponent(props) {
  const [isLoading, setLoading] = useState(true)
  const module = useRef(undefined)

  const loadModules = async () => {
    // Load all modules in parallel instead of sequentially
    const [store, { withRouter }, { Dialog, Portal }, { isMobile }] = await Promise.all([import('app-store-web'), import('app-utils-web'), import('react-native-paper'), import('react-device-detect')])

    const getIsMobile = () => {
      const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
      const { IS_MOBILE } = GLOBAL_OBJ.onlinetur.constants
      const { width } = Dimensions.get('window')
      return isMobile || width < IS_MOBILE
    }

    module.current = {
      store,
      withRouter,
      Dialog,
      Portal,
      isMobile: getIsMobile()
    }
  }

  useEffect(() => {
    loadModules().then(() => setLoading(false))
  }, [])

  // Memoize mapStateToProps to prevent recreation
  const mapStateToProps = useMemo(() => {
    if (!module.current?.store) return null

    const { store } = module.current

    return state => ({
      sendMessageAI: store.chatSelector.getSendMessageAI(state)
    })
  }, [isLoading])

  // Memoize mapDispatchToProps to prevent recreation and only create when store is available
  const mapDispatchToProps = useMemo(() => {
    if (!module.current?.store) return null

    const { store } = module.current

    return dispatch => ({
      setSendMessageAI: data => dispatch(store.chatAction.setSendMessageAI(data))
    })
  }, [isLoading])

  // Memoize the connected component to prevent recreation on every render
  const PreModerationWithProps = useMemo(() => {
    if (isLoading || !module.current?.withRouter || !mapDispatchToProps) return null

    const { withRouter } = module.current
    return withRouter(connect(mapStateToProps, mapDispatchToProps)(PreModeration))
  }, [isLoading, mapStateToProps, mapDispatchToProps])

  if (isLoading || !PreModerationWithProps) {
    return null
  }

  return <PreModerationWithProps {...props} utils={module.current} />
}
