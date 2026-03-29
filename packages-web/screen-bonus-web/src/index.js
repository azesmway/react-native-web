import { useEffect, useMemo, useRef, useState } from 'react'
import { Dimensions, Platform } from 'react-native'
import { connect } from 'react-redux'

import Bonus from './Bonus'

export default function ViewPlaceComponent(props) {
  const [isLoading, setLoading] = useState(true)
  const module = useRef(undefined)

  const loadModules = async () => {
    // Parallel imports for independent modules
    const [store, { t, withRouter }, { isMobile }] = await Promise.all([import('app-store-web'), import('app-utils-web'), import('react-device-detect')])

    const getIsMobile = () => {
      const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
      const { IS_MOBILE } = GLOBAL_OBJ.onlinetur.constants
      const { width } = Dimensions.get('window')
      return isMobile || width < IS_MOBILE
    }

    // Build module object once
    const moduleData = {
      store,
      t,
      withRouter,
      isMobile: getIsMobile()
    }

    // Conditionally load WebView only for non-web platforms
    if (Platform.OS !== 'web') {
      const { WebView } = await import('react-native-webview')
      moduleData.WebView = WebView
    }

    module.current = moduleData
  }

  useEffect(() => {
    loadModules().then(() => setLoading(false))
  }, [])

  // Memoize the connected component
  const BonusWithProps = useMemo(() => {
    if (isLoading || !module.current) {
      return null
    }

    const { store, withRouter } = module.current

    const mapStateToProps = state => ({
      user: store.userSelector.getUser(state)
    })

    const mapDispatchToProps = dispatch => ({
      setHeaderParams: data => dispatch(store.headerAction.setHeaderParams(data)),
      setFooterBar: data => dispatch(store.nappAction.setFooterBar(data))
    })

    return withRouter(connect(mapStateToProps, mapDispatchToProps)(Bonus))
  }, [isLoading])

  if (isLoading || !BonusWithProps) {
    return null
  }

  return <BonusWithProps {...props} utils={module.current} />
}
