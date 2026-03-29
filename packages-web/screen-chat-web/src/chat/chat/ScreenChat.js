import isEmpty from 'lodash/isEmpty'
import { Component } from 'react'
import { ActivityIndicator, Alert, Appearance, Dimensions, Platform, Text, View } from 'react-native'

import ChatFooter from '../components/footer'
import Message from '../components/message'
import NotifyButton from '../components/notify'
import ReplyMessage from '../components/reply'
import ModalYoutube from '../components/youtube'
import ChatContent from '../content'
import chatModel from '../model/chatModel'
import getData from '../model/getData'
import onEvents from '../model/onEvents'

const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
const { getOpenCurrentMessageId, getStartAppChat, setStartAppChat, setOpenCurrentMessageId, getSafeAreaInsets } = GLOBAL_OBJ.onlinetur.storage
const { MAIN_COLOR } = GLOBAL_OBJ.onlinetur.constants

// Константы для избегания магических чисел
const APP_COUNT_LIMIT = 2
const MODAL_DELAY = 600
const SHARE_DELAY = 1000

class ScreenChat extends Component {
  constructor(props) {
    super(props)

    // Инициализация моделей
    Object.assign(this, new getData(this, this.props.utils))
    Object.assign(this, new onEvents(this, this.props.utils))
    Object.assign(this, new chatModel(this, this.props.utils))

    // Начальное состояние
    this.state = this.getInitialState()

    // Привязка методов
    // this.bindMethods()

    // Инициализация переменных экземпляра
    this.initializeInstanceVariables()
  }

  // Вынесено для читаемости
  getInitialState = () => ({
    newMessages: [],
    first_id: '-1',
    oldMessageId: '-1',
    newMessageId: '-1',
    setBottomOffset: false,
    modalIsOpen: false,
    img360: null,
    isErrorServer: false,
    isErrorServerText: '',
    isEditMessage: false,
    editMessage: null,
    textEdit: '',
    isDeleteMessage: false,
    deleteMessage: null,
    menuComponent: null,
    hashtag: null,
    openAlert: false,
    titleAlert: '',
    bodyAlert: '',
    image_min: [],
    selected: new Map(),
    favorite: new Map(),
    geo: new Map(),
    bubble: null,
    warningMessage: null,
    isWarningMessage: false,
    currentMessage: null,
    textMessage: '',
    complainMessage: null,
    isComplainMessage: true,
    complainDialog: false,
    textComplain: '',
    share: null,
    openYoutube: false,
    openYoutubeLink: '',
    openContacts: false,
    location: {},
    isFilterOpen: false,
    hotels: [],
    places: [],
    bgColor: '#e2efea',
    txtColor: '#000000',
    img360upload: false,
    visibleRequest: false,
    openSearch: false,
    notifyEnabled: false,
    openGeo: false,
    showLoading: false,
    searchText: '',
    isModalBGTransparent: true,
    isModalBGBlurred: false,
    visibleModal: false,
    isActionOpen: false,
    isContactOpen: false,
    isVisibleDialog: false,
    textVisibleDialog: '',
    objectVisibleDialog: null,
    openFab: false,
    isActionSelectOpen: false,
    actionPromo: null,
    isAdd: 0,
    currentAction: null,
    action: null,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    isOpenDialog: false,
    imgPDFupload: false,
    viewMessage: {},
    viewModalMessage: false,
    viewType: '',
    openReplayMessage: false,
    progress: 0,
    geoFilter: '',
    search: '',
    heightInputToolbar: 0
  })

  initializeInstanceVariables() {
    this.startShare = false
    this.shareDataView = {}
    this.isBGState = false
    this.interval = null
    this.viewOpenDialogHotel = false
    this.loadWhileNewMessage = false
  }

