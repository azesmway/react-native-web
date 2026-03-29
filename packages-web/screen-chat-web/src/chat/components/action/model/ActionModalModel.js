import orderBy from 'lodash/orderBy'
import { ImageBackground, Platform, TouchableOpacity, View } from 'react-native'

const excludeFields = [
  'isDatePickerVisible',
  'isTimePickerVisible',
  'date_zaezd',
  'is_add',
  'id_promo',
  'idCateg1',
  'idCateg2',
  'categ1Name',
  'categ2Name',
  'isSave',
  'images',
  'currency',
  'anchorEl',
  'pictures',
  'promButtonName',
  'promButtonIds',
  'idPromButton',
  'idNumberIds',
  'idNumber',
  'textSnackbar',
  'openSnackbar',
  'vertical',
  'horizontal',
  'variants',
  'variantsModal',
  'days',
  'daysModal',
  'idNumberDesc',
  'idNumberType',
  'id_room',
  'room_title'
]

class actionModalModel {
  constructor(component, props) {
    this.c = component
    this.rootprops = props
  }

  handleConfirm = date => {
    this.c.setState({ date_zaezd: date })
    this.c.hideDatePicker()
  }

  handleConfirmTime = time => {
    this.c.setState({ date_zaezd: time })
    this.c.hideTimePicker()
  }

  handleConfirmWeb = event => {
    const { moment } = this.rootprops

    var d = event.target.value.split('-')
    this.c.setState({ date_zaezd: new Date(d[0], d[1] - 1, d[2], 14, 0, 0) }, () => {
      this.c.valRefTime.current.value = moment(this.c.state.date_zaezd).format('HH:ss')
    })
  }

  handleConfirmTimeWeb = event => {
    var time = event.target.value.split(':')
    var d = this.c.state.date_zaezd
    d.setHours(time[0])
    d.setMinutes(time[1])
    let newDate = new Date(d)
    this.c.setState({ date_zaezd: newDate })
  }

  hideDatePicker = () => {
    this.c.setState({ isDatePickerVisible: false })
  }

  showDatePicker = () => {
    this.c.setState({ isDatePickerVisible: true })
  }

  hideTimePicker = () => {
    this.c.setState({ isTimePickerVisible: false })
  }

  showTimePicker = () => {
    this.c.setState({ isTimePickerVisible: true })
  }

  onSaveAction = async () => {
    const { Alert, chatServiceGet, moment, chatServicePost, t } = this.rootprops

    const { onCancel, user, idChat, onNewMessages, article, filter } = this.c.props
    const { selectedCountry, selectedHotel, selectedHobby, chatAgent, selectedFav, selectedAgent, selectedPlace } = this.c.props.filter
    const { images, hours, date_zaezd, msg, is_add, id_promo, pictures, id_room, room_type, room_title, variants, days, id_categ1, idNumber, idNumberIds } = this.c.state

    let body = new FormData()
    let hotelId = '-1'
    let result

    if (room_title === '' && idNumber.length === 0) {
      this.c.setState({ room_title_error: true, isSave: false })
      return
    }

    if (selectedPlace !== '-1') {
      hotelId = (selectedPlace * -1 - 100000).toString()
    }

    hotelId = selectedHotel !== '-1' ? Number(selectedHotel) + 100000 : hotelId
    let hobbyId = chatAgent ? selectedAgent : selectedHobby
    let token = user.device ? user.device.token : ''
    let android_id_install = user.device ? user.android_id_install : ''

    body.append('token', token)
    body.append('android_id_install', android_id_install)

    Object.keys(this.c.state).forEach(key => {
      if (excludeFields.indexOf(key) === -1) {
        body.append(key, this.c.state[key])
      }
    })

    body.append('sotr_chat', chatAgent ? '1' : '0')

    body.append('id_post', selectedCountry)
    body.append('id_hobbi', hobbyId)

    if (article) {
      body.append('id_room', idNumberIds[0])
      body.append('room_title', idNumber[0])
      if (article.object_type === 1) {
        body.append('id_hotel', Number(article.object_id) + 100000)
      } else if (article.object_type === 2) {
        await chatServiceGet.fetchAddPost(user.device.token, user.android_id_install, '', Number(article.object_id) * -1, -1, filter.selectCategory.id)
        body.append('id_hotel', Number(article.object_id) * -1)
      }
    } else {
      body.append('id_room', id_room)
      body.append('room_title', room_title)
      body.append('id_hotel', hotelId)
    }
    body.append('room_type', room_type ? room_type : -1)

    if (is_add === 0) {
      body.append('is_add', 0)
    } else if (is_add === 1) {
      body.append('is_add', 1)
      body.append('id_chat_promo', idChat)
    } else if (is_add === -1) {
      body.append('id_promo', id_promo)
    }

    body.append('date_zaezd', moment(new Date(date_zaezd)).format())
    let time = new Date(date_zaezd).setHours(new Date(date_zaezd).getHours() - Number(hours))
    body.append('promo_date_finish', moment(time).format())

    if (variants.length > 0) {
      let bodyVariants = new FormData()
      bodyVariants.append('token', token)
      bodyVariants.append('android_id_install', android_id_install)
      bodyVariants.append('id_hotel', hotelId)
      bodyVariants.append('id_room', id_room)
      bodyVariants.append('id_food', id_categ1)
      bodyVariants.append('json_data', JSON.stringify(variants))

      result = await chatServicePost.fetchActionRoomPeoples(bodyVariants)
    }

    if (days.length > 0) {
      body.append('json_days', JSON.stringify(days))
    }

    if (images && images.length > 0) {
      result = await this.c.trainingAndSendImages(selectedCountry, body, images, token, android_id_install, is_add !== -1)
    } else if (pictures && pictures.length > 0) {
      result = await this.c.trainingAndSendImages(selectedCountry, body, pictures, token, android_id_install, is_add !== -1)
    } else {
      result = await chatServicePost.fetchActionMassage(body, is_add !== -1)
    }

    if (result.code === 0) {
      if (onNewMessages) {
        onNewMessages(null, 0, true)
      }
      if (Platform.OS !== 'web') {
        this.c.props.closeModalAction()
      } else {
        this.c.props.closeModalAction()
      }
    } else {
      this.c.setState({ isSave: false }, () => {
        Alert.alert(t('common.errorTitle'), result.error)
      })
    }
  }

