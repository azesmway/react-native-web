import { useEffect, useRef, useState } from 'react'
import { connect } from 'react-redux'

import StatusBar from './statusbar'

export default function StatusBarComponent(props) {
  const [isLoading, setLoading] = useState(true)
  const module = useRef(undefined)

  const loadModules = async () => {
    const store = await import('app-store-web')
    module.current = {
      store: store
    }
  }

  useEffect(() => {
    if (isLoading) {
      loadModules().then(() => setLoading(false))
    }
  }, [isLoading])

  if (isLoading) {
    return <></>
  }

  const { store } = module.current

  const mapStateToProps = state => ({
    statusBar: store.nappSelector.getStatusBar(state)
  })

  const mapDispatchToProps = dispatch => ({})

  const StatusBarWithStore = connect(mapStateToProps, mapDispatchToProps)(StatusBar)

  return <StatusBarWithStore {...props} utils={module.current} />
}
