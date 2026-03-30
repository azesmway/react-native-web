import React, { lazy, PureComponent, Suspense } from 'react'
import { ActivityIndicator, Appearance, Dimensions, Image, Platform, Text, TouchableOpacity, View } from 'react-native'

const Filter = lazy(() => import('./filter/Filter'))
const List = lazy(() => import('./List'))
const Search = lazy(() => import('./Search'))

const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
const { getAuthLink } = GLOBAL_OBJ.onlinetur.storage
const { WIDTH_MAX, WIDTH_BLOCK, MAIN_COLOR } = GLOBAL_OBJ.onlinetur.constants
const { width, height } = Dimensions.get('window')

class ListHotels extends PureComponent {
  constructor(props) {
    super(props)

    const { RatingsController } = props

    Object.assign(this, new RatingsController(this, this.props.utils))

    this.state = {
      hotel: '',
      showLoading: false,
      showSearch: false,
      selectedCountries: props && props.filter && props.filter.selectedCountries ? props.filter.selectedCountries : [],
      action: 'get_top_rate',
      lim: 20,
      ofs: 0,
      cuid: props && props.filter && props.filter.selectedPlaces.length === 0 ? props.filter.selectedCountries : [],
      puid: props && props.filter && props.filter.selectedPlaces,
      hclass: props && props.filter && props.filter.indexCategory ? props.filter.indexCategory : 0,
      pattern: props.pattern,
      searchText: '',
      showFilter: false,
      slideIndex: Number(this.props.categoryRating),
      visibleModal: false,
      visibleModalGrade: false,
      hotelIdGrade: '',
      visibleImages: false,
      visibleModalSearch: false,
      countryId: null,
      hotelId: null,
      placeId: null,
      hclassName: null,
      listHotels: [],
      urlRequestPriceId: '',
      indexTab: 1,
      hotels: [],
      view: false,
      loading: false,
      coords: null,

      userIdLink: '',
      userHashLink: '',
      userNameLink: ''
    }

    this.updateSearch = searchText => {
      this.setState({ hotel: searchText })
    }

    this.cancelSearch = () => {
      this.setState({ hotel: '' })
    }

    this.onCancelFilter = () => {
      this.setState({ showFilter: false })
    }

    this.setSlideIndex = (event, slideIndex) => {
      const { history, ratingHotelView } = this.props
      const { ofs } = this.state

      if (ratingHotelView !== 0) {
        history('/rt/' + ratingHotelView + '/c/' + (slideIndex + 1))
      } else {
        history('/r/' + (slideIndex + 1))
      }

      this.setState({ slideIndex: Number(slideIndex), ofs: 0 })
    }

    this.openModalFilter = () => {
      this.setState({ visibleModal: true })
    }

    this.openModalGrade = id => {
      this.setState({ visibleModalGrade: true, hotelIdGrade: id })
    }

    this.closeModalFilter = () => {
      this.setState({ visibleModal: false })
    }

    this.closeModalGrade = () => {
      this.setState({ visibleModalGrade: false })
    }

    this.setVisibleImages = visible => {
      this.setState({ visibleImages: visible })
    }

    this.setVisibleModalSearch = (visible, countryId, hotelId, placeId, hclass, listHotels) => {
      this.setState({ visibleModalSearch: visible, countryId: countryId, hotelId: hotelId, placeId: placeId, hclassName: hclass, listHotels })
    }

    this.setSelectSearchModal = (params, url, tp) => {
      const { setSelectSearch } = this.props

      this.setState({ visibleModalSearch: false, urlRequestPriceId: url, indexTab: tp }, () => {
        setSelectSearch(params)
      })
    }

    this.setUrlRequestPriceId = urlRequestPriceId => {
      this.setState({ urlRequestPriceId })
    }

    this.setHotelsGeo = result => {
      if (result && result.h && result.h.length > 0) {
        const h = []

        for (let i = 0; i < result.h.length; i++) {
          const n = result.h[i]
          n.pname = result.r.filter(r => Number(r.id) === Number(n.puid))[0].name
          n.cname = result.ctr.filter(c => Number(c.id) === Number(n.cuid))[0].name
          h.push(n)
        }

        this.setState({ hotels: h, view: true })
      } else {
        this.setState({ hotels: [], view: false, loading: false }, () => {
          alert('По Вашему запросу ни чего не найдено!')
        })
      }
    }

    // this.getUserLocation = () => {
    //   if (navigator.geolocation) {
    //     // get the current users location
    //     navigator.geolocation.getCurrentPosition(
    //       position => {
    //         const { latitude, longitude } = position.coords
    //
    //         if (latitude && longitude) {
    //           this.setState({ coords: position.coords, view: true, loading: false })
    //         }
    //       },
    //       error => {
    //         console.error('Error getting user location:', error)
    //       }
    //     )
    //   }
    // }

    this.getParams = () => {
      const { t } = this.props.utils
      const { countries, filter, currentCategory, user } = this.props
      const { showSearch, slideIndex, selectedCountries } = this.state

      let params = {}
      params.title = currentCategory ? currentCategory.name_menu_rating : t('screens.ratings.components.listhotels.title')
      params.screen = 'list_hotels'
      params.showSearchField = this.showSearchField
      params.onOpenSearch = this.showSearchField
      params.onClearSearch = this.cancelSearch
      params.showSearch = showSearch
      params.openSearch = showSearch
      params.placeholder = t('components.header.appheader.searchRating')
      params.onSubmitEditingWeb = this.updateSearch
      params.user = user
      params.slideIndex = slideIndex

      if (filter && filter.selectedCountries && filter.selectedCountries.length > 0) {
        params.selectedCountries = filter.selectedCountries
      } else {
        params.selectedCountries = selectedCountries
      }

      params.openModalFilter = this.openModalFilter
      params.setFilterURL = this.setFilterURL
      let valueCountries = []

      for (let i = 0; i < countries.length; i++) {
        if (countries[i].id_country && params.selectedCountries.indexOf(countries[i].id_country.toString()) > -1) {
          valueCountries.push(countries[i].title)
        }
      }

      params.subtitle = valueCountries.length > 0 ? valueCountries.join(',') : t('common.loading')

      return params
    }

    this.setGradeOnOpen = () => {
      const { queryString } = this.props.utils
      const { pathname } = this.props
      const { visibleModalGrade } = this.state

      if (pathname.includes('/grade') && !visibleModalGrade) {
        const usr = getAuthLink() !== '' ? queryString.parse(getAuthLink().replace('?', '')) : { name: '', token: '', user_id: '' }
        const h = pathname.split('/')
        this.setState({ visibleModalGrade: true, hotelIdGrade: h[2], userIdLink: usr.user_id, userHashLink: usr.token, userNameLink: usr.name })
      }
    }

    this.setSelectedCountries = selectedCountries => {
      this.setState({ selectedCountries: selectedCountries }, () => {})
    }

    this.changeCat = index => {
      const { history } = this.props
      // if (Number(index) !== Number(slideIndex) && Number(current) !== Number(slideIndex)) {
      //   setOffset(0)
      //   setHotelList([])
      //   setSelectedRatingCategory(index)
      //   setSlideIndex(index)
      // }
      history('/r/' + (index + 1))
    }
  }

