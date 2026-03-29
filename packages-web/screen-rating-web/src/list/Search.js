import _ from 'lodash'
import { PureComponent } from 'react'
import { ActivityIndicator, Appearance, Button as NButton, Dimensions, FlatList, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native'

const titleScreen = 'ПОИСК'

function getAges() {
  const arr = []
  for (let i = 0; i <= 15; i += 1) {
    arr[i] = { name: `${i} лет`, value: i, uid: i + '' }
    if (i > 1 && i < 5) {
      arr[i].uid = i + ''
      arr[i].name = `${i} года`
    }
    if (i === 1) {
      arr[i].uid = i + ''
      arr[i].name = `${i} год`
    }
  }
  return arr
}

const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
const { getAppConstants } = GLOBAL_OBJ.onlinetur.storage
const { MAIN_COLOR } = GLOBAL_OBJ.onlinetur.constants
const { width, height } = Dimensions.get('window')

export default class SearchRating extends PureComponent {
  constructor(props) {
    super(props)

    const { moment } = this.props.utils

    this.state = {
      isLoading: true,
      min: 0,
      max: 10,
      modalVisible: false,
      list: {},
      listCountry: [],
      listCity: [],
      listSity: [],
      listPlace: [],
      listHotel: [],
      listHotelView: [],
      listPansions: [],
      listHotelStars: [],
      listAges: getAges(),
      //listCity: {},
      city: this.props.selectSearch && this.props.selectSearch.city ? this.props.selectSearch.city : {},
      sity: {},
      place: {},
      hotel: {},
      hotelView: [],
      pansion: this.props.selectSearch && this.props.selectSearch.pansion ? this.props.selectSearch.pansion : {},
      modalVisibleS: false,
      modalVisibleH: false,
      modalVisibleCountry: false,
      modalVisibleSity: false,
      modalVisibleHotels: false,
      modalVisiblePlaces: false,
      modalVisibleStars: false,
      modalVisiblePansions: false,
      modalVisibleAges: false,
      selected: [],
      places: [],
      action: () => {},
      date: moment().add('+6', 'day'),
      focus: 'startDate',
      startDate: this.props.selectSearch && this.props.selectSearch.startDate ? moment(new Date(this.props.selectSearch.startDate)) : moment().add('+6', 'day'),
      endDate: this.props.selectSearch && this.props.selectSearch.endDate ? moment(new Date(this.props.selectSearch.endDate)) : moment().add('+9', 'day'),
      modalVisibleC: false,
      human: this.props.selectSearch && this.props.selectSearch.human ? this.props.selectSearch.human : [1, 1],
      childs: this.props.selectSearch && this.props.selectSearch.childs ? this.props.selectSearch.childs : [],
      values: this.props.selectSearch && this.props.selectSearch.values ? this.props.selectSearch.values : [3, 14],
      url: '',
      width: Dimensions.get('window').width,
      height: Dimensions.get('window').height,
      loadCity: true,
      loadContries: true,
      loadPlaces: true,
      loadHotels: true,
      loadStars: true,
      loadPansions: true,
      searchBarHotel: '',
      valueType: props.user.notour === 1 ? (props.indexTab === 1 ? 'tur' : 'hotel') : 'tur',
      checkedAb: true,

      selectedHotel: new Map()
    }

    this.arrayholderHotels = []
  }

  componentDidMount = async () => {
    await this.initFrom()
  }

  /**
   * Инициализация данных формы.
   * @returns {Promise<void>}
   */
  initFrom = async () => {
    const { country, hotel } = this.props
    const { city, sity } = this.state
    this.getCountries().then(data1 => {
      this.setState({ loadCity: false, city: city.name ? city : data1[29], listCity: data1 }, async () => {
        this.getSity(this.state.city.uid).then(data2 => {
          const cn = country && Number(country) !== -1 ? country : '112'
          const currentCountry = data2.filter(c => Number(c.uid) === Number(cn))[0]
          this.setState(
            {
              loadContries: false,
              sity: currentCountry,
              selected: [],
              listCountry: data2,
              hotelView: [
                {
                  uid: hotel
                }
              ]
            },
            () => {
              // this.onPressPlaces(false)
              // this.onPressHotelsView(false)
              // this.onPressHotelsStars(false)
              // this.onPressPansions(false)

              if (currentCountry) {
                this.selectSity(currentCountry)
              }
            }
          )
        })
      })
    })
  }

  /**
   * Получаем список доступных стран.
   * @returns {Promise<any>}
   */
  getCountries = async () => {
    const { chatServiceGet } = this.props.utils
    const path = getAppConstants().url_beta

    return chatServiceGet.fetch(path + '/countries0.php?cities=1').then(response => response)
  }

  /**
   * Выбор города вылета.
   * @returns {Promise<void>}
   */
  onPressSity = async () => {
    let selected = []
    selected.push(this.state.city.uid)

    this.setState({
      modalVisibleSity: true,
      list: { title: 'Откуда' },
      action: this.selectCity.bind(this),
      selected: selected
    })
  }

  /**
   * Выбор страны куда летим
   * @returns {Promise<void>}
   */
  onPressCountries = async () => {
    let selected = []
    selected.push(this.state.sity.uid)

    this.setState({
      modalVisibleCountry: true,
      action: this.selectSity.bind(this),
      selected: selected
    })
  }

  /**
   * Загрузка и выбор курортов.
   * @param press
   */
  onPressPlaces = press => {
    const { place } = this.props

    if (!press) {
      this.getPlaces(this.state.sity.uid).then(data => {
        const currentPlace = data.filter(c => Number(c.uid) === Number(place))[0]

        if (place && currentPlace) {
          this.setState(
            {
              loadPlaces: false,
              listPlace: data
            },
            () => {
              this.togglePlaces(currentPlace)
            }
          )
        } else {
          this.setState({
            loadPlaces: false,
            listPlace: data
          })
        }
      })
    } else {
      this.setState({
        modalVisiblePlaces: true,
        list: { title: 'Курорт' },
        action: this.selectPlace.bind(this)
      })
    }
  }

  /**
   * Загрузка и выбор отелей по стране.
   * @param press
   */
  onPressHotelsView = press => {
    const { hotel } = this.props

    if (!press) {
      this.getHotels(this.state.sity.uid).then(data => {
        data = data.h ? data.h : []

        for (let a = 0; a < data.length; a++) {
          data[a].uid = data[a].id
        }

        this.arrayholderHotels = data
        const currentHotel = data.filter(c => Number(c.id) === Number(hotel))[0]

        if (hotel && currentHotel) {
          this.setState({
            loadHotels: false,
            listHotelView: data,
            hotelView: [currentHotel]
          })
        } else {
          this.setState({
            loadHotels: false,
            listHotelView: data
          })
        }
      })
    } else {
      this.setState({
        modalVisibleHotels: true,
        list: { title: 'Отели' },
        action: this.selectHotelView.bind(this)
      })
    }
  }

  /**
   * Загрузка и выбор категории отеля.
   * @param press
   * @returns {Promise<void>}
   */
  onPressHotelsStars = async press => {
    const { hclass } = this.props

    if (!press) {
      this.getStars(this.state.city.uid).then(data => {
        for (let i = 0; i < data.length; i++) {
          data[i].uid = data[i].id
        }

        const currentStar = data.filter(c => c.name === hclass)[0]

        if (hclass && currentStar) {
          this.setState(
            {
              loadStars: false,
              listHotelStars: [{ uid: 1, name: 'Любая' }, ...data]
            },
            () => {
              this.toggleStars(currentStar)
            }
          )
        } else {
          this.setState({
            loadStars: false,
            listHotelStars: [{ uid: 1, name: 'Любая' }, ...data]
          })
        }
      })
    } else {
      this.setState({
        modalVisibleStars: true,
        action: this.selectHotel.bind(this)
      })
    }
  }

  /**
   * Загрузка и выбор вариантов питания.
   * @param press
   * @returns {Promise<void>}
   */
  onPressPansions = async press => {
    if (!press) {
      this.getPansions().then(data => {
        for (let i = 0; i < data.length; i++) {
          data[i].uid = data[i].id
        }

        this.setState({
          loadPansions: false,
          listPansions: [{ uid: 1, name: 'Любое' }, ...data]
        })
      })
    } else {
      this.setState({
        modalVisiblePansions: true,
        action: this.selectPansions.bind(this)
      })
    }
  }

  selectCity(el) {
    this.setState({ city: el, modalVisible: false })
  }

  selectSity(el) {
    this.setState({ sity: el, places: [], hotelView: [], selected: [] })
  }

  selectPlace(el) {
    this.setState({ place: el, modalVisibleS: false })
  }

  selectHotelView(el) {
    this.setState({ hotelView: el, modalVisibleS: false })
  }

  selectHotel(el) {
    this.setState({ hotel: el, modalVisible: false })
  }

  selectPansions(el) {
    this.setState({ pansion: el, modalVisible: false })
  }

  search = () => {
    const { setSelectSearch, currentCategory, user } = this.props
    const { human, childs, city, sity, places, startDate, endDate, values, pansion, hotel, hotelView, valueType, checkedAb } = this.state
    const ikol = human.length
    const cntDeti = childs.length

    let places_id = '&mplaces[]='
    for (let i = 0; i < places.length; i++) {
      if (places_id === '&mplaces[]=') {
        places_id += places[i].uid
      } else {
        places_id += '&mplaces[]=' + places[i].uid
      }
    }

    const listHotels = GLOBAL_OBJ.onlinetur.ratingHotels
    const hotelOne = this.props.hotel && this.props.hotel !== -1 ? this.props.hotel : listHotels[0].huid

    let hotels_id = '&hotels[]=' + hotelOne
    // for (let i = 0; i < hotelView.length; i++) {
    //   if (hotels_id === '&hotels[]=') {
    //     hotels_id += hotelView[i].uid
    //   } else {
    //     hotels_id += '&hotels[]=' + hotelView[i].uid
    //   }
    // }

    for (let i = 0; i < 10; i++) {
      if (Number(listHotels[i].huid) !== Number(hotelOne)) {
        hotels_id += '&hotels[]=' + listHotels[i].huid
      }
    }

    const pansions_id = pansion.id ? pansion.id : ''
    const n1 = values[0]
    const n2 = values[1]

    const idHotel = Number(hotelOne) + 100000
    let android_id_install = ''
    let token = ''

    if (!_.isEmpty(user)) {
      android_id_install = user.android_id_install
      token = user.device.token
    }

    const path = getAppConstants().url_beta

    let url = path + '/results.php?json=1&ad=1'
    let d1 = startDate.format('YYYY-MM-DD')
    let d2 = endDate.format('YYYY-MM-DD')

    const p = getAppConstants().url_main.includes('onlinetur.ru') ? getAppConstants().url_main : getAppConstants().url_main
    // eslint-disable-next-line max-len
    let url2 = `${p}/api/chat_v3/get_list_promo.php?token=${token}&android_id_install=${android_id_install}&id_categories=${currentCategory.id}&lim=20&ofs=0&sort=&cuid=&puid=&hclass=&date_from=${d1}&date_to=${d2}&pattern=`

    d1 = startDate.format('DD.MM.YYYY')
    d2 = endDate.format('DD.MM.YYYY')

    if (valueType === 'tur' && checkedAb) {
      url += `&onlyRoom=&flightFrom=${city.uid}`
    } else {
      url += '&onlyRoom=on&flightFrom=-1'
    }

    url += `&country=${listHotels[0].cuid}&dateStart=${d1}&dateBack=${d2}&date_plus=0&nightsMin=${n1}&nightsMax=${n2}&pansionType=${pansions_id}`

    if (ikol && ikol > 0) {
      url += `&adult=${ikol}`
    } else {
      url += '&adult=1'
    }

    if (cntDeti && cntDeti > 0) {
      url += `&child=${cntDeti}`
      url += childs.map((c, i) => '&cage' + (i + 1) + '=' + c.value).join('')
    }

    url += '&accomType=44'

    if (hotels_id) {
      url += hotels_id
    }

    url += '&roomsCount=1&resnewtable=1&advancedsearch=1&submit=1'

    if (user && user.device && user.device.token) {
      url += '&apid=' + user.id_user + (user.is_sotr === 1 ? '&agn=2' : '')
      url2 += '&apid=' + user.id_user + (user.is_sotr === 1 ? '&agn=2' : '')
    }

    // setSelectSearch({ human, childs, city, sity, places, startDate, endDate, values, pansion, hotel: this.props.hotel, hotelView, listHotels }, valueType === 'tur' ? url : url2)
    setSelectSearch({ human, childs, city, sity, places, startDate, endDate, values, pansion, hotel: hotelOne, hotelView, listHotels }, url, valueType === 'tur' ? 1 : 2)
  }

  getSity = async city => {
    const { chatServiceGet } = this.props.utils
    const path = getAppConstants().url_beta

    return chatServiceGet
      .fetch(`${path}/countries0.php?countries=1&city=${city}`)
      .then(response => response)
      .catch(err => {
        return []
      })
  }

  getPlaces = async country => {
    const { chatServiceGet } = this.props.utils
    const path = getAppConstants().url_beta

    return chatServiceGet
      .fetch(`${path}/places.php?json=1&country=${country}&app=11`)
      .then(response => response)
      .catch(err => {
        return []
      })
  }

  getHotels = async country => {
    const { chatServiceGet } = this.props.utils
    const path = getAppConstants().url_beta

    return chatServiceGet
      .fetch(`${path}/hotels.php?json=2&country=${country}`)
      .then(response => response)
      .catch(err => {
        return []
      })
  }

  getHotelsByPlaces = async country => {
    const { chatServiceGet } = this.props.utils
    const path = getAppConstants().url_beta

    let places = ''
    for (let i = 0; i < this.state.places.length; i++) {
      places += this.state.places[i].uid + ','
    }
    return chatServiceGet
      .fetch(`${path}/hotels.php?json=2&country=${country}&place=${places}`)
      .then(response => response)
      .catch(err => {
        return []
      })
  }

  getStars() {
    const { chatServiceGet } = this.props.utils
    const path = getAppConstants().url_beta

    return chatServiceGet
      .fetch(`${path}/api/index.php?action=get_hotelClasses`)
      .then(response => response)
      .catch(err => {
        return []
      })
  }

  getPansions() {
    const { chatServiceGet } = this.props.utils
    const path = getAppConstants().url_beta

    return chatServiceGet
      .fetch(`${path}/api/index.php?action=get_pansions`)
      .then(response => response)
      .catch(err => {
        return []
      })
  }

  selectChilds(el) {
    this.setState({ childs: [...this.state.childs, el], modalVisible: false })
  }

  onOpenWebPage = () => {}

  alertInit = () => {
    const { Alert } = this.props.utils

    Alert.alert('Поиск туров', 'Перейти к последнему поиску', [
      { text: 'Отмена', style: 'destructive' },
      { text: 'Перейти', onPress: this.onOpenWebPage }
    ])
  }

  toggle = el => {
    const { selected, listPlace } = this.state
    if (selected.indexOf(el.uid) === -1) {
      selected.push(el.uid)
      const places = selected.map(el => {
        return listPlace.find(elem => elem.uid === el) ? listPlace.find(elem => elem.uid === el) : false
      })
      this.setState({ selected: selected, places })
      return
    }
    selected.splice(selected.indexOf(el.uid), 1)
    const places = selected.map(el => {
      //listPlace
      return listPlace.find(elem => elem.uid === el) ? listPlace.find(elem => elem.uid === el) : false
    })
    this.setState({ selected: selected, places })
  }

  togglePlaces = el => {
    const { selected, listPlace } = this.state
    if (selected.indexOf(el.uid) === -1) {
      selected.push(el.uid)
      const places = selected.map(el => {
        return listPlace.find(elem => elem.uid === el) ? listPlace.find(elem => elem.uid === el) : false
      })

      this.setState({ selected: selected, places })
      return
    }
    selected.splice(selected.indexOf(el.uid), 1)
    const places = selected.map(el => {
      //listPlace
      return listPlace.find(elem => elem.uid === el) ? listPlace.find(elem => elem.uid === el) : false
    })
    this.setState({ selected: selected, places })
  }

  toggleCity = el => {
    let selected = []
    selected.push(el.uid)
    this.setState({ selected: selected, city: el })
  }

  toggleCountry = el => {
    let selected = []
    selected.push(el.uid)
    console.log('toggleCountry', el)
    this.setState({ selected: selected, sity: el })
  }

  toggleStars = el => {
    let selected = []
    selected.push(el.uid)
    this.setState({ selected: selected, hotel: el })
  }

  togglePansion = el => {
    let selected = []
    selected.push(el.uid)
    this.setState({ selected: selected, pansion: el })
  }

  toggleAges = el => {
    let selected = []
    selected.push(el.uid)
    this.setState({ selected: selected, childs: [...this.state.childs, el] })
  }

  toggleHotel = el => {
    if (this.state.selected.indexOf(el.uid) === -1) {
      this.state.selected.push(el.uid)
      this.setState({ selected: this.state.selected })
    } else {
      const newSelect = this.state.selected.filter(function (elem) {
        return elem !== el.uid
      })
      this.setState({ selected: newSelect })
    }
  }

  goBack = () => {
    this._web.goBack()
  }

  goForward = () => {
    this._web.goForward()
  }

  reload = () => {
    this._web.reload()
  }

  onPressDate = () => {
    this.setState({ modalVisibleC: true })
  }

  /**
   * Модальное окно для выбора города вылета.
   **/
  modalCity = () => {
    const { theme, Portal, Modal, ListItem, isMobile, Header } = this.props.utils

    let isDarkMode = Appearance.getColorScheme() === 'dark'
    let bg = isDarkMode ? theme.dark.colors.background : theme.light.colors.background
    let txt = isDarkMode ? theme.dark.colors.text : theme.light.colors.text

    return (
      <Portal>
        <Modal visible={this.state.modalVisibleSity} onDismiss={() => this.setState({ modalVisibleSity: false })} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <View
            style={{
              alignSelf: 'center',
              borderRadius: 5,
              height: Dimensions.get('window').height / 2,
              width: isMobile ? width : width / 2,
              backgroundColor: bg
            }}>
            <Header
              {...this.props}
              onlineTurHeader
              centerComponent={{
                text: 'Выберите город вылета',
                style: { color: txt, fontSize: 16, fontWeight: 'bold', paddingTop: 2 }
              }}
              backgroundColor={isDarkMode ? bg : '#ececec'}
              containerStyle={{ borderTopLeftRadius: 15, borderTopRightRadius: 15, borderBottomWidth: 1 }}
            />
            <View style={{ flex: 1, alignItems: 'flex-start', backgroundColor: bg }}>
              <ScrollView style={{ height: '100%', width: '100%' }}>
                {this.state.listCity &&
                  this.state.listCity.map((el, ind) => {
                    return (
                      <ListItem key={el.uid} bottomDivider containerStyle={{ backgroundColor: bg }}>
                        <ListItem.CheckBox
                          title={el.name}
                          checked={this.state.selected.indexOf(el.uid) !== -1}
                          onPress={() => this.toggleCity(el)}
                          containerStyle={{ backgroundColor: 'transparent', borderWidth: 0, color: txt }}
                          textStyle={{ color: txt, fontWeight: 'normal' }}
                        />
                      </ListItem>
                    )
                  })}
              </ScrollView>
            </View>
            <View
              footer
              bordered
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                backgroundColor: bg
              }}>
              <NButton title={'Закрыть'} onPress={() => this.setState({ modalVisibleSity: false, selected: [] })} color={'red'} />
              <NButton title={'Выбрать'} onPress={() => this.setState({ modalVisibleSity: false })} />
            </View>
          </View>
        </Modal>
      </Portal>
    )
  }

  /**
   * Модальное окно для выбора страны прилета.
   **/
  modalCountry = () => {
    const { theme, Portal, Modal, ListItem } = this.props.utils

    return (
      <Portal>
        <Modal visible={this.state.modalVisibleCountry} onDismiss={() => this.setState({ modalVisibleCountry: false })} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <View
            style={{
              alignSelf: 'center',
              borderRadius: 5,
              height: Dimensions.get('window').height - 200,
              width: Dimensions.get('window').width - 40,
              backgroundColor: '#ffffff'
            }}>
            <View header bordered style={{ backgroundColor: '#f8f8f8' }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.text }}>Выберите страну</Text>
            </View>
            <View style={{ flex: 1, alignItems: 'flex-start' }}>
              <ScrollView style={{ height: '100%', width: '100%' }}>
                {this.state.listCountry &&
                  this.state.listCountry.map((el, ind) => {
                    return (
                      <ListItem key={el.uid} bottomDivider>
                        <ListItem.CheckBox
                          title={el.name}
                          checked={this.state.selected.indexOf(el.uid) !== -1}
                          onPress={() => this.toggleCountry(el)}
                          containerStyle={{ backgroundColor: 'transparent', borderWidth: 0 }}
                        />
                      </ListItem>
                    )
                  })}
              </ScrollView>
            </View>
            <View
              footer
              bordered
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between'
              }}>
              <NButton title={'Закрыть'} onPress={() => this.setState({ modalVisibleCountry: false, selected: [] })} />
              <NButton
                title={'Выбрать'}
                onPress={() =>
                  this.setState({ modalVisibleCountry: false, loadPlaces: true, loadHotels: true, places: [], hotelView: [], selected: [] }, () => {
                    this.onPressPlaces(false)
                    this.onPressHotelsView(false)
                  })
                }
              />
            </View>
          </View>
        </Modal>
      </Portal>
    )
  }

  /**
   * Модальное окно для выбора курортов.
   **/
  modalPlaces = () => {
    const { theme, Portal, Modal, ListItem } = this.props.utils

    return (
      <Portal>
        <Modal visible={this.state.modalVisiblePlaces} onDismiss={() => this.setState({ modalVisiblePlaces: false })} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <View
            style={{
              alignSelf: 'center',
              borderRadius: 5,
              height: Dimensions.get('window').height - 200,
              width: Dimensions.get('window').width - 40,
              backgroundColor: '#ffffff'
            }}>
            <View header bordered style={{ backgroundColor: '#f8f8f8' }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.text }}>Выберите курорт</Text>
            </View>
            <View style={{ flex: 1, alignItems: 'flex-start' }}>
              <ScrollView style={{ height: '100%', width: '100%' }}>
                {this.state.listPlace &&
                  this.state.listPlace.map((el, ind) => {
                    return (
                      <ListItem key={el.uid} bottomDivider>
                        <ListItem.CheckBox
                          title={el.name}
                          checked={this.state.selected.indexOf(el.uid) !== -1}
                          onPress={() => this.togglePlaces(el)}
                          containerStyle={{ backgroundColor: 'transparent', borderWidth: 0 }}
                        />
                      </ListItem>
                    )
                  })}
              </ScrollView>
            </View>
            <View
              footer
              bordered
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between'
              }}>
              <NButton color={'red'} title={'Очистить'} onPress={() => this.setState({ modalVisiblePlaces: false, selected: [], places: [] })} />
              <NButton
                title={'Выбрать'}
                onPress={() =>
                  this.setState({ modalVisiblePlaces: false, loadHotels: true, hotelView: [], selected: [] }, async () => {
                    this.getHotelsByPlaces(this.state.sity.uid).then(data => {
                      data = data.h

                      for (let a = 0; a < data.length; a++) {
                        data[a].uid = data[a].id
                      }

                      this.arrayholderHotels = data

                      this.setState({
                        loadHotels: false,
                        listHotelView: data
                      })
                    })
                  })
                }
              />
            </View>
          </View>
        </Modal>
      </Portal>
    )
  }

  renderItemHotels = el => {
    const { ListItem } = this.props.utils

    return (
      <ListItem key={el.item.uid.toString()} bottomDivider>
        <ListItem.CheckBox
          title={el.item.name}
          checked={!!this.state.selectedHotel.get(el.item.uid)}
          onPress={() => this.changeSelectRow(el.item)}
          containerStyle={{ backgroundColor: 'transparent', borderWidth: 0 }}
        />
      </ListItem>
    )
  }

  keyExtractor = (item, index) => item.uid.toString()

  SearchFilterHotel = text => {
    const newData = this.arrayholderHotels.filter(function (item) {
      const itemData = item.name ? item.name.toUpperCase() : ''.toUpperCase()
      const textData = text.toUpperCase()
      return itemData.indexOf(textData) > -1
    })
    this.setState({
      listHotelView: newData,
      searchBarHotel: text
    })
  }

  changeSelectRow = item => {
    this.setState(
      state => {
        const selectedHotel = new Map(state.selectedHotel)
        selectedHotel.set(item.uid, !selectedHotel.get(item.uid))

        return { selectedHotel }
      },
      () => {
        if (this.state.selectedHotel.get(item.uid)) {
          let h = this.state.hotelView
          h.push(item)
          this.setState({ hotelView: h })
        } else {
          const newSelect = this.state.hotelView.filter(function (elem) {
            return item.uid !== elem.uid
          })
          this.setState({ hotelView: newSelect })
        }
      }
    )
  }

  /**
   * Модальное окно для выбора отелей.
   **/
  modalHotels = () => {
    const { theme, Portal, Modal, SearchBar } = this.props.utils

    return (
      <Portal>
        <Modal visible={this.state.modalVisibleHotels} onDismiss={() => this.setState({ modalVisibleHotels: false })} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <View
            style={{
              alignSelf: 'center',
              borderRadius: 5,
              height: Dimensions.get('window').height - 200,
              width: Dimensions.get('window').width - 40,
              backgroundColor: '#ffffff'
            }}>
            <View header bordered style={{ backgroundColor: '#f8f8f8' }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.text }}>Выберите отели</Text>
            </View>
            <View style={{ flex: 1 }}>
              <SearchBar
                placeholder="Поиск отеля..."
                onChangeText={text => this.SearchFilterHotel(text)}
                value={this.state.searchBarHotel}
                lightTheme={true}
                inputStyle={{ backgroundColor: '#fff' }}
                inputContainerStyle={{ backgroundColor: '#fff' }}
                autoCapitalize={'none'}
                autoCorrect={false}
              />
              <FlatList data={this.state.listHotelView} keyExtractor={this.keyExtractor} renderItem={this.renderItemHotels} enableEmptySections={true} extraData={this.state} />
            </View>
            <View
              footer
              bordered
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between'
              }}>
              <NButton title={'Очистить'} color={'red'} onPress={() => this.setState({ modalVisibleHotels: false, selected: [], hotelView: [], selectedHotel: new Map() })} />
              <NButton title={'Выбрать'} onPress={() => this.setState({ modalVisibleHotels: false })} />
            </View>
          </View>
        </Modal>
      </Portal>
    )
  }

  /**
   * Модальное окно для выбора категории отелей.
   **/
  modalStars = () => {
    const { theme, Portal, Modal, ListItem } = this.props.utils

    return (
      <Portal>
        <Modal visible={this.state.modalVisibleStars} onDismiss={() => this.setState({ modalVisibleStars: false })} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <View
            style={{
              alignSelf: 'center',
              borderRadius: 5,
              height: Dimensions.get('window').height - 200,
              width: Dimensions.get('window').width - 40,
              backgroundColor: '#ffffff'
            }}>
            <View header bordered style={{ backgroundColor: '#f8f8f8' }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.text }}>Выберите категорию отеля</Text>
            </View>
            <View style={{ flex: 1, alignItems: 'flex-start' }}>
              <ScrollView style={{ height: '100%', width: '100%' }}>
                {this.state.listHotelStars &&
                  this.state.listHotelStars.map((el, ind) => {
                    return (
                      <ListItem key={el.uid} bottomDivider>
                        <ListItem.CheckBox
                          title={el.name}
                          checked={this.state.selected.indexOf(el.uid) !== -1}
                          onPress={() => this.toggleStars(el)}
                          containerStyle={{ backgroundColor: 'transparent', borderWidth: 0 }}
                        />
                      </ListItem>
                    )
                  })}
              </ScrollView>
            </View>
            <View
              footer
              bordered
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between'
              }}>
              <NButton title={'Очистить'} color={'red'} onPress={() => this.setState({ modalVisibleStars: false, selected: [], hotel: { uid: 1, name: 'Любая' } })} />
              <NButton title={'Выбрать'} onPress={() => this.setState({ modalVisibleStars: false })} />
            </View>
          </View>
        </Modal>
      </Portal>
    )
  }

  /**
   * Модальное окно для выбора питания.
   **/
  modalPansions = () => {
    const { theme, Portal, Modal, ListItem } = this.props.utils

    return (
      <Portal>
        <Modal visible={this.state.modalVisiblePansions} onDismiss={() => this.setState({ modalVisiblePansions: false })} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <View
            style={{
              alignSelf: 'center',
              borderRadius: 5,
              height: Dimensions.get('window').height - 200,
              width: Dimensions.get('window').width - 40,
              backgroundColor: '#ffffff'
            }}>
            <View header bordered style={{ backgroundColor: '#f8f8f8' }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.text }}>Выберите категорию отеля</Text>
            </View>
            <View style={{ flex: 1, alignItems: 'flex-start' }}>
              <ScrollView style={{ height: '100%', width: '100%' }}>
                {this.state.listPansions &&
                  this.state.listPansions.map((el, ind) => {
                    return (
                      <ListItem key={el.uid} bottomDivider>
                        <ListItem.CheckBox
                          title={el.name}
                          checked={this.state.selected.indexOf(el.uid) !== -1}
                          onPress={() => this.togglePansion(el)}
                          containerStyle={{ backgroundColor: 'transparent', borderWidth: 0 }}
                        />
                      </ListItem>
                    )
                  })}
              </ScrollView>
            </View>
            <View
              footer
              bordered
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between'
              }}>
              <NButton title={'Очистить'} color={'red'} onPress={() => this.setState({ modalVisiblePansions: false, selected: [], pansion: { uid: 1, name: 'Любое' } })} />
              <NButton title={'Выбрать'} onPress={() => this.setState({ modalVisiblePansions: false })} />
            </View>
          </View>
        </Modal>
      </Portal>
    )
  }

  /**
   * Выбор дат вылета.
   * @returns {*}
   */
  modalDates = () => {
    const { theme, Portal, Modal, moment, DatesClass, Header } = this.props.utils

    class Dates extends DatesClass {
      state = {
        currentDate: moment(),
        focusedMonth: moment().add('+6', 'day').startOf('month')
      }

      constructor() {
        super()
      }
    }

    const isDateBlocked = date => date.isBefore(moment(), 'day')

    const onDatesChange = ({ startDate, endDate, focusedInput }) => this.setState({ ...this.state, focus: focusedInput }, () => this.setState({ ...this.state, startDate, endDate }))

    let isDarkMode = Appearance.getColorScheme() === 'dark'
    let bg = isDarkMode ? theme.dark.colors.background : theme.light.colors.background
    let txt = isDarkMode ? theme.dark.colors.text : theme.light.colors.text
    let link = isDarkMode ? theme.dark.colors.link : theme.light.colors.link

    return (
      <Portal>
        <Modal visible={this.state.modalVisibleC} onDismiss={() => this.setState({ modalVisibleC: false })} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <View
            style={{
              alignSelf: 'center',
              borderRadius: 10,
              height: Dimensions.get('window').height / 2.2,
              width: 300,
              backgroundColor: bg
            }}>
            <Header
              {...this.props}
              onlineTurHeader
              centerComponent={{
                text: 'Выберите даты',
                style: { color: txt, fontSize: 16, fontWeight: 'bold', paddingTop: 2 }
              }}
              backgroundColor={isDarkMode ? bg : '#ececec'}
              containerStyle={{ borderTopLeftRadius: 15, borderTopRightRadius: 15, borderBottomWidth: 1 }}
            />
            <View style={{ flex: 1, alignItems: 'center', backgroundColor: bg }}>
              <Dates onDatesChange={onDatesChange} isDateBlocked={isDateBlocked} startDate={this.state.startDate} endDate={this.state.endDate} focusedInput={this.state.focus} range />
            </View>
            <View
              footer
              bordered
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                backgroundColor: bg
              }}>
              <NButton title={'Закрыть'} onPress={() => this.setState({ modalVisibleC: false })} color={'red'} />
              <NButton title={'Выбрать'} onPress={() => this.setState({ modalVisibleC: false })} color={MAIN_COLOR} />
            </View>
          </View>
        </Modal>
      </Portal>
    )
  }

  /**
   * Выбор возраста детей.
   * @returns {*}
   */
  modalAges = () => {
    const { theme, Portal, Modal, Icon, ListItem } = this.props.utils

    let isDarkMode = Appearance.getColorScheme() === 'dark'
    let bg = isDarkMode ? theme.dark.colors.background : theme.light.colors.background
    let txt = isDarkMode ? theme.dark.colors.text : theme.light.colors.text
    let link = isDarkMode ? theme.dark.colors.link : theme.light.colors.link

    return (
      <Portal>
        <Modal visible={this.state.modalVisibleAges} onDismiss={() => this.setState({ modalVisibleAges: false })} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <View
            style={{
              alignSelf: 'center',
              borderRadius: 5,
              height: Dimensions.get('window').height / 2,
              width: Dimensions.get('window').width - 40,
              backgroundColor: bg
            }}>
            <View header bordered style={{ backgroundColor: bg, flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: txt }}>Выберите возраст</Text>
              <TouchableOpacity
                onPress={() => {
                  this.setState({ modalVisibleAges: false })
                }}>
                <Icon name={'close'} color={'red'} />
              </TouchableOpacity>
            </View>
            <View style={{ flex: 1, alignItems: 'flex-start', backgroundColor: bg }}>
              <ScrollView style={{ height: '100%', width: '100%' }}>
                {this.state.listAges &&
                  this.state.listAges.map((el, ind) => {
                    return (
                      <ListItem key={el.uid} bottomDivider containerStyle={{ backgroundColor: bg }}>
                        <ListItem.CheckBox
                          title={el.name}
                          checked={this.state.selected.indexOf(el.uid) !== -1}
                          onPress={() => this.toggleAges(el)}
                          containerStyle={{ backgroundColor: 'transparent', borderWidth: 0, color: txt }}
                          textStyle={{ color: txt, fontWeight: 'normal' }}
                        />
                      </ListItem>
                    )
                  })}
              </ScrollView>
            </View>
            <View
              footer
              bordered
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                backgroundColor: bg
              }}>
              <NButton title={'Очистить'} color={'red'} onPress={() => this.setState({ modalVisibleAges: false, selected: [], childs: [] })} />
              <NButton title={'Выбрать'} onPress={() => this.setState({ modalVisibleAges: false, selected: [] })} />
            </View>
          </View>
        </Modal>
      </Portal>
    )
  }

  renderLeftIcon = () => {
    const { Icon } = this.props.utils
    const { closeModalFilter } = this.props

    return (
      <TouchableOpacity onPress={() => closeModalFilter()}>
        <Icon name={'close'} color={'red'} />
      </TouchableOpacity>
    )
  }

  render() {
    const { theme, Portal, Modal, Icon, Header, Tab, CheckBox } = this.props.utils

    const { user } = this.props
    const { city, pansion, hotel, human, hotelView, childs, valueType, checkedAb } = this.state

    let isDarkMode = Appearance.getColorScheme() === 'dark'
    let bg = isDarkMode ? theme.dark.colors.background : theme.light.colors.background
    let txt = isDarkMode ? theme.dark.colors.text : theme.light.colors.text
    let link = isDarkMode ? theme.dark.colors.link : theme.light.colors.link

    return (
      <>
        <>
          <Header
            {...this.props}
            onlineTurHeader
            statusBarProps={{ translucent: true }}
            leftComponent={this.renderLeftIcon()}
            centerComponent={{
              text: titleScreen,
              style: { color: txt, fontSize: 16, fontWeight: 'bold', paddingTop: 2 }
            }}
            backgroundColor={isDarkMode ? bg : '#ececec'}
            containerStyle={{ borderTopLeftRadius: 15, borderTopRightRadius: 15, borderBottomWidth: 1 }}
          />
          <Tab value={valueType === 'tur' ? 0 : 1} onChange={index => this.setState({ valueType: index === 0 ? 'tur' : 'hotel' })} indicatorStyle={{ backgroundColor: MAIN_COLOR }}>
            <Tab.Item
              title={
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ color: txt }}>ТУРЫ</Text>
                  <Text style={{ fontSize: 11, color: txt }}>(все туроператоры)</Text>
                </View>
              }
              titleStyle={{ fontSize: 14, color: valueType === 'tur' ? MAIN_COLOR : txt }}
              buttonStyle={{ borderBottomColor: valueType === 'tur' ? MAIN_COLOR : bg, backgroundColor: bg }}
            />
            <Tab.Item
              title={
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ color: txt }}>ОТЕЛИ</Text>
                  <Text style={{ fontSize: 11, color: txt }}>(прямое бронирование)</Text>
                </View>
              }
              titleStyle={{ fontSize: 14, color: valueType === 'hotel' ? MAIN_COLOR : txt }}
              buttonStyle={{ borderBottomColor: valueType === 'hotel' ? MAIN_COLOR : bg, backgroundColor: bg }}
            />
          </Tab>
          {valueType === 'tur' ? (
            <View style={{ flexDirection: 'row', margin: 4, marginTop: 20, justifyContent: 'space-between' }}>
              <CheckBox
                title="Тур с билетами"
                checked={checkedAb}
                onPress={() => this.setState({ checkedAb: !checkedAb, valueType: checkedAb ? 'hotel' : 'tur' })}
                containerStyle={{ backgroundColor: 'transparent', margin: 0, borderWidth: 0 }}
                checkedColor={MAIN_COLOR}
                uncheckedColor={MAIN_COLOR}
                textStyle={{ color: txt, fontWeight: 'normal', fontSize: 12 }}
              />
              <View
                style={{
                  flexDirection: 'row',
                  padding: 4,
                  backgroundColor: 'transparent',
                  marginRight: 14
                }}>
                <View style={{ justifyContent: 'center', marginRight: 5 }}>
                  <Text style={{ color: txt, fontSize: 12 }}>{'Откуда: '}</Text>
                </View>
                <TouchableOpacity onPress={this.onPressSity} disabled={!checkedAb} style={{ justifyContent: 'center', backgroundColor: 'transparent' }}>
                  {this.state.loadCity ? (
                    <ActivityIndicator animating size={'small'} />
                  ) : (
                    <View style={{ flexDirection: 'row', backgroundColor: 'transparent' }}>
                      <Text
                        style={{
                          color: !checkedAb ? '#d3d3d3' : isDarkMode ? link : MAIN_COLOR,
                          fontWeight: 'bold',
                          fontSize: 15,
                          marginTop: 3
                        }}>
                        {city.name}
                      </Text>
                      <Icon name={'edit'} color={MAIN_COLOR} style={{ marginLeft: 5 }} />
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ) : null}
          <View style={{ width: '100%', alignItems: 'center', marginVertical: 20 }}>
            <View style={{ padding: 4, flexDirection: 'row' }}>
              <TouchableOpacity onPress={this.onPressDate}>
                <View style={{ padding: 10 }}>
                  <Text style={{ color: txt, fontSize: 12 }}>{'Выберите даты'}</Text>
                  <Text
                    style={{
                      color: MAIN_COLOR,
                      fontWeight: 'bold',
                      paddingTop: 3,
                      fontSize: 18
                    }}>
                    c {this.state.startDate && this.state.startDate.format('DD MMMM')} по {this.state.endDate && this.state.endDate.format('DD MMMM')}
                  </Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={this.onPressDate} style={{ width: 50, alignItems: 'flex-start', justifyContent: 'center', top: 7 }}>
                <Icon name={'edit'} color={MAIN_COLOR} />
              </TouchableOpacity>
            </View>
          </View>
          <View style={{ flexDirection: 'row', margin: 4, marginTop: 0 }}>
            <View
              style={{
                width: '50%',
                padding: 6
              }}>
              <Text style={{ color: txt, fontSize: 12, alignSelf: 'center' }}>Взрослые ({human.length})</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 10 }}>
                <TouchableOpacity onPress={() => this.setState({ human: [1] })}>
                  <Icon type={'feather'} name={'user'} style={{ marginLeft: 0 }} size={30} color={isDarkMode ? (human[0] ? '#ccc' : 'gray') : human[0] ? MAIN_COLOR : '#ccc'} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() =>
                    this.setState({
                      human: human[1] && !human[2] ? [1] : [1, 1]
                    })
                  }>
                  <Icon type={'feather'} name={'user'} style={{ marginLeft: 0 }} size={30} color={isDarkMode ? (human[1] ? '#ccc' : 'gray') : human[1] ? MAIN_COLOR : '#ccc'} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() =>
                    this.setState({
                      human: human[2] && !human[3] ? [1, 1] : [1, 1, 1]
                    })
                  }>
                  <Icon type={'feather'} name={'user'} style={{ marginLeft: 0 }} size={30} color={isDarkMode ? (human[2] ? '#ccc' : 'gray') : human[2] ? MAIN_COLOR : '#ccc'} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() =>
                    this.setState({
                      human: human[3] && !human[4] ? [1, 1, 1] : [1, 1, 1, 1]
                    })
                  }>
                  <Icon type={'feather'} name={'user'} style={{ marginLeft: 0 }} size={30} color={isDarkMode ? (human[3] ? '#ccc' : 'gray') : human[3] ? MAIN_COLOR : '#ccc'} />
                </TouchableOpacity>
              </View>
            </View>
            <View style={{ width: 20 }} />
            <View
              style={{
                width: '50%',
                padding: 4
              }}>
              <Text style={{ color: txt, fontSize: 12, alignSelf: 'center' }}>Дети</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 10 }}>
                <TouchableOpacity
                  style={{ alignItems: 'center' }}
                  onPress={() => {
                    if (childs[1]) {
                      this.setState({ childs: [childs[1]] })
                      return
                    }
                    if (childs[0]) {
                      this.setState({ childs: [] })
                      return
                    }
                    this.setState({
                      modalVisibleAges: true,
                      list: { title: 'Возраст', data: this.state.listAges },
                      action: this.selectChilds.bind(this)
                    })
                  }}>
                  <Icon type={'feather'} name={'user'} style={{ marginLeft: 0 }} size={30} color={isDarkMode ? (childs[0] ? '#ccc' : 'gray') : childs[0] ? MAIN_COLOR : '#ccc'} />
                  <Text style={{ color: 'gray', fontSize: 12, marginLeft: 4 }}>{childs[0] && childs[0].name}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ alignItems: 'center' }}
                  onPress={() => {
                    if (childs[1]) {
                      this.setState({ childs: [childs[0]] })
                      return
                    }
                    this.setState({
                      modalVisibleAges: true,
                      list: { title: 'Возраст', data: this.state.listAges },
                      action: this.selectChilds.bind(this)
                    })
                  }}>
                  <Icon type={'feather'} name={'user'} style={{ marginLeft: 0 }} size={30} color={isDarkMode ? (childs[1] ? '#ccc' : 'gray') : childs[1] ? MAIN_COLOR : '#ccc'} />
                  <Text style={{ color: 'gray', fontSize: 12, marginLeft: 4 }}>{childs[1] && childs[1].name}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ alignItems: 'center' }}
                  onPress={() => {
                    if (childs[2]) {
                      this.setState({ childs: [childs[1]] })
                      return
                    }
                    this.setState({
                      modalVisibleAges: true,
                      list: { title: 'Возраст', data: this.state.listAges },
                      action: this.selectChilds.bind(this)
                    })
                  }}>
                  <Icon type={'feather'} name={'user'} style={{ marginLeft: 0 }} size={30} color={isDarkMode ? (childs[2] ? '#ccc' : 'gray') : childs[2] ? MAIN_COLOR : '#ccc'} />
                  <Text style={{ color: 'gray', fontSize: 12, marginLeft: 4 }}>{childs[2] && childs[2].name}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          {/*</View>*/}
          {/*<View style={{ flexDirection: 'row', margin: 4 }}>*/}
          {/*  */}
          {/*  <View style={{ flex: 0.2 }} />*/}
          {/*  */}
          {/*</View>*/}
          <View
            style={{
              position: 'absolute',
              width: '100%',
              alignItems: 'center',
              justifyContent: 'center',
              bottom: 20
            }}>
            <TouchableOpacity
              onPress={() => {
                this.search()
              }}
              style={{ paddingVertical: 14, alignSelf: 'center', backgroundColor: '#e4ecf6', width: '90%', alignItems: 'center', borderRadius: 10 }}>
              <Text style={{ fontWeight: 'bold', color: txt }}>{'НАЙТИ'}</Text>
            </TouchableOpacity>
          </View>
          <View style={{ height: 20 }} />
        </>

        {this.modalCity()}
        {this.modalCountry()}
        {this.modalPlaces()}
        {this.modalHotels()}
        {this.modalStars()}
        {this.modalPansions()}
        {this.modalDates()}
        {this.modalAges()}

        <Portal>
          <Modal visible={this.state.modalVisible} onDismiss={() => {}} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <View
              style={{
                padding: 22,
                flex: 1,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                justifyContent: 'center'
              }}>
              <View
                style={{
                  backgroundColor: 'white',
                  borderRadius: 6,
                  marginBottom: 30
                }}>
                <Text style={{ paddingHorizontal: 10, paddingTop: 10, fontSize: 16, color: theme.text }}>{this.state.list.title}</Text>
                <ScrollView style={{ padding: 10 }}>
                  <View style={{ marginBottom: 40 }}>
                    {this.state.list.data &&
                      this.state.list.data.map(el => {
                        return (
                          <TouchableOpacity
                            style={{ paddingVertical: 5 }}
                            key={el.uid}
                            onPress={() => {
                              //this.setModalVisible(!this.state.modalVisible)
                              this.state.action(el)
                            }}>
                            <Text style={{ fontSize: 16, color: theme.text }}>{el.name}</Text>
                          </TouchableOpacity>
                        )
                      })}
                  </View>
                </ScrollView>
              </View>
            </View>
          </Modal>
        </Portal>
      </>
    )
  }
}
