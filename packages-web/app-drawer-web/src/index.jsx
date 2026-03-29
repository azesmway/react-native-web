import { useEffect, useMemo, useRef, useState } from 'react'
import { Dimensions, Platform } from 'react-native'
import { connect } from 'react-redux'

import WebDrawer from './WebDrawer'

export default function WebDrawerComponent(props) {
  const [isLoading, setLoading] = useState(true)
  const module = useRef(undefined)

  const loadModules = async () => {
    const [{ drawerSelector, drawerAction }, { isMobile }, { Drawer }] = await Promise.all([import('app-store-web'), import('react-device-detect'), import('react-native-drawer-layout')])

    const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
    const { IS_MOBILE } = GLOBAL_OBJ.onlinetur.constants
    const { width } = Dimensions.get('window')

    module.current = {
      drawerSelector,
      drawerAction,
      Drawer,
      isMobile: isMobile || width < IS_MOBILE
    }
  }

  useEffect(() => {
    loadModules().then(() => setLoading(false))
  }, [])

  const WebDrawerWithProps = useMemo(() => {
    if (isLoading || !module.current) return null

    const { drawerSelector, drawerAction } = module.current

    const mapStateToProps = state => ({
      openDrawer: drawerSelector.getOpenDrawer(state)
    })

    const mapDispatchToProps = dispatch => ({
      setDrawer: data => dispatch(drawerAction.openDrawer(data))
    })

    return connect(mapStateToProps, mapDispatchToProps)(WebDrawer)
  }, [isLoading])

  if (isLoading || !WebDrawerWithProps) {
    return <></>
  }

  return <WebDrawerWithProps {...props} utils={module.current} />
}