  // Оптимизация shouldComponentUpdate
  shouldComponentUpdate(nextProps, nextState) {
    const { chatRendered, filter } = this.props
    const { visibleModal, share, openSearch, notifyEnabled } = this.state

    // Сравниваем только релевантные поля
    if (chatRendered !== nextProps.chatRendered) return true
    if (visibleModal !== nextState.visibleModal) return true
    if (share !== nextState.share) return true
    if (filter !== nextProps.filter) return true
    if (openSearch !== nextState.openSearch) return true
    if (notifyEnabled !== nextState.notifyEnabled) return true

    return false
  }

  componentDidMount = async () => {
    const { pathname } = this.props
    this.setFooter()
    this.getParamsComponent()
    await this.openChatWithFilter(pathname)

    GLOBAL_OBJ.onlinetur.currentComponent = this
  }

  componentDidUpdate = async (prevProps, prevState) => {
    const { shareData, pathname, filter, user } = this.props
    const { share } = this.state

    // Оптимизированная проверка обновления чата
    if (this.hasFilterChanged(prevProps.filter, filter)) {
      await this.actionComponentDidUpdate(prevProps, prevState)
    }

    // Обработка share данных
    this.handleShareData(shareData, user)

    if (pathname !== prevProps.pathname && !isEmpty(this.shareDataView)) {
      this.handleShareView()
    }
  }

  // Вспомогательные методы
  hasFilterChanged(oldFilter, newFilter) {
    return Object.keys(newFilter).some(key => oldFilter[key] !== newFilter[key])
  }

  handleShareData(shareData, user) {
    if (!this.startShare && shareData.length > 0 && user?.id_user) {
      this.startShare = true
      setTimeout(() => this.sendShareToCurrentChat(), SHARE_DELAY)
    }
  }

  handleShareView() {
    this.startShare = true
    setTimeout(() => this.sendShareToCurrentChat(this.shareDataView), SHARE_DELAY)
  }

  // Оптимизированные методы
  initChat = async () => {
    const { setChatMessages, setChatRendered } = this.props

    this.setState(
      {
        newMessages: [],
        first_id: '-1',
        oldMessageId: '-1',
        newMessageId: '-1'
      },
      () => {
        setChatRendered(false)
        setChatMessages([])
      }
    )
  }

  loadingMessages = async (id_message, next, endMess = null) => {
    await this.setLastMessages(id_message)
    await this.setOldMessages(false, true)
    return true
  }

  initLoadData = async () => {
    const { matchPath, chatServiceGet } = this.props.utils
    const { user, filter, openDialogHotel, pathname, chatTheme, appCount, setAppCount, setOpenDialogHotel, setModalTheme, setChatRendered, setChatCountNewMessages, setChatOpenIdMessage } = this.props

    let id_message = getOpenCurrentMessageId()
    const next = id_message !== -1 ? 1 : 0
    const match = matchPath(pathname, { path: ['/y/:y/h/:h'], exact: true, strict: false })

    this.handleDialogHotel(match, openDialogHotel, setOpenDialogHotel)

    if (!isEmpty(user)) {
      await this.loadUserData(user, filter, id_message, next, chatServiceGet, setChatCountNewMessages, setChatOpenIdMessage)
    } else {
      await this.loadGuestData()
    }

    setChatRendered(true)
    setOpenCurrentMessageId(-1)
    this.loadWhileNewMessage = true

    this.handlePostLoadActions(pathname, filter, user, chatTheme, appCount, setAppCount, setModalTheme)
  }

  handleDialogHotel(match, openDialogHotel, setOpenDialogHotel) {
    if (!match && (openDialogHotel || openDialogHotel === undefined) && !this.viewOpenDialogHotel) {
      this.openDialogHotel()
      setOpenDialogHotel(false)
      this.viewOpenDialogHotel = true
    }
  }

