// import Clipboard from '@react-native-clipboard/clipboard'
// import { AlertWeb, Mobile, Storage } from 'app-core'
// import { AppData, chatServiceGet, chatServicePost } from 'app-services'
// import { store } from 'app-store'
// import { t } from 'app-utils'
import isEmpty from 'lodash/isEmpty'
import isObject from 'lodash/isObject'
import { Dimensions, Keyboard, Linking, Platform, Share } from 'react-native'

import Send from '../send/Send'

const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
const { setMessagesIds, getAppConstants, getAppConfig, getSafeAreaInsets } = GLOBAL_OBJ.onlinetur.storage
const { HEIGHT_INPUT } = GLOBAL_OBJ.onlinetur.constants

class onEvents {
  constructor(component, props) {
    this.c = component
    this.rootprops = props
  }

  onBanMessage = async banMessage => {
    const { AppData, t, Alert } = this.rootprops

    if (Platform.OS === 'web') {
      await AppData.setBanMessage(this.c, banMessage)
    } else {
      const txt = banMessage.is_ban === 0 ? t('chat.model.onEvents.userBan') : t('chat.model.onEvents.userNotBan')

      Alert.alert(t('common.attention'), t('common.youWant') + txt, [
        { text: t('common.cancel'), style: 'destructive' },
        { text: t('common.yes'), onPress: async () => await AppData.setBanMessage(this.c, banMessage) }
      ])
    }
  }

  onOpenZagrebon = async id => {
    if (Platform.OS === 'web') {
      Linking.openURL('https://zagrebon.com/api/add/' + id, '_blank')
    } else {
      Linking.openURL('https://zagrebon.com/api/add/' + id, '_blank')
    }
  }

  onEditMyMessage = currentMessage => {
    const { Alert, t } = this.rootprops

    if (!currentMessage.is_owner) {
      Alert.alert(t('common.attention'), t('common.notEdit'))

      return
    }

    this.c.setState({ isEditMessage: true, editMessage: currentMessage }, () => {
      this.c.props.setChatTextMessage(currentMessage.text !== '' ? currentMessage.text : '- нет текста -')
    })
  }

  onDelMyMessage = currentMessage => {
    const { Alert, t } = this.rootprops

    const { user } = this.c.props

    if (user.is_admin !== 1 && !currentMessage.is_owner) {
      Alert.alert(t('common.attention'), t('common.notRemove'))

      return
    }

    this.c.setState(
      {
        deleteMessage: currentMessage,
        isDeleteMessage: true
      },
      () => {
        Alert.alert(t('common.attention'), user.is_admin === 1 ? t('common.messageDeleteAdm') : t('common.messageDelete'), [
          {
            text: t('common.cancel'),
            style: 'destructive',
            onPress: () =>
              this.c.setState({
                deleteMessage: null,
                isDeleteMessage: false
              })
          },
          {
            text: t('common.yes'),
            onPress: () => this.c.onSend()
          }
        ])
      }
    )
  }

  onComplainMessage = currentMessage => {
    const { Alert, t } = this.rootprops

    this.c.setState(
      {
        complainMessage: currentMessage,
        isComplainMessage: true
      },
      () => {
        Alert.alert(t('common.attention'), t('common.complain'), [
          {
            text: t('common.cancel'),
            style: 'destructive',
            onPress: () =>
              this.c.setState({
                deleteMessage: null,
                isDeleteMessage: false
              })
          },
          {
            text: t('common.yes'),
            onPress: () => this.c.sendComplainMessage()
          }
        ])
      }
    )
  }

  onBlockUser = id => {
    const { Alert, t, chatServiceGet } = this.rootprops

    const { user } = this.c.props

    Alert.alert(t('containers.bubble.block'), t('common.block'), [
      {
        text: t('common.no'),
        style: 'destructive'
      },
      {
        text: t('common.yes'),
        onPress: async () => {
          let res = await chatServiceGet.fetchBlock(user.device.token, user.android_id_install, id)

          if (res.code === 0) {
            Alert.alert(t('common.attention'), t('common.blockSuccess'))
          }
        }
      }
    ])
  }

