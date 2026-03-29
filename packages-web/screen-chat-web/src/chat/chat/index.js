import isEmpty from 'lodash/isEmpty'
import { useEffect, useMemo, useRef, useState } from 'react'
import { connect } from 'react-redux'

import ScreenChat from './ScreenChat'

export default function ScreenChatComponent(props) {
  const [isLoading, setLoading] = useState(true)
  const module = useRef(undefined)

  const loadModules = async () => {
    // Parallel loading of all modules for better performance
    const [
      store,
      utils,
      services,
      { appcore },
      { ActionFilter },
      { mobile },
      { connectActionSheet },
      reactNativeElements,
      reactNativePaper,
      Clipboard,
      Alert,
      Geolocation,
      { getDocumentAsync },
      imagePicker,
      { parse }
    ] = await Promise.all([
      import('app-store-web'),
      import('app-utils-web'),
      import('app-services-web'),
      import('app-core-web'),
      import('app-controller-web'),
      import('app-mobile-web'),
      import('@expo/react-native-action-sheet'),
      import('react-native-elements'),
      import('react-native-paper'),
      import('@react-native-clipboard/clipboard'),
      import('@blazejkustra/react-native-alert'),
      import('@react-native-community/geolocation'),
      import('expo-document-picker'),
      import('expo-image-picker'),
      import('exifr/src/core.mjs')
    ])

    // Single assignment instead of multiple spreads
    module.current = {
      store,
      withRouter: utils.withRouter,
      theme: utils.theme,
      t: utils.t,
      matchPath: utils.matchPath,
      moment: utils.moment,
      chatServiceGet: services.chatServiceGet,
      chatServicePost: services.chatServicePost,
      AppData: services.AppData,
      init: services.init,
      testResponse: appcore.testResponse,
      convertRequestWeb: appcore.convertRequestWeb,
      errorTextResponse: appcore.errorTextResponse,
      convertRequest: appcore.convertRequest,
      ActionFilter,
      mobile,
      connectActionSheet,
      Icon: reactNativeElements.Icon,
      SearchBar: reactNativeElements.SearchBar,
      Button: reactNativePaper.Button,
      Dialog: reactNativePaper.Dialog,
      Modal: reactNativePaper.Modal,
      Paragraph: reactNativePaper.Paragraph,
      Portal: reactNativePaper.Portal,
      ProgressBar: reactNativePaper.ProgressBar,
      TextInput: reactNativePaper.TextInput,
      Clipboard: Clipboard.default,
      Alert: Alert.default,
      Geolocation: Geolocation.default,
      getDocumentAsync,
      requestMediaLibraryPermissionsAsync: imagePicker.requestMediaLibraryPermissionsAsync,
      launchImageLibraryAsync: imagePicker.launchImageLibraryAsync,
      parse: parse
    }
  }

  useEffect(() => {
    loadModules().then(() => setLoading(false))
  }, [])

  // Memoize the connected component to prevent recreation on every render
  const ScreenChatWithProps = useMemo(() => {
    if (isLoading || !module.current) return null

    const { store, withRouter, connectActionSheet } = module.current

    const mapStateToProps = state => ({
      categories: store.catSelector.getCategories(state),
      filter: store.filterSelector.getFilter(state),
      user: store.userSelector.getUser(state),
      currentCategory: store.filterSelector.getSelectCategory(state),
      hobby: store.chatSelector.getHobby(state),
      hotels: store.chatSelector.getHotels(state),
      places: store.chatSelector.getPlaces(state),
      countries: store.countriesSelector.getAllCountries(state),
      agent: store.countriesSelector.getAllAgent(state),
      shareData: store.chatSelector.getShareData(state),
      shareDataNotAuth: store.chatSelector.getShareDataNotAuth(state),
      openDialogHotel: store.appSelector.getOpenDialogHotel(state),
      themes: store.chatSelector.getCountries(state),
      chatTheme: store.chatSelector.getChatTheme(state),
      appCount: store.appSelector.getAppCount(state),
      ratingCategories: store.ratingSelector.getCriteria(state),
      messagesOffline: store.messagesSelector.getMessagesOffline(state),
      images: store.chatSelector.getChatImages(state),
      chatRendered: store.chatSelector.getChatRendered(state),
      replyMessage: store.chatSelector.getChatReplyMessage(state),
      images360: store.chatSelector.getChatImages360(state),
      openIdMessage: store.chatSelector.getChatOpenIdMessage(state),
      myRatingLocal: store.ratingSelector.getMyRatingLocal(state),
      myRatingServer: store.ratingSelector.getMyRatingServer(state),
      messages: store.chatSelector.getChatMessages(state),
      selectHotel: store.filterSelector.getSelectHotel(state),
      selectPlace: store.filterSelector.getSelectPlace(state),
      agreement: store.appSelector.getChatAgreement(state),
      fcmToken: store.userSelector.getFcmToken(state),
      expoToken: store.userSelector.getExpoToken(state),
      device: store.appSelector.getDevice(state)
    })

    const mapDispatchToProps = dispatch => ({
      setAgent: data => dispatch(store.chatAction.setAgent(data)),
      setCountries: data => dispatch(store.chatAction.setCountries(data)),
      setInitData: data => {
        if (!isEmpty(data.chat?.agent)) {
          dispatch(store.chatAction.setAgent(data.chat.agent))
        }
        if (!isEmpty(data.filter)) {
          dispatch(store.filterAction.setFilter(data.filter))
        }
      },
      setFilter: data => dispatch(store.filterAction.setFilter(data)),
      setHotels: data => dispatch(store.chatAction.setHotels(data)),
      setPlaces: data => dispatch(store.chatAction.setPlaces(data)),
      setHobby: data => dispatch(store.chatAction.setHobby(data)),
      setShareData: data => dispatch(store.chatAction.setShareData(data)),
      setOpenDialogHotel: data => dispatch(store.appAction.setOpenDialogHotel(data)),
      setChatTheme: data => dispatch(store.chatAction.setChatTheme(data)),
      setAppCount: data => dispatch(store.appAction.setAppCount(data)),
      setMessagesOffline: data => dispatch(store.messagesAction.setMessagesOffline(data)),
      setModalTheme: (visible, data) => dispatch(store.chatAction.setModalTheme(visible, data)),
      setChatImages: data => dispatch(store.chatAction.setChatImages(data)),
      setChatMessages: data => dispatch(store.chatAction.setChatMessages(data)),
      setChatMessagesOld: data => dispatch(store.chatAction.setChatMessagesOld(data)),
      setChatMessagesNew: data => dispatch(store.chatAction.setChatMessagesNew(data)),
      setChatRendered: data => dispatch(store.chatAction.setChatRendered(data)),
      setChatScrollToBottom: data => dispatch(store.chatAction.setChatScrollToBottom(data)),
      setChatCountNewMessages: data => dispatch(store.chatAction.setChatCountNewMessages(data)),
      setChatReplyMessage: data => dispatch(store.chatAction.setChatReplyMessage(data)),
      setChatImages360: data => dispatch(store.chatAction.setChatImages360(data)),
      setChatSendMessage: data => dispatch(store.chatAction.setChatSendMessage(data)),
      setChatOpenIdMessage: data => dispatch(store.chatAction.setChatOpenIdMessage(data)),
      setChatTextMessage: data => dispatch(store.chatAction.setChatTextMessage(data)),
      changeMyRatingLocal: data => dispatch(store.ratingAction.changeMyRatingLocal(data)),
      setSelectHotel: data => dispatch(store.filterAction.setSelectHotel(data)),
      setSelectPlace: data => dispatch(store.filterAction.setSelectPlace(data)),
      setAllHobby: data => dispatch(store.countriesAction.setAllHobby(data)),
      setHeaderParams: data => dispatch(store.headerAction.setHeaderParams(data)),
      setFooterBar: data => dispatch(store.nappAction.setFooterBar(data)),
      setModalFilter: data => dispatch(store.chatAction.setModalFilter(data)),
      setModalUser: data => dispatch(store.chatAction.setModalUser(data)),
      setModalContact: data => dispatch(store.chatAction.setModalContact(data)),
      setHeightInput: data => dispatch(store.chatAction.setHeightInput(data))
    })

    return connectActionSheet(withRouter(connect(mapStateToProps, mapDispatchToProps)(ScreenChat)))
  }, [isLoading])

  if (isLoading || !ScreenChatWithProps) {
    return null
  }

  return <ScreenChatWithProps {...props} utils={module.current} />
}
