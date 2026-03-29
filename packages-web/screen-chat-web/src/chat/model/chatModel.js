import isEmpty from 'lodash/isEmpty'
import isFunction from 'lodash/isFunction'
import { Platform } from 'react-native'

const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
const { setMessagesIds } = GLOBAL_OBJ.onlinetur.storage

class chatModel {
  constructor(component, props) {
    this.c = component
    this.rootprops = props
  }

  setNotifyEnabled = async notifyEnabled => {
    const { chatServiceGet } = this.rootprops

    const { user, filter, agent, setAgent, setCountries, countries } = this.c.props
    const status = await chatServiceGet.fetchSetStatusPush(
      user.fcmToken,
      '',
      user.device.token,
      user.android_id_install,
      filter.selectedCountry,
      filter.selectedHotel !== '-1' ? Number(filter.selectedHotel) + 100000 : '-1',
      filter.chatAgent ? filter.selectedAgent : filter.selectedHobby,
      notifyEnabled ? 1 : 0,
      filter.chatAgent ? 1 : 0
    )

    if (status.code === 0) {
      this.c.setState({ notifyEnabled: notifyEnabled })

      if (filter.chatAgent) {
        let agentNew = Object.assign([], agent)

        for (let i = 0; i < agentNew.length; i++) {
          if (agentNew[i].id === filter.selectedAgent && filter.selectedCountry === '-1' && filter.selectedHotel === '-1' && filter.selectedHobby === '-1') {
            agentNew[i].enabled = notifyEnabled ? 1 : 0
          }
        }

        setAgent(agentNew)
      } else {
        let countriesNew = Object.assign([], countries)

        for (let i = 0; i < countriesNew.length; i++) {
          if (countriesNew[i].id === filter.selectedCountry && filter.selectedHotel === '-1' && filter.selectedHobby === '-1') {
            countriesNew[i].enabled = notifyEnabled ? 1 : 0
          }
        }

        setCountries(countriesNew)
      }
    }
  }

  setBottomOffset = () => {
    const { setBottomOffset } = this.c.state

    if (!setBottomOffset) {
      this.c.setState({ setBottomOffset: true })
    }
  }

  openChatWithFilter = async deepLink => {
    const { init, t, Alert } = this.rootprops

    this.c.loadWhileNewMessage = false
    const { countries, hobby, history, shareData, setChatReplyMessage } = this.c.props
    const { bgColor, txtColor } = this.c.state
    let bgColorNew, txtColorNew
    let article = null

    if (this.c.props.glob && this.c.props.glob.article) {
      article = JSON.parse(this.c.props.glob.article)
    }
    this.c.setState({ share: shareData }, async () => {
      await this.c.initChat()
      init.filterApp(this.c, deepLink).then(async result => {
        if (result) {
          if (result.error) {
            history(result.url)
            return
          }

          if (result.filter.selectedHobby !== '-1') {
            const currentHobby = hobby.filter(function (item) {
              return item.id === result.filter.selectedHobby
            })
            bgColorNew = currentHobby && currentHobby[0] ? currentHobby[0].color_background : bgColor
            txtColorNew = currentHobby && currentHobby[0] ? currentHobby[0].color_text_info : txtColor
          } else if (result.filter.selectedCountry !== '-1') {
            const currentTheme = countries.filter(function (item) {
              return item.id === result.filter.selectedCountry
            })
            bgColorNew = currentTheme && currentTheme[0] ? currentTheme[0].color_background : bgColor
            txtColorNew = currentTheme && currentTheme[0] ? currentTheme[0].color_text_info : txtColor
          }

          this.c.setState(
            {
              bgColor: bgColorNew,
              txtColor: txtColorNew,
              id_post: article ? result.filter.selectedCountry : '-1',
              id_hotel: article ? result.filter.selectedHotel : '-1',
              id_hobbi: article ? result.filter.selectedHobby : '-1'
            },
            () => {
              if (article) {
                setChatReplyMessage({
                  replyId: Number(article.id) * -1,
                  msg_parent: article.title,
                  name_parent: 'Новость',
                  id_parent: -123,
                  id_post: article.post_id,
                  data: article
                })
              }
            }
          )

          setMessagesIds()
          await this.c.initLoadData()
        } else {
          Alert.alert(t('common.errorTitle'), t('common.errorServer'))
        }
      })
    })
  }

