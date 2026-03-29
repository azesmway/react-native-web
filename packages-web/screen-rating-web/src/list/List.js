// import { Loading } from 'app-common'
// import { AlertDialog } from 'app-containers'
import compact from 'lodash/compact'
import React, { createRef, lazy, PureComponent, Suspense } from 'react'
import { ActivityIndicator, Appearance, Dimensions, FlatList, Platform, Text, TouchableOpacity, View } from 'react-native'

const Item = lazy(() => import('../item/Item'))

const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
const { getAppConfig, getAppConstants } = GLOBAL_OBJ.onlinetur.storage
const { MAIN_COLOR } = GLOBAL_OBJ.onlinetur.constants

const { width, height } = Dimensions.get('window')

class List extends PureComponent {
  constructor(props) {
    super(props)

    const { RatingsController } = props

    Object.assign(this, new RatingsController(this, this.props.utils))
    this.listRef = createRef()

    this.state = {
      hotelList: [],
      isLoading: true,
      offset: this.props.ofs,
      isLoadingEarlier: false,
      openAlert: false,
      titleAlert: '',
      bodyAlert: '',
      shareMessage: null,
      isShareMessage: false,
      initialScrollIndex: 0,
      titleHotel: '',
      pricesList: [],
      loadingPrice: ' Запрос цен...'
    }

    this.setVisibleModalSearchWithHotelist = (visible, countryId, hotelId, placeId, hclass, index) => {
      const { setVisibleModalSearch } = this.props
      const { hotelList } = this.state
      const listHotels = []

      if (index < 3) {
        for (let i = 0; i < hotelList.length; i++) {
          if (i < 10 && Number(hotelList[i].cuid) === Number(countryId)) {
            listHotels.push(hotelList[i])
          }
        }
      } else if (index > 10) {
        for (let i = 10; i > 0; i--) {
          if (Number(hotelList[i].cuid) === Number(countryId)) {
            listHotels.push(hotelList[i])
          }
        }

        for (let i = 10; i < hotelList.length; i++) {
          if (i < 20 && Number(hotelList[i].cuid) === Number(countryId)) {
            listHotels.push(hotelList[i])
          }
        }
      }

      setVisibleModalSearch(visible, countryId, hotelId, placeId, hclass, listHotels)
    }

    this.renderItem = ({ item, index }) => {
      const { hotels, setHotels, history, countries, user, currentCategory, list, indexTab, openModalGrade, setModalLogin } = this.props
      let country = countries.filter(function (c) {
        return Number(c.id_country) === Number(item.cuid)
      })

      return (
        <Suspense>
          <Item
            item={item}
            setHotels={setHotels}
            hotels={hotels}
            history={history}
            index={index}
            country={country}
            ratingHotelView={this.props.ratingHotelView}
            shareRating={this.shareRating}
            user={user}
            currentCategory={currentCategory}
            list={list}
            setVisibleModalSearch={this.setVisibleModalSearchWithHotelist}
            indexTab={indexTab}
            openModalGrade={openModalGrade}
            utils={this.props.utils}
            setModalLogin={setModalLogin}
          />
        </Suspense>
      )
    }

    this.setHotelsList = hotelList => {
      let newHotels = Object.assign([], hotelList)
      this.setState({ hotelList: newHotels })
    }

    this.shareRating = idHotel => {
      const { t } = this.props.utils
      const { slideIndex, user, ratingHotelView } = this.props
      let shareOptions = {}
      const rt = ratingHotelView !== 0 ? ratingHotelView : Number(idHotel)

      shareOptions = {
        title: t('common.application') + ' ' + getAppConfig().displayName,
        message: t('common.application') + ' ' + getAppConfig().displayName,
        url: getAppConfig().homepage + '/rt/' + rt + '/c/' + (Number(slideIndex) + 1) + '?c=' + (user && user.referral && user.referral.code ? user.referral.code : '')
      }

      this.setState({
        openAlert: true,
        titleAlert: shareOptions.title,
        bodyAlert: shareOptions.message,
        shareMessage: shareOptions,
        isShareMessage: true,
        appShare: true
      })
    }

    this.handleCloseAlert = () => {
      this.setState({
        openAlert: false,
        titleAlert: '',
        bodyAlert: '',
        shareMessage: null,
        isShareMessage: false,
        appShare: false
      })
    }

    this.getNewPrice = (pricesList, end = false) => {
      const { listHotels, setSaveRatingCache, slideIndex, selectedCountries } = this.props
      const { hotelList, offset } = this.state

      if (pricesList && !pricesList.error && pricesList.length > 0) {
        for (let i = 0; i < pricesList.length; i++) {
          const hotel = hotelList.filter(h => Number(h.huid) === Number(pricesList[i].hotel_id))[0]

          if (hotel) {
            hotel.price_RUB = pricesList[i].price_RUB
            hotel.cur = pricesList[i].currency
            hotel.grp_link = pricesList[i].grp_link
            hotel.nights = pricesList[i].nights
          }
        }

        const hs = Object.assign([], hotelList)
        this.setState({ hotelList: hs }, () => {
          if (end) {
            for (let i = 0; i < listHotels.length; i++) {
              const hotel = hotelList.filter(h => Number(h.huid) === Number(listHotels[i].huid))[0]

              if (hotel && !hotel.price_RUB) {
                hotel.price_RUB = -1
                hotel.grp_link = ''
              }
            }

            const hs2 = Object.assign([], this.state.hotelList)
            this.setState({ hotelList: hs2 })
            setSaveRatingCache({
              [slideIndex]: {
                time: new Date().getTime(),
                listHotels: hs2,
                offset: offset,
                selectedCountries: selectedCountries
              }
            })
          }
        })
      }
    }

    this.requestPriceHotels = async urlRequestPriceId => {
      const { chatServiceGet } = this.props.utils
      const { setUrlRequestPriceId, selectSearch, setSaveRatingCache, slideIndex, selectedCountries, user } = this.props
      const { hotelList, offset, pricesList } = this.state
      const prices = await chatServiceGet.getPriceHotelsRatingId(urlRequestPriceId)
      const path = getAppConstants().url_beta

      // eslint-disable-next-line consistent-this
      const cmd = this

      if (prices && prices.searchid) {
        let url = `${path}/results_online.php?searchid=${prices.searchid}&jsonp=1`

        if (user && user.device && user.device.token) {
          url += '&apid=' + user.id_user + (user.is_sotr === 1 ? '&agn=2' : '')
        }

        const timer = ms => new Promise(res => setTimeout(res, ms))

        let count = 0
        for (let i = 0; i < prices.delays.length; i++) {
          cmd.setState({ loadingPrice: ' Шаг ' + (i + 1) + ' из ' + prices.delays.length + ', загружено цен: ' + (count && String(count) !== '' ? count : '0') })
          await timer(prices.delays[i] * 1000)
          const pricesNewList = await chatServiceGet.getPriceHotelsRatingList(url)
          const stop = i + 1 === prices.delays.length
          count = pricesNewList.length
          this.getNewPrice(pricesNewList, stop)

          if (stop) {
            setUrlRequestPriceId('')
          }
        }
      } else {
        if (prices && prices.code === 0) {
          let hs
          if (prices.data && prices.data.length > 1 && prices.data[1] && urlRequestPriceId.indexOf('get_list_promo.php') === -1) {
            const hotel = hotelList.filter(h => Number(h.huid) === Number(prices.data[1].id_otel) - 100000)[0]

            if (hotel) {
              hotel.price_RUB_Hotel = prices.data[1].price_full
              hotel.cur = prices.data[1].currency
              hotel.action_link = '/ah/' + (Number(prices.data[1].id_otel) - 100000)
            }

            hs = Object.assign([], hotelList)
            this.setState({ hotelList: hs })
          } else if (prices.data && prices.data.length > 0 && urlRequestPriceId.indexOf('get_list_promo.php') > -1) {
            for (let i = 0; i < prices.data.length; i++) {
              const hotel = hotelList.filter(h => Number(h.huid) === Number(prices.data[i].id_otel - 100000))[0]

              if (hotel) {
                hotel.price_RUB_Hotel = prices.data[i].price_min
                hotel.cur = prices.data[i].currency ? prices.data[i].currency : '$'
                hotel.action_link = '/ah/' + Number(prices.data[i].id_otel)
              }
            }

            hs = Object.assign([], hotelList)
            this.setState({ hotelList: hs })
          } else {
            const hotel = hotelList.filter(h => Number(h.huid) === Number(selectSearch.hotel))[0]

            if (hotel) {
              hotel.price_RUB_Hotel = -1
              hotel.action_link = '/ah'
            }

            hs = Object.assign([], hotelList)
            this.setState({ hotelList: hs })
          }

          setSaveRatingCache({
            [slideIndex]: {
              time: new Date().getTime(),
              listHotels: hs,
              offset: offset,
              selectedCountries: selectedCountries
            }
          })

          setUrlRequestPriceId('')
        } else {
          setUrlRequestPriceId('')
        }
      }
    }

    this.setParamsInit = () => {
      const { params, ratingHotelView, slideIndex, setHeaderParams, setFooterBar } = this.props
      const { hotelList, titleHotel } = this.state

      if (ratingHotelView !== 0) {
        let id = -1
        const a = compact(ratingHotelView.split('_').join(',').split(','))
        if (ratingHotelView && (ratingHotelView.indexOf('_') > -1 || ratingHotelView.indexOf(',') > -1)) {
          id = a[0]
        } else {
          id = ratingHotelView
        }

        if (id !== -1) {
          const m = hotelList.map(i => i.name)

          params.title = ratingHotelView.indexOf('_') > -1 ? 'Рейтинг группы' : 'Рейтинг'
          params.subtitle = m.join(', ')
          params.clearHotelRating = true
          params.slideIndex = slideIndex

          if (a.length === 1) {
            params.subtitle = titleHotel
          }
        }
      }

      setHeaderParams(params)
    }

    this.setFooter = () => {
      const { setFooterBar, history, user, setModalLogin } = this.props

      setFooterBar({
        type: 'curved',
        screen: 'rating-list',
        position: 'CENTER', // {navName === 'all' ? 'CENTER' : navName === 'my' ? 'LEFT' : 'RIGHT'}
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
          icon: 'star',
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

    this.renderConstr = index => {
      const { theme, isMobile } = this.props.utils
      const { categories, user } = this.props

      let isDarkMode = Appearance.getColorScheme() === 'dark'
      let bg = isDarkMode ? theme.dark.colors.background : theme.light.colors.background
      let txt = isDarkMode ? theme.dark.colors.text : theme.light.colors.text
      let actxt = isDarkMode ? theme.dark.colors.main : theme.light.colors.main
      let intxt = isDarkMode ? theme.dark.colors.textInactive : theme.light.colors.textInactive

      if (Number(categories[index].constr) === 1) {
        return (
          <View style={{ width: '100%', alignItems: 'center', marginTop: 100 }}>
            <Text style={{ color: 'red', fontSize: 18, fontWeight: 'bold' }}>{'НОМИНАЦИЯ ЕЩЕ ФОРМИРУЕТСЯ'}</Text>
            <Text style={{ color: 'red' }}>{'Отправляйте свои сравнительные оценки!'}</Text>
          </View>
        )
      } else if (Number(categories[index].constr) === -1) {
        return (
          <View style={{ flex: 1, width: isMobile ? width : width / 2, alignSelf: 'center', backgroundColor: 'rgba(255,255,255,0.5)' }}>
            <View style={{ width: '100%', alignItems: 'center', bottom: 80, position: 'absolute' }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '96%' }}>
                <Text style={{ fontSize: 14, fontWeight: 'bold', textAlign: 'left', color: txt }}>{'Заполните в разделе\n"Мои номинации"'}</Text>
                <Text style={{ fontSize: 14, fontWeight: 'bold', textAlign: 'right', color: txt }}>{'Просмотр в разделе\n"Мой рейтинг"'}</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '96%' }}>
                <TouchableOpacity
                  style={{ alignItems: 'center' }}
                  onPress={() => {
                    if (user && user.device && user.device.token) {
                      // setNavName('my')
                    } else {
                      // router.replace('/auth')
                    }
                  }}>
                  {/*<MaterialIcons name={'filter-list'} size={40} color={constApp.MAIN_COLOR} />*/}
                  <Text style={{ color: MAIN_COLOR }}>{'МОИ НОМИНАЦИИ'}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ alignItems: 'center' }}
                  onPress={() => {
                    if (user && user.device && user.device.token) {
                      // setNavName('final')
                    } else {
                      // router.push('/auth')
                    }
                  }}>
                  {/*<MaterialIcons name={'thumb-up-off-alt'} size={40} color={constApp.MAIN_COLOR} />*/}
                  <Text style={{ color: MAIN_COLOR }}>{'МОЙ РЕЙТИНГ'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )
      } else {
        return <></>
      }
    }
  }

  componentDidMount = async () => {
    this.setFooter()
    await this.initListHotels()
    this.setParamsInit()
  }

  componentDidUpdate = async (prevProps, prevState, snapshot) => {
    const { cuid, puid, hclass, pattern, hotels, time, slideIndex, ratingHotelView, urlRequestPriceId, coords, selectedCountries } = this.props
    const arrayHotels = ratingHotelView !== 0 ? compact(ratingHotelView.split('_').join(',').split(',')) : []
    const oneHotel = ratingHotelView !== 0 ? arrayHotels.length === 1 : null
    if (prevProps.urlRequestPriceId !== urlRequestPriceId && urlRequestPriceId !== '') {
      await this.requestPriceHotels(urlRequestPriceId)

      return
    }

    if (prevProps.pattern !== pattern) {
      await this.searchListHotels()
      this.setParamsInit()

      return
    }

    if (prevProps.coords !== coords) {
      await this.initListHotels(false, true)
      this.setParamsInit()

      return
    }

    if (prevProps.cuid !== cuid || prevProps.puid !== puid || prevProps.hclass !== hclass || prevProps.coords !== coords) {
      await this.initListHotels()
      this.setParamsInit()

      return
    }

    if (prevProps.slideIndex !== slideIndex) {
      await this.initListHotels(true)
      this.setParamsInit()

      return
    }

    if (prevState.hotelList.length !== this.state.hotelList.length) {
      if (oneHotel && this.state.titleHotel === '' && (this.state.initialScrollIndex === 0 || this.state.initialScrollIndex === 100)) {
        const { Alert } = this.props.utils

        Alert.alert('Внимание!', (this.state.titleHotel ? this.state.titleHotel : 'Указанный отель') + ' пока отсутствует в данной номинации!')
      }

      this.setParamsInit()

      return
    }

    if (prevProps.selectedCountries.length !== selectedCountries.length) {
      this.setParamsInit()
    }
  }

  render() {
    const { isMobile, FAB, Icon } = this.props.utils
    const { slideIndex, setVisibleImages, visibleImages, urlRequestPriceId, categories, params } = this.props
    const { hotelList, isLoading, isLoadingEarlier, openAlert, initialScrollIndex, loadingPrice } = this.state

    if (isLoading) {
      return (
        <View
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1
          }}>
          <ActivityIndicator size={'large'} color={MAIN_COLOR} />
          <Text>{'Загрузка...'}</Text>
        </View>
      )
    }

    return (
      <>
        {urlRequestPriceId !== '' ? (
          <View style={{ alignItems: 'center' }}>
            <View style={{ flexDirection: 'row' }}>
              <ActivityIndicator />
              <Text style={{ fontSize: 16, color: 'blue' }}>{loadingPrice ? loadingPrice : ''}</Text>
            </View>
          </View>
        ) : null}
        {Number(categories[slideIndex].constr) === 1 ? (
          <View style={{ width: '100%', alignItems: 'center' }}>
            <Text style={{ color: 'red', fontSize: 18, fontWeight: 'bold' }}>{'НОМИНАЦИЯ ЕЩЕ ФОРМИРУЕТСЯ'}</Text>
            <Text style={{ color: 'red' }}>{'Отправляйте свои сравнительные оценки!'}</Text>
          </View>
        ) : (
          <></>
        )}
        {categories && categories[slideIndex] && categories[slideIndex].constr && Number(categories[slideIndex].constr) !== 0 ? (
          this.renderConstr(slideIndex)
        ) : (
          <FlatList
            ref={ref => (this.listRef = ref)}
            style={{
              marginTop: 5,
              flex: 1
            }}
            data={hotelList}
            renderItem={item => this.renderItem(item)}
            keyExtractor={(item, index) => index.toString()}
            extraData={this.state}
            onEndReached={this.onEndReachedWeb}
            onEndReachedThreshold={0.2}
            maintainVisibleContentPosition={{
              minIndexForVisible: initialScrollIndex
            }}
            onScrollToIndexFailed={error => {
              this.listRef.scrollToOffset({ offset: error.averageItemLength * error.index, animated: false })
              setTimeout(() => {
                if (hotelList.length !== 0 && this.listRef !== null) {
                  this.listRef.scrollToIndex({ index: error.index, animated: false })
                }
              }, 100)
            }}
            onScroll={e => {
              if (e.nativeEvent.contentOffset.y === 0) {
                this.setState({ initialScrollIndex: 0 })
                setVisibleImages(true)
              } else if (e.nativeEvent.contentOffset.y < 20) {
                setVisibleImages(true)
              } else {
                this.setState({ initialScrollIndex: 100 })
                setVisibleImages(false)
              }
            }}
            ListEmptyComponent={
              <View
                style={{
                  width: isMobile ? width : width / 2,
                  height: height - 180,
                  alignSelf: 'center',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                <View style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0.5, backgroundColor: '#fff', top: 0 }} />
                <Text style={{ fontWeight: 'bold', fontSize: 18, color: '#676767' }}>{'Данных в рейтинге не найдено!'}</Text>
              </View>
            }
            ListFooterComponent={
              <View
                style={{
                  backgroundColor: '#fff',
                  height: height / 4,
                  alignSelf: 'center'
                }}
              />
            }
          />
        )}
        {isLoadingEarlier && <ActivityIndicator size={'large'} style={{ alignSelf: 'center', position: 'absolute', left: 0, right: 0, bottom: 160 }} />}
        {initialScrollIndex !== 0 ? (
          <View style={{ position: 'absolute', bottom: isMobile ? 100 : 20, right: 20 }}>
            <FAB
              onClick={() => {
                if (this.listRef) {
                  this.listRef.scrollToIndex({ index: 0, animated: false })
                }
              }}>
              <Icon name={'add'} />
            </FAB>
          </View>
        ) : null}
      </>
    )
  }
}

export default List
