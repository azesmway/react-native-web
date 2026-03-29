import { useEffect, useMemo, useRef, useState } from 'react'
import { Dimensions, Platform } from 'react-native'
import { connect } from 'react-redux'

import MapChat from './MapChat'

export default function MapChatComponent(props) {
  const [isLoading, setLoading] = useState(true)
  const module = useRef(undefined)

  const loadModules = async () => {
    // Parallel imports where dependencies allow
    const [store, { withRouter, theme, t }, { chatServiceGet }, MapView, { Marker, Polygon, PROVIDER_GOOGLE }, Spinner, { Modal, Portal }, { Icon }, { isMobile }, Geolocation] = await Promise.all([
      import('app-store-web'),
      import('app-utils-web'),
      import('app-services-web'),
      import('react-native-maps'),
      import('react-native-maps'),
      import('react-native-loading-spinner-overlay'),
      import('react-native-paper'),
      import('react-native-elements'),
      import('react-device-detect'),
      import('@react-native-community/geolocation')
    ])

    const getIsMobile = () => {
      const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
      const { IS_MOBILE } = GLOBAL_OBJ.onlinetur.constants
      const { width } = Dimensions.get('window')
      return isMobile || width < IS_MOBILE
    }

    // Single assignment instead of multiple spreads
    module.current = {
      store,
      withRouter,
      theme,
      t,
      chatServiceGet,
      MapView: MapView.default,
      Marker,
      Polygon,
      PROVIDER_GOOGLE,
      Spinner: Spinner.default,
      Modal,
      Portal,
      Icon,
      isMobile: getIsMobile(),
      Geolocation: Geolocation.default
    }
  }

  useEffect(() => {
    loadModules().then(() => setLoading(false))
  }, [])

  // Memoize connected component to avoid recreation on every render
  const MapChatWithProps = useMemo(() => {
    if (isLoading || !module.current) {
      return null
    }

    const { store, withRouter } = module.current

    const mapStateToProps = state => ({
      filter: store.filterSelector.getFilter(state),
      currentCategory: store.filterSelector.getSelectCategory(state),
      user: store.userSelector.getUser(state),
      places: store.chatSelector.getPlaces(state),
      selectHotel: store.filterSelector.getSelectHotel(state),
      selectPlace: store.filterSelector.getSelectPlace(state)
    })

    const mapDispatchToProps = dispatch => ({
      setHeaderParams: data => dispatch(store.headerAction.setHeaderParams(data)),
      setFooterBar: data => dispatch(store.nappAction.setFooterBar(data))
    })

    return withRouter(connect(mapStateToProps, mapDispatchToProps)(MapChat))
  }, [isLoading])

  if (isLoading || !MapChatWithProps) {
    return null
  }

  return <MapChatWithProps {...props} utils={module.current} />
}
