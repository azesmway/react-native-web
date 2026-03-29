// import { Mobile, Storage } from 'app-core'
// import { chatServiceGet, chatServicePost } from 'app-services'
// import { store } from 'app-store'
import isEmpty from 'lodash/isEmpty'
import { Platform } from 'react-native'

const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
const { getAppConstants, getToastFn } = GLOBAL_OBJ.onlinetur.storage

class Send {
  async onSend(cmp, message, filter, user, utils) {
    const { store, mobile, chatServiceGet, chatServicePost } = utils

    let result = {}
    const { setMessagesOffline, images, replyMessage, images360, ratingCategories, myRatingLocal, myRatingServer, changeMyRatingLocal, fcmToken, expoToken } = cmp.props
    const { id_hotel, id_hobbi, isEditMessage, id_post, editMessage, isDeleteMessage, deleteMessage, image_min, imgPDFupload } = cmp.state
    const messages = store.getState().chat.messages
    const { selectedCountry, selectedHotel, selectedHobby, chatAgent, selectedFav, selectedAgent, selectedPlace, selectedPlaceName, selectedHotelName, selectCategory } = filter

    const isConnected = await mobile.testConnection()

    let hotelId = '-1'
    let hotelName = selectedHotelName

    if (selectedPlace !== '-1') {
      hotelId = (selectedPlace * -1 - 100000).toString()
      hotelName = selectedPlaceName
    }

    hotelId = selectedHotel !== '-1' ? Number(selectedHotel) + 100000 : hotelId
    let hobbyId = chatAgent ? selectedAgent : selectedHobby

    let path = getAppConstants().url_main + getAppConstants().url_api3_path
    let postUrl = path + '/add_chat.php'
    let body = new FormData()

    let id_post_mes = replyMessage.replyId ? (chatAgent ? -1 : replyMessage.id_post) : selectedCountry

    body.append('token', user.device ? user.device.token : '')
    body.append('android_id_install', user.device ? user.android_id_install : '')

    if (!isEditMessage && !isDeleteMessage) {
      body.append('sotr_chat', chatAgent ? '1' : '0')
      body.append('msg', message.text)

      if (replyMessage.replyId) {
        if (replyMessage.id_parent === -123) {
          body.append('id_parent', replyMessage.replyId)
          body.append('id_hotel', id_hotel)
          body.append('id_hobbi', id_hobbi)
          body.append('id_user_parent', replyMessage.id_parent)
          body.append('name_parent', replyMessage.name_parent)
          body.append('msg_parent', replyMessage.msg_parent)
          body.append('parent_image', image_min && image_min[0] ? image_min[0] : '')
          body.append('id_post', replyMessage.id_post)
        } else {
          body.append('id_parent', replyMessage.replyId)
          body.append('id_hotel', id_hotel)
          body.append('id_hobbi', chatAgent ? replyMessage.id_post : -1)
          body.append('id_user_parent', replyMessage.id_parent)
          body.append('name_parent', replyMessage.name_parent)
          body.append('msg_parent', replyMessage.msg_parent)
          body.append('parent_image', image_min && image_min[0] ? image_min[0] : '')
          body.append('id_post', chatAgent ? -1 : replyMessage.id_post)
        }
      } else {
        if (selectedFav === '1') {
          body.append('fav', 1)
          body.append('id_post', -1)
          body.append('id_hotel', -1)
          body.append('id_hobbi', -1)
        } else {
          body.append('id_hotel', hotelId)
          body.append('id_hobbi', hobbyId)
          body.append('id_post', selectedCountry)
        }
      }

      if (chatAgent) {
        body.append('my_city', user.my_city ? user.my_city : 44)
        body.append('tip_chat', '1')
      }
    } else if (isEditMessage && !isDeleteMessage) {
      const path = getAppConstants().url_main + getAppConstants().url_api3_path
      postUrl = path + '/edit_chat.php'
      body.append('id_chat', editMessage.id)
      body.append('msg', message.text ? message.text : '')
    } else if (isDeleteMessage) {
      const path = getAppConstants().url_main + getAppConstants().url_api3_path
      postUrl = path + '/del_chat.php'
      body.append('id_chat', deleteMessage.id)
    }

    if (messages.length === 1) {
      if (isConnected) {
        await chatServiceGet.fetchAddPost(user.device.token, user.android_id_install, hotelName, hotelId, id_post_mes, selectCategory.id)
      }
    }

    if (images.length > 0) {
      if (imgPDFupload) {
        result = await mobile.postPdf(postUrl, path, images[0].base64, user, id_post_mes, user.device.token, user.android_id_install)
      } else {
        if (Platform.OS === 'web') {
          result = await mobile.trainingAndSendImages(id_post_mes, body, images, user.device.token, user.android_id_install, cmp, isConnected, setMessagesOffline)

          if (!isConnected) {
            if (Platform.OS === 'web') {
              mobile.notifyOffline()
            }

            return result
          }
        } else {
          result = await mobile.trainingAndSendImages(id_post_mes, body, images, user.device.token, user.android_id_install, cmp, isConnected, setMessagesOffline)
        }
        cmp.setState({ progress: 0 })
      }
    } else if (!isEmpty(images360)) {
      let item
      if (Platform.OS !== 'web') {
        item = await this.sendImage360(id_post_mes, images360, user.device.token, user.android_id_install, utils)
      } else {
        item = await this.sendImage360Web(id_post_mes, images360, user.device.token, user.android_id_install, utils)
      }

      result = await mobile.trainingAndSendImages360(body, item)
    } else {
      if (!isEditMessage && !isDeleteMessage && !isEmpty(message.contact)) {
        body.append('img', message.contact)
        body.append('tip', 4)
      }

      if (isConnected) {
        result = await chatServicePost.onPostMessage(body, postUrl)
      } else {
        let object = {}
        if (Platform.OS === 'web') {
          body.forEach((value, key) => (object[key] = value))
        } else {
          for (let i = 0; i < body._parts.length; i++) {
            object[body._parts[i][0]] = body._parts[i][1]
          }
        }

        setMessagesOffline([
          {
            id: new Date().getTime(),
            message: JSON.stringify(object),
            url: postUrl
          }
        ])

        if (Platform.OS === 'web') {
          mobile.notifyOffline()
        } else {
          const toast = getToastFn()

          toast.show('⚠️ Ваше сообщение будет отправлено после возобновления связи с интернетом.', {
            type: 'warning',
            placement: 'top',
            animationType: 'zoom-in',
            onPress: id => {
              toast.hide(id)
            }
          })
        }

        result.code = 0

        return result
      }
    }

    if (result.code === 0 && fcmToken && fcmToken !== '') {
      chatServiceGet.fetchSetStatusPush(fcmToken, expoToken, user.device.token, user.android_id_install, id_post_mes, id_hotel, id_hobbi, 1, chatAgent ? 1 : 0).then()
    }

    if (!isEditMessage && !isDeleteMessage) {
      let myRating = true

      for (let i = 0; i < myRatingServer.length; i++) {
        if (myRatingServer[i] && myRatingServer[i].list && myRatingServer[i].list.length > 0) {
          const h = myRatingServer[i].list.filter(r => Number(r.huid) === Number(hotelId) - 100000)[0]

          if (h) {
            myRating = false

            break
          }
        }
      }

      if (myRating) {
        for (let i = 0; i < myRatingLocal.length; i++) {
          if (myRatingLocal[i] && myRatingLocal[i].list && myRatingLocal[i].list.length > 0) {
            const h = myRatingLocal[i].list.filter(r => Number(r.huid) === Number(hotelId) - 100000)[0]

            if (h) {
              myRating = false

              break
            }
          }
        }

        if (myRating) {
          const hId = Number(hotelId) - 100000
          let url = 'action=get_top_rate'
          url += `&cuid=${selectedCountry}&puid=&lim=20&ofs=0&hclass=&huids=${hId}&pattern=&criteria_id=1&add=1`

          const res = await chatServiceGet.getRatingHotels(url)

          if (res && res.hotels && res.hotels.length > 0) {
            try {
              const rAdd = Object.assign([], myRatingLocal)

              for (let i = 0; i < rAdd.length; i++) {
                if (Number(res.hotels[0].huid) === hId) {
                  const hAdd = Object.assign({}, res.hotels[0])
                  hAdd.my_rating = 0
                  hAdd.notSave = true

                  rAdd[i].list.push(hAdd)
                }
              }

              changeMyRatingLocal(rAdd)
            } catch (e) {
              console.log('e', e)
            }
          }
        }
      }
    }

    if (isEditMessage) {
      editMessage.text = message.text ? message.text : ''
    }

    return result
  }

