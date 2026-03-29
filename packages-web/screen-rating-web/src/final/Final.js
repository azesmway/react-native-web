import isEmpty from 'lodash/isEmpty'
import md5 from 'md5'
import { Component, lazy, Suspense } from 'react'
import { Alert, Appearance, Dimensions, ImageBackground, Linking, Platform, Text, TouchableOpacity, View } from 'react-native'

// import Filter from './Filter'
const FinalList = lazy(() => import('./List'))
// import SearchRating from './Search'

const SCALE_IMG = Platform.isPad ? 50 : 70
const SCALE_FONT = Platform.isPad ? 8 : 12
const SCALE_H = Platform.isPad ? 54 : 74

const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
const { getAppConfig } = GLOBAL_OBJ.onlinetur.storage
const { WIDTH_MAX, WIDTH_BLOCK, MAIN_COLOR } = GLOBAL_OBJ.onlinetur.constants
const { width, height } = Dimensions.get('window')

class FinalHotels extends Component {
  constructor(props) {
    super(props)

    const { RatingsController } = props

    Object.assign(this, new RatingsController(this, this.props.utils))

    this.state = {
      slideIndex: Number(this.props.selectedRatingCategory),
      hotel: '',
      showLoading: false,
      showSearch: false,
      selectedCountries: props && props.filter && props.filter.selectedCountries ? props.filter.selectedCountries : [],
      action: 'get_top_rate',
      cuid: props && props.filter && props.filter.selectedPlaces.length === 0 ? props.filter.selectedCountries : [],
      puid: props && props.filter && props.filter.selectedPlaces,
      hclass: props.filter.indexCategory,
      pattern: '',
      searchText: '',
      visibleWinner: [],
      isModalBGTransparent: true,
      isModalBGBlurred: false,
      visibleModal: false,
      paramsTitle: null,

      visibleModalSearch: false,
      countryId: null,
      hotelId: null,
      placeId: null,
      hclassName: null,
      listHotels: [],
      urlRequestPriceId: '',
      indexTab: 1,
      coords: null,
      isEdit: false,
      editRating: this.props.editRating,
      scores: {},
      persent: {},
      slideIndexFinal: Number(this.props.selectedRatingCategory),
      visibleImages: true,
      lim: 20,
      ofs: 0,
      onFocus: false,
      scoresOld: [],
      persentOld: {},
      hotelList: [],
      isLoading: true,
      isFocus: false,
      visibleModalScores: false
    }

    this.setParamsTitle = (params = null) => {
      this.setState({ paramsTitle: params })
    }

    this.updateSearch = searchText => {
      this.setState({ hotel: searchText })
    }

    this.cancelSearch = () => {
      this.setState({ hotel: '', showSearch: false })
    }

    this.showSearchFieldMob = () => {
      const { showSearch } = this.state

      this.setState({ showSearch: !showSearch })
    }

    this.setVisibleModalSearch = (visible, countryId, hotelId, placeId, hclass, listHotels) => {
      this.setState({ visibleModalSearch: visible, countryId: countryId, hotelId: hotelId, placeId: placeId, hclassName: hclass, listHotels })
    }

    this.setSelectSearchModal = (params, url) => {
      const { setSelectSearch } = this.props

      this.setState({ visibleModalSearch: false, urlRequestPriceId: url }, () => {
        // setSelectSearch(params)
      })
    }

    this.setUrlRequestPriceId = urlRequestPriceId => {
      this.setState({ urlRequestPriceId })
    }

    this.getUserLocationOn = callback => {
      const { t, Geolocation, Alert } = this.props.utils

      Geolocation.getCurrentPosition(info => {
        if (info.coords.latitude > 0 && info.coords.longitude > 0) {
          this.setState({ coords: info.coords }, () => callback())
        } else {
          Alert.alert(t('common.attention'), t('common.attentionGeo'))
        }
      })
    }

    this.getUserLocationOff = () => {
      this.setState({ coords: null })
    }

    this.savePoints = async () => {
      const { categories } = this.props
      const { scores } = this.state
      const c = []
      const p = []

      for (let i = 0; i < categories.length; i++) {
        c.push(categories[i].id)
        p.push(scores[i] ? scores[i] : 0)
      }

      const result = await this.onListHotelsMyRating(false, null, true)

      if (result.persents) {
        let c1 = {}
        let p1 = {}

        for (let i = 0; i < categories.length; i++) {
          if (result.persents[categories[i].id]) {
            c1[i] = Number(result.persents[categories[i].id].points)
            p1[i] = Number(result.persents[categories[i].id].rpersent)
          }
        }

        this.setState({ scores: c1, persent: p1 })
      }
    }

    this.setEditPoints = isEditPoints => {
      const { user, setModalLogin, setEditRating } = this.props

      const { scores, persent } = this.state
      const s = Object.assign([], scores)

      if (!isEditPoints) {
        this.setState({ editRating: s.length < 4 }, () => {
          setEditRating(s.length < 4)
          if (!user.id_user) {
            toast.show('Для сохранения результатов требуется авторизация!', {
              type: 'danger',
              placement: 'top',
              animationType: 'zoom-in',
              onPress: id => {
                toast.hide(id)
                setModalLogin(true)
              }
            })
          }
          this.savePoints().then()
        })
      } else {
        this.setState({ editRating: isEditPoints, scoresOld: scores, persentOld: persent }, () => {
          setEditRating(isEditPoints)
        })
      }
    }

    this.clearPoints = () => {
      const { setEditRating } = this.props
      const { scoresOld, persentOld } = this.state

      this.setState({ editRating: false, scores: scoresOld, persent: persentOld, scoresOld: {}, persentOld: {} }, () => {
        setEditRating(false)
      })
    }

    this.gotoLink = () => {
      const { user } = this.props

      if (user.login && user.login !== '') {
        Linking.openURL('https://ateston.com/diagnosis/358?mks=' + md5((user.ml ? user.ml : '') + user.login).substring(0, 12))
      } else {
        Linking.openURL('https://ateston.com/diagnosis/358')
      }
    }

    this.getListMyRating = (save, reached = false) => {
      const { categories } = this.props
      const { ofs, hotelList, editRating } = this.state

      this.onListHotelsMyRating(false, null, save).then(result => {
        const c = []
        const p = []

        if (result.persents && !isEmpty(result.persents)) {
          for (let i = 0; i < categories.length; i++) {
            if (result.persents[categories[i].id]) {
              c.push(result.persents[categories[i].id].points)
              p.push(result.persents[categories[i].id].rpersent)
            }
          }
        }

        this.setState({
          hotelList: result.hotels && reached ? hotelList.concat(result.hotels) : result.hotels ? result.hotels : [],
          ofs: result.ofs ? result.ofs : ofs,
          isLoading: false,
          titleHotel: '',
          scores: c,
          persent: p,
          cuid: result.cuids ? result.cuids : [],
          selectedCountries: result.cuids ? result.cuids : [],
          visibleModalScores: editRating && c && c.length < 4
        })
      })
    }

    this.getInitDataMyRating = () => {
      const { matchPath } = this.props.utils
      const { pathname } = this.props

      let match = matchPath(pathname, {
        path: ['/rm/:rm'],
        exact: true,
        strict: false
      })

      if (match) {
        const cat = match.params.rm.split('_')
        const c1 = []

        for (let i = 0; i < cat.length; i++) {
          const b = cat[i].split('-')
          c1.push(b[1])
        }

        this.setState({ scores: c1 }, () => {
          this.getListMyRating(true)
        })
      } else {
        this.getListMyRating(false)
      }
    }

    this.onEndReached = () => {
      const { ofs } = this.state

      this.setState({ ofs: ofs + 20 }, () => {
        this.getListMyRating(false, true)
      })
    }

    this.renderConstr = index => {
      const { categories } = this.props

      if (Number(categories[index].constr) === 1) {
        return (
          <View style={{ width: '100%', alignItems: 'center', marginTop: 100 }}>
            <Text style={{ color: 'red', fontSize: 18, fontWeight: 'bold' }}>{'НОМИНАЦИЯ ЕЩЕ ФОРМИРУЕТСЯ'}</Text>
            <Text style={{ color: 'red' }}>{'Отправляйте свои сравнительные оценки!'}</Text>
          </View>
        )
      } else if (Number(categories[index].constr) === -1) {
        return (
          <View style={{ width: '100%', alignItems: 'center', marginTop: 100 }}>
            <Text style={{ color: 'red', fontSize: 18, fontWeight: 'bold' }}>{'ДОСТУП К НОМИНАЦИИ ЗАКРЫТ'}</Text>
            <Text style={{ color: 'red' }}>{'Отправляйте свои сравнительные оценки!'}</Text>
          </View>
        )
      } else {
        return <></>
      }
    }

    this.setParams = () => {
      const { t } = this.props.utils
      const { filter, countries, categories, selectedRatingCategory, setHeaderParams } = this.props
      const { showSearch, editRating, selectedCountries } = this.state

      let params = {}
      params.title = 'мой рейтинг' //currentCategory ? currentCategory.name_menu_rating : t('screens.ratings.components.listhotels.title')
      params.screen = 'final_hotels'
      params.showSearchField = this.showSearchFieldMob
      params.openSearch = showSearch
      params.onOpenSearch = this.cancelSearch
      params.onSubmitEditing = this.updateSearch
      params.onPressShare = this.onPressShare
      params.setEditPoints = this.setEditPoints
      params.editRating = editRating

      if (filter.selectedCountries.length > 0) {
        params.selectedCountries = filter.selectedCountries
      } else {
        params.selectedCountries = selectedCountries
      }

      params.openModalFilter = this.openModalFilter
      params.setFilterURL = this.setFilterURL
      let valueCountries = []

      for (let i = 0; i < countries.length; i++) {
        if (countries[i].id_country && selectedCountries.indexOf(countries[i].id_country.toString()) > -1) {
          valueCountries.push(countries[i].title)
        }
      }

      params.subtitle = valueCountries.length > 0 ? valueCountries.join(', ') : editRating ? 'Установка важности' : t('common.loading')

      let urlChat = '/'
      let listCat

      if (categories && categories.length > 0) {
        listCat = categories[selectedRatingCategory]

        if (listCat && listCat.chat) {
          urlChat = listCat.chat.replace(getAppConfig().homepage, '')
        }
      }

      params.listCat = listCat
      params.urlChat = urlChat

      setHeaderParams(params)
    }

    this.setFooter = () => {
      const { setFooterBar, history, user, setModalLogin } = this.props

      setFooterBar({
        type: 'curved',
        screen: 'rating-list',
        position: 'RIGHT', // {navName === 'all' ? 'CENTER' : navName === 'my' ? 'LEFT' : 'RIGHT'}
        leftIcon: {
          icon: 'filter-list',
          size: 30,
          onPress: () => {
            if (user && user.id_user) {
              history('/rr/1')
            } else {
              toast.show('⚠️ Авторизуйтесь чтобы получить больше возможностей поиска туров и отелей!', {
                type: 'warning',
                placement: 'top',
                animationType: 'zoom-in',
                onPress: id => {
                  toast.hide(id)
                  setModalLogin(true)
                }
              })
            }
          }
        },
        centerIcon: {
          icon: 'star-outline',
          size: 30,
          onPress: () => {
            history('/r/1')
          }
        },
        rightIcon: {
          icon: 'thumb-up-off-alt',
          size: 30,
          onPress: () => {
            history('/rn/1')
          }
        }
      })
    }

    this.changeCat = index => {
      const { history, setSelectedRatingCategory } = this.props

      setSelectedRatingCategory(index)
      history('/rn/' + (index + 1))
    }
  }

