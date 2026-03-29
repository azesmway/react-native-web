import { useEffect, useRef, useState } from 'react'
import { Dimensions, Platform } from 'react-native'
import { connect } from 'react-redux'

import Ratings from './Ratings'

// const NotificationsComponent = props => {
//   const { NotificationsSystem, dismissNotification, bootstrapTheme } = props
//   const dispatch = useDispatch()
//   // @ts-ignore
//   const notifications = useSelector(state => state.notifications)
//
//   return <NotificationsSystem notifications={notifications} dismissNotification={id => dispatch(dismissNotification(id))} theme={bootstrapTheme} />
// }

export default function WebDrawerComponent(props) {
  const [isLoading, setLoading] = useState(true)
  const module = useRef(undefined)

  const loadModules = async () => {
    const [store, { withRouter, theme, t, moment, matchPath }, { mobile }, Alert, { rtkQuery, chatServiceGet, AppData }, { isMobile: isMobileDevice }] = await Promise.all([
      import('app-store-web'),
      import('app-utils-web'),
      import('app-mobile-web'),
      import('@blazejkustra/react-native-alert'),
      import('app-services-web'),
      import('react-device-detect')
    ])

    const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
    const { IS_MOBILE } = GLOBAL_OBJ.onlinetur.constants
    const { width } = Dimensions.get('window')
    const isMobile = isMobileDevice || width < IS_MOBILE

    module.current = {
      store,
      withRouter,
      theme,
      t,
      moment,
      matchPath,
      mobile,
      Alert: Alert.default,
      rtkQuery,
      chatServiceGet,
      AppData,
      isMobile
    }
  }

  useEffect(() => {
    loadModules().then(() => setLoading(false))
  }, [])

  if (isLoading) {
    return null
  }

  const { store, withRouter } = module.current

  const mapStateToProps = state => ({
    currentCategory: store.filterSelector.getSelectCategory(state),
    user: store.userSelector.getUser(state),
    criteriaRating: store.ratingSelector.getCriteria(state),
    countries: store.countriesSelector.getAllCountries(state),
    categories: store.ratingSelector.getCriteria(state),
    changeMyRating: store.ratingSelector.getChangeMyRating(state),
    unauthCount: store.appSelector.getUnauthCount(state)
  })

  const mapDispatchToProps = dispatch => ({
    changeCriteria: data => dispatch(store.ratingAction.changeCriteria(data)),
    setUnauthCount: data => dispatch(store.appAction.setUnauthCount(data)),
    setHeaderParams: data => dispatch(store.headerAction.setHeaderParams(data)),
    setFooterBar: data => dispatch(store.nappAction.setFooterBar(data)),
    setModalLogin: data => dispatch(store.nappAction.setModalLogin(data))
  })

  const RatingsWithProps = withRouter(connect(mapStateToProps, mapDispatchToProps)(Ratings))

  return <RatingsWithProps {...props} utils={module.current} />
}
