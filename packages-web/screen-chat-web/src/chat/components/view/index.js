import { useEffect, useMemo, useRef, useState } from 'react'
import { Dimensions, Platform } from 'react-native'
import { connect } from 'react-redux'

import ReplyView from './ReplyView'

export default function ReplyViewComponent(props) {
  const [isLoading, setLoading] = useState(true)
  const module = useRef(undefined)

  const loadModules = async () => {
    // Parallel imports for better performance
    const [store, { withRouter }, { Icon }, { isMobile }] = await Promise.all([import('app-store-web'), import('app-utils-web'), import('react-native-elements'), import('react-device-detect')])

    const getIsMobile = () => {
      const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
      const { IS_MOBILE } = GLOBAL_OBJ.onlinetur.constants
      const { width } = Dimensions.get('window')
      return isMobile || width < IS_MOBILE
    }

    // Single assignment instead of multiple spread operations
    module.current = {
      store,
      withRouter,
      Icon,
      isMobile: getIsMobile()
    }
  }

  useEffect(() => {
    loadModules().then(() => setLoading(false))
  }, [])

  // Memoize Redux connector to prevent recreation on every render
  const ReplyViewWithProps = useMemo(() => {
    if (isLoading || !module.current) return null

    const { store, withRouter } = module.current

    const mapStateToProps = state => ({})

    const mapDispatchToProps = dispatch => ({
      setChatReplyMessage: data => dispatch(store.chatAction.setChatReplyMessage(data))
    })

    return withRouter(connect(mapStateToProps, mapDispatchToProps)(ReplyView))
  }, [isLoading])

  if (isLoading || !ReplyViewWithProps) {
    return null
  }

  return <ReplyViewWithProps {...props} utils={module.current} />
}
