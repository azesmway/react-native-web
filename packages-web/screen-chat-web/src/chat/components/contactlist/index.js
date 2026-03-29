import { useEffect, useRef, useState } from 'react'
import { Platform } from 'react-native'
import { connect } from 'react-redux'

import ContactList from './ContactList'

// Вынесено за пределы компонента — не пересоздаётся при каждом рендере
const mapStateToProps = () => ({})
const mapDispatchToProps = () => ({})

const loadModules = async () => {
  const [store, { withRouter, t, theme }, { Header, Icon, SearchBar }, { default: Alert }] = await Promise.all([
    import('app-store-web'),
    import('app-utils-web'),
    import('react-native-elements'),
    import('@blazejkustra/react-native-alert')
  ])

  const nativeContacts = Platform.OS !== 'web' ? await import('react-native-contacts') : {}

  return {
    store,
    withRouter,
    t,
    theme,
    Header,
    Icon,
    SearchBar,
    Alert,
    ...nativeContacts
  }
}

export default function ContactListComponent(props) {
  const [isLoading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const modulesRef = useRef(null)
  // Вынесено в ref — не пересоздаётся при каждом рендере
  const ContactListWithPropsRef = useRef(null)

  useEffect(() => {
    loadModules()
      .then(modules => {
        modulesRef.current = modules
        ContactListWithPropsRef.current = modules.withRouter(connect(mapStateToProps, mapDispatchToProps)(ContactList))
        setLoading(false)
      })
      .catch(setError)
  }, [])

  if (error) {
    console.error('ContactListComponent: failed to load modules', error)
    return null
  }

  if (isLoading) {
    return null
  }

  const ContactListWithProps = ContactListWithPropsRef.current

  return <ContactListWithProps {...props} utils={modulesRef.current} />
}
