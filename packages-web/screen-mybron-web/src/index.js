import { useEffect, useMemo, useRef, useState } from 'react'
import { Dimensions, Platform } from 'react-native'
import { connect } from 'react-redux'

import MyBron from './MyBron'

export default function ViewPlaceComponent(props) {
  const [isLoading, setLoading] = useState(true)
  const module = useRef(undefined)

  const loadModules = async () => {
    // Parallel imports for better performance
    const [
      store,
      { chatServiceGet, chatServicePost },
      { withRouter, t, theme, moment },
      { Tab, ListItem, Icon, Tooltip, Header },
      { Modal, Portal, Button, Dialog, Paragraph, TextInput },
      Alert,
      { DatePickerModal },
      { isMobile }
    ] = await Promise.all([
      import('app-store-web'),
      import('app-services-web'),
      import('app-utils-web'),
      import('react-native-elements'),
      import('react-native-paper'),
      import('@blazejkustra/react-native-alert'),
      import('react-native-paper-dates'),
      import('react-device-detect')
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
      chatServiceGet,
      chatServicePost,
      withRouter,
      t,
      theme,
      moment,
      Tab,
      ListItem,
      Icon,
      Tooltip,
      Header,
      Modal,
      Portal,
      Button,
      Dialog,
      Paragraph,
      TextInput,
      Alert: Alert.default,
      DatePickerModal,
      isMobile: getIsMobile()
    }
  }

  useEffect(() => {
    loadModules().then(() => setLoading(false))
  }, [])

  // Memoize the connected component to avoid recreation on every render
  const MyBronWithProps = useMemo(() => {
    if (isLoading || !module.current) {
      return null
    }

    const { store, withRouter } = module.current

    const mapStateToProps = state => ({
      currentCategory: store.filterSelector.getSelectCategory(state),
      user: store.userSelector.getUser(state),
      filterApp: store.filterSelector.getFilter(state)
    })

    const mapDispatchToProps = dispatch => ({
      setHeaderParams: data => dispatch(store.headerAction.setHeaderParams(data)),
      setFooterBar: data => dispatch(store.nappAction.setFooterBar(data))
    })

    return withRouter(connect(mapStateToProps, mapDispatchToProps)(MyBron))
  }, [isLoading])

  if (isLoading || !MyBronWithProps) {
    return null
  }

  return <MyBronWithProps {...props} utils={module.current} />
}
