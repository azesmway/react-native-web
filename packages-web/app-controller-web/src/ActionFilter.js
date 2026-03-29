import isEmpty from 'lodash/isEmpty'
import { Platform } from 'react-native'

const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
const { setMessagesIds } = GLOBAL_OBJ.onlinetur.storage

class ActionFilter {
  getUrlString = data => {
    let url = ''

    if (data.chatAgent) {
      url += '/a/' + data.selectedAgent
    }

    url += Number(data.selectedCountry) !== -1 ? '/y/' + data.selectedCountry : ''
    url += Number(data.selectedHotel) !== -1 ? '/h/' + data.selectedHotel : ''
    url += Number(data.selectedPlace) !== -1 ? '/p/' + data.selectedPlace : ''
    url += Number(data.selectedHobby) !== -1 ? '/b/' + data.selectedHobby : ''

    return url
  }

  onChangeCountry = async (callComponent, theme) => {
    const { filter, history, setFilter } = callComponent.props

    callComponent.setState({ isFilterOpen: false }, async () => {
      let data = Object.assign({}, filter)
      data.selectedCountry = theme.id
      data.selectedCountryName = theme.title
      let url

      if (filter.chatAgent) {
        url = '/a/' + filter.selectedAgent + '/y/' + theme.id
      } else {
        url = '/y/' + theme.id
      }

      setFilter(data)
      history(url)
    })
  }

  onChangeHotel = async (callComponent, hotel) => {
    const { filter, history, setFilter, countries, setSelectHotel } = callComponent.props

    const country = countries.filter(function (item) {
      return item.id_country === Number(hotel.cuid)
    })[0]

    // callComponent.setState({ isFilterOpen: false }, async () => {
    let data = Object.assign({}, filter)
    data.selectedCountry = country.id
    data.selectedCountryName = country.title
    data.selectedHotel = hotel.id
    data.selectedHotelName = hotel.name
    data.selectedPlace = '-1'
    data.selectedPlaceName = ''

    setFilter(data)
    setSelectHotel(hotel)

    const url = this.getUrlString(data)
    history(url)
    // })
  }

  onChangePlace = async (callComponent, place) => {
    const { filter, history, setFilter, setSelectPlace } = callComponent.props

    callComponent.setState({ isFilterOpen: false }, async () => {
      let data = Object.assign({}, filter)
      data.selectedHotel = '-1'
      data.selectedHotelName = ''
      data.selectedPlace = place.uid
      data.selectedPlaceName = place.name

      setFilter(data)
      setSelectPlace(place)

      history(this.getUrlString(data))
    })
  }

  onChangeHobby = async (callComponent, hobby) => {
    const { filter, history, setFilter } = callComponent.props

    callComponent.setState({ isFilterOpen: false }, async () => {
      let data = Object.assign({}, filter)
      data.selectedHobby = hobby.id
      data.selectedHobbyName = hobby.title

      setFilter(data)

      history(this.getUrlString(data))
    })
  }

  onChangeAgent = async (callComponent, agent) => {}

  onClearFilter = async callComponent => {
    const { filter, history, setFilter, setSelectHotel, setSelectPlace } = callComponent.props

    callComponent.setState({ isFilterOpen: false }, async () => {
      let data = Object.assign({}, filter)
      data.selectedHotel = '-1'
      data.selectedHotelName = ''
      data.selectedPlace = '-1'
      data.selectedPlaceName = ''
      data.selectedHobby = '-1'
      data.selectedHobbyName = ''

      setFilter(data)
      setSelectHotel({})
      setSelectPlace({})

      setMessagesIds()

      history(this.getUrlString(data))
    })
  }

  onClearCountry = callComponent => {
    const { filter, history } = callComponent.props

    callComponent.setState({ isFilterOpen: false }, async () => {
      setMessagesIds()

      history('/a/' + filter.selectedAgent)
    })
  }

  onClearHobby = callComponent => {
    const { filter, history, setFilter } = callComponent.props

    callComponent.setState({ isFilterOpen: false }, async () => {
      let data = Object.assign({}, filter)
      data.selectedHobby = '-1'
      data.selectedHobbyName = ''

      setMessagesIds()

      setFilter(data)
      history(this.getUrlString(data))
    })
  }

  onClearPlace = (callComponent, filterDialog) => {
    const { places, setSelectPlace } = callComponent.props

    setMessagesIds()

    filterDialog.setState({ places: places })
    setSelectPlace({})
  }

