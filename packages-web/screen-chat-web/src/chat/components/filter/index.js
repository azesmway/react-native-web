import { useEffect, useRef, useState } from 'react'
import { connect } from 'react-redux'

import FilterDialog from './FilterDialog'

const createMapStateToProps = store => state => ({
  categories: store.catSelector.getCategories(state),
  filter: store.filterSelector.getFilter(state),
  user: store.userSelector.getUser(state),
  currentCategory: store.filterSelector.getSelectCategory(state),
  hobby: store.chatSelector.getHobby(state),
  hotels: store.chatSelector.getHotels(state)
})

const createMapDispatchToProps = store => dispatch => ({
  setFilter: data => dispatch(store.filterAction.setFilter(data)),
  setHotels: data => dispatch(store.chatAction.setHotels(data))
})

const loadModules = async () => {
  const [store, { withRouter, theme, t }, { default: Alert }, { AppData }, { ActionFilter }, { Header, Icon, ListItem, SearchBar, Tab, TabView }, { default: Geolocation }] = await Promise.all([
    import('app-store-web'),
    import('app-utils-web'),
    import('@blazejkustra/react-native-alert'),
    import('app-services-web'),
    import('app-controller-web'),
    import('react-native-elements'),
    import('@react-native-community/geolocation')
  ])

  return { store, withRouter, theme, t, Alert, AppData, ActionFilter, Header, Icon, ListItem, SearchBar, Tab, TabView, Geolocation }
}

export default function FilterDialogComponent(props) {
  const [isLoading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const modulesRef = useRef(null)
  const FilterDialogWithPropsRef = useRef(null)

  useEffect(() => {
    loadModules()
      .then(modules => {
        modulesRef.current = modules

        const { store, withRouter } = modules
        FilterDialogWithPropsRef.current = withRouter(connect(createMapStateToProps(store), createMapDispatchToProps(store))(FilterDialog))

        setLoading(false)
      })
      .catch(setError)
  }, [])

  if (error) {
    console.error('FilterDialogComponent: failed to load modules', error)
    return null
  }

  if (isLoading) return null

  const FilterDialogWithProps = FilterDialogWithPropsRef.current

  return <FilterDialogWithProps {...props} utils={modulesRef.current} />
}
