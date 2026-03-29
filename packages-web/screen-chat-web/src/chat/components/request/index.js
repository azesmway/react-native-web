import { useEffect, useState } from 'react'
import { connect } from 'react-redux'

import RequestModal from './RequestModal'

const mapStateToProps = () => ({})
const mapDispatchToProps = () => ({})

let cachedModules = null
let RequestModalWithProps = null

async function loadModules() {
  if (cachedModules) return cachedModules

  const [
    store,
    { chatServiceGet, chatServicePost },
    { withRouter, t, theme, moment },
    { mobile },
    { Icon, Header },
    { TextInput, Portal, Modal },
    { default: DateTimePickerModal },
    { default: ModalDropdown },
    { Dropdown },
    { WebView },
    { default: Alert }
  ] = await Promise.all([
    import('app-store-web'),
    import('app-services-web'),
    import('app-utils-web'),
    import('app-mobile-web'),
    import('react-native-elements'),
    import('react-native-paper'),
    import('react-native-modal-datetime-picker'),
    import('react-native-modal-dropdown'),
    import('react-native-element-dropdown'),
    import('react-native-webview'),
    import('@blazejkustra/react-native-alert')
  ])

  cachedModules = {
    store,
    chatServiceGet,
    chatServicePost,
    withRouter,
    t,
    theme,
    moment,
    mobile,
    Icon,
    Header,
    TextInput,
    Portal,
    Modal,
    DateTimePickerModal,
    ModalDropdown,
    Dropdown,
    WebView,
    Alert
  }

  RequestModalWithProps = cachedModules.withRouter(connect(mapStateToProps, mapDispatchToProps)(RequestModal))

  return cachedModules
}

loadModules().catch(console.error)

export default function RequestModalComponent(props) {
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
    console.error('RequestModalComponent: failed to load modules', error)
    return null
  }

  if (!modules) return null

  return <RequestModalWithProps {...props} utils={modules} />
}