  async loadUserData(user, filter, id_message, next, chatServiceGet, setChatCountNewMessages, setChatOpenIdMessage) {
    const chats = await chatServiceGet.getInfoChat(
      user.device.token,
      user.android_id_install,
      filter.selectedCountry,
      filter.selectedHotel !== '-1' ? filter.selectedHotel * 1 + 100000 : '-1',
      filter.chatAgent ? filter.selectedAgent : filter.selectedHobby,
      filter.chatAgent ? 1 : 0
    )

    if (chats?.code === 0 && chats.count_new > 0) {
      setChatCountNewMessages(chats.count_new)
      setChatOpenIdMessage(true)
    }

    await this.loadingMessages(id_message !== -1 ? id_message : null, next)
    this.setState({ notifyEnabled: !!chats?.notyf_enabled })
  }

  async loadGuestData() {
    await this.setLastMessages()
    await this.setOldMessages(false, true)
  }

  handlePostLoadActions(pathname, filter, user, chatTheme, appCount, setAppCount, setModalTheme) {
    setTimeout(() => {
      const match = this.props.utils.matchPath(pathname, {
        path: ['/y/:y/h/:h/v/:v', '/y/:y', '/a/:a', '/y/:y/v/:v'],
        exact: true,
        strict: false
      })

      const params = match?.params || {}

      if (params.v === '1' || pathname.includes('/v/1')) {
        if (filter.selectedHotel !== '-1' && user?.hotels_user?.includes(Number(filter.selectedHotel) + 100000)) {
          this.openModalAction()
        }
      } else if (params.v === '2' || pathname.includes('/v/2')) {
        this.openModalAction()
      } else if ((params.y || params.a) && chatTheme !== 1 && !getStartAppChat() && appCount < APP_COUNT_LIMIT) {
        setModalTheme(true, {})
        setStartAppChat(false)
        setAppCount(appCount + 1)
      }
    }, MODAL_DELAY)
  }

  // Оптимизированные модальные методы
  openModalFilter = (viewType, geo = '', location = null) => {
    const { setModalFilter } = this.props
    GLOBAL_OBJ.onlinetur.currentComponent = this
    setModalFilter({ isFilterOpen: true, viewType, visibleModal: true, geoFilter: geo, location })
  }

  closeModalFilter = () => this.setState({ visibleModal: false, isFilterOpen: false })

  openModalAction = (action = null, currentAction = null, isAdd = 0) => {
    this.setState({ isActionOpen: true, currentAction, isAdd, action }, () => {
      this.setState({ visibleModal: true })
    })
  }

  closeModalAction = () => this.setState({ visibleModal: false, isActionOpen: false, currentAction: null, isAdd: 0, action: null })

  openModalContact = () => {
    const { setModalContact } = this.props
    GLOBAL_OBJ.onlinetur.currentComponent = this
    setModalContact({ visibleModal: true, isContactOpen: true })
  }

  closeModalContact = () => this.setState({ visibleModal: false, isContactOpen: false })

  openModalActionSelect = actionPromo => {
    this.setState({ isActionSelectOpen: true, actionPromo }, () => {
      this.setState({ visibleModal: true })
    })
  }

  closeModalActionSelect = () => this.setState({ visibleModal: false, isActionSelectOpen: false, actionPromo: null })

  onSelectThemes = (theme, sotr = false, type = 0) => {
    const { AppData } = this.props.utils
    const { filter, history, setHotels, setFilter, countries, user, setPlaces, chatTheme, setChatTheme, currentCategory } = this.props

    this.setState({ visibleModal: false }, async () => {
      const android_id_install = user.device ? user.android_id_install : ''
      const themeId = theme.id

      if (type !== 2) {
        const [hotels, places] = await Promise.all([
          AppData.setAppHotelsWithPage(countries, android_id_install, themeId, 0, 100, currentCategory.id),
          AppData.setAppPlacesBackground(countries, themeId, android_id_install, currentCategory.id)
        ])

        if (hotels) setHotels(hotels)
        if (places) setPlaces(places)
      }

      const newFilter = { ...filter }
      let url

      if (sotr && type === 1) {
        newFilter.selectedCountry = themeId
        newFilter.selectedCountryName = theme.title
        newFilter.chatAgent = false
        newFilter.selectedAgent = '-1'
        newFilter.selectedAgentName = ''
        url = `/y/${themeId}`
      } else if (sotr) {
        newFilter.chatAgent = true
        newFilter.selectedAgent = themeId
        newFilter.selectedAgentName = theme.title
        url = `/a/${themeId}`
      } else {
        newFilter.selectedCountry = themeId
        newFilter.selectedCountryName = theme.title
        newFilter.chatAgent = false
        newFilter.selectedAgent = '-1'
        newFilter.selectedAgentName = ''
        url = `/y/${themeId}`
      }

      if (!chatTheme) setChatTheme(1)
      setFilter(newFilter)
      history(url)
    })
  }

