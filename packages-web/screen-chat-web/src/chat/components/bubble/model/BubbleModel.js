import isEmpty from 'lodash/isEmpty'
import { Dimensions, Keyboard, Platform, Share } from 'react-native'

const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
const { getSafeAreaInsets, getSelectCategory, getAppConfig } = GLOBAL_OBJ.onlinetur.storage

class BubbleModel {
  constructor(component, props) {
    this.c = component
    this.rootprops = props
  }

  setStatusName = status => {
    this.c.setState({ statusRequest: status })
  }

  getOptions = () => {
    const { t } = this.rootprops
    const { currentMessage, user } = this.c.props

    let options = []

    if (user.is_admin === 1 || user.is_moderator === 1) {
      options = [t('containers.bubble.copy'), t('containers.bubble.reply'), t('containers.bubble.share'), t('containers.bubble.edit'), t('containers.bubble.del')]
      if (currentMessage.cnt_reply > 0) {
        options.push(t('chat.model.onEvents.replay'))
      }
      options.push(
        t('containers.bubble.complain'),
        t('containers.bubble.block'),
        currentMessage.is_warning ? t('containers.bubble.warnOff') : t('containers.bubble.warnOn'),
        currentMessage.is_ban === 0 ? t('containers.bubble.banOn') : t('containers.bubble.banOff'),
        t('containers.bubble.zagrebon'),
        t('containers.bubble.user')
      )
    } else if (currentMessage.is_owner && currentMessage.tip === 5) {
      options = [t('containers.bubble.share'), t('containers.bubble.reply'), t('containers.bubble.del'), t('containers.bubble.zagrebon')]
    } else if (currentMessage.is_edit) {
      options = [t('containers.bubble.copy'), t('containers.bubble.reply'), t('containers.bubble.share'), t('containers.bubble.edit'), t('containers.bubble.del')]
      if (currentMessage.cnt_reply > 0) {
        options.push(t('chat.model.onEvents.replay'))
      }
      options.push(t('containers.bubble.complain'), t('containers.bubble.user'))
    } else if (isEmpty(user)) {
      options = [t('containers.bubble.copy'), t('containers.bubble.share')]

      if (currentMessage.cnt_reply > 0) {
        options.push(t('chat.model.onEvents.replay'))
      }

      options.push(t('containers.bubble.complain'), t('containers.bubble.block'), t('containers.bubble.user'))
    } else {
      options = [t('containers.bubble.copy'), t('containers.bubble.reply'), t('containers.bubble.share')]

      if (currentMessage.cnt_reply > 0) {
        options.push(t('chat.model.onEvents.replay'))
      }

      options.push(t('containers.bubble.complain'), t('containers.bubble.block'), t('containers.bubble.user'))
    }

    return options
  }

