import { useEffect, useState } from 'react'
import { connect } from 'react-redux'

import Footer from './Footer'

const mapStateToProps = () => ({})
const mapDispatchToProps = () => ({})

let cachedModules = null
let FooterWithProps = null

async function loadModules() {
  if (cachedModules) return cachedModules

  const [store, { chatServiceGet }, { withRouter, t, theme }] = await Promise.all([import('app-store-web'), import('app-services-web'), import('app-utils-web')])

  cachedModules = { store, chatServiceGet, withRouter, t, theme }

  FooterWithProps = cachedModules.withRouter(connect(mapStateToProps, mapDispatchToProps)(Footer))

  return cachedModules
}

loadModules().catch(console.error)

export default function FooterComponent(props) {
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
    console.error('FooterComponent: failed to load modules', error)
    return null
  }

  if (!modules) return null

  return <FooterWithProps {...props} utils={modules} />
}