  componentDidMount() {
    this.setGradeOnOpen()
  }

  renderModal = () => {
    const { Portal, Modal } = this.props.utils
    const { countries, changeRatingFilter, filter } = this.props
    const { slideIndex, selectedCountries, visibleModal } = this.state

    return (
      <Portal>
        <Modal visible={visibleModal} onDismiss={() => this.closeModalFilter()} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <View
            style={{
              width: Dimensions.get('window').width < WIDTH_MAX ? Dimensions.get('window').width : WIDTH_BLOCK,
              borderRadius: 10,
              backgroundColor: '#ffffff',
              alignSelf: 'center',
              height: Dimensions.get('window').height,
              marginTop: 140
            }}>
            <Suspense fallback={null}>
              <Filter
                visible={visibleModal}
                closeModalFilter={this.closeModalFilter}
                countries={countries}
                selectedCountries={selectedCountries}
                // setSelectedCountries={this.setSelectedCountries}
                setFilterURLWeb={this.setFilterURLWeb}
                changeRatingFilter={changeRatingFilter}
                filter={filter}
                android={true}
                myHotels={false}
                slideIndex={slideIndex}
                utils={this.props.utils}
                RatingsController={this.props.RatingsController}
              />
            </Suspense>
          </View>
        </Modal>
      </Portal>
    )
  }