  runFunctionByIndex = buttonIndex => {
    const chat = GLOBAL_OBJ.onlinetur.currentComponent
    const { currentMessage, user } = this.c.props

    if (user.is_admin === 1 || user.is_moderator === 1) {
      if (currentMessage.cnt_reply > 0) {
        switch (buttonIndex) {
          case 0:
            chat.onClipboardSetString(currentMessage.text)
            break
          case 1:
            chat.onPressReplyMessage(currentMessage)
            break
          case 2:
            this.c.onShare(currentMessage)
            break
          case 3:
            chat.onEditMyMessage(currentMessage)
            break
          case 4:
            chat.onDelMyMessage(currentMessage)
            break
          case 5:
            chat.onPressResponse(currentMessage)
            break
          case 6:
            chat.onComplainMessage(currentMessage)
            break
          case 7:
            chat.onBlockUser(currentMessage.id_user)
            break
          case 8:
            chat.onWarningMessage(currentMessage)
            break
          case 9:
            chat.onBanMessage(currentMessage)
            break
          case 10:
            chat.onOpenZagrebon(currentMessage.id)
            break
          case 11:
            chat.onChatUser(currentMessage)
            break
        }
      } else {
        switch (buttonIndex) {
          case 0:
            chat.onClipboardSetString(currentMessage.text)
            break
          case 1:
            chat.onPressReplyMessage(currentMessage)
            break
          case 2:
            this.c.onShare(currentMessage)
            break
          case 3:
            chat.onEditMyMessage(currentMessage)
            break
          case 4:
            chat.onDelMyMessage(currentMessage)
            break
          case 5:
            chat.onComplainMessage(currentMessage)
            break
          case 6:
            chat.onBlockUser(currentMessage.id_user)
            break
          case 7:
            chat.onWarningMessage(currentMessage)
            break
          case 8:
            chat.onBanMessage(currentMessage)
            break
          case 9:
            chat.onOpenZagrebon(currentMessage.id)
            break
          case 10:
            chat.onChatUser(currentMessage)
            break
        }
      }
    } else if (currentMessage.is_owner && currentMessage.tip === 5) {
      switch (buttonIndex) {
        case 0:
          this.c.onShare(currentMessage)
          break
        case 1:
          chat.onPressReplyMessage(currentMessage)
          break
        case 2:
          chat.onDelMyMessage(currentMessage)
          break
        case 3:
          chat.onOpenZagrebon(currentMessage.id)
          break
      }
    } else if (currentMessage.is_edit) {
      if (currentMessage.cnt_reply > 0) {
        switch (buttonIndex) {
          case 0:
            chat.onClipboardSetString(currentMessage.text)
            break
          case 1:
            chat.onPressReplyMessage(currentMessage)
            break
          case 2:
            this.c.onShare(currentMessage)
            break
          case 3:
            chat.onEditMyMessage(currentMessage)
            break
          case 4:
            chat.onDelMyMessage(currentMessage)
            break
          case 5:
            chat.onPressResponse(currentMessage)
            break
          case 6:
            chat.onComplainMessage(currentMessage)
            break
          case 7:
            chat.onBlockUser(currentMessage.id_user)
            break
          case 8:
            chat.onChatUser(currentMessage)
            break
        }
      } else {
        switch (buttonIndex) {
          case 0:
            chat.onClipboardSetString(currentMessage.text)
            break
          case 1:
            chat.onPressReplyMessage(currentMessage)
            break
          case 2:
            this.c.onShare(currentMessage)
            break
          case 3:
            chat.onEditMyMessage(currentMessage)
            break
          case 4:
            chat.onDelMyMessage(currentMessage)
            break
          case 5:
            chat.onComplainMessage(currentMessage)
            break
          case 6:
            chat.onBlockUser(currentMessage.id_user)
            break
          case 7:
            chat.onChatUser(currentMessage)
            break
        }
      }
    } else if (isEmpty(user)) {
      if (currentMessage.cnt_reply > 0) {
        switch (buttonIndex) {
          case 0:
            chat.onClipboardSetString(currentMessage.text)
            break
          case 1:
            this.c.onShare(currentMessage)
            break
          case 2:
            chat.onPressResponse(currentMessage)
            break
          case 3:
            chat.onComplainMessage(currentMessage)
            break
          case 4:
            chat.onBlockUser(currentMessage.id_user)
            break
          case 5:
            chat.onChatUser(currentMessage)
            break
        }
      } else {
        switch (buttonIndex) {
          case 0:
            chat.onClipboardSetString(currentMessage.text)
            break
          case 1:
            this.c.onShare(currentMessage)
            break
          case 2:
            chat.onComplainMessage(currentMessage)
            break
          case 3:
            chat.onBlockUser(currentMessage.id_user)
            break
          case 4:
            chat.onChatUser(currentMessage)
            break
        }
      }
    } else {
      if (currentMessage.cnt_reply > 0) {
        switch (buttonIndex) {
          case 0:
            chat.onClipboardSetString(currentMessage.text)
            break
          case 1:
            chat.onPressReplyMessage(currentMessage)
            break
          case 2:
            this.c.onShare(currentMessage)
            break
          case 3:
            chat.onPressResponse(currentMessage)
            break
          case 4:
            chat.onComplainMessage(currentMessage)
            break
          case 5:
            chat.onBlockUser(currentMessage.id_user)
            break
          case 6:
            chat.onChatUser(currentMessage)
            break
        }
      } else {
        switch (buttonIndex) {
          case 0:
            chat.onClipboardSetString(currentMessage.text)
            break
          case 1:
            chat.onPressReplyMessage(currentMessage)
            break
          case 2:
            this.c.onShare(currentMessage)
            break
          case 3:
            chat.onComplainMessage(currentMessage)
            break
          case 4:
            chat.onBlockUser(currentMessage.id_user)
            break
          case 5:
            chat.onChatUser(currentMessage)
            break
        }
      }
    }
  }