  onWarningMessage = async warningMessage => {
    const { Alert, AppData, t } = this.rootprops

    let txt1 = warningMessage.is_warning === 0 ? t('common.warnOn') : t('common.warnOff')

    Alert.alert(t('common.attention'), t('common.youWant') + txt1 + t('common.warnText'), [
      { text: t('common.cancel'), style: 'destructive' },
      {
        text: t('common.yes'),
        onPress: async () => {
          await AppData.setWarningMessage(this.c, warningMessage)
        }
      }
    ])
  }

  openFile = async () => {
    const { Alert, getDocumentAsync } = this.rootprops
    const { setChatImages, setChatImages360 } = this.c.props

    try {
      const pickerResult = await getDocumentAsync({})

      if (pickerResult.canceled) {
        return
      }

      if (pickerResult.assets[0].mimeType !== 'application/pdf') {
        Alert.alert('Ошибка!', 'Вы выбрали не PDF файл.')

        return
      }

      this.c.setState(
        {
          imgPDFupload: true
        },
        () => {
          setChatImages([
            {
              mime: pickerResult.assets[0].mimeType,
              uri: pickerResult.assets[0].uri,
              type: pickerResult.assets[0].mimeType,
              name: pickerResult.assets[0].name,
              base64: pickerResult.assets[0].base64
            }
          ])
          setChatImages360(null)
        }
      )
    } catch (e) {
      console.error('error', e)
    }
  }