  updateChat = (oldFilter, newFilter) => {
    return Promise.resolve(this.hasFilterChanged(oldFilter, newFilter))
  }

  handlerViewMessage = currentMessage => {
    const { setModalUser } = this.props
    setModalUser({
      viewModalMessage: !!currentMessage.id,
      viewMessage: currentMessage
    })
  }

  updateSearch = text => this.setState({ search: text })

  onSubmitEditing = () => {
    const { setFilter, filter } = this.props
    const { search } = this.state
    const newFilter = { ...filter, searchFav: search || '' }
    setFilter(newFilter)
  }

  onSelectContact = (item, phone) => {
    const { t } = this.props.utils

    Alert.alert(t('common.attention'), t('chat.model.onEvents.addContact'), [
      { text: t('common.cancel'), style: 'destructive' },
      {
        text: t('common.yes'),
        onPress: async () => {
          const contact = {
            name: `${item.item.familyName} ${item.item.givenName}`,
            phones: [phone]
          }

          await this.onSend([{ text: '', contact: JSON.stringify(contact) }])
          this.setState({ openContacts: false, isContactOpen: false })
        }
      }
    ])
  }

  getParamsComponent = () => {
    const { t } = this.props.utils
    const { ratingCategories, chatRendered, bot, setHeaderParams } = this.props
    const { openSearch, notifyEnabled } = this.state

    setHeaderParams({
      screen: bot ? 'chat_bot' : 'chat',
      title: bot ? 'Чат с ботом' : undefined,
      openSearch,
      onOpenSearch: this.onOpenSearch,
      onClearSearch: this.onClearSearch,
      onSubmitEditingWeb: this.onSubmitEditingWeb,
      placeholder: t('components.header.appheader.search'),
      openModalFilter: this.openModalFilter,
      setNotifyEnabled: this.setNotifyEnabled,
      notifyEnabled,
      messagesLength: 0,
      chatRendered,
      ratingCategories
    })
  }

  setFooter = () => this.props.setFooterBar({})

  // Методы рендеринга
  renderMessage = (messageProps, index) => {
    const { history } = this.props
    const { selected, favorite, geo } = this.state
    const { currentMessage } = messageProps
    const messageId = currentMessage._id

    delete messageProps.key

    return (
      <Message
        {...messageProps}
        selected={selected.get(messageId)}
        favorite={favorite.get(messageId)}
        geo={geo.get(messageId)}
        history={history}
        showActionSheetWithOptions={this.props.showActionSheetWithOptions}
        onChatUser={this.onChatUser}
        onClipboardSetString={this.onClipboardSetString}
        onComplainMessage={this.onComplainMessage}
        onBlockUser={this.onBlockUser}
        handlerViewMessage={this.handlerViewMessage}
        onPressHashtag={this.onPressHashtag}
        onPressCoord={this.onPressCoord}
        openImages={this.openImages}
        contactCard={this.contactCard}
      />
    )
  }

  renderReplyMessage = props => {
    const { history, setChatOpenIdMessage } = this.props
    return <ReplyMessage {...props} onRefreshChat={this.onRefreshChat} history={history} replyMessageView={props.currentMessage} setChatOpenIdMessage={setChatOpenIdMessage} />
  }

