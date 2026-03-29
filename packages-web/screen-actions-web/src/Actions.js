import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ActivityIndicator, Appearance, Dimensions, FlatList, ImageBackground, Platform, Text, View } from 'react-native'

// import Filter from './Filter'
import bg_ah from '../images/bg_ah.jpg'
import ActionItem from './ActionItem'

const { width, height } = Dimensions.get('window')

// Initial filter state extracted as constant
const INITIAL_FILTER = {
  selectedCountries: [],
  valueCountries: '',
  selectedPlaces: [],
  valuePlaces: '',
  selectedHClass: [],
  valueHClass: '',
  dateFrom: '',
  dateTo: '',
  pattern: '',
  sort: '',
  sortList: []
}

const Actions = props => {
  let { history, currentCategory, user, filterApp, pathname, countries, utils, router, setHeaderParams } = props
  const { theme, chatServiceGet, t, Portal, Modal, isMobile } = utils

  const [actions, setActions] = useState(null)
  const [showSearch, setShowSearch] = useState(false)
  const [currentFilter, setCurrentFilter] = useState(INITIAL_FILTER)
  const [isLoading, setLoading] = useState(false)
  const [visibleModal, setVisibleModal] = useState(false)

  // Use ref to prevent race conditions
  const isLoadingRef = useRef(false)

  // Memoize token and android_id_install
  const token = useMemo(() => user?.device?.token || '', [user?.device?.token])
  const android_id_install = useMemo(() => user?.android_id_install || '', [user?.android_id_install])

  // Memoize currentCategory.id to prevent unnecessary re-renders
  const categoryId = useMemo(() => currentCategory?.id, [currentCategory?.id])

  // Memoize theme values
  const { bg, txt } = useMemo(() => {
    const isDarkMode = Appearance.getColorScheme() === 'dark'
    return {
      bg: isDarkMode ? theme.dark.colors.background : theme.light.colors.background,
      txt: isDarkMode ? theme.dark.colors.text : theme.light.colors.text
    }
  }, [theme])

  const getSort = useCallback(async () => {
    const sorts = await chatServiceGet.getSortActions(token, android_id_install, categoryId)

    if (sorts?.code === 0 && sorts.data?.length > 0) {
      setCurrentFilter(prev => ({
        ...INITIAL_FILTER,
        sort: sorts.data[0].sort,
        sortList: sorts.data
      }))
    }
  }, [token, android_id_install, categoryId, chatServiceGet])

  const getActions = useCallback(
    async filter => {
      if (isLoadingRef.current) return

      isLoadingRef.current = true
      setLoading(true)

      try {
        const id = pathname.includes('/ah/') ? pathname.replace('/ah/', '') : ''

        // Build query string more efficiently - filter out empty values
        const params = {
          sort: filter.sort,
          cuid: filter.selectedCountries.join(','),
          puid: filter.selectedPlaces.join(','),
          hclass: filter.selectedHClass.join(','),
          date_from: filter.dateFrom,
          date_to: filter.dateTo,
          pattern: filter.pattern
        }

        const queryParams = new URLSearchParams(params)
        const actionsList = await chatServiceGet.getListActions(token, android_id_install, categoryId, 20, 0, '&' + queryParams.toString())

        if (actionsList?.code === 0) {
          setActions(actionsList.data)

          // if (id) {
          //   router.navigate({
          //     pathname: '/ah/',
          //     params: {
          //       hotel: {},
          //       user,
          //       currentCategory,
          //       isFinishAll: null,
          //       filterApp,
          //       history,
          //       huid: id
          //     }
          //   })
          // }
        }
      } finally {
        isLoadingRef.current = false
        setLoading(false)
      }
    },
    [pathname, token, android_id_install, categoryId, chatServiceGet, router, user, currentCategory, filterApp, history]
  )

  const onSearch = useCallback(showSearchNew => {
    if (showSearchNew === false) {
      setCurrentFilter(prev => ({
        ...INITIAL_FILTER,
        sort: prev.sort,
        sortList: prev.sortList
      }))
    }
    setShowSearch(prev => !prev)
  }, [])

  const onSubmitEditing = useCallback(text => {
    setCurrentFilter(prev => ({
      ...INITIAL_FILTER,
      pattern: text,
      sort: prev.sort,
      sortList: prev.sortList
    }))
  }, [])

  const openModalFilter = useCallback(() => setVisibleModal(true), [])
  const closeModalFilter = useCallback(() => setVisibleModal(false), [])

  // Calculate badge value - simplified
  const badgeCount = useMemo(() => {
    return (
      (currentFilter.selectedCountries.length > 0 ? 1 : 0) +
      (currentFilter.selectedPlaces.length > 0 ? 1 : 0) +
      (currentFilter.selectedHClass.length > 0 ? 1 : 0) +
      (currentFilter.dateFrom ? 1 : 0) +
      (currentFilter.dateTo ? 1 : 0)
    )
  }, [currentFilter.selectedCountries.length, currentFilter.selectedPlaces.length, currentFilter.selectedHClass.length, currentFilter.dateFrom, currentFilter.dateTo])

  // Memoize header params object to prevent unnecessary updates
  const headerParams = useMemo(
    () => ({
      title: currentCategory?.name_menu_action,
      screen: 'actions_hotels',
      openSearch: showSearch,
      showSearchField: onSearch,
      openModalFilter,
      onSubmitEditing,
      onOpenSearch: onSearch,
      badge: badgeCount
    }),
    [currentCategory?.name_menu_action, showSearch, onSearch, openModalFilter, onSubmitEditing, badgeCount]
  )

  useEffect(() => {
    setHeaderParams(headerParams)
  }, [headerParams, setHeaderParams])

  const emptyActions = useMemo(
    () => (
      <View style={{ flex: 1, alignItems: 'center' }}>
        <Text style={{ paddingTop: 40, fontSize: 20, fontWeight: 'bold', color: txt }}>{t('common.empty')}</Text>
      </View>
    ),
    [txt, t]
  )

  const keyExtractor = useCallback((item, index) => item?.id?.toString() || index.toString(), [])

  const renderItem = useCallback(({ item, index }) => <ActionItem {...props} item={item} index={index} router={props.expoRouter} />, [props])

  const renderModal = useMemo(
    () => (
      <Portal>
        <Modal visible={visibleModal} onDismiss={closeModalFilter} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <View
            style={{
              width: isMobile ? width : width / 2,
              borderRadius: 10,
              backgroundColor: bg,
              alignSelf: 'center',
              height: Dimensions.get('window').height,
              marginTop: 140
            }}>
            {/*<Filter countries={countries} setCurrentFilter={setCurrentFilter} currentFilter={currentFilter} android={Platform.OS === 'android'} closeModalFilter={closeModalFilter} />*/}
          </View>
        </Modal>
      </Portal>
    ),
    [visibleModal, closeModalFilter, isMobile, bg]
  )

  useEffect(() => {
    getSort()
  }, [])

  useEffect(() => {
    setActions(null)
    getActions(currentFilter).then()
  }, [currentFilter])

  return (
    <ImageBackground source={bg_ah} resizeMode={'cover'} style={{ width: '100%', height: '100%' }}>
      <View style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0.5, backgroundColor: '#fff' }} />
      {actions ? (
        <FlatList
          style={{ flex: 1 }}
          contentContainerStyle={{
            alignItems: 'center'
          }}
          data={actions}
          ListEmptyComponent={emptyActions}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          ListFooterComponent={<View style={{ height: 50 }} />}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={10}
        />
      ) : (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text>{t('common.loading')}</Text>
          <ActivityIndicator />
        </View>
      )}
      {renderModal}
    </ImageBackground>
  )
}

export default Actions
