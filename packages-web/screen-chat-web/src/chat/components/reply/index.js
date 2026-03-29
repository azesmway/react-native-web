import { useEffect, useState } from 'react'
import { connect } from 'react-redux'

import ReplyMessage from './ReplyMessage'

const mapStateToProps = () => ({})
const mapDispatchToProps = () => ({})

let cachedModules = null
let ReplyMessageWithProps = null

async function loadModules() {
  if (cachedModules) return cachedModules

  const [store, { withRouter }] = await Promise.all([import('app-store-web'), import('app-utils-web')])

  cachedModules = { store, withRouter }

  ReplyMessageWithProps = cachedModules.withRouter(connect(mapStateToProps, mapDispatchToProps)(ReplyMessage))

  return cachedModules
}

loadModules().catch(console.error)

export default function ReplyMessageComponent(props) {
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
    console.error('ReplyMessageComponent: failed to load modules', error)
    return null
  }

  if (!modules) return null

  return <ReplyMessageWithProps {...props} utils={modules} />
}
