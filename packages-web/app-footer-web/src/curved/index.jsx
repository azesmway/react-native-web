import { useEffect, useMemo, useRef, useState } from 'react'
import { Dimensions, Platform } from 'react-native'
import { connect } from 'react-redux'

import Curved from './curved'

export default function CurvedComponent(props) {
  const [isLoading, setLoading] = useState(true)
  const module = useRef(undefined)

  const loadModules = async () => {
    // Parallel imports for better performance
    const [store, { t, theme }, { Icon }, { isMobile }, { CurvedViewComponent, getPathUp }, { scale }] = await Promise.all([
      import('app-store-web'),
      import('app-utils-web'),
      import('react-native-elements'),
      import('react-device-detect'),
      import('react-native-curved-bottom-bar'),
      import('react-native-size-scaling')
    ])

    const getIsMobile = () => {
      const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
      const { IS_MOBILE } = GLOBAL_OBJ.onlinetur.constants
      const { width } = Dimensions.get('window')
      return isMobile || width < IS_MOBILE
    }

    // Single assignment instead of multiple spreads
    module.current = {
      store,
      t,
      theme,
      Icon,
      isMobile: getIsMobile(),
      CurvedViewComponent,
      getPathUp,
      scale
    }
  }

  useEffect(() => {
    loadModules().then(() => setLoading(false))
  }, [])

  // Memoize connected component to prevent unnecessary recreations
  const CurvedWithStore = useMemo(() => {
    if (isLoading || !module.current) return null

    const mapStateToProps = state => ({})
    const mapDispatchToProps = dispatch => ({})

    return connect(mapStateToProps, mapDispatchToProps)(Curved)
  }, [isLoading])

  if (isLoading || !CurvedWithStore) {
    return null
  }

  return <CurvedWithStore {...props} utils={module.current} />
}
