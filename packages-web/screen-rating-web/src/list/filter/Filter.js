import { lazy, PureComponent, Suspense } from 'react'
import { ActivityIndicator, Dimensions, Platform, ScrollView, Text, TextInput as RNTextInput, TouchableOpacity, View } from 'react-native'

const Countries = lazy(() => import('./Countries'))
const Hotels = lazy(() => import('./Hotels'))
const Places = lazy(() => import('./Places'))
const ItemList = lazy(() => import('./ItemList'))

const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
const { MAIN_COLOR } = GLOBAL_OBJ.onlinetur.constants

class Filter extends PureComponent {
  static defaultProps = {}

  constructor(props) {
    super(props)

    const { RatingsController } = props
    Object.assign(this, new RatingsController(this, this.props.utils))

    const { t } = props.utils
    const hClass = [t('screens.ratings.components.filter.any'), '1*', '2*', '3*', '4*', '5*']

    this.state = {
      visibleModal: false,
      visibleModalPlaces: false,
      selectedCountries: [],
      countriesAll: [],
      placesAll: [],
      selectedPlaces: [],
      valueCountries: '',
      valuePlaces: t('screens.ratings.components.filter.resorts'),
      categoryHotelName: t('screens.ratings.components.filter.any'),
      categoryHotel: [t('screens.ratings.components.filter.any'), '5*', '4*', '3*', '2*', '1*'],
      indexCategory: props && props.filter && props.filter.indexCategory ? props.filter.indexCategory : 0,
      visibleModalHotels: false,
      hotels: [],
      isLoading: false,
      pattern: '',
      newHotels: []
    }

    this.changeVisibleModal = () => {
      const { visibleModal } = this.state

      this.setState({ visibleModal: !visibleModal })
    }

    this.changeVisibleModalPlaces = () => {
      const { visibleModalPlaces } = this.state

      this.setState({ visibleModalPlaces: !visibleModalPlaces })
    }

    this.changeVisibleModalHotels = () => {
      const { visibleModalHotels } = this.state

      this.setState({ visibleModalHotels: !visibleModalHotels })
    }

    this.setCountries = async () => {
      const { chatServiceGet } = this.props.utils
      const { countries, selectedCountries, filter } = this.props
      const { indexCategory } = this.state

      let valCountries = []
      let valPlaces = []
      let sc = selectedCountries

      if (filter.selectedCountries.length > 0) {
        sc = filter.selectedCountries
      }

      for (let i = 0; i < countries.length; i++) {
        if (countries[i].id_country && sc.indexOf(countries[i].id_country.toString()) > -1) {
          valCountries.push(countries[i].title)
        }
      }

      this.setState(
        {
          countriesAll: countries,
          selectedCountries: sc,
          valueCountries: valCountries.length > 0 ? valCountries.join(',') : t('screens.ratings.components.filter.country'),
          categoryHotelName: hClass[indexCategory]
        },
        async () => {
          const places = await chatServiceGet.getRatingPlaces(sc.join(','))

          if (filter.selectedPlaces.length > 0) {
            for (let i = 0; i < places.length; i++) {
              if (places[i].uid && filter.selectedPlaces.indexOf(places[i].uid.toString()) > -1) {
                valPlaces.push(places[i].name)
              }
            }

            this.setState({
              placesAll: places,
              selectedPlaces: filter.selectedPlaces,
              valuePlaces: valPlaces.length > 0 ? valPlaces.join(',') : t('screens.ratings.components.filter.resorts')
            })
          } else {
            this.setState({ placesAll: places })
          }
        }
      )
    }

    this.changeSelectedCountries = async selectedCountries => {
      const { chatServiceGet } = this.props.utils
      const { countriesAll } = this.state
      let valCountries = []

      for (let i = 0; i < countriesAll.length; i++) {
        if (countriesAll[i].id_country && selectedCountries.indexOf(countriesAll[i].id_country.toString()) > -1) {
          valCountries.push(countriesAll[i].title)
        }
      }

      this.setState(
        {
          selectedCountries: selectedCountries,
          valueCountries: valCountries.length > 0 ? valCountries.join(',') : t('screens.ratings.components.filter.country'),
          selectedPlaces: [],
          valuePlaces: t('screens.ratings.components.filter.resorts')
        },
        async () => {
          const places = await chatServiceGet.getRatingPlaces(selectedCountries.join(','))

          this.setState({ placesAll: places, placesSelected: [] })
        }
      )
    }

    this.changeSelectedPlaces = selectedPlaces => {
      const { placesAll } = this.state
      let valPlaces = []

      for (let i = 0; i < placesAll.length; i++) {
        if (placesAll[i].uid && selectedPlaces.indexOf(placesAll[i].uid.toString()) > -1) {
          valPlaces.push(placesAll[i].name)
        }
      }

      this.setState({
        selectedPlaces: selectedPlaces,
        valuePlaces: valPlaces.length > 0 ? valPlaces.join(',') : t('screens.ratings.components.filter.resorts')
      })
    }

    this.changeSelectedHotels = item => {
      let indexCategory = 0

      switch (item) {
        case '1*':
          indexCategory = 1
          break
        case '2*':
          indexCategory = 2
          break
        case '3*':
          indexCategory = 3
          break
        case '4*':
          indexCategory = 4
          break
        case '5*':
          indexCategory = 5
          break
      }

      this.setState({ visibleModalHotels: false, indexCategory: indexCategory, categoryHotelName: item })
    }

    this.saveFilter = () => {
      const { getObjectAssign } = this.props.utils
      const { setFilterURLWeb, changeRatingFilter, closeModalFilter, changeMyRatingLocal, myRatingLocal, myRatingServer } = this.props
      const { selectedCountries, selectedPlaces, indexCategory, newHotels } = this.state

      let countries = []
      let places = []

      if (selectedPlaces.length > 0) {
        places = selectedPlaces
      } else {
        countries = selectedCountries
      }

      changeRatingFilter({
        selectedCountries: selectedCountries,
        selectedPlaces: selectedPlaces,
        indexCategory: indexCategory
      })

      this.setFilterURLWeb(countries, places, indexCategory)

      const newHotelsAdd = getObjectAssign([], newHotels)

      if (myRatingServer) {
        for (let i = 0; i < myRatingServer.length; i++) {
          for (let j = 0; j < newHotelsAdd.length; j++) {
            if (myRatingServer[i].list && myRatingServer[i].list && myRatingServer[i].list.length > 0) {
              const hS = myRatingServer[i].list.filter(r => Number(r.huid) === Number(newHotelsAdd[j].huid))[0]

              if (!hS) {
                newHotelsAdd[j].add = true
              }
            } else {
              newHotelsAdd[j].add = true
            }
          }
        }
      }

      if (myRatingLocal) {
        for (let i = 0; i < myRatingLocal.length; i++) {
          for (let j = 0; j < newHotelsAdd.length; j++) {
            const hS = myRatingLocal[i].list.filter(r => Number(r.huid) === Number(newHotelsAdd[j].huid))[0]

            if (!hS) {
              newHotelsAdd[j].add = true
            } else {
              newHotelsAdd[j].add = false
            }
          }
        }

        for (let i = 0; i < myRatingLocal.length; i++) {
          for (let j = 0; j < newHotelsAdd.length; j++) {
            if (newHotelsAdd[j].add) {
              myRatingLocal[i].list.push(newHotelsAdd[j])
            }
          }
        }

        changeMyRatingLocal(myRatingLocal)
      }

      closeModalFilter()
    }

    this.searchListHotels = async () => {
      const { chatServiceGet } = this.props.utils
      const { selectedCountries, selectedPlaces, indexCategory, pattern } = this.state

      this.setState({ isLoading: true }, async () => {
        let url = 'action=get_top_rate'

        if (selectedPlaces.length > 0) {
          url += '&cuid=&puid=' + selectedPlaces.join(',') + '&lim=40&ofs=0&hclass=' + (indexCategory === 0 ? '' : indexCategory) + '&pattern=' + pattern + '&criteria_id=&add=1'
        } else {
          url += '&cuid=' + selectedCountries.join(',') + '&puid=&lim=40&ofs=0&hclass=' + (indexCategory === 0 ? '' : indexCategory) + '&pattern=' + pattern + '&criteria_id=&add=1'
        }

        const result = await chatServiceGet.getRatingHotels(url)

        if (result) {
          this.setState({ hotels: result.hotels ? result.hotels : [], offset: 0, isLoading: false }, () => {})
        } else {
          this.setState({ isLoading: false })
        }
      })
    }

    this.changeHotelsInMyRating = (itemCurrent, checked) => {
      const { getObjectAssign } = this.props.utils
      const { newHotels } = this.state

      let newHotelsCurrent = getObjectAssign([], newHotels.length > 0 ? newHotels : [])

      if (checked) {
        let add = true
        for (let i = 0; i < newHotelsCurrent.length; i++) {
          if (newHotelsCurrent[i].huid === itemCurrent.huid) {
            add = false
          }
        }

        if (add) {
          itemCurrent.my_rating = 0
          itemCurrent.notSave = true
          newHotelsCurrent.push(itemCurrent)
          this.setState({ newHotels: newHotelsCurrent })
        }
      } else {
        for (let i = 0; i < newHotelsCurrent.length; i++) {
          if (newHotelsCurrent[i].huid === itemCurrent.huid) {
            newHotelsCurrent.splice(i, 1)
          }
        }

        this.setState({ newHotels: newHotelsCurrent })
      }
    }
  }