  getImagesVideo = () => {
    const { mobile } = this.rootprops

    const { images } = this.c.state
    const ImagePicker = mobile.initImagePicker()

    ImagePicker.openPicker({
      multiple: false,
      cropping: true,
      includeExif: true,
      writeTempFile: true
    }).then(imagesSelect => {
      let newImgs = images.concat(imagesSelect)
      this.c.setState({ images: newImgs })
    })
  }

  renderPreviewImage = item => {
    const { Icon } = this.rootprops

    return (
      <TouchableOpacity key={item.item.localIdentifier} style={{ marginRight: 3, width: 70, height: 70 }} onPress={() => this.c.removePreviewImages(item.item, item.index)}>
        <View>
          <ImageBackground source={{ uri: item.item.path }} style={{ marginRight: 3, width: 70, height: 70 }}>
            <View style={{ alignItems: 'flex-end' }}>
              <Icon name={'cancel'} color={'red'} size={25} style={{ fontWeight: 'bold' }} />
            </View>
          </ImageBackground>
        </View>
      </TouchableOpacity>
    )
  }

  removePreviewImages = (item, index) => {
    const { images } = this.c.state
    let newImg = []
    images.forEach(function (val, ind) {
      if (ind !== index) {
        newImg.push(val)
      }
    })
    this.c.setState({ images: newImg })
  }

  keyExtractor = (item, index) => index.toString()

  trainingAndSendImages = async (id_post_mes, body, images, token, android_id_install, addPromo) => {
    const { mobile, chatServicePost } = this.rootprops

    let img = []
    let img_min = []
    let urls
    if (Platform.OS !== 'web') {
      urls = await mobile.sendResizeUploadImage(id_post_mes, images, token, android_id_install)
    } else {
      urls = await mobile.sendResizeUploadImage(id_post_mes, images, token, android_id_install)
    }

    for (const item of urls) {
      if (item.image) {
        img.push({
          path: item.image,
          date: item.exifDateTime,
          latitude: item.exifLatitude,
          longitude: item.exifLongitude
        })

        img_min.push({
          path: item.image_min,
          date: item.exifDateTime,
          latitude: item.exifLatitude,
          longitude: item.exifLongitude
        })
      }
    }

    body.append('img', JSON.stringify(img))
    body.append('img_min', JSON.stringify(img_min))

    return await chatServicePost.fetchActionMassage(body, addPromo)
  }

