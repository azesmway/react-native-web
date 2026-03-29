import { useEffect, useRef, useState } from 'react'
import { connect } from 'react-redux'

import ActionSelect from './ActionSelect'

const mapStateToProps = () => ({})
const mapDispatchToProps = () => ({})

const loadModules = async () => {
  const [store, { withRouter, t, moment, theme }, { Icon, Header }] = await Promise.all([import('app-store-web'), import('app-utils-web'), import('react-native-elements')])

  return { store, withRouter, t, moment, theme, Icon, Header }
}

export default function ActionSelectComponent(props) {
  const [isLoading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const modulesRef = useRef(null)
  const ActionSelectWithPropsRef = useRef(null)

  useEffect(() => {
    loadModules()
      .then(modules => {
        modulesRef.current = modules
        ActionSelectWithPropsRef.current = modules.withRouter(connect(mapStateToProps, mapDispatchToProps)(ActionSelect))
        setLoading(false)
      })
      .catch(setError)
  }, [])

  if (error) {
    console.error('ActionSelectComponent: failed to load modules', error)
    return null
  }

  if (isLoading) return null

  const ActionSelectWithProps = ActionSelectWithPropsRef.current

  return <ActionSelectWithProps {...props} utils={modulesRef.current} />
}
