import { useEffect, useMemo, useRef, useState } from 'react'
import { Dimensions, Platform } from 'react-native'
import { connect } from 'react-redux'

import ActionsHotel from './ActionsHotel'

// Memoize selectors to prevent recreation on every render
const createMapStateToProps = store => state => ({
  currentCategory: store.filterSelector.getSelectCategory(state),
  user: store.userSelector.getUser(state),
  filterApp: store.filterSelector.getFilter(state),
  countries: store.countriesSelector.getAllCountries(state)
})

const createMapDispatchToProps = store => dispatch => ({
  setHeaderParams: data => dispatch(store.headerAction.setHeaderParams(data)),
  setFooterBar: data => dispatch(store.nappAction.setFooterBar(data))
})

export default function ViewPlaceComponent(props) {
  const [isLoading, setLoading] = useState(true)
  const moduleRef = useRef(null)

  const loadModules = async () => {
    const [storeModule, utilsModule, servicesModule, paperModule, elementsModule, deviceModule, imageLoadModule, carouselModule] = await Promise.all([
      import('app-store-web'),
      import('app-utils-web'),
      import('app-services-web'),
      import('react-native-paper'),
      import('react-native-elements'),
      import('react-device-detect'),
      import('react-native-image-placeholder'),
      import('react-native-snap-carousel')
    ])

    const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
    const { IS_MOBILE } = GLOBAL_OBJ.onlinetur.constants
    const { width } = Dimensions.get('window')
    const isMobile = deviceModule.isMobile || width < IS_MOBILE

    moduleRef.current = {
      store: storeModule,
      t: utilsModule.t,
      withRouter: utilsModule.withRouter,
      theme: utilsModule.theme,
      moment: utilsModule.moment,
      chatServiceGet: servicesModule.chatServiceGet,
      Modal: paperModule.Modal,
      Portal: paperModule.Portal,
      ListItem: elementsModule.ListItem,
      Button: elementsModule.Button,
      Header: elementsModule.Header,
      Icon: elementsModule.Icon,
      Input: elementsModule.Input,
      Switch: elementsModule.Switch,
      Card: elementsModule.Card,
      CheckBox: elementsModule.CheckBox,
      isMobile,
      ImageLoad: imageLoadModule.default,
      Carousel: carouselModule.default
    }
  }

  useEffect(() => {
    loadModules().then(() => setLoading(false))
  }, [])

  // Memoize the connected component to prevent recreation on every render
  const ConnectedComponent = useMemo(() => {
    if (!moduleRef.current) return null

    const { store, withRouter } = moduleRef.current

    return withRouter(connect(createMapStateToProps(store), createMapDispatchToProps(store))(ActionsHotel))
  }, [isLoading]) // Only recreate when loading completes

  if (isLoading || !ConnectedComponent) {
    return null
  }

  return <ConnectedComponent {...props} utils={moduleRef.current} />
}