  onClearHotel = (callComponent, filterDialog) => {
    const { hotels, setSelectHotel } = callComponent.props

    setMessagesIds()

    filterDialog.setState({ hotels: hotels })
    setSelectHotel({})
  }

  onClearOnlyCountry = async callComponent => {
    const { filter, history, setFilter } = callComponent.props

    callComponent.setState({ isFilterMenuOpen: false }, async () => {
      let data = Object.assign({}, filter)
      data.selectedCountry = '-1'
      data.selectedCountryName = ''

      setMessagesIds()

      history(this.getUrlString(data))
    })
  }

  onClearOnlySearch = async callComponent => {
    const { AppData } = await import('app-services-web')
    const { filter, history, setFilter } = callComponent.props

    callComponent.setState({ isFilterMenuOpen: false }, async () => {
      let data = Object.assign({}, filter)
      data.searchFav = ''
      const url = AppData.initUrl(data)

      setMessagesIds()

      setFilter(data)
      history(url)
    })
  }

  onClearOnlyHotel = async callComponent => {
    const { filter, history, setFilter, setSelectHotel } = callComponent.props

    callComponent.setState({ isFilterMenuOpen: false }, async () => {
      let data = Object.assign({}, filter)
      data.selectedHotel = '-1'
      data.selectedHotelName = ''

      setMessagesIds()

      setFilter(data)
      setSelectHotel({})

      history(this.getUrlString(data))
    })
  }

  onClearOnlyPlace = async callComponent => {
    const { filter, history, setFilter, setSelectPlace } = callComponent.props

    callComponent.setState({ isFilterMenuOpen: false }, async () => {
      let data = Object.assign({}, filter)
      data.selectedPlace = '-1'
      data.selectedPlaceName = ''

      setMessagesIds()

      setFilter(data)
      setSelectPlace({})

      history(this.getUrlString(data))
    })
  }

  onClearOnlyHobby = async callComponent => {
    const { filter, history, setFilter } = callComponent.props

    callComponent.setState({ isFilterMenuOpen: false }, async () => {
      let data = Object.assign({}, filter)
      data.selectedHobby = '-1'
      data.selectedHobbyName = ''

      setMessagesIds()

      setFilter(data)
      history(this.getUrlString(data))
    })
  }

  stopUpdatingLocation = callComponent => {
    callComponent.locationSubscription && callComponent.locationSubscription()
  }

  changeLocation = async (callComponent, location) => {
    const { t } = await import('app-utils-web')
    const { chatServiceGet } = await import('app-services-web')
    const Alert = await import('@blazejkustra/react-native-alert')
    const { user, currentCategory } = callComponent.props

    const hotels = await chatServiceGet.fetchHotelsBeside(!isEmpty(user.device) ? user.device.token : '', user.android_id_install, location.latitude, location.longitude, 0, currentCategory.id)

    if (hotels && hotels.h && hotels.h.length > 0) {
      callComponent.setState({ hotels: hotels.h, places: hotels.r })
    } else {
      callComponent.setState({ hotels: [], isLoadingHotels: false }, () => {
        Alert.default.alert(t('common.attention'), t('chat.model.chatModel.hotelNotFound'))

        callComponent.initFilter()
      })
    }
  }

  startUpdatingLocation = callComponent => {
    // const RNLocation = Mobile.initRNLocation()

    // callComponent.setState({ hotels: [] }, async () => {
    //   RNLocation.requestPermission({
    //     ios: 'whenInUse',
    //     android: {
    //       detail: 'fine', // or 'fine'
    //       rationale: {
    //         title: t('action.filter.requestPermissionTitle'),
    //         message: t('action.filter.requestPermissionMessage'),
    //         buttonPositive: t('action.filter.requestPermissionOk'),
    //         buttonNegative: t('action.filter.requestPermissionCancel')
    //       }
    //     }
    //   }).then(granted => {
    //     if (granted) {
    //       callComponent.locationSubscription = RNLocation.subscribeToLocationUpdates(locations => {
    //         callComponent.setState({ location: locations[0] }, async () => {
    //           this.stopUpdatingLocation(callComponent)
    //           await this.changeLocation(callComponent, locations[0])
    //         })
    //       })
    //     } else {
    //       Alert.alert(t('common.attention'), t('common.attentionGeo'))
    //       return null
    //     }
    //   })
    // })
  }
}

export default new ActionFilter()