  actionComponentDidUpdate = async (prevProps, prevState) => {
    const pathname = this.c.props.pathname
    const { user, places, filter } = this.c.props

    if (
      pathname.indexOf('/y/') > -1 ||
      pathname.indexOf('/a/') > -1 ||
      pathname.indexOf('/fav') > -1 ||
      pathname.indexOf('?fav') > -1 ||
      pathname.indexOf('/b/') > -1 ||
      pathname.indexOf('/h/') > -1
    ) {
      if (this.c.loadWhileNewMessage) {
        this.c.loadWhileNewMessage = false
        await this.c.initChat()
        setMessagesIds()
        await this.c.initLoadData()
      }

      return
    }

    if (!isEmpty(places) && isEmpty(prevProps.places) && isEmpty(user) && pathname.indexOf('/y/') > -1 && pathname.indexOf('/h/') > -1) {
      if (this.c.loadWhileNewMessage) {
        this.c.loadWhileNewMessage = false
        await this.c.initChat()
        setMessagesIds()
        await this.c.initLoadData()
      }

      return
    }

    if (pathname.indexOf('/mini') === -1 && (prevProps.filter.searchFav === '' || prevProps.filter.searchFav === undefined) && filter.searchFav !== '') {
      if (this.c.loadWhileNewMessage) {
        this.c.loadWhileNewMessage = false
        await this.c.initChat()
        setMessagesIds()
        await this.c.initLoadData()
      }

      return
    }

    if (prevProps.filter.searchFav !== '' && filter.searchFav === '') {
      if (this.c.loadWhileNewMessage) {
        this.c.loadWhileNewMessage = false
        await this.c.initChat()
        setMessagesIds()
        await this.c.initLoadData()
      }

      return
    }

    if (prevProps.filter.searchFav !== '' && filter.searchFav !== '' && filter.searchFav.charAt(0) === '#') {
      if (this.c.loadWhileNewMessage) {
        this.c.loadWhileNewMessage = false
        await this.c.initChat()
        setMessagesIds()
        await this.c.initLoadData()
      }
    }
  }

  openImages = (images, img360, currentMessage) => {
    const { modalIsOpen } = this.c.state

    this.c.setState({ imagesView: images, modalIsOpen: !modalIsOpen, img360: img360, currentMessage: currentMessage })
  }

  closeImage = () => {
    const { setChatImages } = this.c.props

    this.c.setState(
      state => ({ modalIsOpen: !state.modalIsOpen, img360: null, currentMessage: null }),
      () => {
        setChatImages([])
      }
    )
  }

  handleCloseAlert = () => {
    this.c.setState({
      openAlert: false,
      currentMessage: null,
      isDeleteMessage: false,
      deleteMessage: null,
      shareMessage: null,
      isShareMessage: false,
      warningMessage: null,
      isWarningMessage: false,
      isEditMessage: false,
      editMessage: null,
      menuComponent: null,
      bubble: null
    })
  }

  handleCloseMenu = () => {
    this.c.setState({ openMenu: false, menuMessage: null })
  }

  testImage = value => {
    if (isEmpty(value)) {
      return false
    }

    let arrayPicExt = ['jpg', 'gif', 'png', 'jpeg', 'tiff']
    let extPicture = value.toLowerCase().split('.').pop()

    return arrayPicExt.indexOf(extPicture) > -1
  }

  setShareText = text => {
    if (this.c.giftedChat && isFunction(this.c.giftedChat.onInputTextChanged)) {
      this.c.giftedChat.onInputTextChanged(text)
      this.c.startShare = false
      this.c.shareDataView = {}
    }
  }

  sendShareToCurrentChat = async shareDataView => {
    const { mobile, t } = this.rootprops

    const { shareData, setShareData, setChatImages, setChatImages360 } = this.c.props

    if (!isEmpty(shareDataView)) {
      if (!isEmpty(shareDataView.text)) {
        this.c.setShareText(shareDataView.text)
      } else if (!isEmpty(shareDataView.weblink) && !this.c.testImage(this.shareDataView.weblink)) {
        this.c.setShareText(shareDataView.weblink)
      }

      return
    }

    if (shareData.length === 0) {
      return
    }

    this.c.shareDataView = Object.assign({}, shareData[0])
    this.c.startShare = true

    if (!isEmpty(this.c.shareDataView.text)) {
      this.c.onInsertToChat(this.c.shareDataView.text)
    } else if (!isEmpty(this.c.shareDataView.weblink) && !this.c.testImage(this.c.shareDataView.weblink)) {
      if (!isEmpty(this.c.shareDataView.sharetext)) {
        if (this.c.giftedChat && isFunction(this.c.giftedChat.onInputTextChanged)) {
          this.c.onInsertToChat(this.c.shareDataView.sharetext + '\n\n' + this.c.shareDataView.weblink)
        }
      }
    } else if (!isEmpty(this.c.shareDataView.filePath) || !isEmpty(this.c.shareDataView.contentUri) || this.c.testImage(this.c.shareDataView.weblink)) {
      this.c.setState({ isLoading: true }, async () => {
        if (this.c.shareDataView.mimeType.includes('pdf')) {
          this.c.setState(
            {
              imgPDFupload: true
            },
            () => {
              setChatImages([
                {
                  mime: 'application/pdf',
                  uri: this.c.shareDataView.filePath,
                  type: 'pdf',
                  name: this.c.shareDataView.fileName
                }
              ])
              setChatImages360(null)
            }
          )
        } else if (['jpg', 'jpeg', 'gif', 'png'].indexOf(this.c.shareDataView.mimeType.toLowerCase().replace('image/', '').replace('.', '')) > -1) {
          if (Platform.OS === 'android') {
            const PermissionsAndroid = mobile.initPermissionsAndroid()
            PermissionsAndroid.requestMultiple(
              [
                PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
                PermissionsAndroid.PERMISSIONS.ACCESS_MEDIA_LOCATION,
                PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
              ],
              {
                title: t('common.gallery'),
                message: t('chat.component.chat.access')
              }
            ).then(async result => {
              await mobile.getImagesShare(this.c, shareData)
            })
          } else {
            await mobile.getImagesShare(this.c, shareData)
          }
        }
      })
    }

    setShareData([])
  }

