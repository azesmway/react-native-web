import { useEffect, useState } from 'react'
import { connect } from 'react-redux'

import NotifyButton from './NotifyButton'

const mapStateToProps = () => ({})
const mapDispatchToProps = () => ({})

let cachedModules = null
let NotifyButtonWithProps = null

async function loadModules() {
  if (cachedModules) return cachedModules

  const [store, { withRouter, moment, t }, { Icon }] = await Promise.all([import('app-store-web'), import('app-utils-web'), import('react-native-elements')])

  cachedModules = { store, withRouter, moment, t, Icon }

  NotifyButtonWithProps = cachedModules.withRouter(connect(mapStateToProps, mapDispatchToProps)(NotifyButton))

  return cachedModules
}

loadModules().catch(console.error)

export default function NotifyButtonComponent(props) {
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
    console.error('NotifyButtonComponent: failed to load modules', error)
    return null
  }

  if (!modules) return null

  return <NotifyButtonWithProps {...props} utils={modules} />
}