  onLongPress = () => {
    const { t, isMobile } = this.rootprops
    const chat = GLOBAL_OBJ.onlinetur.currentComponent

    const { currentMessage, user } = this.c.props

    Keyboard.dismiss()

    if (isEmpty(currentMessage)) {
      return
    }

    const options = this.getOptions()

    const cancelButtonIndex = options.length - 1
    this.c.props.showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
        showSeparators: true,
        containerStyle: { bottom: getSafeAreaInsets().bottom, margin: 0, padding: 0, height: Dimensions.get('window').height / 3 },
        textStyle: { fontSize: 16 },
        cancelButtonTintColor: 'red'
      },
      buttonIndex => this.runFunctionByIndex(buttonIndex)
    )
  }
  onShare = async item => {
    const { user, filter } = this.c.props
    const cat = filter.selectCategory

    let ref = ''

    if (!isEmpty(user)) {
      ref = '?c=' + user.referral.code
    }

    let url = getAppConfig().homepage + '/m/' + item.id + ref + (ref !== '' ? '&cat=' + cat.id : '?cat=' + cat.id)
    let message = item.text

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
    } catch (error) {}
  }

  onHobbyCountry = () => {
    const { selectedHotel, selectedHotelName, selectedHobby, selectedHobbyName, selectedPlace, selectedPlaceName, chatAgent, selectedAgent, selectedAgentName } = this.c.props.filter
    const { currentMessage } = this.c.props

    let data = {
      selectedCountry: currentMessage.id_post,
      selectedHotel: selectedHotel,
      selectedHobby: selectedHobby,
      selectedPlace: selectedPlace,

      selectedCountryName: currentMessage.post_title,
      selectedHotelName: selectedHotelName,
      selectedHobbyName: selectedHobbyName,
      selectedPlaceName: selectedPlaceName,

      selectedFav: '0',
      selectedFavName: '',

      chatAgent: chatAgent,
      selectedAgent: selectedAgent,
      selectedAgentName: selectedAgentName
    }

    this.c.props.reduxFilter(data)
  }

  onPressRowSetLike = async currentMessage => {
    const { Alert, chatServicePost, t } = this.rootprops

    const { user } = this.c.props
    const { device, android_id_install } = user
    const { is_like, cnt_like } = this.c.state
    const data = new FormData()

    data.append('token', !isEmpty(device) ? device.token : '')
    data.append('android_id_install', android_id_install)
    data.append('id_chat', currentMessage.id)
    data.append('id_user_owner', currentMessage.id_user)

    if (is_like) {
      data.append('tip', 0)
    } else {
      data.append('tip', 1)
    }

    const like = await chatServicePost.fetchLike(data)

    if (like && like.code === 0) {
      if (is_like) {
        this.c.setState({ cnt_like: cnt_like - 1, is_like: false, load_like: false })
      } else {
        this.c.setState({ cnt_like: cnt_like + 1, is_like: true, load_like: false })
      }
    } else if (like && like.error) {
      this.c.setState({ cnt_like: currentMessage.cnt_like, is_like: currentMessage.is_like, load_like: false }, () => {
        Alert.alert(t('common.attention'), like.error ? like.error : 'Ошибка сервера!')
      })
    }
  }

  onPressRowLike = async currentMessage => {
    const { Alert, t } = this.rootprops

    const { user } = this.c.props

    if (isEmpty(user)) {
      Alert.alert(t('common.attention'), t('common.notAuth'))

      return
    }

    if (!currentMessage.is_owner) {
      if (!currentMessage.is_like) {
        Alert.alert(t('common.attention'), t('chat.model.onEvents.like'), [
          { text: t('common.cancel'), style: 'destructive' },
          {
            text: t('common.yes'),
            onPress: async () => {
              await this.onPressRowSetLike(currentMessage)
            }
          }
        ])
      } else {
        await this.onPressRowSetLike(currentMessage)
      }
    } else {
      Alert.alert(t('common.attention'), t('chat.model.onEvents.likeError'))
    }
  }

  onPressRowFavorite = async currentMessage => {
    const { chatServicePost } = this.rootprops

    const { user } = this.c.props
    const { device, android_id_install, id_user } = user
    const { favorite, cnt_favorite } = this.c.state

    const fav = new FormData()
    fav.append('token', !isEmpty(device) ? device.token : '')
    fav.append('android_id_install', android_id_install)
    fav.append('id_chat', currentMessage.id)
    fav.append('id_user_owner', id_user)

    if (favorite) {
      fav.append('tip', 0)
    } else {
      fav.append('tip', 1)
    }

    const req = await chatServicePost.fetchFavorite(fav)

    if (req && req.code === 0) {
      if (favorite) {
        this.c.setState({ cnt_favorite: cnt_favorite - 1, favorite: false, load_favorite: false })
      } else {
        this.c.setState({ cnt_favorite: cnt_favorite + 1, favorite: true, load_favorite: false })
      }
    } else {
      this.c.setState({ cnt_favorite: currentMessage.cnt_favorite, favorite: currentMessage.is_favorite, load_favorite: false })
    }
  }
}