  keyExtractor = (item, index) => item.localIdentifier

  removePreviewImages = (item, index) => {
    const { images, setChatImages } = this.c.props
    let newImg = []
    images.forEach(function (val, ind) {
      if (ind !== index) {
        newImg.push(val)
      }
    })
    this.c.setState({ imgPDFupload: false }, () => {
      setChatImages(newImg)
    })
  }

  contactCard = (contact, tp) => {
    const { mobile } = this.rootprops

    if (tp === 0) {
      mobile.openLinkPhone(contact.phones[0])
    } else if (tp === 1) {
      mobile.openLinkSms(contact.phones[0])
    } else if (tp === 2) {
      mobile.addContact(contact)
    }
  }

  handleCloseFilter = () => {
    const { user } = this.c.props

    this.c.setState({ isFilterOpen: false }, async () => {
      if (!isEmpty(user)) {
        // await this.c._sendMessageChat.setEnable()
      }
    })
  }

  changeLocation = async (locations = null) => {
    const { chatServiceGet, t, Alert } = this.rootprops

    const { countries, filter, setFilter, user, currentCategory, history } = this.c.props
    let hotels

    if (locations.latitude && locations.longitude) {
      hotels = await chatServiceGet.fetchHotelsBeside(!isEmpty(user.device) ? user.device.token : '', user.android_id_install, locations.latitude, locations.longitude, 0, currentCategory.id)
    } else {
      Alert.alert(t('common.attention'), t('chat.model.chatModel.hotelNotFound'))
      // this.c.setState({ isLoading: false }, () => setChatSendMessage(false))

      return
    }

    if (isEmpty(hotels.h)) {
      Alert.alert(t('common.attention'), t('chat.model.chatModel.hotelNotFound'))
      // this.c.setState({ isLoading: false }, () => setChatSendMessage(false))

      return
    }

    const country = countries.filter(function (item) {
      return item.tip === 0 && item.id_country === Number(hotels.ctr[0].id)
    })

    if (isEmpty(country)) {
      Alert.alert('Внимание!', t('chat.model.chatModel.countryNotFound'))
      // this.c.setState({ isLoading: false }, () => setChatSendMessage(false))

      return
    }

    let data = Object.assign({}, filter)
    data.selectedCountry = country[0].id
    data.selectedCountryName = country[0].title
    setFilter(data)

    history('/y/' + country[0].id)

    this.c.openModalFilter('hotel', 'geo', locations)
    // this.c.setState(
    //   {
    //     hotels: hotels.h,
    //     places: hotels.r,
    //     isFilterOpen: true,
    //     openGeo: true
    //   },
    //   async () => {
    //     setChatSendMessage(false)
    //
    //   }
    // )
  }

  openDialogHotel = () => {
    const { t, Alert } = this.rootprops

    let buttons = []

    const curChat = {
      text: t('chat.model.chatModel.geo'),
      onPress: async () => {
        this.c.setState({ isFilterOpen: true, openGeo: true }, () => {
          this.c.openModalFilter()
          this.c.props.setOpenDialogHotel(false)
        })
      }
    }

    const selectChat = {
      text: t('chat.model.chatModel.name'),
      onPress: async () => {
        this.c.setState({ isFilterOpen: true }, () => {
          this.c.openModalFilter()
          this.c.props.setOpenDialogHotel(false)
        })
      }
    }

    const cancel = {
      text: t('chat.model.chatModel.cancel'),
      style: 'cancel',
      onPress: async () => {}
    }

    if (Platform.OS === 'ios') {
      buttons.push(curChat)
      buttons.push(selectChat)
      buttons.push(cancel)
    } else {
      buttons.push(cancel)
      buttons.push(selectChat)
      buttons.push(curChat)
    }

    Alert.alert(t('chat.model.chatModel.selectHotel'), '', buttons)
  }
}

export default chatModel
