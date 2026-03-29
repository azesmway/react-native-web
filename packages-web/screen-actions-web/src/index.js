import { useEffect, useRef, useState } from 'react'
import { Dimensions, Platform } from 'react-native'
import { connect } from 'react-redux'

import Actions from './Actions'

export default function ViewPlaceComponent(props) {
  const [isLoading, setLoading] = useState(true)
  const module = useRef({})

  // Оптимизируем загрузку модулей через Promise.all
  const loadModules = async () => {
    const [storeModule, utilsModule, servicesModule, paperModule, elementsModule, deviceModule] = await Promise.all([
      import('app-store-web'),
      import('app-utils-web'),
      import('app-services-web'),
      import('react-native-paper'),
      import('react-native-elements'),
      import('react-device-detect')
    ])

    const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
    const { IS_MOBILE } = GLOBAL_OBJ.onlinetur.constants
    const { width } = Dimensions.get('window')
    const isMobile = deviceModule.isMobile || width < IS_MOBILE

    module.current = {
      store: storeModule,
      t: utilsModule.t,
      withRouter: utilsModule.withRouter,
      theme: utilsModule.theme,
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
      isMobile
    }
  }

  useEffect(() => {
    loadModules().then(() => setLoading(false))
  }, [])

  if (isLoading) {
    return null
  }

  const { store, withRouter } = module.current

  const mapStateToProps = state => ({
    currentCategory: store.filterSelector.getSelectCategory(state),
    user: store.userSelector.getUser(state),
    filterApp: store.filterSelector.getFilter(state),
    countries: store.countriesSelector.getAllCountries(state)
  })

  const mapDispatchToProps = dispatch => ({
    setHeaderParams: data => dispatch(store.headerAction.setHeaderParams(data)),
    setFooterBar: data => dispatch(store.nappAction.setFooterBar(data))
  })

  const ActionsWithProps = withRouter(connect(mapStateToProps, mapDispatchToProps)(Actions))

  return <ActionsWithProps {...props} utils={module.current} />
}