  renderModal = () => {
    const { theme, Portal, Modal } = this.props.utils
    const { countries, changeRatingFilter, filter } = this.props
    const { selectedCountries, visibleModal } = this.state

    let isDarkMode = Appearance.getColorScheme() === 'dark'
    let bg = isDarkMode ? theme.dark.colors.background : theme.light.colors.background

    return (
      <Portal>
        <Modal visible={visibleModal} onDismiss={() => this.closeModalFilter()} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <View
            style={{
              width: Dimensions.get('window').width < WIDTH_MAX ? Dimensions.get('window').width : WIDTH_BLOCK,
              borderRadius: 10,
              backgroundColor: bg,
              alignSelf: 'center',
              height: Dimensions.get('window').height,
              marginTop: 140
            }}>
            {/*<Filter*/}
            {/*  countries={countries}*/}
            {/*  changeRatingFilter={changeRatingFilter}*/}
            {/*  filter={filter}*/}
            {/*  setSelectedCountries={this.setSelectedCountries}*/}
            {/*  setFilterURL={this.setFilterURL}*/}
            {/*  selectedCountries={selectedCountries}*/}
            {/*  closeModalFilter={this.closeModalFilter}*/}
            {/*  android={true}*/}
            {/*/>*/}
          </View>
        </Modal>
      </Portal>
    )
  }

