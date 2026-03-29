import { useEffect, useMemo, useRef, useState } from 'react'
import { Dimensions, Platform } from 'react-native'
import { connect } from 'react-redux'

import MessageImage from './MessageImage'

export default function MessageImageComponent(props) {
  const [isLoading, setLoading] = useState(true)
  const module = useRef(undefined)

  const loadModules = async () => {
    // Parallel imports for better performance
    const [store, { withRouter, moment, t }, { Icon }, { isMobile }] = await Promise.all([
      import('app-store-web'),
      import('app-utils-web'),
      import('react-native-elements'),
      import('react-device-detect')
    ])

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
      moment,
      t,
      Icon,
      isMobile: getIsMobile()
    }
  }

  useEffect(() => {
    loadModules().then(() => setLoading(false))
  }, [])

  // Memoize Redux connector to prevent recreation on every render
  const MessageImageWithProps = useMemo(() => {
    if (isLoading || !module.current) return null

    const { store, withRouter } = module.current

    const mapStateToProps = state => ({})

    const mapDispatchToProps = dispatch => ({
      setImagesView: data => dispatch(store.chatAction.setImagesView(data))
    })

    return withRouter(connect(mapStateToProps, mapDispatchToProps)(MessageImage))
  }, [isLoading])

  if (isLoading || !MessageImageWithProps) {
    return null
  }

  return <MessageImageWithProps {...props} utils={module.current} />
}
