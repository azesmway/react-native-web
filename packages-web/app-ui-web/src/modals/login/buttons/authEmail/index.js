import { useEffect, useMemo, useRef, useState } from 'react'
import { connect } from 'react-redux'

import AuthEmail from './component/AuthEmail'

export default function AuthEmailComponent(props) {
  const [isLoading, setLoading] = useState(true)
  const module = useRef(undefined)

  const loadModules = async () => {
    // Parallel imports for better performance
    const [store, { TextInput, Modal, Portal }, { Header, Icon, Input }, { t, theme, firebase, moment, withRouter }, { mobile }, { chatServiceGet, chatServicePost, rtkQuery }, Alert] =
      await Promise.all([
        import('app-store-web'),
        import('react-native-paper'),
        import('react-native-elements'),
        import('app-utils-web'),
        import('app-mobile-web'),
        import('app-services-web'),
        import('@blazejkustra/react-native-alert')
      ])

    // Single assignment
    module.current = {
      store,
      TextInput,
      Modal,
      Portal,
      Header,
      Icon,
      Input,
      t,
      theme,
      firebase,
      withRouter,
      moment,
      getCookie: mobile.getCookie,
      chatServiceGet,
      chatServicePost,
      rtkQuery,
      Alert: Alert.default
    }
  }

  useEffect(() => {
    loadModules().then(() => setLoading(false))
  }, [])

  // Memoize the connected component
  const AuthEmailWithProps = useMemo(() => {
    if (isLoading || !module.current) return null

    const { store } = module.current

    const mapStateToProps = state => ({
      user: store.userSelector.getUser(state),
      userName: store.appSelector.getUserName(state),
      androidIdInstall: store.appSelector.getAndroidIdInstall(state),
      referral: store.appSelector.getRef(state),
      filter: store.filterSelector.getFilter(state),
      fcmToken: store.userSelector.getFcmToken(state),
      expoToken: store.userSelector.getExpoToken(state),
      locationPath: store.appSelector.getLocationPath(state),
      device: store.appSelector.getDevice(state)
    })

    const mapDispatchToProps = dispatch => ({
      setUser: data => dispatch(store.userAction.setUser(data)),
      setUserName: data => dispatch(store.appAction.setUserName(data)),
      setFilter: data => dispatch(store.filterAction.setFilter(data))
    })

    return connect(mapStateToProps, mapDispatchToProps)(AuthEmail)
  }, [isLoading])

  if (isLoading || !AuthEmailWithProps) {
    return null
  }

  return <AuthEmailWithProps {...props} utils={module.current} />
}
