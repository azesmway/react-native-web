import { useEffect, useRef, useState } from 'react'
import { connect } from 'react-redux'

import Actions from './Actions'
import { Dimensions, Platform } from 'react-native'

export default function ActionsComponent(props) {
  const [isLoading, setLoading] = useState(true)
  const module = useRef(undefined)

  const loadModules = async () => {
    const store = await import('app-store-web')

    module.current = {
      store: store
    }

    const { withRouter, moment, t } = await import('app-utils-web')
    module.current = {
      ...module.current,
      withRouter: withRouter,
      moment: moment,
      t: t
    }

    const { chatServiceGet } = await import('app-services-web')
    module.current = {
      ...module.current,
      chatServiceGet: chatServiceGet
    }

    const { Button, Icon, ListItem, Tooltip } = await import('react-native-elements')
    module.current = {
      ...module.current,
      Icon: Icon,
      Button: Button,
      ListItem: ListItem,
      Tooltip: Tooltip
    }

    const Alert = await import('@blazejkustra/react-native-alert')
    module.current = {
      ...module.current,
      Alert: Alert.default
    }

    const { isMobile } = await import('react-device-detect')

    const getIsMobile = () => {
      const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
      const { IS_MOBILE } = GLOBAL_OBJ.onlinetur.constants
      const { width } = Dimensions.get('window')

      return isMobile || width < IS_MOBILE
    }

    module.current = {
      ...module.current,
      isMobile: getIsMobile()
    }
  }

  useEffect(() => {
    loadModules().then(() => setLoading(false))
  }, [])

  if (isLoading) {
    return <></>
  }

  const { store, withRouter } = module.current

  const mapStateToProps = state => ({
    appUser: store.userSelector.getUser(state)
  })

  const mapDispatchToProps = dispatch => ({})

  const ActionsWithProps = withRouter(connect(mapStateToProps, mapDispatchToProps)(Actions))

  return <ActionsWithProps {...props} utils={module.current} />
}