  // async sendLike(user, id, id_user, is_like, utils) {
  //   const { chatServicePost } = utils
  //
  //   const like = new FormData()
  //
  //   like.append('token', user.device ? user.device.token : '')
  //   like.append('android_id_install', user.device ? user.android_id_install : '')
  //   like.append('id_chat', id)
  //   like.append('id_user_owner', id_user)
  //
  //   if (is_like) {
  //     like.append('tip', 0)
  //   } else {
  //     like.append('tip', 1)
  //   }
  //
  //   return await chatServicePost.fetchLike(like)
  // }
  //
  // async sendFavorite(user, id, id_user, is_favorite, utils) {
  //   const { chatServicePost } = utils
  //
  //   const fav = new FormData()
  //
  //   fav.append('token', user.device ? user.device.token : '')
  //   fav.append('android_id_install', user.device ? user.android_id_install : '')
  //   fav.append('id_chat', id)
  //   fav.append('id_user_owner', id_user)
  //
  //   if (is_favorite) {
  //     fav.append('tip', 0)
  //   } else {
  //     fav.append('tip', 1)
  //   }
  //
  //   return chatServicePost.fetchFavorite(fav)
  // }

  async sendImage360(id_post_mes, img, token, android_id_install, utils) {
    const { chatServicePost, mobile } = utils

    const ImageResizer = mobile.initImageResizer()

    return ImageResizer.createResizedImage(img.path, img.width, img.height, 'JPEG', 100)
      .then(async response => {
        const body = new FormData()
        body.append('token', token)
        body.append('android_id_install', android_id_install)
        body.append('id_post', id_post_mes)
        body.append('is_image360', 1)
        body.append('file', {
          uri: response.uri,
          type: 'image/jpeg',
          name: response.name
        })
        return await chatServicePost.fetchChatImgUpload(body)
      })
      .catch(error => {
        const crashlytics = mobile.initCrashlytics()

        if (crashlytics) {
          crashlytics().recordError(error)
        } else {
          console.log('sendImage360', error)
        }
      })
  }

  async sendImage360Web(id_post_mes, img, token, android_id_install, utils) {
    const { chatServicePost } = utils

    const body = new FormData()
    body.append('token', token)
    body.append('android_id_install', android_id_install)
    body.append('id_post', id_post_mes)
    body.append('is_image360', 1)
    body.append('file', img.file)

    return await chatServicePost.fetchChatImgUploadWeb(body)
  }
}

export default new Send()