  renderModalScores = () => {
    const { theme, Portal, Modal, isMobile } = this.props.utils
    const { visibleModalScores } = this.state

    let isDarkMode = Appearance.getColorScheme() === 'dark'
    let bg = isDarkMode ? theme.dark.colors.background : theme.light.colors.background
    let warn = isDarkMode ? theme.dark.colors.textPrimary : theme.light.colors.textPrimary
    let txt = isDarkMode ? theme.dark.colors.text : theme.light.colors.text

    return (
      <Portal>
        <Modal visible={visibleModalScores} onDismiss={() => this.setState({ visibleModalScores: false })} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <View
            style={{
              width: isMobile ? width : width / 3,
              borderRadius: 10,
              backgroundColor: bg,
              alignSelf: 'center',
              height: Dimensions.get('window').height / 3,
              padding: 20,
              alignItems: 'center'
            }}>
            <Text style={{ textAlign: 'center', color: warn, fontSize: 16 }}>{'Установите важность как минимум у трех номинаций для того чтобы рассчитать рейтинг для вас.'}</Text>
            <View style={{ position: 'absolute', bottom: 20 }}>
              <TouchableOpacity
                onPress={() => this.setState({ visibleModalScores: false })}
                style={{
                  width: 200,
                  height: 40,
                  borderWidth: 0.5,
                  borderColor: '#ccc',
                  borderRadius: 10,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#e4ecf6'
                }}>
                <Text style={{ color: txt, fontSize: 16, fontWeight: 'bold' }}>{'ПОНЯТНО'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </Portal>
    )
  }

  renderModalSearch = () => {
    const { theme, Portal, Modal } = this.props.utils
    const { selectSearch, currentCategory, user, indexTab } = this.props
    const { visibleModalSearch, countryId, hotelId, placeId, hclassName, listHotels } = this.state

    let isDarkMode = Appearance.getColorScheme() === 'dark'
    let bg = isDarkMode ? theme.dark.colors.background : theme.light.colors.background

    return (
      <Portal>
        <Modal visible={visibleModalSearch} onDismiss={() => this.closeModalFilter()} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <View
            style={{
              width: Dimensions.get('window').width < WIDTH_MAX ? Dimensions.get('window').width : WIDTH_BLOCK,
              borderRadius: 10,
              backgroundColor: bg,
              alignSelf: 'center',
              height: Dimensions.get('window').height,
              marginTop: 140
            }}>
            {/*<SearchRating*/}
            {/*  setVisibleModalSearch={this.setVisibleModalSearch}*/}
            {/*  country={countryId}*/}
            {/*  hotel={hotelId}*/}
            {/*  place={placeId}*/}
            {/*  hclass={hclassName}*/}
            {/*  closeModalFilter={() => this.setVisibleModalSearch(false)}*/}
            {/*  selectSearch={selectSearch}*/}
            {/*  setSelectSearch={this.setSelectSearchModal}*/}
            {/*  listHotels={listHotels}*/}
            {/*  currentCategory={currentCategory}*/}
            {/*  user={user}*/}
            {/*  indexTab={indexTab}*/}
            {/*/>*/}
          </View>
        </Modal>
      </Portal>
    )
  }

  componentDidMount() {
    this.setParams()
    this.setFooter()
    this.getInitDataMyRating()
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const { matchPath } = this.props.utils
    const { selectedCountries, selectedPlaces, indexCategory } = this.props.filter
    const { isLoading } = this.state

    this.setParams()

    if (isLoading && (prevProps.selectedCountries !== selectedCountries || prevProps.selectedPlaces !== selectedPlaces || prevProps.indexCategory !== indexCategory)) {
      let match = matchPath(this.props.pathname, {
        path: ['/rm/:rm'],
        exact: true,
        strict: false
      })

      if (!match) {
        this.getListMyRating(false)
      }
    }
  }

  renderItem = ({ item, index, changeCat, slideIndex }) => {
    return (
      <View
        style={{
          height: SCALE_H,
          shadowColor: '#000',
          shadowOffset: {
            width: 2,
            height: 3
          },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
          alignItems: 'center'
        }}>
        <TouchableOpacity onPress={() => changeCat(index, slideIndex)} delayPressIn={100}>
          <ImageBackground source={{ uri: item.img }} imageStyle={{ borderRadius: 10 }} style={{ width: Platform.isPad ? width / 4 : width / 3, height: SCALE_IMG }}>
            <View style={{ position: 'absolute', left: 0, right: 0, bottom: 10, alignItems: 'center' }}>
              <Text style={{ fontWeight: 'bold', fontSize: SCALE_FONT, color: '#fff', textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 2, textShadowColor: '#000' }}>{item.name}</Text>
            </View>
          </ImageBackground>
        </TouchableOpacity>
      </View>
    )
  }

  render() {
    const { theme, ScrollableTabView, ScrollableTabBar, TextInput, t, Button, isMobile } = this.props.utils
    const {
      criteria,
      history,
      countries,
      filter,
      ratingHotelView,
      user,
      categories,
      currentCategory,
      setSaveRatingCache,
      selectSearch,
      listHotelsCache,
      setSelectedRatingCategory,
      selectedRatingCategory,
      hotels,
      setHotels,
      setModalLogin
    } = this.props
    const {
      hotel,
      showSearch,
      selectedCountries,
      action,
      cuid,
      puid,
      hclass,
      slideIndexFinal,
      paramsTitle,
      urlRequestPriceId,
      listHotels,
      indexTab,
      coords,
      editRating,
      scores,
      persent,
      hotelList,
      isLoading
    } = this.state

    let isDarkMode = Appearance.getColorScheme() === 'dark'
    let bg = isDarkMode ? theme.dark.colors.background : theme.light.colors.background
    let bgB = isDarkMode ? theme.dark.colors.iconInactive : theme.light.colors.background
    let txt = isDarkMode ? theme.dark.colors.text : theme.light.colors.text
    let actxt = isDarkMode ? theme.dark.colors.text : theme.light.colors.main
    let intxt = isDarkMode ? theme.dark.colors.textInactive : theme.light.colors.textInactive

    return (
      <>
        <View style={{ height: 60 }}>
          <ScrollableTabView
            scrollWithoutAnimation={true}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            style={{ backgroundColor: bg, width: isMobile ? width : width / 2, alignSelf: 'center' }}
            renderTabBar={props => (
              <ScrollableTabBar
                {...props}
                style={{ height: 55 }}
                renderTab={(item, page, isTabActive, onPressHandler, onLayoutHandler) => {
                  const textStyle = {}
                  const textColor = isTabActive ? actxt : txt
                  const fontWeight = isTabActive ? 'bold' : 'normal'

                  return (
                    <TouchableOpacity
                      key={`${item.name}_${page}`}
                      accessible={true}
                      accessibilityLabel={item.name}
                      accessibilityTraits="button"
                      onPress={() => onPressHandler(page)}
                      onLayout={onLayoutHandler}>
                      <View
                        style={{
                          margin: 4,
                          height: 50,
                          alignItems: 'center',
                          justifyContent: 'center',
                          paddingHorizontal: 20
                        }}>
                        <Text style={[{ color: item.constr === -1 ? intxt : textColor, fontWeight }, textStyle]}>{item.name}</Text>
                      </View>
                    </TouchableOpacity>
                  )
                }}
              />
            )}
            onChangeTab={({ i, ref, from }) => {
              if (i !== from) {
                if (editRating) {
                  setSelectedRatingCategory(i)

                  if (!isLoading) {
                    this.setEditPoints(true)
                  }
                } else {
                  this.changeCat(i)
                }
              }
            }}
            initialPage={slideIndexFinal}
            tabBarActiveTextColor={actxt}
            tabBarInactiveTextColor={txt}
            tabBarUnderlineStyle={{
              backgroundColor: actxt
            }}>
            {categories.map((item, index) => {
              const n = item.name + '\n' + (scores[index] ? scores[index] : '0') + ' бал./' + (persent[index] ? persent[index] + '%' : '0%')
              const n1 = item.name + '\n' + (persent[index] ? persent[index] : '0') + '%'
              return editRating ? (
                <Text tabLabel={n} i={index} key={index} style={{ color: txt, alignSelf: 'center' }} tabItem={{ name: n, constr: item.constr }} />
              ) : (
                <Text tabLabel={n1} i={index} key={index} style={{ color: txt, alignSelf: 'center' }} tabItem={{ name: n1, constr: item.constr }} />
              )
            })}
          </ScrollableTabView>
        </View>
        {editRating ? (
          <View style={{ width: isMobile ? width : width / 2, alignSelf: 'center', height: '100%' }}>
            <View style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0.5, backgroundColor: '#fff' }} />
            <View style={{ marginLeft: 12, marginTop: 10 }}>
              <Text style={{ fontSize: 16, color: txt }}>{t('screens.ratings.components.ratings.points')}</Text>
            </View>
            <TextInput
              label={
                categories[selectedRatingCategory] && categories[selectedRatingCategory].name ? (
                  <Text style={{ fontWeight: 'bold', color: MAIN_COLOR }}>{'Баллы по ' + categories[selectedRatingCategory].name}</Text>
                ) : (
                  <></>
                )
              }
              value={scores[selectedRatingCategory] ? String(scores[selectedRatingCategory]) : ''}
              onChangeText={text => {
                if (!isNaN(Number(text))) {
                  const scoresNew = {
                    ...scores,
                    [selectedRatingCategory]: Number(text)
                  }
                  this.setState({ scores: scoresNew })
                }
              }}
              style={{ backgroundColor: bg, color: txt, margin: 10, marginTop: 5, borderWidth: 0 }}
              outlineStyle={{ borderWidth: 1, borderColor: '#cbcbcb' }}
              mode={'outlined'}
              onFocus={() => this.setState({ isFocus: true })}
              onBlur={() => this.setState({ isFocus: false })}
              keyboardType={'numeric'}
            />
            <View style={{ marginLeft: 12, marginTop: 10 }}>
              <Text style={{ fontSize: 16, color: txt }}>{t('screens.ratings.components.ratings.percent')}</Text>
            </View>
            <TextInput
              value={persent[selectedRatingCategory] ? String(persent[selectedRatingCategory]) + '%' : '0%'}
              style={{ backgroundColor: bg, color: txt, margin: 10, marginTop: 5, borderWidth: 0 }}
              outlineStyle={{ borderWidth: 1, borderColor: '#cbcbcb' }}
              mode={'outlined'}
              editable={false}
            />
            <View style={{ alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', marginTop: 30 }}>
                <Button icon="content-save" mode="elevated" onPress={() => this.setEditPoints(false)} textColor={MAIN_COLOR} style={{ alignSelf: 'center', borderColor: bgB, borderWidth: 1 }}>
                  {' РАССЧИТАТЬ '}
                </Button>
                <View style={{ width: 10 }} />
                <Button icon="close" mode="elevated" onPress={() => this.clearPoints()} textColor={'red'} style={{ alignSelf: 'center', borderColor: bgB, borderWidth: 1 }}>
                  {' ОТМЕНИТЬ '}
                </Button>
              </View>
            </View>
            <View style={{ alignItems: 'center', marginTop: 50, marginHorizontal: 10 }}>
              <View style={{ backgroundColor: bg, alignItems: 'center', padding: 20, borderRadius: 10, borderWidth: 1, borderColor: '#ccc' }}>
                <Text style={{ fontSize: 16, textAlign: 'center', color: txt }}>{'Помочь выбрать свои номинации для отдыха за 1 минуту?'}</Text>
                <View style={{ flexDirection: 'row' }}>
                  <Text style={{ fontSize: 16, textAlign: 'center', color: txt }}>{'Переходите в '}</Text>
                  <TouchableOpacity onPress={this.gotoLink} style={{ marginLeft: Platform.OS === 'ios' ? 2 : 0 }}>
                    <Text style={{ fontSize: 16, color: MAIN_COLOR, fontWeight: 'bold' }}>{'мини-опрос -> диагноз'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            <View style={{ height: 40 }} />
          </View>
        ) : (
          <></>
        )}
        {!editRating && criteria && criteria.length > 0 ? (
          <FinalList
            pattern={hotel}
            setSelectedCountries={this.setSelectedCountries}
            action={action}
            cuid={cuid}
            puid={puid}
            hclass={hclass}
            history={history}
            categories={criteria}
            slideIndex={selectedRatingCategory}
            renderCarouselItem={this.renderItem}
            setSlideIndex={this.setSlideIndex}
            countries={countries}
            ratingHotelView={ratingHotelView}
            user={user}
            onPressShare={this.onPressShare}
            setParamsTitle={this.setParamsTitle}
            setVisibleModalSearch={this.setVisibleModalSearch}
            urlRequestPriceId={urlRequestPriceId}
            setUrlRequestPriceId={this.setUrlRequestPriceId}
            listHotels={listHotels}
            selectedCountries={selectedCountries}
            indexTab={indexTab}
            setSaveRatingCache={setSaveRatingCache}
            selectSearch={selectSearch}
            listHotelsCache={listHotelsCache}
            coords={coords}
            hotelList={hotelList}
            isLoading={isLoading}
            onEndReached={this.onEndReached}
            utils={this.props.utils}
            hotels={hotels}
            setHotels={setHotels}
            currentCategory={currentCategory}
            setModalLogin={setModalLogin}
          />
        ) : (
          <></>
        )}
        {this.renderModal()}
        {this.renderModalSearch()}
        {this.renderModalScores()}
      </>
    )
  }
}

export default FinalHotels
