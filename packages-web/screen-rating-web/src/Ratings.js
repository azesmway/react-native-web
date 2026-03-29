import { Component, lazy, memo, Suspense } from 'react'
import { Dimensions, ImageBackground, Platform, StyleSheet, View } from 'react-native'

import RatingsController from './controller/RatingsController'
const ListHotels = lazy(() => import('./list'))
const FinalHotels = lazy(() => import('./final'))
const MyHotels = lazy(() => import('./my'))

import bg from '../images/bg.jpg'

const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
const { getCategoiesRatingServer, getAppConfig } = GLOBAL_OBJ.onlinetur.storage

// Extract static styles
const styles = StyleSheet.create({
  backgroundImage: { width: '100%', height: '100%' },
  overlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0.5,
    backgroundColor: '#fff'
  }
})

// Extract route patterns as constants
const ROUTE_PATTERNS = {
  MAIN: ['/r/:r(\\d+)'],
  DETAIL: ['/rt/:rt(\\d+)/c/:c(\\d+)', '/rt/:rt(\\d+)/c/:c(\\d+)/grade'],
  RR: ['/rr/:rr(\\d+)'],
  RN: ['/rn/:rn(\\d+)']
}

const MATCH_OPTIONS = { exact: true, strict: false }

// Memoized background wrapper component
const BackgroundWrapper = memo(({ children }) => (
  <ImageBackground source={bg} resizeMode="cover" style={styles.backgroundImage}>
    <View style={styles.overlay} />
    <Suspense fallback={null}>{children}</Suspense>
  </ImageBackground>
))

class Ratings extends Component {
  constructor(props) {
    super(props)

    this.state = {
      value: 1,
      width: Dimensions.get('window').width,
      height: Dimensions.get('window').height,
      params: {},
      textVisibleDialog: '',
      newValue: null,
      list: false,
      widget: 'widget' in this.props.search
    }

    Object.assign(this, new RatingsController(this, this.props.utils))
  }

  // Extracted method for navigation
  navigateToRating = (newValue, categoryRating) => {
    const routes = ['/rr/', '/r/', '/rn/']
    this.props.history(routes[newValue] + categoryRating)
  }

  updateDimensions = () => {
    this.setState({ width: window.innerWidth, height: window.innerHeight })
  }

  handleChange = (event, newValue, categoryRating) => {
    const { user, history, changeMyRating, setModalLogin } = this.props
    const { Alert, t } = this.props.utils

    if (newValue === 0 && !user.device) {
      event.preventDefault()
      setModalLogin(true)

      return
    }

    if (changeMyRating) {
      Alert.alert(t('common.attention'), t('screens.ratings.components.myhotels.quest'), [
        { text: t('common.cancel'), style: 'destructive' },
        {
          text: t('common.yes'),
          onPress: () => {
            this.setState({ textVisibleDialog: '', changeMyRating: false, value: newValue }, () => this.navigateToRating(newValue, categoryRating))
          }
        }
      ])
      return
    }

    this.setState({ value: newValue }, () => this.navigateToRating(newValue, categoryRating))
  }

  unauthToast = () => {
    const { user, unauthCount, setUnauthCount } = this.props

    if (!user.id_user && unauthCount < 4) {
      toast.show('⚠️ Авторизуйтесь чтобы получить больше возможностей поиска туров и отелей!', {
        type: 'warning',
        placement: 'top',
        animationType: 'zoom-in',
        onPress: id => toast.hide(id)
      })
      setUnauthCount(unauthCount + 1)
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return this.props.unauthCount === nextProps.unauthCount
  }

  componentDidMount = async () => {
    const { user, currentCategory, categories, changeCriteria, pathname, history, setModalLogin } = this.props
    await this.initDataRatings(user, currentCategory.id, changeCriteria, categories, pathname, history, setModalLogin)
    setTimeout(this.unauthToast, 3000)
  }

  componentWillUnmount() {
    const { setFooterBar, setHeaderParams } = this.props
    setHeaderParams({})
    setFooterBar({})
  }

  // Extracted helper method
  parseRouteParams = (matchPath, pathname, categoriesLength) => {
    let match,
      categoryRating = 0,
      ratingHotelView = 0,
      valueHot = this.state.value

    // Try main route
    match = matchPath(pathname, { path: ROUTE_PATTERNS.MAIN, ...MATCH_OPTIONS })
    if (match) {
      categoryRating = Math.min(Math.max(0, Number(match.params.r) - 1), categoriesLength - 1)
      return { categoryRating, ratingHotelView, valueHot, match }
    }

    // Try detail route
    match = matchPath(pathname, { path: ROUTE_PATTERNS.DETAIL, ...MATCH_OPTIONS })
    if (match) {
      categoryRating = Math.min(Math.max(0, Number(match.params.c) - 1), categoriesLength - 1)
      ratingHotelView = match.params.rt
      return { categoryRating, ratingHotelView, valueHot, match }
    }

    // Try RR route
    match = matchPath(pathname, { path: ROUTE_PATTERNS.RR, ...MATCH_OPTIONS })
    if (match) {
      categoryRating = Math.min(Math.max(0, Number(match.params.rr) - 1), categoriesLength - 1)
      valueHot = 0
      return { categoryRating, ratingHotelView, valueHot, match }
    }

    // Try RN route
    match = matchPath(pathname, { path: ROUTE_PATTERNS.RN, ...MATCH_OPTIONS })
    if (match) {
      categoryRating = Math.min(Math.max(0, Number(match.params.rn) - 1), categoriesLength - 1)
      valueHot = 2
      return { categoryRating, ratingHotelView, valueHot, match }
    }

    return { categoryRating, ratingHotelView, valueHot, match }
  }

  render() {
    const { matchPath, t } = this.props.utils
    const { categories, countries, currentCategory, pathname, rating } = this.props
    const { params, list } = this.state

    const categoriesRatings = categories?.length > 0 ? categories : getCategoiesRatingServer()
    const { categoryRating, ratingHotelView } = this.parseRouteParams(matchPath, pathname, categoriesRatings.length)

    // Update params if needed
    if (!params.clearHotelRating) {
      if (params.selectedCountries?.length > 0 && ratingHotelView === 0) {
        const valueCountries = countries.filter(c => c.id_country && params.selectedCountries.includes(c.id_country.toString())).map(c => c.title)
        params.subtitle = valueCountries.length > 0 ? valueCountries.join(',') : t('common.loading')
      } else if (ratingHotelView !== 0) {
        params.clearHotelRating = true
      }
      params.title = currentCategory.name_menu_rating
    }

    const sharedProps = { categoryRating, ratingHotelView, categories: categoriesRatings, RatingsController }

    if (rating === 'all') {
      return (
        <BackgroundWrapper>
          <ListHotels {...sharedProps} list={list} />
        </BackgroundWrapper>
      )
    }

    if (rating === 'final') {
      return (
        <BackgroundWrapper>
          <FinalHotels {...sharedProps} location={this.props.location} />
        </BackgroundWrapper>
      )
    }

    if (rating === 'my') {
      return (
        <BackgroundWrapper>
          <MyHotels {...sharedProps} />
        </BackgroundWrapper>
      )
    }

    return null
  }
}

export default Ratings