  renderModalGrade = () => {
    const { Portal, Modal, Icon } = this.props.utils
    const { user } = this.props
    const { hotelIdGrade, visibleModalGrade, userIdLink, userHashLink, userNameLink } = this.state

    const userId = user && user.id_user ? user.id_user : userIdLink
    const userHash = user && user.hash_rt ? user.hash_rt : userHashLink
    const userName = user && user.name ? user.name : userNameLink

    return (
      <Portal>
        <Modal visible={visibleModalGrade} onDismiss={() => this.closeModalGrade()} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <View
            style={{
              width: Dimensions.get('window').width - 100,
              borderRadius: 10,
              backgroundColor: '#ffffff',
              alignSelf: 'center',
              height: Dimensions.get('window').height - 50
            }}>
            <iframe
              src={'https://beta.distant-office.ru/bestt.php?i=ols' + hotelIdGrade + '&only=1&t=0;3&fo=1&user_id=' + userId + '&hash=' + userHash + '&name=' + userName}
              width={Dimensions.get('window').width - 120}
              height={Dimensions.get('window').height - 60}
              frameBorder={0}
            />
            <TouchableOpacity style={{ position: 'absolute', right: 10, top: 10 }} onPress={() => this.closeModalGrade()}>
              <Icon name={'close'} color={'red'} />
            </TouchableOpacity>
          </View>
        </Modal>
      </Portal>
    )
  }

  renderModalSearch = () => {
    const { Portal, Modal, isMobile } = this.props.utils
    const { selectSearch, currentCategory, user } = this.props
    const { visibleModalSearch, countryId, hotelId, placeId, hclassName, listHotels, coords, indexTab } = this.state

    return (
      <Portal>
        <Modal visible={visibleModalSearch} onDismiss={() => this.setVisibleModalSearch(false)} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <View
            style={{
              width: isMobile ? width : width / 3,
              borderRadius: 10,
              backgroundColor: '#ffffff',
              alignSelf: 'center',
              height: Dimensions.get('window').height / 2
            }}>
            <Suspense fallback={null}>
              <Search
                setVisibleModalSearch={this.setVisibleModalSearch}
                country={countryId}
                hotel={hotelId}
                place={placeId}
                hclass={hclassName}
                closeModalFilter={() => this.setVisibleModalSearch(false)}
                selectSearch={selectSearch}
                setSelectSearch={this.setSelectSearchModal}
                listHotels={listHotels}
                currentCategory={currentCategory}
                user={user}
                coords={coords}
                indexTab={indexTab}
                utils={this.props.utils}
              />
            </Suspense>
          </View>
        </Modal>
      </Portal>
    )
  }

