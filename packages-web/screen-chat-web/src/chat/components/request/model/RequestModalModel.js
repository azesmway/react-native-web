import orderBy from 'lodash/orderBy'

class requestModalModel {
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
    const { moment, chatServicePost } = this.rootprops

    const { user, closeModalRequest, onCancel } = this.c.props
    const { date_zaezd, msg, id_promo, pictures, price_full, cnt_days, id_categ1, id_categ2, id_user, roomSelect, room_title } = this.c.state
    let body = new FormData()
    let result

    let token = user.device ? user.device.token : ''
    let android_id_install = user.device ? user.android_id_install : ''

    body.append('token', token)
    body.append('android_id_install', android_id_install)
    body.append('id_promo', id_promo)
    body.append('id_promo_user', id_user)
    body.append('id_action', 15)
    body.append('price_full', price_full)
    body.append('cnt_days', cnt_days)
    body.append('id_categ1', id_categ1)
    body.append('id_categ2', id_categ2)
    if (roomSelect) {
      body.append('id_room', roomSelect)
      body.append('room_title', room_title)
    }
    body.append('date_zaezd', moment(date_zaezd).format('YYYY-MM-DD'))
    body.append('msg', msg)

    return await chatServicePost.fetchRequestMessage(body)
  }

  keyExtractor = (item, index) => index.toString()

  initData = async () => {
    const { chatServiceGet } = this.rootprops

    const { filter, user, request } = this.c.props
    const { currency } = this.c.state

    let token = user.device ? user.device.token : ''
    let android_id_install = user.device ? user.android_id_install : ''

    const catMain = await chatServiceGet.getPromoAction(android_id_install, token, filter.selectCategory.id)

    let id_hotel = Number(filter.selectedHotel) + 100000

    if (request && request.id_otel) {
      id_hotel = request.id_otel
    }

    const rooms = await chatServiceGet.getPromoActionRooms(android_id_install, token, id_hotel)

    let roomsName = []
    let roomIds = []

    for (let i = 0; i < rooms.length; i++) {
      // roomsName.push(rooms[i].name.replace(/&quot;/g, '"'))
      roomIds.push(rooms[i].id)

      roomsName.push({
        id: rooms[i].id,
        value: rooms[i].id,
        label: rooms[i].name.replace(/&quot;/g, '"'),
        title: rooms[i].name.replace(/&quot;/g, '"')
      })
    }

    catMain.curr = orderBy(catMain.curr, ['id'])
    for (let i = 0; i < catMain.curr.length; i++) {
      currency.push(catMain.curr[i].name)
    }

    this.c.setState({
      idCateg1: catMain.categ1,
      categ1Name: catMain.categ1_name,
      idCateg2: catMain.categ2,
      categ2Name: catMain.categ2_name,
      currency: currency,
      id_curr: 1,
      idNumber: roomsName,
      idNumberIds: roomIds
    })

    if (request) {
      this.c.setState({ price_full: request.price_full, cnt_days: request.cnt_days, id_promo: request.id_promo, id_user: request.id_user, idNumber: roomsName, idNumberIds: roomIds })
    }

    this.c.valRef.current.select(1)
  }

  onSelectItem = (item, value) => {
    this.c.setState({ [item]: value })
  }
}

export default requestModalModel
