import { useEffect, useRef, useState } from 'react'
import { connect } from 'react-redux'

import DialogBox from './DialogBox'

const mapStateToProps = () => ({})
const mapDispatchToProps = () => ({})

const loadModules = async () => {
  const [store, { withRouter }, { Portal, Modal, Dialog }, { Icon }] = await Promise.all([
    import('app-store-web'),
    import('app-utils-web'),
    import('react-native-paper'),
    import('react-native-elements')
  ])

  return { store, withRouter, Portal, Modal, Dialog, Icon }
}

export default function DialogBoxComponent(props) {
  const [isLoading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const modulesRef = useRef(null)
  const DialogBoxWithPropsRef = useRef(null)

  useEffect(() => {
    loadModules()
      .then(modules => {
        modulesRef.current = modules
        DialogBoxWithPropsRef.current = modules.withRouter(connect(mapStateToProps, mapDispatchToProps)(DialogBox))
        setLoading(false)
      })
      .catch(setError)
  }, [])

  if (error) {
    console.error('DialogBoxComponent: failed to load modules', error)
    return null
  }

  if (isLoading) return null

  const DialogBoxWithProps = DialogBoxWithPropsRef.current

  return <DialogBoxWithProps {...props} utils={modulesRef.current} />
}