  renderDateView = (d1, d2, curSelectSearch) => {
    const { theme, Icon, isMobile } = this.props.utils

    let isDarkMode = Appearance.getColorScheme() === 'dark'
    let bg = isDarkMode ? theme.dark.colors.background : theme.light.colors.background
    let txt = isDarkMode ? theme.dark.colors.text : theme.light.colors.text
    let link = isDarkMode ? theme.dark.colors.link : theme.light.colors.link

    return (
      <View
        style={{
          width: isMobile ? width : width / 2,
          height: 60,
          flexDirection: 'row',
          backgroundColor: bg,
          paddingHorizontal: 10,
          borderBottomWidth: 1,
          borderBottomColor: '#e3e3e3',
          justifyContent: 'space-between',
          alignSelf: 'center'
        }}>
        <View style={{ width: 218, height: 60 }}>
          <View style={{ paddingTop: 10, flexDirection: 'row' }}>
            {!d1 && !d2 ? (
              <Text
                style={{
                  color: MAIN_COLOR,
                  fontSize: 12
                }}>
                {'Даты: не выбрано'}
              </Text>
            ) : (
              <>
                <Text
                  style={{
                    color: MAIN_COLOR,
                    fontSize: 12
                  }}>
                  {'c ' + d1}
                </Text>
                <Text
                  style={{
                    color: MAIN_COLOR,
                    fontSize: 12
                  }}>
                  {' по ' + d2}
                </Text>
              </>
            )}
          </View>
          <View style={{ flexDirection: 'row' }}>
            <Text style={{ fontSize: 12, color: MAIN_COLOR, marginTop: 2 }}>{'Взр: '}</Text>
            <View style={{ flexDirection: 'row', marginTop: 2 }}>
              {curSelectSearch.human.map((h, i) => (
                <Icon type={'feather'} name={'user'} key={i.toString()} style={{ marginLeft: 0 }} size={14} color={MAIN_COLOR} />
              ))}
            </View>
            {curSelectSearch.childs.length > 0 ? (
              <>
                <Text style={{ fontSize: 12, color: MAIN_COLOR, marginTop: 2, marginLeft: 10 }}>{'Дети: '}</Text>
                <View style={{ flexDirection: 'row', marginTop: 2 }}>
                  {curSelectSearch.childs.map((h, i) => (
                    <Icon type={'feather'} name={'user'} key={i.toString()} style={{ marginLeft: 0 }} size={14} color={MAIN_COLOR} />
                  ))}
                </View>
              </>
            ) : (
              <></>
            )}
          </View>
        </View>
        <View style={{ width: 130, height: 60, alignItems: 'flex-end', justifyContent: 'center' }}>
          <TouchableOpacity
            onPress={() => {
              this.setVisibleModalSearch(true, curSelectSearch.sity.uid, curSelectSearch.hotel, '', '', curSelectSearch.listHotels)
            }}
            style={{
              height: 30,
              borderWidth: 0.5,
              borderColor: '#ccc',
              borderRadius: 5,
              backgroundColor: '#e4ecf6',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
            <Text style={{ color: '#494949', textTransform: 'uppercase', fontSize: 12, padding: 5 }}>{'Запрос цены'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  renderPriceFilter = () => {
    const { moment, Tooltip } = this.props.utils
    const { selectSearch } = this.props
    const { tooltipView } = this.state
    let curSelectSearch = {}

    if (!selectSearch || (selectSearch && !selectSearch.startDate)) {
      curSelectSearch = {
        sity: {
          uid: -1
        },
        hotel: -1,
        listHotels: [],
        human: [0, 1],
        childs: [],
        startDate: moment().add('+6', 'day'),
        endDate: moment().add('+9', 'day')
      }
    } else {
      curSelectSearch = selectSearch
    }

    const d1 = moment(curSelectSearch.startDate).format('DD MMMM')
    const d2 = moment(curSelectSearch.endDate).format('DD MMMM')

    return tooltipView ? (
      <Tooltip
        popover={
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16 }}>{'Уточните параметры и мы покажем актуальные цены!'}</Text>
          </View>
        }
        width={260}
        height={64}
        backgroundColor={'#fff'}
        overlayColor={'rgba(255,255,255,0.01)'}
        withOverlay={true}
        toggleOnPress={false}
        visible={tooltipView}
        highlightColor={'#fff'}>
        {this.renderDateView(d1, d2, curSelectSearch)}
      </Tooltip>
    ) : (
      this.renderDateView(d1, d2, curSelectSearch)
    )
  }

  render() {
    const { ScrollableTabView, ScrollableTabBar, theme, isMobile, SearchBar, t, Icon } = this.props.utils
    const { history, categories, user, ratingHotelView, list, setParams } = this.props
    const { slideIndex, hotel, selectedCountries, action, cuid, puid, lim, ofs, hclass, visibleImages, searchText, showLoading, urlRequestPriceId, listHotels, indexTab, view, loading, coords } =
      this.state

    // if (list) {
    //   return (
    //     <>
    //       <SearchBar
    //         placeholder={t('components.header.appheader.searchRating')}
    //         onChangeText={text => this.setState({ searchText: text })}
    //         value={searchText}
    //         lightTheme={true}
    //         containerStyle={{ backgroundColor: '#fff', padding: 0, width: isBrowser ? WIDTH_BLOCK : '100%', alignSelf: 'center', marginTop: 5, borderRadius: 10 }}
    //         inputStyle={{ backgroundColor: '#fff', padding: 0, color: '#000' }}
    //         inputContainerStyle={{ backgroundColor: '#fff', padding: 0 }}
    //         autoCapitalize={'none'}
    //         autoCorrect={false}
    //         searchIcon={<Icon name="search" size={30} color={'#8d8d8d'} />}
    //         clearIcon={
    //           <Icon
    //             name="close"
    //             size={30}
    //             color={'red'}
    //             onPress={() => {
    //               this.setState({ searchText: '' })
    //               this.cancelSearch()
    //             }}
    //           />
    //         }
    //         showLoading={showLoading}
    //         onSubmitEditing={() => this.updateSearch(searchText)}
    //         keyboardType={'web-search'}
    //         onClear={() => this.cancelSearch()}
    //       />
    //       <List
    //         pattern={hotel}
    //         setSelectedCountries={this.setSelectedCountries}
    //         action={action}
    //         cuid={cuid}
    //         puid={puid}
    //         lim={lim}
    //         ofs={ofs}
    //         hclass={hclass}
    //         history={history}
    //         slideIndex={slideIndex}
    //         categories={categories}
    //         ratingHotelView={ratingHotelView}
    //         user={user}
    //         setParams={setParams}
    //         params={this.getParams()}
    //         list={list}
    //         setVisibleImages={this.setVisibleImages}
    //         visibleImages={visibleImages}
    //         setVisibleModalSearch={this.setVisibleModalSearch}
    //         urlRequestPriceId={urlRequestPriceId}
    //         setUrlRequestPriceId={this.setUrlRequestPriceId}
    //         listHotels={listHotels}
    //         selectedCountries={selectedCountries}
    //         indexTab={indexTab}
    //         coords={coords}
    //         openModalGrade={this.openModalGrade}
    //       />
    //       {this.renderModal()}
    //       {this.renderModalSearch()}
    //     </>
    //   )
    // } else {
    //   return (
    //     <>
    //       <View>
    //         <Tabs
    //           value={slideIndex}
    //           onChange={this.setSlideIndex}
    //           indicatorColor="primary"
    //           textColor="primary"
    //           variant="scrollable"
    //           scrollButtons="on"
    //           style={{
    //             backgroundColor: '#fff',
    //             width: isBrowser ? WIDTH_BLOCK : '100%',
    //             height: visibleImages ? 110 : 20
    //           }}>
    //           {visibleImages
    //             ? categories.map((c, i) => {
    //                 return (
    //                   <Tab
    //                     key={i.toString()}
    //                     label={c.name}
    //                     icon={
    //                       <Image blurRadius={Number(c.constr) === -1 ? 5 : 0} source={{ uri: c.img }} style={{ width: 100, height: 60,
    //                       borderRadius: 5, opacity: Number(c.constr) === -1 ? 0.3 : 1 }} />
    //                     }
    //                     wrapped
    //                   />
    //                 )
    //               })
    //             : categories.map((c, i) => {
    //                 return <Tab key={i.toString()} label={c.name} wrapped />
    //               })}
    //         </Tabs>
    //         {this.renderPriceFilter()}
    //         <View style={{ flexDirection: 'row' }}>
    //           {view ? (
    //             <TouchableOpacity
    //               onPress={() => this.setState({ hotels: [], view: false, loading: false, coords: null })}
    //               style={{ backgroundColor: '#fff', marginTop: 5, alignItems: 'center', justifyContent: 'center', width: 40 }}>
    //               <Icon name={'location-off'} color={'red'} size={30} />
    //             </TouchableOpacity>
    //           ) : loading ? (
    //             <View style={{ backgroundColor: '#fff', marginTop: 5, alignItems: 'center', justifyContent: 'center', width: 40 }}>
    //               <ActivityIndicator color={MAIN_COLOR} />
    //             </View>
    //           ) : (
    //             <TouchableOpacity
    //               onPress={() => {
    //                 this.setState({ loading: true }, () => {
    //                   this.getUserLocation()
    //                 })
    //               }}
    //               style={{ backgroundColor: '#fff', marginTop: 5, alignItems: 'center', justifyContent: 'center', width: 40 }}>
    //               <Icon name={'location-on'} color={MAIN_COLOR} size={30} />
    //             </TouchableOpacity>
    //           )}
    //           <SearchBar
    //             placeholder={t('components.header.appheader.searchRating')}
    //             onChangeText={text => this.setState({ searchText: text })}
    //             value={searchText}
    //             lightTheme={true}
    //             containerStyle={{ backgroundColor: '#fff', padding: 0, width: isBrowser ? WIDTH_BLOCK - 40 : '100%', alignSelf: 'center', marginTop: 5, borderRadius: 10 }}
    //             inputStyle={{ backgroundColor: '#fff', padding: 0, color: '#000' }}
    //             inputContainerStyle={{ backgroundColor: '#fff', padding: 0 }}
    //             autoCapitalize={'none'}
    //             autoCorrect={false}
    //             searchIcon={<Icon name="search" size={30} color={'#8d8d8d'} />}
    //             clearIcon={
    //               <Icon
    //                 name="close"
    //                 size={30}
    //                 color={'red'}
    //                 onPress={() => {
    //                   this.setState({ searchText: '' })
    //                   this.cancelSearch()
    //                 }}
    //               />
    //             }
    //             showLoading={showLoading}
    //             onSubmitEditing={() => this.updateSearch(searchText)}
    //             keyboardType={'web-search'}
    //             onClear={() => this.cancelSearch()}
    //           />
    //         </View>
    //         <List
    //           pattern={hotel}
    //           setSelectedCountries={this.setSelectedCountries}
    //           action={action}
    //           cuid={cuid}
    //           puid={puid}
    //           lim={lim}
    //           ofs={ofs}
    //           hclass={hclass}
    //           history={history}
    //           slideIndex={slideIndex}
    //           categories={categories}
    //           ratingHotelView={ratingHotelView}
    //           user={user}
    //           setParams={setParams}
    //           params={this.getParams()}
    //           list={list}
    //           setVisibleImages={this.setVisibleImages}
    //           visibleImages={visibleImages}
    //           setVisibleModalSearch={this.setVisibleModalSearch}
    //           urlRequestPriceId={urlRequestPriceId}
    //           setUrlRequestPriceId={this.setUrlRequestPriceId}
    //           listHotels={listHotels}
    //           selectedCountries={selectedCountries}
    //           indexTab={indexTab}
    //           coords={coords}
    //           openModalGrade={this.openModalGrade}
    //         />
    //       </View>
    //       {this.renderModal()}
    //       {this.renderModalSearch()}
    //       {this.renderModalGrade()}
    //     </>
    //   )
    // }

    let isDarkMode = Appearance.getColorScheme() === 'dark'
    let bg = isDarkMode ? theme.dark.colors.background : theme.light.colors.background
    let txt = isDarkMode ? theme.dark.colors.text : theme.light.colors.text
    let actxt = isDarkMode ? theme.dark.colors.main : theme.light.colors.main
    let intxt = isDarkMode ? theme.dark.colors.textInactive : theme.light.colors.textInactive

    return (
      <>
        {this.renderPriceFilter()}
        <View>
          <SearchBar
            placeholder={t('components.header.appheader.searchRating')}
            onChangeText={text => this.setState({ searchText: text })}
            value={searchText}
            lightTheme={true}
            containerStyle={{ backgroundColor: '#fff', padding: 0, width: isMobile ? width : width / 2, alignSelf: 'center' }}
            inputStyle={{ backgroundColor: '#fff', padding: 5, color: '#000' }}
            inputContainerStyle={{ backgroundColor: '#fff', padding: 0 }}
            autoCapitalize={'none'}
            autoCorrect={false}
            searchIcon={<Icon name="search" size={30} color={'#8d8d8d'} />}
            clearIcon={
              <Icon
                name="close"
                size={30}
                color={'red'}
                onPress={() => {
                  this.setState({ searchText: '' })
                  this.cancelSearch()
                }}
              />
            }
            showLoading={showLoading}
            onSubmitEditing={() => this.updateSearch(searchText)}
            keyboardType={'web-search'}
            onClear={() => this.cancelSearch()}
          />
        </View>
        <View style={{ height: 60 }}>
          <ScrollableTabView
            scrollWithoutAnimation={true}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            style={{ backgroundColor: bg, width: isMobile ? width : width / 2, alignSelf: 'center' }}
            renderTabBar={props => (
              <ScrollableTabBar
                {...this.props}
                style={{ height: 60 }}
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
                      onPress={() => {
                        onPressHandler(page)
                      }}
                      onLayout={onLayoutHandler}>
                      <View
                        style={{
                          margin: 5,
                          height: 50,
                          alignItems: 'center',
                          justifyContent: 'center',
                          paddingLeft: 20,
                          paddingRight: 20
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
                this.changeCat(i)
              }
            }}
            initialPage={slideIndex}
            tabBarActiveTextColor={actxt}
            tabBarInactiveTextColor={txt}
            tabBarUnderlineStyle={{
              backgroundColor: actxt
            }}>
            {categories.map((item, index) => {
              return (
                <Text tabLabel={item.name} i={index} key={index} tabItem={{ name: item.name, constr: item.constr }}>
                  {item.name}
                </Text>
              )
            })}
          </ScrollableTabView>
        </View>
        <Suspense fallback={null}>
          <List
            {...this.props}
            pattern={hotel}
            setSelectedCountries={this.setSelectedCountries}
            action={action}
            cuid={cuid}
            puid={puid}
            lim={lim}
            ofs={ofs}
            hclass={hclass}
            history={history}
            slideIndex={slideIndex}
            categories={categories}
            ratingHotelView={ratingHotelView}
            user={user}
            setParams={setParams}
            params={this.getParams()}
            list={list}
            setVisibleImages={this.setVisibleImages}
            visibleImages={visibleImages}
            setVisibleModalSearch={this.setVisibleModalSearch}
            urlRequestPriceId={urlRequestPriceId}
            setUrlRequestPriceId={this.setUrlRequestPriceId}
            listHotels={listHotels}
            selectedCountries={selectedCountries}
            indexTab={indexTab}
            coords={coords}
            openModalGrade={this.openModalGrade}
            utils={this.props.utils}
            RatingsController={this.props.RatingsController}
          />
        </Suspense>
        {this.renderModal()}
        {this.renderModalSearch()}
        {this.renderModalGrade()}
      </>
    )
  }
}

export default ListHotels
