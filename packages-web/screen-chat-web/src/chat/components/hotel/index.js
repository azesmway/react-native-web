import { useEffect, useState } from 'react'
import { Dimensions, Platform } from 'react-native'
import { connect } from 'react-redux'

import ViewHotel from './ViewHotel'

const GLOBAL_OBJ = Platform.OS === 'web' ? window : global

const createMapStateToProps = store => state => ({
  filter: store.filterSelector.getFilter(state),
  currentCategory: store.filterSelector.getSelectCategory(state),
  user: store.userSelector.getUser(state),
  hotels: store.chatSelector.getHotels(state)
})

const createMapDispatchToProps = store => dispatch => ({
  setHeaderParams: data => dispatch(store.headerAction.setHeaderParams(data)),
  setFooterBar: data => dispatch(store.nappAction.setFooterBar(data)),
  setModalLogin: data => dispatch(store.nappAction.setModalLogin(data))
})

let cachedModules = null
let ViewHotelWithProps = null

const getIsMobile = isMobile => {
  const { IS_MOBILE } = GLOBAL_OBJ.onlinetur.constants
  const { width } = Dimensions.get('window')
  return isMobile || width < IS_MOBILE
}

async function loadModules() {
  if (cachedModules) return cachedModules

  const isWeb = Platform.OS === 'web'

  const [
    store,
    { chatServiceGet },
    { withRouter, t, theme },
    { appcore },
    { Icon, Switch },
    { default: ImageLoad },
    { default: Carousel },
    { RenderHTML },
    { Modal, Portal },
    { isMobile },
    panoramaModule
  ] = await Promise.all([
    import('app-store-web'),
    import('app-services-web'),
    import('app-utils-web'),
    import('app-core-web'),
    import('react-native-elements'),
    import('react-native-image-placeholder'),
    import('react-native-snap-carousel'),
    import('react-native-render-html'),
    import('react-native-paper'),
    import('react-device-detect'),
    isWeb ? Promise.resolve(null) : import('@lightbase/react-native-panorama-view')
  ])

  cachedModules = {
    store,
    chatServiceGet,
    withRouter,
    t,
    theme,
    testResponse: appcore.testResponse,
    convertRequestWeb: appcore.convertRequestWeb,
    errorTextResponse: appcore.errorTextResponse,
    convertRequest: appcore.convertRequest,
    Icon,
    Switch,
    ImageLoad,
    Carousel,
    RenderHTML,
    Modal,
    Portal,
    isMobile: getIsMobile(isMobile),
    PanoramaView: panoramaModule?.default ?? null
  }

  ViewHotelWithProps = cachedModules.withRouter(connect(createMapStateToProps(store), createMapDispatchToProps(store))(ViewHotel))

  return cachedModules
}

loadModules().catch(console.error)

export default function ViewHotelComponent(props) {
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
    console.error('ViewHotelComponent: failed to load modules', error)
    return null
  }

  if (!modules) return null

  return <ViewHotelWithProps {...props} utils={modules} />
}
