import { useEffect, useMemo, useRef, useState } from 'react'
import { Dimensions, Platform } from 'react-native'
import { connect } from 'react-redux'

import Radio from './Radio'

export default function StatusBarComponent(props) {
  const [isLoading, setLoading] = useState(true)
  const module = useRef(undefined)

  const loadModules = async () => {
    const [store, { t }, { appcore }, { chatServiceGet }, ReactAudioPlayer, { Icon }, { Dropdown }, { isMobile }] = await Promise.all([
      import('app-store-web'),
      import('app-utils-web'),
      import('app-core-web'),
      import('app-services-web'),
      import('react-audio-player'),
      import('react-native-elements'),
      import('react-native-element-dropdown'),
      import('react-device-detect')
    ])

    const getIsMobile = () => {
      const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
      const { IS_MOBILE } = GLOBAL_OBJ.onlinetur.constants
      const { width } = Dimensions.get('window')

      return isMobile || width < IS_MOBILE
    }

    module.current = {
      store,
      t,
      appcore,
      chatServiceGet,
      ReactAudioPlayer: ReactAudioPlayer.default,
      Icon,
      Dropdown,
      isMobile: getIsMobile()
    }
  }

  useEffect(() => {
    loadModules().then(() => setLoading(false))
  }, [])

  const RadioWithStore = useMemo(() => {
    if (isLoading || !module.current) {
      return null
    }

    const mapStateToProps = state => ({})
    const mapDispatchToProps = dispatch => ({})

    return connect(mapStateToProps, mapDispatchToProps)(Radio)
  }, [isLoading])

  if (isLoading || !RadioWithStore) {
    return null
  }

  return <RadioWithStore {...props} utils={module.current} />
}
