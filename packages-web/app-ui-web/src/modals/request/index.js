import { usePathname } from 'expo-router'
import { useEffect, useMemo, useRef, useState } from 'react'
import { connect } from 'react-redux'

import RequestModal from './component/RequestModal'

export default function WebDrawerComponent(props) {
  const [isLoading, setLoading] = useState(true)
  const module = useRef(undefined)
  const pathname = usePathname()

  const loadModules = async () => {
    // Parallel imports for better performance
    const [store, { TextInput, Modal, Portal }, { Header, Icon, ListItem }, { t, theme, firebase, moment }, { mobile }, { chatServiceGet, chatServicePost, rtkQuery }] = await Promise.all([
      import('app-store-web'),
      import('react-native-paper'),
      import('react-native-elements'),
      import('app-utils-web'),
      import('app-mobile-web'),
      import('app-services-web')
    ])

    // Single assignment
    module.current = {
      store,
      TextInput,
      Modal,
      Portal,
      Header,
      Icon,
      ListItem,
      t,
      theme,
      firebase,
      moment,
      getCookie: mobile.getCookie,
      chatServiceGet,
      chatServicePost,
      rtkQuery
    }
  }

  useEffect(() => {
    loadModules().then(() => setLoading(false))
  }, [])

  // Memoize the connected component
  const RequestModalWithProps = useMemo(() => {
    if (isLoading || !module.current) return null

    const { store } = module.current

    const mapStateToProps = state => ({
      user: store.userSelector.getUser(state),
      filter: store.filterSelector.getFilter(state)
    })

    const mapDispatchToProps = dispatch => ({
      setModalRequest: data => dispatch(store.nappAction.setModalRequest(data))
    })

    return connect(mapStateToProps, mapDispatchToProps)(RequestModal)
  }, [isLoading])

  if (isLoading || !RequestModalWithProps) {
    return null
  }

  return <RequestModalWithProps {...props} utils={module.current} pathname={pathname} />
}