  async componentDidMount() {
    const { myHotels } = this.props
    await this.setCountries()

    if (myHotels) {
      await this.searchListHotels()
    }
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

  renderRightsButtons = () => {
    const { Icon } = this.props.utils

    return (
      <View style={{ flexDirection: 'row', flex: 1 }}>
        <TouchableOpacity onPress={() => this.saveFilter()}>
          <Icon name={'done'} color={MAIN_COLOR} />
        </TouchableOpacity>
      </View>
    )
  }

  renderListHotels = () => {
    const { theme, t } = this.props.utils
    const { myHotels } = this.props
    const { hotels, isLoading } = this.state

    if (!myHotels) {
      return <></>
    }

    return (
      <>
        {isLoading ? (
          <ActivityIndicator size={'large'} />
        ) : (
          <ScrollView contentContainerStyle={{ flexGrow: 1, paddingLeft: 10, paddingRight: 10, paddingBottom: 120, marginTop: 10 }} scrollEnabled>
            {hotels.length > 0 ? (
              hotels.map((item, index) => {
                return (
                  <Suspense fallback={null}>
                    <ItemList key={index.toString()} item={item} changeHotelsInMyRating={this.changeHotelsInMyRating} myHotelsList={[]} utils={this.props.utils} />
                  </Suspense>
                )
              })
            ) : (
              <View
                style={{
                  alignSelf: 'center'
                }}>
                <Text style={{ color: theme.text }}>{t('screens.ratings.components.filter.not_find')}</Text>
              </View>
            )}
          </ScrollView>
        )}
      </>
    )
  }

  render() {
    const { Button, Header, t, theme, Icon, TextInput } = this.props.utils
    const { myHotels, android } = this.props

    const { countriesAll, visibleModal, selectedCountries, valueCountries, valuePlaces, visibleModalPlaces, selectedPlaces, placesAll, categoryHotel, visibleModalHotels, categoryHotelName, pattern } =
      this.state

    let props = {}
    if (android) {
      props = {
        containerStyle: { borderTopLeftRadius: 15, borderTopRightRadius: 15 }
      }
    }

    const view = myHotels ? { paddingHorizontal: 5, flexDirection: 'row' } : { padding: 5 }
    const field = myHotels ? { backgroundColor: 'transparent', flex: 0.333, color: theme.text } : { backgroundColor: 'transparent', color: theme.text }

    return (
      <>
        <Header
          {...props}
          onlineTurHeader
          statusBarProps={{ translucent: true }}
          leftComponent={this.renderLeftIcon()}
          centerComponent={{
            text: myHotels ? t('screens.ratings.components.filter.myhotels') : t('screens.ratings.components.filter.filter'),
            style: { color: '#000', fontSize: 16, fontWeight: 'bold', paddingTop: 2 }
          }}
          backgroundColor={'#ececec'}
          rightComponent={this.renderRightsButtons()}
        />
        <View style={view}>
          <TextInput
            label={t('screens.ratings.components.filter.selectCountries')}
            editable={false}
            value={valueCountries}
            style={field}
            render={props => (
              <TouchableOpacity style={{ flexDirection: 'row' }} onPress={() => this.changeVisibleModal()}>
                <RNTextInput
                  editable={false}
                  value={props.value}
                  onPressOut={() => this.changeVisibleModal()}
                  numberOfLines={1}
                  ellipsizeMode={'tail'}
                  style={{
                    fontSize: 16,
                    width: Dimensions.get('window').width - 20,
                    paddingTop: 34,
                    paddingLeft: 15,
                    paddingRight: 20,
                    color: theme.text
                  }}
                />
                <View style={{ flex: 1, position: 'absolute', right: 10, bottom: 0 }}>
                  <Icon name={'keyboard-arrow-down'} color={'#7c7c7c'} />
                </View>
              </TouchableOpacity>
            )}
          />
          <TextInput
            label={t('screens.ratings.components.filter.selectResort')}
            editable={false}
            value={valuePlaces}
            style={field}
            render={props => (
              <TouchableOpacity style={{ flexDirection: 'row' }} onPress={() => this.changeVisibleModalPlaces()}>
                <RNTextInput
                  editable={false}
                  value={props.value}
                  onPressOut={() => this.changeVisibleModalPlaces()}
                  numberOfLines={1}
                  ellipsizeMode={'tail'}
                  style={{
                    fontSize: 16,
                    width: Dimensions.get('window').width - 20,
                    paddingTop: 34,
                    paddingLeft: 15,
                    paddingRight: 20,
                    color: theme.text
                  }}
                />
                <View style={{ flex: 1, position: 'absolute', right: 10, bottom: 0 }}>
                  <Icon name={'keyboard-arrow-down'} color={'#7c7c7c'} />
                </View>
              </TouchableOpacity>
            )}
          />
          <TextInput
            label={t('screens.ratings.components.filter.cat')}
            editable={false}
            value={categoryHotelName}
            style={field}
            render={props => (
              <TouchableOpacity style={{ flexDirection: 'row' }} onPress={() => this.changeVisibleModalHotels()}>
                <RNTextInput
                  editable={false}
                  value={props.value}
                  onPressOut={() => this.changeVisibleModalHotels()}
                  numberOfLines={1}
                  ellipsizeMode={'tail'}
                  style={{
                    fontSize: 16,
                    width: Dimensions.get('window').width - 20,
                    paddingTop: 34,
                    paddingLeft: 15,
                    paddingRight: 20,
                    color: theme.text
                  }}
                />
                <View style={{ flex: 1, position: 'absolute', right: 10, bottom: 0 }}>
                  <Icon name={'keyboard-arrow-down'} color={'#7c7c7c'} />
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
        {myHotels && (
          <View style={{ paddingHorizontal: 5, flexDirection: 'row' }}>
            <TextInput
              label={t('screens.ratings.components.filter.pattern')}
              value={pattern}
              style={{ backgroundColor: 'transparent', color: theme.text, flex: 1 }}
              onChangeText={text => this.setState({ pattern: text })}
            />
            <View style={{ alignItems: 'center', width: 50, justifyContent: 'center' }}>
              <TouchableOpacity onPress={() => this.searchListHotels()}>
                <Icon name={'search'} color={MAIN_COLOR} />
              </TouchableOpacity>
            </View>
          </View>
        )}
        {visibleModal && (
          <Countries
            countries={countriesAll}
            selectedCountries={selectedCountries}
            visibleModal={visibleModal}
            changeVisibleModal={this.changeVisibleModal}
            changeSelectedCountries={this.changeSelectedCountries}
            utils={this.props.utils}
          />
        )}
        {visibleModalPlaces && (
          <Places
            places={placesAll}
            selectedPlaces={selectedPlaces}
            visibleModalPlaces={visibleModalPlaces}
            changeVisibleModalPlaces={this.changeVisibleModalPlaces}
            changeSelectedPlaces={this.changeSelectedPlaces}
            utils={this.props.utils}
          />
        )}
        {visibleModalHotels && (
          <Hotels
            hotels={categoryHotel}
            visibleModalHotels={visibleModalHotels}
            changeVisibleModalHotels={this.changeVisibleModalHotels}
            changeSelectedHotels={this.changeSelectedHotels}
            utils={this.props.utils}
          />
        )}
        {myHotels && this.renderListHotels()}
      </>
    )
  }
}

export default Filter
