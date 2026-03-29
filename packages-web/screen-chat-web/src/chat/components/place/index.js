import { useEffect, useState } from 'react'
import { connect } from 'react-redux'

import ViewPlace from './ViewPlace'

const createMapStateToProps = store => state => ({
  filter: store.filterSelector.getFilter(state),
  currentCategory: store.filterSelector.getSelectCategory(state),
  user: store.userSelector.getUser(state)
})

const mapDispatchToProps = () => ({})

let cachedModules = null
let ViewPlaceWithProps = null

async function loadModules() {
  if (cachedModules) return cachedModules

  const [store, { chatServiceGet }, { withRouter, t, theme }, { RenderHTML }] = await Promise.all([
    import('app-store-web'),
    import('app-services-web'),
    import('app-utils-web'),
    import('react-native-render-html')
  ])

  cachedModules = { store, chatServiceGet, withRouter, t, theme, RenderHTML }

  ViewPlaceWithProps = cachedModules.withRouter(connect(createMapStateToProps(store), mapDispatchToProps)(ViewPlace))

  return cachedModules
}

loadModules().catch(console.error)

export default function ViewPlaceComponent(props) {
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
    console.error('ViewPlaceComponent: failed to load modules', error)
    return null
  }

  if (!modules) return null

  return <ViewPlaceWithProps {...props} utils={modules} />
}
