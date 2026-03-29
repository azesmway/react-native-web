import { useEffect, useMemo, useRef, useState } from 'react'
import { Dimensions, Platform } from 'react-native'
import { connect } from 'react-redux'

import Profile from './Profile'

export default function ViewPlaceComponent(props) {
  const [isLoading, setLoading] = useState(true)
  const module = useRef({})

  const loadModules = async () => {
    const [store, services, utils, mobile, core, actionSheet, imagePicker, camera, communications, common, elements, paper, maskedInput, dropdown, alert, deviceModule] = await Promise.all([
      import('app-store-web'),
      import('app-services-web'),
      import('app-utils-web'),
      import('app-mobile-web'),
      import('app-core-web'),
      import('@expo/react-native-action-sheet'),
      import('expo-image-picker'),
      import('expo-camera'),
      import('react-native-communications'),
      import('app-common-web'),
      import('react-native-elements'),
      import('react-native-paper'),
      import('react-native-advanced-input-mask'),
      import('react-native-element-dropdown'),
      import('@blazejkustra/react-native-alert'),
      import('react-device-detect')
    ])

    const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
    const { IS_MOBILE } = GLOBAL_OBJ.onlinetur.constants
    const { width } = Dimensions.get('window')
    const isMobile = deviceModule.isMobile || width < IS_MOBILE

    module.current = {
      store,
      appApi: store.appApi,
      dispatch: store.dispatch,
      chatServiceGet: services.chatServiceGet,
      chatServicePost: services.chatServicePost,
      rtkQuery: services.rtkQuery,
      withRouter: utils.withRouter,
      t: utils.t,
      theme: utils.theme,
      moment: utils.moment,
      setLocale: utils.setLocale,
      getLocale: utils.getLocale,
      firebase: utils.firebase,
      mobile: mobile.default,
      functions: core.functions,
      ActionSheetProvider: actionSheet.ActionSheetProvider,
      requestMediaLibraryPermissionsAsync: imagePicker.requestMediaLibraryPermissionsAsync,
      launchImageLibraryAsync: imagePicker.launchImageLibraryAsync,
      CameraView: camera.CameraView,
      CameraType: camera.CameraType,
      useCameraPermissions: camera.useCameraPermissions,
      Communications: communications.default,
      MainHeader: common.MainHeader,
      ListItem: elements.ListItem,
      Button: elements.Button,
      Header: elements.Header,
      Icon: elements.Icon,
      Input: elements.Input,
      Switch: elements.Switch,
      Card: elements.Card,
      CheckBox: elements.CheckBox,
      Modal: paper.Modal,
      Portal: paper.Portal,
      MaskedTextInput: maskedInput.MaskedTextInput,
      Dropdown: dropdown.Dropdown,
      Alert: alert.default,
      isMobile
    }

    if (Platform.OS !== 'web') {
      module.current.GoogleSignin = (await import('@react-native-google-signin/google-signin')).default
    }
  }

  useEffect(() => {
    loadModules().then(() => setLoading(false))
  }, [])

  const ConnectedProfile = useMemo(() => {
    if (isLoading) return null

    const { store, withRouter } = module.current

    const mapStateToProps = state => ({
      user: store.userSelector.getUser(state),
      notifyNews: store.userSelector.getNotifyNews(state),
      filter: store.filterSelector.getFilter(state),
      currentCategory: store.filterSelector.getSelectCategory(state),
      agent: store.countriesSelector.getAllAgent(state),
      countries: store.countriesSelector.getAllCountries(state),
      userVK: store.userSelector.getVK(state),
      urlPost: store.userSelector.getUrlPost(state),
      isPostVK: store.userSelector.isPostVK(state),
      news: store.newsSelector.getNews(state),
      agentTowns: store.userSelector.getAgentTowns(state),
      expoToken: store.userSelector.getExpoToken(state),
      passwordSotr: store.userSelector.getPasswordSotr(state),
      fcmToken: store.userSelector.getFcmToken(state),
      device: store.appSelector.getDevice(state),
      appLang: store.appSelector.getAppLang(state),
      appLangInterface: store.appSelector.getAppLangInterface(state)
    })

    const mapDispatchToProps = dispatch => ({
      setUser: data => dispatch(store.userAction.setUser(data)),
      setFilter: data => dispatch(store.filterAction.setFilter(data)),
      setCountries: data => dispatch(store.chatAction.setCountries(data)),
      setNotifyNews: data => dispatch(store.userAction.setNotifyNews(data)),
      setVK: data => dispatch(store.userAction.setVK(data)),
      setAgentTowns: data => dispatch(store.userAction.setAgentTowns(data)),
      setUrlPost: data => dispatch(store.userAction.setUrlPost(data)),
      setPostVK: data => dispatch(store.userAction.setPostVK(data)),
      setLocationPath: data => dispatch(store.appAction.setLocationPath(data)),
      setHeaderParams: data => dispatch(store.headerAction.setHeaderParams(data)),
      setFooterBar: data => dispatch(store.nappAction.setFooterBar(data)),
      setModalLogin: data => dispatch(store.nappAction.setModalLogin(data)),
      setAgent: data => dispatch(store.chatAction.setAgent(data)),
      setPasswordSotr: data => dispatch(store.userAction.setPasswordSotr(data)),
      setAppLangStore: data => dispatch(store.appAction.setAppLang(data)),
      setAppLangInterface: data => dispatch(store.appAction.setAppLangInterface(data)),
      logOut: data => {
        dispatch(store.userAction.setUser(data.user))
        dispatch(store.filterAction.setFilter(data.filter))
      },
      setCategories: data => dispatch(store.catAction.setCategories(data)),
      setAllCountries: data => dispatch(store.countriesAction.setAllCountries(data)),
      setAllAgent: data => dispatch(store.countriesAction.setAllAgent(data)),
      changeOfflineMode: data => dispatch(store.messagesAction.changeOfflineMode(data)),
      changeMyRatingLocal: data => dispatch(store.ratingAction.changeMyRatingLocal(data)),
      changeMyRatingServer: data => dispatch(store.ratingAction.changeMyRatingServer(data))
    })

    return withRouter(connect(mapStateToProps, mapDispatchToProps)(Profile))
  }, [isLoading])

  if (isLoading) {
    return null
  }

  return <ConnectedProfile {...props} utils={module.current} />
}
