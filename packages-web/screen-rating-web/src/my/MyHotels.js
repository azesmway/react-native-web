import { Component, lazy, Suspense } from 'react'
import { Appearance, Dimensions, ImageBackground, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

import MyHotelsController from '../controller/MyHotelsController'
const Filter = lazy(() => import('../list/filter/Filter'))
const ListMy = lazy(() => import('./ListMy'))

const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
const { width } = Dimensions.get('window')
const { MAIN_COLOR } = GLOBAL_OBJ.onlinetur.constants

const SCALE_IMG = Platform.isPad ? 50 : 70
const SCALE_FONT = Platform.isPad ? 8 : 12
const SCALE_H = Platform.isPad ? 54 : 74

class MyHotels extends Component {
  constructor(props) {
    super(props)

    Object.assign(this, new MyHotelsController(this, this.props.utils))

    this.state = {
      slideIndex: props.selectedRatingCategory ? props.selectedRatingCategory : 0,
      slideId: -1,
      myHotels: [],
      save: false,
      visibleSnackbar: false,
      visibleWinner: [],
      visibleSnackbarWinner: false,

      hotel: '',
      showLoading: false,
      showSearch: false,
      selectedCountries: props && props.filter && props.filter.selectedCountries ? props.filter.selectedCountries : [],
      action: 'get_top_rate',
      cuid: props && props.filter && props.filter.selectedPlaces.length === 0 ? props.filter.selectedCountries : [],
      puid: props && props.filter && props.filter.selectedPlaces,
      lim: 40,
      ofs: 0,
      hclass: props && props.filter && props.filter.indexCategory ? props.filter.indexCategory : 0,
      pattern: props.pattern,
      searchText: '',
      showFilter: false,
      isLoading: true,
      data: []
    }

    this.updateLocalData = myRatingLocal => {
      const { changeMyRatingLocal, myRatingServer } = this.props

      changeMyRatingLocal(myRatingLocal)
      this.setNewData(myRatingServer)
    }

    this.setParams = () => {
      const { t } = this.props.utils
      const { setHeaderParams } = this.props

      let params = {}
      params.title = t('screens.ratings.components.myhotels.title')
      params.subtitle = t('screens.ratings.components.myhotels.subtitle')
      params.screen = 'my-rating'
      params.saveRating = this.saveRating
      params.setWinners = this.setWinners
      params.isNotSave = this.getNotSaveHotels()

      setHeaderParams(params)
    }

    this.setFooter = () => {
      const { setFooterBar, history } = this.props

      setFooterBar({
        type: 'curved',
        screen: 'rating-list',
        position: 'LEFT',
        leftIcon: {
          icon: 'filter-list',
          size: 30,
          onPress: () => {
            history('/rr/1')
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
      const { getObjectAssign } = this.props.utils
      const { history, myRatingLocal, changeMyRatingLocal } = this.props
      const { slideId } = this.state

      const chMyRatingLocal = getObjectAssign([], myRatingLocal)
      const hList = chMyRatingLocal.filter(r => Number(r.id) === Number(slideId))[0]
      hList.list = hList.list.filter(h => Number(h.my_rating) === 0)

      changeMyRatingLocal(chMyRatingLocal)

      history('/rr/' + (index + 1))
    }
  }

  componentDidMount = () => {
    const { navigate } = this.props.router
    this.setParams()
    this.setFooter()
    this.setMyHotels()

    this.unsubscribe = navigate.addListener('blur', () => {
      this.setMyHotels()
    })
  }

  componentWillUnmount() {
    this.unsubscribe()
  }

  renderItem = ({ item, index, changeCat, slideIndex }) => {
    const { criteria } = this.props
    const { myRatingJSON } = this.state

    let viewMyRating
    try {
      viewMyRating = myRatingJSON !== '' ? JSON.parse(myRatingJSON) : []
    } catch (e) {
      viewMyRating = []
    }

    const nullRating = viewMyRating[index] ? viewMyRating[index].list.filter(r => r.my_rating === 0)[0] : null

    if (!criteria[index]) {
      return <></>
    }

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

  renderModal = () => {
    const { Portal, Modal, isMobile } = this.props.utils
    const { countries, changeRatingFilter, filter, setHotels, hotels, myRatingLocal, myRatingServer } = this.props
    const { selectedCountries, isModalBGTransparent, isModalBGBlurred, visibleModal } = this.state

    return (
      <Portal>
        <Modal visible={visibleModal} onDismiss={() => this.setState({ visibleModal: false })} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <View
            style={{
              width: isMobile ? width : width / 2.4,
              borderRadius: 10,
              backgroundColor: '#ffffff',
              alignSelf: 'center',
              height: Dimensions.get('window').height - 200
            }}>
            <Suspense fallback={null}>
              <Filter
                countries={countries}
                changeRatingFilter={changeRatingFilter}
                filter={filter}
                setSelectedCountries={this.setSelectedCountries}
                setFilterURL={this.setFilterURL}
                selectedCountries={selectedCountries}
                closeModalFilter={this.closeModalFilter}
                android={true}
                myHotels={true}
                myHotelsList={hotels}
                setMyHotels={this.setMyHotels}
                setHotels={setHotels}
                myRatingLocal={myRatingLocal}
                myRatingServer={myRatingServer}
                changeMyRatingLocal={this.updateLocalData}
                RatingsController={this.props.RatingsController}
                utils={this.props.utils}
              />
            </Suspense>
          </View>
        </Modal>
      </Portal>
    )
  }

  render() {
    const { Snackbar, t, theme, isMobile, ScrollableTabView, ScrollableTabBar, FAB } = this.props.utils
    const { criteria, history, user, setSelectedRatingCategory, selectedRatingCategory, categories } = this.props
    const { slideIndex, visibleSnackbar, visibleWinner, isLoading, visibleModal, slideId, data } = this.state

    let isDarkMode = Appearance.getColorScheme() === 'dark'
    let bg = isDarkMode ? theme.dark.colors.background : theme.light.colors.background
    let txt = isDarkMode ? theme.dark.colors.text : theme.light.colors.text
    let actxt = isDarkMode ? theme.dark.colors.main : theme.light.colors.main
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
                setSelectedRatingCategory(i)
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
          <ListMy
            hotels={data}
            removeFromMyRating={this.removeFromMyRating}
            removeFromMyCategory={this.removeFromMyCategory}
            changeRatingHotel={this.changeRatingHotel}
            history={history}
            visibleWinner={visibleWinner}
            slideIndex={slideIndex}
            categories={criteria}
            setSlideIndex={this.setSlideIndex}
            renderCarouselItem={this.renderItem}
            user={user}
            isLoading={isLoading}
            slideId={slideId}
            setSelectedRatingCategory={setSelectedRatingCategory}
            selectedRatingCategory={selectedRatingCategory}
            utils={this.props.utils}
            saveRatingCurrent={this.saveRatingCurrent}
          />
        </Suspense>
        {/*<Snackbar visible={visibleSnackbar} onDismiss={this.onDismissSnackBar} style={{ backgroundColor: 'green', opacity: 0.5 }}>*/}
        {/*  <Text style={{ fontWeight: 'bold', color: '#000' }}>{t('screens.ratings.components.myhotels.save')}</Text>*/}
        {/*</Snackbar>*/}
        {/**/}
        {this.renderModal()}
        {!visibleModal && <FAB style={[styles.fab, { bottom: isMobile ? 80 : 40 }]} color={'#fff'} icon="plus" onPress={() => this.setState({ visibleModal: true })} />}
        {/**/}
      </>
    )
  }
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    backgroundColor: MAIN_COLOR,
    margin: 16,
    right: 0,
    borderRadius: 27
  }
})

export default MyHotels
