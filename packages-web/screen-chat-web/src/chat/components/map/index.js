import { useEffect, useState } from 'react'
import { connect } from 'react-redux'

import Map from './Map'

const createMapStateToProps = store => state => ({
  filter: store.filterSelector.getFilter(state),
  currentCategory: store.filterSelector.getSelectCategory(state),
  user: store.userSelector.getUser(state)
})

const createMapDispatchToProps = store => dispatch => ({
  setHeaderParams: data => dispatch(store.headerAction.setHeaderParams(data)),
  setFooterBar: data => dispatch(store.nappAction.setFooterBar(data))
})

let cachedModules = null
let MapWithProps = null

async function loadModules() {
  if (cachedModules) return cachedModules

  const [
    store,
    { chatServiceGet },
    { withRouter, t, theme },
    { RenderHTML },
    // Один импорт для всего из пакета
    { default: MapView, Marker, ClusterProps, MarkerClusterer }
  ] = await Promise.all([import('app-store-web'), import('app-services-web'), import('app-utils-web'), import('react-native-render-html'), import('@teovilla/react-native-web-maps')])

  cachedModules = {
    store,
    chatServiceGet,
    withRouter,
    t,
    theme,
    RenderHTML,
    MapView,
    Marker,
    ClusterProps,
    MarkerClusterer
  }

  MapWithProps = cachedModules.withRouter(connect(createMapStateToProps(store), createMapDispatchToProps(store))(Map))

  return cachedModules
}

loadModules().catch(console.error)

export default function MapComponent(props) {
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
    console.error('MapComponent: failed to load modules', error)
    return null
  }

  if (!modules) return null

  return <MapWithProps {...props} utils={modules} />
}