  onPressAction = setViewCamera => {
    const { t, mobile, Alert } = this.rootprops

    const { images, replyMessage } = this.c.props

    let options = [
      t('chat.model.onEvents.gallery'),
      t('chat.model.onEvents.picture360'),
      t('chat.model.onEvents.camera'),
      t('chat.model.onEvents.video'),
      t('chat.model.onEvents.contact'),
      t('chat.model.onEvents.addPdf'),
      t('chat.model.onEvents.cancel')
    ]
    const cancelButtonIndex = options.length - 1

    let stBottom = 45
    // Platform.OS !== 'web' ? getSafeAreaInsets().bottom : images.length > 0 ? 40 : replyMessage && replyMessage.replyId ? 21 : 45

    this.c.props.showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
        showSeparators: true,
        containerStyle: { bottom: stBottom, margin: 0, padding: 0 },
        textStyle: { fontSize: 16 },
        cancelButtonTintColor: 'red'
      },
      async buttonIndex => {
        switch (buttonIndex) {
          case 0:
            mobile.getImagesVideo(this.c)
            break
          case 1:
            mobile.getImages360(this.c)
            break
          case 2:
            setViewCamera()
            break
          case 3:
            Alert.alert(
              'Внимание!',
              'Чтобы добавить видео в чат, загрузите свое видео на Youtube, Rutube, TIkTok или VK, потом скопируете ссылку на свое ' +
                'загруженное видео и отправляете эту ссылку в сообщении любого чата (можно к ссылке добавить любой текст). \n' +
                'Ваше видео будет показываться прямо из чата.'
            )
            break
          case 4:
            if (Platform.OS === 'web') {
              Alert.alert('Внимание!', 'Отображение контактов возможно только в мобильной версии.')
            } else {
              this.c.openModalContact()
            }
            break
          case 5:
            this.openFile().then()
            break
        }
      }
    )
  }

  onCancelYoutube = () => {
    this.c.setState({ openYoutube: false })
  }

  onCancelContacts = () => {
    this.c.setState({ openContacts: false })
  }

  onRefreshChat = () => {
    this.c.setState({ openReplayMessage: true }, async () => {
      await this.c.initChat()
      setMessagesIds()
      await this.c.initLoadData()
    })
  }

  onDropFile = picture => {
    const { setChatImages, setChatImages360 } = this.c.props
    const { img360upload } = this.c.state

    if (img360upload) {
      setChatImages360(picture)
    } else {
      setChatImages(picture)
    }
  }

  onCancelThemes = () => {
    this.c.setState({ visibleTheme: false })
  }

  onCancelAction = async () => {
    this.c.setState({ visibleAction: false })
  }

  onSelect = async theme => {
    const { history } = this.c.props
    let url = '/y/' + theme.id

    this.c.setState({ visibleTheme: false }, () => {
      history(url)
    })
  }

  // onViewableItemsChanged = ({ viewableItems, changed }) => {
  //   let array = []
  //   for (let i = 0; i < viewableItems.length; i++) {
  //     array.push(viewableItems[i].item.id)
  //   }
  //
  //   if (array.length > 0) {
  //     this.c.setState({ viewableItems: array })
  //   }
  // }

  onPressHashtag = async (hash, msg) => {
    const { chatServiceGet } = this.rootprops

    const { hobby, filter, history, places, countries, setFilter, pathname, user, setChatRendered, setSelectHotel, setSelectPlace } = this.c.props

    setChatRendered(false)

    const token = user && user.device && user.device.token ? user.device.token : ''
    const android_id_install = user && user.device && user.device.token ? user.android_id_install : ''

    if (hash.charAt(0) === '#' && hash.charAt(1) !== '_') {
      let data = Object.assign({}, filter)
      data.searchFav = hash

      setFilter(data)
      this.c.setState({ openSearch: true })
    } else if (hash.charAt(0) === '#' && hash.charAt(1) === '_') {
      const testhash = hash.replace('#_', '')
      let data = Object.assign({}, filter)

      if (pathname.indexOf('/mini') > -1) {
        return
      }

      for (let j = 0; j < hobby.length; j++) {
        if (hobby[j].title.toUpperCase() === testhash.replace(/_/g, ' ').toUpperCase()) {
          data.selectedHobby = hobby[j].id
          data.selectedHobbyName = hobby[j].title

          setFilter(data)
          history('/b/' + hobby[j].id, {
            state: {
              prevpath: pathname
            }
          })

          return
        }
      }

      for (let j = 0; j < places.length; j++) {
        if (places[j].name.toUpperCase() === testhash.replace(/_/g, ' ').toUpperCase()) {
          data.selectedHotel = '-1'
          data.selectedHotelName = ''
          data.selectedPlace = places[j].uid
          data.selectedPlaceName = places[j].name

          setFilter(data)
          setSelectPlace(places[j])
          history('/y/' + filter.selectedCountry + '/p/' + places[j].uid)

          return
        }
      }

      if (Number(msg.id_hotel) < 0) {
        const place = await chatServiceGet.getViewPlace(Number(msg.id_hotel) * -1 - 100000, android_id_install, token)

        data.selectedHotel = '-1'
        data.selectedHotelName = ''
        data.selectedPlace = Number(msg.id_hotel) * -1 - 100000
        data.selectedPlaceName = place.title
        data.selectedCountry = place.chat_c
        data.selectedCountryName = place.cn

        setFilter(data)
        setSelectPlace(place)
        history('/y/' + msg.id_post + '/p/' + (Number(msg.id_hotel) * -1 - 100000))

        return
      }

      for (let j = 0; j < countries.length; j++) {
        if (countries[j].title.toUpperCase() === testhash.replace(/_/g, ' ').toUpperCase()) {
          data.selectedHobby = '-1'
          data.selectedHobbyName = ''
          data.selectedHotel = '-1'
          data.selectedHotelName = ''
          data.selectedPlace = '-1'
          data.selectedPlaceName = ''
          data.selectedCountry = countries[j].id
          data.selectedCountryName = countries[j].title

          setFilter(data)

          if (!filter.chatAgent) {
            history('/y/' + countries[j].id)
          } else {
            history('/a/' + filter.selectedAgent + '/y/' + countries[j].id)
          }

          return
        }
      }

      const hotel = await chatServiceGet.getViewHotel(Number(msg.id_hotel) - 100000, android_id_install, token)

      if (hotel && hotel.id) {
        data.selectedHotel = Number(msg.id_hotel) - 100000
        data.selectedHotelName = hotel.title
        data.selectedPlace = '-1'
        data.selectedPlaceName = ''
        setFilter(data)

        setSelectHotel(hotel)
      } else {
        data.selectedHotel = Number(msg.id_hotel) - 100000
        data.selectedHotelName = 'Данные не найдены!'
        data.selectedPlace = '-1'
        data.selectedPlaceName = ''
        setFilter(data)
      }

      data.selectedCountry = msg.id_post
      data.selectedCountryName = msg.post_title

      if (!filter.chatAgent) {
        history('/y/' + msg.id_post + '/h/' + (Number(msg.id_hotel) - 100000))
      } else {
        history('/a/' + filter.selectedAgent + '/y/' + msg.id_post + '/h/' + (Number(msg.id_hotel) - 100000))
      }
    }
  }

  onHotelOpen = msg => {
    let urlHotel
    let url = getAppConstants().url_main

    if (msg.id_hotel > 0) {
      urlHotel = `${url}/bestt.php?i=ols${msg.id_hotel - 100000}&nsh=1&t=0;1`
    } else {
      urlHotel = `${url}/bestt.php?i=ols${msg.id_hotel - 100000}&t=C&nsh=1&t=0;1&l=2&t=0;0`
    }

    window.open(urlHotel, '_blank')
  }

  onPressCoord = async (bubble, currentMessage) => {
    const { Alert, t, mobile } = this.rootprops

    const { user, filter } = this.c.props

    if (filter.selectedCountry !== '-1' || filter.selectedHotel !== '-1' || filter.selectedPlace !== '-1') {
      if (currentMessage && currentMessage.user && user && user.id_user && currentMessage.user._id === user.id_user) {
        await mobile.sendCoord(this.c, bubble, currentMessage, user, this.rootprops)
      } else {
        Alert.alert(t('common.attention'), 'Вы не можете подтверждать не свое сообщение!')
      }
    } else {
      Alert.alert(t('common.attention'), t('chat.model.onEvents.confirm'))
    }
  }

  onEndReached = async () => {
    const { store } = this.rootprops

    const { oldMessageId } = this.c.state
    const state = store.getState()
    const { user } = this.c.props

    if (user.id_user) {
      if (state.chat.messages.length > 19 && oldMessageId !== -10000) {
        await this.c.setOldMessages(false, false, false)
      }
    }
  }

  onStartReached = async () => {
    const { store } = this.rootprops

    // const state = store.getState()
    // const { user } = this.c.props
    //
    // if (!isEmpty(user.device) && !state.chat.isBottomList) {
    //   await this.c.setNewMessages(state.chat.messages[state.chat.messages.length - 1].id)
    // }
  }

  onOpenSearch = openSearch => {
    const { filter, setFilter } = this.c.props

    this.c.setState({ openSearch: openSearch }, () => {
      let data = Object.assign({}, filter)

      data.searchFav = ''
      setFilter(data)
    })
  }

  onClearSearch = () => {
    const { filter, setFilter } = this.c.props

    let data = Object.assign({}, filter)

    data.searchFav = ''
    setFilter(data)
  }

  onSubmitEditingWeb = search => {
    const { setFilter, filter } = this.c.props
    let data = Object.assign({}, filter)

    data.searchFav = search
    setFilter(data)
  }

  onSubmitEditing = () => {
    const { setFilter, filter } = this.c.props
    const { searchText } = this.c.state
    let data = Object.assign({}, filter)

    data.searchFav = searchText
    setFilter(data)
  }

  onPressReplyMessage = message => {
    const { Alert, t } = this.rootprops

    const { setChatReplyMessage, filter } = this.c.props
    const { device } = this.c.props.user

    if (!device) {
      Alert.alert(t('common.attention'), t('common.notAuth'))

      return
    }

    const { _id, user, text, id_hotel, id_hobbi, id_post, image_min, hashtag } = message

    this.c.setState(
      {
        id_hotel: id_hotel ? id_hotel : -1,
        id_hobbi: id_hobbi ? id_hobbi : -1,
        id_post: id_post,
        image_min: image_min
      },
      () => {
        setChatReplyMessage({ replyId: _id, id_parent: user._id, name_parent: user.name, msg_parent: text, id_post: filter.chatAgent ? id_hobbi : id_post, data: message })
      }
    )
  }

  onInsertToChat = (obj, img = []) => {
    const { t, Alert } = this.rootprops

    const { setShareData, setChatImages, setModalTheme } = this.c.props

    let buttons = []
    let geo

    const curChat = {
      text: t('chat.model.onEvents.currentChat'),
      onPress: async () => {
        if (!isEmpty(obj)) {
          this.c.setShareText(obj)
        } else {
          this.c.startShare = false
          this.c.shareDataView = {}
          setChatImages(img)
        }
        setShareData([])
      }
    }

    const selectChat = {
      text: t('chat.model.onEvents.selectChat'),
      onPress: async () => {
        if (!isEmpty(obj)) {
          setModalTheme(true, {})
        } else {
          this.c.startShare = false
          this.c.shareDataView = {}
          setChatImages(img)
          setModalTheme(true, {})
        }
        setShareData([])
      }
    }

    if (Platform.OS !== 'web' && img[0].exifLatitude !== -1) {
      geo = {
        text: t('core.mobile.chatGeo'),
        onPress: async () => {
          let locations = {}

          locations.latitude = img[0].exifLatitude.toString()
          locations.longitude = img[0].exifLongitude.toString()

          setChatImages(img)
          this.c.setState({ location: locations }, async () => {
            await this.c.changeLocation(locations)
          })

          setShareData([])
        }
      }
    }

    const cancel = {
      text: t('common.cancel'),
      style: 'destructive',
      onPress: async () => {
        this.c.startShare = false
        this.c.shareDataView = {}

        setShareData([])
      }
    }

    if (Platform.OS === 'ios') {
      buttons.push(curChat)
      buttons.push(selectChat)

      if (geo) {
        buttons.push(geo)
      }

      buttons.push(cancel)
    } else {
      buttons.push(selectChat)

      if (geo) {
        buttons.push(geo)
      }

      buttons.push(curChat)
    }

    Alert.alert(t('common.addContent'), '', buttons)
  }

  onSend = async (message = null) => {
    const { Alert, store, t } = this.rootprops

    const state = store.getState()
    const { filter, user, setChatImages, setChatMessages, setChatReplyMessage, setChatImages360, setChatSendMessage, setHeightInput } = this.c.props
    const { isEditMessage, editMessage, menuComponent, isDeleteMessage, deleteMessage } = this.c.state

    setChatSendMessage(true)
    const result = await Send.onSend(this.c, message, filter, user, this.rootprops)

    if (isObject(result) && result.code === 0) {
      if (isEditMessage && !isDeleteMessage) {
        let newMessages = state.chat.messages.map(msg => {
          if (msg.id === editMessage.id) {
            return {
              ...msg,
              text: message.text,
              update: new Date()
            }
          }
          return msg
        })
        setChatMessages(newMessages)

        if (menuComponent) {
          menuComponent.setState({})
        }
      }

      if (isDeleteMessage) {
        let newMessages = state.chat.messages.filter(function (item) {
          return item.id !== deleteMessage.id
        })

        setChatMessages(newMessages)
      }

      this.c.setState(
        {
          editMessage: null,
          menuComponent: null,
          isEditMessage: false,
          menuMessage: null,
          isDeleteMessage: false,
          deleteMessage: null,
          textMessage: '',
          isOpenDialog: false
        },
        () => {
          setChatImages([])
          setChatImages360(null)
          setChatReplyMessage({
            replyId: null,
            id_parent: '',
            name_parent: '',
            msg_parent: '',
            id_post: '',
            data: {}
          })
          setChatSendMessage(false)

          this.c.setNewMessages(null, 0, true).then(() => {
            setHeightInput(HEIGHT_INPUT)

            setTimeout(async () => {
              if (GLOBAL_OBJ.onlinetur.chatRef && GLOBAL_OBJ.onlinetur.chatRef.current) {
                GLOBAL_OBJ.onlinetur.chatRef.current?.scrollToEnd({ animated: true })
              }
            }, 1000)
          })
        }
      )
    } else {
      Alert.alert(t('common.attention'), t('common.notConnect'))
      this.c.setState(
        {
          isDeleteMessage: false,
          deleteMessage: null,
          menuComponent: null
        },
        () => {
          setChatImages360(null)
          setChatSendMessage(false)
        }
      )
    }
    Keyboard.dismiss()
  }

  onShareChat = async (user, urlChat) => {
    const { t } = this.rootprops

    let ref = ''

    if (!isEmpty(user)) {
      ref = '?c=' + user.referral.code
    }

    let url = getAppConfig().homepage + urlChat + ref
    let message = t('common.appTitle')

    try {
      await Share.share(
        {
          message: message + '\n' + url
        },
        {
          title: message + '\n' + url,
          subject: message + '\n' + url,
          message: message + '\n' + url
        }
      )
    } catch (error) {
      //
    }
  }

  onMoveToFav = async (user, currentMessage) => {
    const { AppData, Alert, t } = this.rootprops

    const req = await AppData.sendFavorite(user, currentMessage._id, currentMessage.id_user, currentMessage.is_favorite)

    if (req.code === 0) {
      Alert.alert(t('common.message'), t('common.messagesAdd'))
    }
  }

  onChatUser = currentMessage => {
    const { filter, setFilter } = this.c.props

    this.c.setState({ isLoading: true }, () => {
      let data = Object.assign({}, filter)

      data.searchFav = '22'
      data.idUserFav = currentMessage.id_user
      data.nameUserFav = currentMessage.user.name
      setFilter(data)
    })
  }

  onPressAvatar = user => {
    const { filter, setFilter, pathname } = this.c.props

    if (pathname.indexOf('/mini') > -1) {
      return
    }

    this.c.setState({ isLoading: true }, () => {
      let data = Object.assign({}, filter)

      data.searchFav = '22'
      data.idUserFav = user._id
      data.nameUserFav = user.name
      setFilter(data)
    })
  }

  onPressResponse = currentMessage => {
    const { filter, setFilter } = this.c.props

    this.c.setState({ isLoading: true }, () => {
      let data = Object.assign({}, filter)

      data.searchFav = '4'
      data.idUserFav = currentMessage.id

      setFilter(data)
    })
  }

  webAlerter = (text, object = null) => {
    this.c.setState({ isVisibleDialog: true, textVisibleDialog: text, objectVisibleDialog: object })
  }

  sendComplainMessage = async () => {
    const { chatServicePost, t, Alert } = this.rootprops

    const { complainMessage, textComplain } = this.c.state
    const { user } = this.c.props

    if (user && user.device && user.device.token) {
      let body = new FormData()
      body.append('token', !isEmpty(user.device) ? user.device.token : '')
      body.append('android_id_install', user.android_id_install)
      body.append('id_chat', complainMessage.id)
      body.append('id_user', complainMessage.id_user)
      body.append('user_name', complainMessage.user.name)
      body.append('user_msg', complainMessage.text)
      body.append('date_msg', complainMessage.date_create)
      body.append('comment', textComplain)

      const res = await chatServicePost.postComplainMessage(body)

      if (res.code === 0) {
        Alert.alert(t('common.attention'), t('common.complainSuccess'))
      }
    }
  }

  onClipboardSetString = text => {
    const { Clipboard, t } = this.rootprops

    Clipboard.setString(text)

    toast.show(t('common.clipboardSuccess'), {
      type: 'success',
      placement: 'top',
      animationType: 'zoom-in',
      onPress: id => {
        toast.hide(id)
      }
    })
  }
}

export default onEvents
