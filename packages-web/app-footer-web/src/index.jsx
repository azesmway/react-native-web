import { useEffect, useRef, useState } from 'react'
import { connect } from 'react-redux'

import Footer from './footer'

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
    footerBar: store.nappSelector.getFooterBar(state)
  })

  const mapDispatchToProps = dispatch => ({})

  const FooterWithStore = connect(mapStateToProps, mapDispatchToProps)(Footer)

  return <FooterWithStore {...props} utils={module.current} />
}