export default BubbleModel


// if (user.is_admin === 1 || user.is_moderator === 1) {
//       options = [t('containers.bubble.copy'), t('containers.bubble.reply'), t('containers.bubble.share'), t('containers.bubble.edit'), t('containers.bubble.del')]
//       if (currentMessage.cnt_reply > 0) {
//         options.push(t('chat.model.onEvents.replay'))
//       }
//       options.push(
//         t('containers.bubble.complain'),
//         t('containers.bubble.block'),
//         currentMessage.is_warning ? t('containers.bubble.warnOff') : t('containers.bubble.warnOn'),
//         currentMessage.is_ban === 0 ? t('containers.bubble.banOn') : t('containers.bubble.banOff'),
//         t('containers.bubble.zagrebon'),
//         t('containers.bubble.user'),
//         t('chat.model.onEvents.replay'),
//         t('common.close')
//       )
//     } else if (currentMessage.is_owner && currentMessage.tip === 5) {
//       options = [t('containers.bubble.share'), t('containers.bubble.reply'), t('containers.bubble.del'), t('containers.bubble.zagrebon'), t('common.close')]
//     } else if (currentMessage.is_edit) {
//       options = [t('containers.bubble.copy'), t('containers.bubble.reply'), t('containers.bubble.share'), t('containers.bubble.edit'), t('containers.bubble.del')]
//       if (currentMessage.cnt_reply > 0) {
//         options.push(t('chat.model.onEvents.replay'))
//       }
//       options.push(t('containers.bubble.complain'), t('containers.bubble.user'), t('common.close'))
//     } else if (isEmpty(user)) {
//       options = [t('containers.bubble.copy'), t('containers.bubble.share')]
//
//       if (currentMessage.cnt_reply > 0) {
//         options.push(t('chat.model.onEvents.replay'))
//       }
//
//       options.push(t('containers.bubble.complain'), t('containers.bubble.block'), t('containers.bubble.user'), t('common.close'))
//     } else {
//       options = [t('containers.bubble.copy'), t('containers.bubble.reply'), t('containers.bubble.share')]
//
//       if (currentMessage.cnt_reply > 0) {
//         options.push(t('chat.model.onEvents.replay'))
//       }
//
//       options.push(t('containers.bubble.complain'), t('containers.bubble.block'), t('containers.bubble.user'), t('common.close'))
//     }