  // hideInputToolbar = () => {
  //   const { pathname, filter, hobby, ratingCategories, replyMessage } = this.props
  //   const url = compact(split(pathname, '/'))
  //
  //   // Проверка ratingCategories
  //   if (ratingCategories?.length) {
  //     const curHobby = hobby.find(item => item.id === filter.selectedHobby)
  //     if (curHobby && ratingCategories.some(cat => cat.chat?.includes(`/b/${curHobby.id}`))) {
  //       return false
  //     }
  //   }
  //
  //   // Проверка URL и других условий
  //   if (url[0] === 'b' && !replyMessage.replyId) return true
  //
  //   const curHobby = hobby.find(item => item.id === filter.selectedHobby)
  //   return !!(curHobby?.tip_price === 1)
  // }

  renderLoading = () => {
    const { theme } = this.props.utils
    const isDarkMode = Appearance.getColorScheme() === 'dark'
    const backgroundColor = isDarkMode ? theme.dark.colors.background : theme.light.colors.background

    return (
      <View style={{ flex: 1, backgroundColor, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  render() {
    const { theme, SearchBar, t, Dialog, Paragraph, Button, Portal, TextInput, Icon } = this.props.utils
    const {
      // modalIsOpen,
      // img360,
      // imagesView,
      // openAlert,
      // openMenu,
      // optionsMenu,
      openYoutube,
      openYoutubeLink,
      // currentMessage,
      openSearch,
      notifyEnabled,
      isVisibleDialog,
      textVisibleDialog,
      objectVisibleDialog,
      // width,
      // viewModalMessage,
      complainDialog,
      textComplain,
      // isEditMessage,
      // editMessage,
      // textEdit,
      search
      // heightInputToolbar
    } = this.state
    const { history, places, countries, filter, user, ratingCategories, chatRendered, messages } = this.props

    const isDarkMode = Appearance.getColorScheme() === 'dark'
    const bgColor = isDarkMode ? theme.dark.colors.background : theme.light.colors.background
    const textColor = isDarkMode ? theme.dark.colors.text : theme.light.colors.text

    const chatProps = {
      // giftedChat: this.giftedChat,
      // onSend: this.onSend,
      onEndReached: this.onEndReached,
      // onStartReached: this.onStartReached,
      renderMessage: this.renderMessage,
      // renderChatFooter: this.renderChatFooter,
      // onPressReplyMessage: this.onPressReplyMessage,
      // renderReplyMessage: this.renderReplyMessage,
      onPressHashtag: this.onPressHashtag
      // onHotelOpen: this.onHotelOpen,
      // onPressCoord: this.onPressCoord,
      // renderActions: this.renderActions,
      // openImages: this.openImages,
      // onPressRowLike: this.onPressRowLike,
      // onPressMessage: this.onPressMessage,
      // onEditMyMessage: this.onEditMyMessage,
      // onDelMyMessage: this.onDelMyMessage,
      // onComplainMessage: this.onComplainMessage,
      // onBlockUser: this.onBlockUser,
      // onWarningMessage: this.onWarningMessage,
      // onBanMessage: this.onBanMessage,
      // onOpenZagrebon: this.onOpenZagrebon,
      // contactCard: this.contactCard,
      // onRefreshChat: this.onRefreshChat,
      // onMoveToFav: this.onMoveToFav,
      // onChatUser: this.onChatUser,
      // onPressResponse: this.onPressResponse,
      // onPressAvatar: this.onPressAvatar,
      // webAlerter: this.webAlerter,
      // openModalActionSelect: this.openModalActionSelect,
      // openModalAction: this.openModalAction,
      // handlerViewMessage: this.handlerViewMessage,
      // hideInputToolbar: this.hideInputToolbar,
      // renderLoading: this.renderLoading,
      // setTextChat: this.setTextChat,
      // onClipboardSetString: this.onClipboardSetString,
      // androidBottom: getSafeAreaInsets().bottom,
      // heightInputToolbar
    }

    return (
      <>
        {openSearch && (
          <SearchBar
            placeholder={t('components.header.appheader.request')}
            onChangeText={this.updateSearch}
            value={search || filter?.searchFav || ''}
            platform="ios"
            containerStyle={{ backgroundColor: 'transparent' }}
            inputContainerStyle={{ backgroundColor: '#fff' }}
            showCancel
            cancelButtonTitle={t('common.close')}
            inputStyle={{ backgroundColor: 'transparent', color: '#000' }}
            onCancel={() => this.onOpenSearch(!openSearch)}
            onSubmitEditing={this.onSubmitEditing}
            lightTheme
            keyboardType="web-search"
            searchIcon={<Icon name="search" color="#ccc" />}
          />
        )}

        <ChatContent text={this.props.text} chatProps={chatProps} />

        {!isEmpty(user) && chatRendered && filter.selectedFav !== '1' && messages.length < 2 && <NotifyButton notifyEnabled={notifyEnabled} setNotifyEnabled={this.setNotifyEnabled} />}

        {chatRendered && (
          <ChatFooter
            country={Number(filter.selectedCountry)}
            hotel={Number(filter.selectedHotel)}
            hotelName={filter.selectedHotelName}
            hobby={Number(filter.selectedHobby)}
            place={Number(filter.selectedPlace)}
            messages={messages}
            chatRendered={chatRendered}
            user={user}
            filter={filter}
            countries={countries}
            places={places}
            ratingCategories={ratingCategories}
            history={history}
          />
        )}

        {openYoutube && <ModalYoutube visible={openYoutube} onCancel={this.onCancelYoutube} openYoutubeLink={openYoutubeLink} />}

        {isVisibleDialog && (
          <Dialog visible={isVisibleDialog} onDismiss={() => this.setState({ isVisibleDialog: false, textVisibleDialog: '' })} style={{ width: 500, alignSelf: 'center', backgroundColor: bgColor }}>
            <Dialog.Title style={{ color: textColor }}>{t('common.attention')}</Dialog.Title>
            <Dialog.Content>
              <Paragraph>{textVisibleDialog}</Paragraph>
            </Dialog.Content>
            <Dialog.Actions>
              {objectVisibleDialog?.actionMessage && (
                <Button onPress={() => objectVisibleDialog.sendBronRequest(objectVisibleDialog.actionMessage)} style={{ marginRight: 20 }}>
                  {t('common.yes')}
                </Button>
              )}
              <Button onPress={() => this.setState({ isVisibleDialog: false, textVisibleDialog: '', objectVisibleDialog: null })} mode="contained" style={{ backgroundColor: 'red' }}>
                {t('common.cancel')}
              </Button>
            </Dialog.Actions>
          </Dialog>
        )}

        {complainDialog && (
          <Portal>
            <Dialog visible={complainDialog} onDismiss={() => this.setState({ complainDialog: false })} style={{ borderRadius: 10, top: -120, backgroundColor: bgColor }}>
              <Dialog.Title>{t('common.attention')}</Dialog.Title>
              <Dialog.Content>
                <Text style={{ fontSize: 16, marginBottom: 15, color: textColor }}>{t('common.complain')}</Text>
                <TextInput
                  mode="outlined"
                  value={textComplain}
                  onChangeText={text => this.setState({ textComplain: text })}
                  underlineColor="transparent"
                  selectionColor={MAIN_COLOR}
                  activeUnderlineColor="transparent"
                />
              </Dialog.Content>
              <Dialog.Actions>
                <Button onPress={() => this.setState({ complainDialog: false })}>{t('common.cancel')}</Button>
                <Button
                  onPress={() => {
                    this.setState({ complainDialog: false }, this.sendComplainMessage)
                  }}>
                  {t('common.send')}
                </Button>
              </Dialog.Actions>
            </Dialog>
          </Portal>
        )}
      </>
    )
  }
}

export default ScreenChat
