import { useEffect, useState } from 'react'
import { connect } from 'react-redux'

import Contacts from './Contacts'

const mapStateToProps = () => ({})
const mapDispatchToProps = () => ({})

// Кеш модулей и компонента — живут на уровне модуля
let cachedModules = null
let ContactsWithProps = null

async function loadModules() {
  if (cachedModules) return cachedModules

  const [store, { chatServiceGet }, { withRouter, t, theme }, { RenderHTML }, { default: MapView }] = await Promise.all([
    import('app-store-web'),
    import('app-services-web'),
    import('app-utils-web'),
    import('react-native-render-html'),
    import('react-native-web-maps')
  ])

  cachedModules = { store, chatServiceGet, withRouter, t, theme, RenderHTML, MapView }

  // Создаём обёртку сразу после загрузки — гарантированно один раз
  ContactsWithProps = cachedModules.withRouter(connect(mapStateToProps, mapDispatchToProps)(Contacts))

  return cachedModules
}

// Прогреваем модули сразу при импорте файла не дожидаясь маунта
loadModules().catch(console.error)

export default function ContactsComponent(props) {
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
    console.error('ContactsComponent: failed to load modules', error)
    return null
  }

  if (!modules) return null

  return <ContactsWithProps {...props} utils={modules} />
}
