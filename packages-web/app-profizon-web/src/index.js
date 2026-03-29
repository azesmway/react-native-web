import { useEffect, useMemo, useRef, useState } from 'react'
import { Dimensions, Platform } from 'react-native'
import { connect } from 'react-redux'

import Profizon from './Profizon'

export default function ProfizonComponent(props) {
  const [isLoading, setLoading] = useState(true)
  const module = useRef(undefined)

  const loadModules = async () => {
    const [store, { isMobile }] = await Promise.all([import('app-store-web'), import('react-device-detect')])

    const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
    const { IS_MOBILE } = GLOBAL_OBJ.onlinetur.constants
    const { width } = Dimensions.get('window')

    module.current = {
      store,
      isMobile: isMobile || width < IS_MOBILE
    }
  }

  useEffect(() => {
    loadModules().then(() => setLoading(false))
  }, [])

  const ProfizonWithProps = useMemo(() => {
    if (isLoading || !module.current) return null

    const { drawerSelector, drawerAction } = module.current

    const mapStateToProps = state => ({})

    const mapDispatchToProps = dispatch => ({})

    return connect(mapStateToProps, mapDispatchToProps)(Profizon)
  }, [isLoading])

  if (isLoading || !ProfizonWithProps) {
    return <></>
  }

  return <ProfizonWithProps {...props} utils={module.current} />
}