  initData = async () => {
    const { chatServiceGet, moment } = this.rootprops

    const { currentAction, action, filter, user, isAdd, article } = this.c.props
    const { currency } = this.c.state

    let token = user.device ? user.device.token : ''
    let android_id_install = user.device ? user.android_id_install : ''
    const cat = await chatServiceGet.getPromoAction(android_id_install, token, filter.selectCategory.id)
    const rooms = await chatServiceGet.getPromoActionRooms(android_id_install, token, Number(filter.selectedHotel) + 100000)

    let variants = []

    if (currentAction) {
      const peoples = await chatServiceGet.getPromoActionPeoples(android_id_install, token, Number(filter.selectedHotel) + 100000, currentAction.id_room, currentAction.id_categ1)

      if (peoples.code === 0) {
        variants = peoples.data
      }
    }

    cat.curr = orderBy(cat.curr, ['id'])
    for (let i = 0; i < cat.curr.length; i++) {
      currency.push(cat.curr[i].name)
    }

    let roomsName = []
    let roomsDesc = []
    let roomIds = []
    let roomType = []

    for (let i = 0; i < rooms.length; i++) {
      roomsName.push(rooms[i].name.replace(/&quot;/g, '"'))
      roomsDesc.push(rooms[i].description.replace(/&quot;/g, '"'))
      roomIds.push(rooms[i].id)
      roomType.push(rooms[i].room_type)
    }

    let promButtonName = []
    let promButtonIds = []

    for (let i = 0; i < cat.prom_button.length; i++) {
      promButtonName.push(cat.prom_button[i].name.replace(/&quot;/g, '"'))
      promButtonIds.push(cat.prom_button[i].id)
    }

    if (article) {
      roomsName.push(article.title)
      roomsDesc.push(article.short_description)
      roomIds.push(Number(article.id) * -1)
    }

    if (currentAction && isAdd === -1) {
      let d1 = new Date(moment(currentAction.date_zaezd).format())
      let d2 = new Date(moment(currentAction.date_finish).format())
      let hours = d1 - d2
      hours = Math.floor((hours % 86400000) / 3600000)

      this.c.setState(
        {
          msg: action.msg,
          promo_msg: action.msg_full ? action.msg_full : '',
          cnt_days: currentAction.cnt_days,
          price_full: currentAction.price_full,
          id_categ1: currentAction.id_categ1,
          id_categ2: currentAction.id_categ2,
          promo_count_room: currentAction.count_room,
          date_zaezd: new Date(moment(currentAction.date_zaezd).format()),
          promo_button_bron_name: currentAction.button_bron_name,
          hours: hours,
          price_proc: currentAction.price_proc.toString(),
          is_add: isAdd,
          promo_price: currentAction.price.toString(),
          id_promo: currentAction.id_promo,
          idCateg1: cat.categ1,
          categ1Name: cat.categ1_name,
          idCateg2: cat.categ2,
          categ2Name: cat.categ2_name,
          currency: currency,
          id_curr: currentAction.id_curr ? currentAction.id_curr : 1,
          day_to_return: currentAction.day_to_return,
          idNumber: roomsName,
          idNumberDesc: roomsDesc,
          idNumberIds: roomIds,
          idNumberType: roomType,
          id_room: currentAction.id_room,
          room_title: currentAction.room_title,
          promButtonName: promButtonName,
          promButtonIds: promButtonIds,
          promo_id_button_bron: currentAction.promo_id_button_bron ? currentAction.promo_id_button_bron : 1,
          variants: variants,
          days: currentAction.days,
          room_type: currentAction.room_type
        },
        () => {
          if (Platform.OS !== 'web') {
            this.c.valRef.current.select(currentAction.id_curr ? currentAction.id_curr : 1)
            this.c.promRef.current.select(currentAction.idPromButton ? currentAction.idPromButton : 0)
          } else {
            this.c.valRef.current.value = moment(currentAction.date_zaezd).format('YYYY-MM-DD')
            this.c.valRefTime.current.value = moment(currentAction.date_zaezd).format('HH:ss')
          }
        }
      )
    } else {
      this.c.setState(
        {
          idCateg1: cat.categ1,
          categ1Name: cat.categ1_name,
          idCateg2: cat.categ2,
          categ2Name: cat.categ2_name,
          currency: currency,
          id_curr: 1,
          idNumber: roomsName,
          idNumberDesc: roomsDesc,
          idNumberIds: roomIds,
          idNumberType: roomType,
          promButtonName: promButtonName,
          promButtonIds: promButtonIds,
          promo_id_button_bron: promButtonIds[0],
          room_type: roomType[0]
        },
        () => {
          if (Platform.OS !== 'web') {
            this.c.valRef.current.select(1)
            this.c.promRef.current.select(0)
          }
        }
      )
    }
  }

  onSelectItem = (item, value) => {
    this.c.setState({ [item]: value })
  }
}

export default actionModalModel
