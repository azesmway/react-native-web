import { Dimensions, Platform } from 'react-native'
import { useEffect, useState } from 'react'
import { connect } from 'react-redux'

import ChatModal from './ChatModal'

const GLOBAL_OBJ = Platform.OS === 'web' ? window : global

const getIsMobile = isMobile => {
  const { IS_MOBILE } = GLOBAL_OBJ.onlinetur.constants
  const { width } = Dimensions.get('window')
  return isMobile || width < IS_MOBILE
}

const createMapStateToProps = store => state => ({
  modalFilter: store.chatSelector.getModalFilter(state),
  modalContact: store.chatSelector.getModalContact(state),
  hobby: store.chatSelector.getHobby(state),
  hotels: store.chatSelector.getHotels(state),
  places: store.chatSelector.getPlaces(state),
  countries: store.countriesSelector.getAllCountries(state),
  filter: store.filterSelector.getFilter(state),
  user: store.userSelector.getUser(state),
  agent: store.countriesSelector.getAllAgent(state)
})

const createMapDispatchToProps = store => dispatch => ({
  setModalFilter: data => dispatch(store.chatAction.setModalFilter(data)),
  setModalContact: data => dispatch(store.chatAction.setModalContact(data))
})

let cachedModules = null
let ChatModalWithProps = null

async function loadModules() {
  if (cachedModules) return cachedModules

  const [store, { withRouter, theme }, { ActionFilter }, { Portal, Modal }, { isMobile }] = await Promise.all([
    import('app-store-web'),
    import('app-utils-web'),
    import('app-controller-web'),
    import('react-native-paper'),
    import('react-device-detect')
  ])

  cachedModules = {
    store,
    withRouter,
    theme,
    ActionFilter,
    Portal,
    Modal,
    isMobile: getIsMobile(isMobile)
  }

  ChatModalWithProps = cachedModules.withRouter(connect(createMapStateToProps(store), createMapDispatchToProps(store))(ChatModal))

  return cachedModules
}

loadModules().catch(console.error)

export default function ChatModalComponent(props) {
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
    console.error('ChatModalComponent: failed to load modules', error)
    return null
  }

  if (!modules) return null

  return <ChatModalWithProps {...props} utils={modules} />
}
