import { Dimensions, Platform } from 'react-native'
import { useEffect, useState } from 'react'
import { connect } from 'react-redux'

import ViewMessage from './ViewMessage'

const GLOBAL_OBJ = Platform.OS === 'web' ? window : global

const getIsMobile = isMobile => {
  const { IS_MOBILE } = GLOBAL_OBJ.onlinetur.constants
  const { width } = Dimensions.get('window')
  return isMobile || width < IS_MOBILE
}

const createMapStateToProps = store => state => ({
  modalUser: store.chatSelector.getModalUser(state)
})

const createMapDispatchToProps = store => dispatch => ({
  setModalUser: data => dispatch(store.chatAction.setModalUser(data))
})

let cachedModules = null
let ViewMessageWithProps = null

async function loadModules() {
  if (cachedModules) return cachedModules

  const [store, { chatServiceGet }, { withRouter, t, theme }, { Modal, Portal, Button }, { Icon }, { isMobile }] = await Promise.all([
    import('app-store-web'),
    import('app-services-web'),
    import('app-utils-web'),
    import('react-native-paper'),
    import('react-native-elements'),
    import('react-device-detect')
  ])

  cachedModules = {
    store,
    chatServiceGet,
    withRouter,
    t,
    theme,
    Modal,
    Portal,
    Button,
    Icon,
    isMobile: getIsMobile(isMobile)
  }

  ViewMessageWithProps = cachedModules.withRouter(connect(createMapStateToProps(store), createMapDispatchToProps(store))(ViewMessage))

  return cachedModules
}

loadModules().catch(console.error)

export default function ViewMessageComponent(props) {
  const [modules, setModules] = useState(cachedModules)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (modules) return

    let cancelled = false

    loadModules()
      .then(mods => {
        if (!cancelled) setModules(mods)
      })
      .catch(err => {
        if (!cancelled) setError(err)
      })

    return () => {
      cancelled = true
    }
  }, [])

  if (error) {
    console.error('ViewMessageComponent: failed to load modules', error)
    return null
  }

  if (!modules) return null

  return <ViewMessageWithProps {...props} utils={modules} />
}
