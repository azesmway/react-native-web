import uniqBy from 'lodash/uniqBy'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ActivityIndicator, Appearance, FlatList, Platform, Text, TouchableOpacity, View } from 'react-native'

const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
const { MAIN_COLOR } = GLOBAL_OBJ.onlinetur.constants

const LIST_HEIGHT = 580
const FOOTER = <View style={{ height: 50 }} />
const FOOTER_TALL = <View style={{ height: 150 }} />
const PAGE_SIZE = 300

// --- Хуки ---

function useTheme(theme) {
  const isDarkMode = Appearance.getColorScheme() === 'dark'
  const colors = isDarkMode ? theme.dark.colors : theme.light.colors
  return { isDarkMode, bg: colors.background, txt: colors.text }
}

function useEscapeKey(onCancel) {
  useEffect(() => {
    if (Platform.OS !== 'web') return
    const handler = e => {
      if (e.keyCode === 27) onCancel()
    }
    document.addEventListener('keydown', handler, false)
    return () => document.removeEventListener('keydown', handler, false)
  }, [onCancel])
}

// --- Вспомогательные функции ---

const filterVisibleHobby = (hobby, filter) => {
  const noneSelected = filter.selectedHotel.toString() === '-1' && filter.selectedPlace.toString() === '-1'
  return noneSelected ? hobby.filter(h => h.tip_price !== 1) : hobby
}

const formatDistance = (dist, t) => (dist > 999 ? (dist / 1000).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + t('containers.filterdialog.km') : dist + t('containers.filterdialog.m'))

// --- Атомарные компоненты ---

function LoadingView({ bg, label }) {
  return (
    <View style={{ flex: 1, backgroundColor: bg, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator />
      {label && <Text>{label}</Text>}
    </View>
  )
}

function CountryItem({ item, ActionFilter, ListItem, callComponent, onCancel, bg, txt }) {
  return (
    <ListItem
      bottomDivider
      onPress={() => {
        ActionFilter.onChangeCountry(callComponent, item)
        onCancel()
      }}
      containerStyle={{ padding: 5, margin: 0, backgroundColor: bg }}>
      <ListItem.Content>
        <ListItem.Title style={{ color: txt, fontSize: 14, fontWeight: '500' }}>{item.title}</ListItem.Title>
      </ListItem.Content>
    </ListItem>
  )
}

function HotelItem({ item, ActionFilter, ListItem, callComponent, onCancel, places, bg, txt, isDarkMode, t }) {
  const place = places.find(p => Number(p.uid) === Number(item.puid))
  const subtitleColor = isDarkMode ? txt : '#757575'

  return (
    <ListItem
      bottomDivider
      onPress={() => {
        ActionFilter.onChangeHotel(callComponent, item)
        onCancel()
      }}
      containerStyle={{ paddingLeft: 10, paddingVertical: 5, margin: 0, backgroundColor: bg }}>
      <ListItem.Content>
        <ListItem.Title style={{ color: txt, fontSize: 14, fontWeight: '500' }}>{item.name}</ListItem.Title>
        {(item.dist || place) && <ListItem.Subtitle style={{ color: subtitleColor, fontSize: 10 }}>{item.dist ? formatDistance(item.dist, t) : place?.name}</ListItem.Subtitle>}
      </ListItem.Content>
    </ListItem>
  )
}

function PlaceItem({ item, ActionFilter, ListItem, callComponent, onCancel, bg, txt }) {
  return (
    <ListItem
      bottomDivider
      onPress={() => {
        ActionFilter.onChangePlace(callComponent, item)
        onCancel()
      }}
      containerStyle={{ padding: 10, margin: 0, backgroundColor: bg }}>
      <ListItem.Content>
        <ListItem.Title style={{ color: txt, fontSize: 14, fontWeight: '500' }}>{item.name.toUpperCase()}</ListItem.Title>
      </ListItem.Content>
    </ListItem>
  )
}

function HobbyItem({ item, ActionFilter, ListItem, Icon, callComponent, onCancel, bg, txt }) {
  return (
    <ListItem
      bottomDivider
      onPress={() => {
        ActionFilter.onChangeHobby(callComponent, item)
        onCancel()
      }}
      containerStyle={{ padding: 10, margin: 0, backgroundColor: bg }}>
      {item.id < 0 && <Icon name="privacy-tip" color="blue" />}
      <ListItem.Content>
        <ListItem.Title style={{ color: txt, fontSize: 14, fontWeight: '500' }}>{item.title}</ListItem.Title>
        {item.msg && <ListItem.Subtitle style={{ fontSize: 10, color: 'gray' }}>{item.msg}</ListItem.Subtitle>}
      </ListItem.Content>
    </ListItem>
  )
}

// --- Основной компонент ---

function FilterDialog({
  utils,
  callComponent,
  onCancel,
  android,
  filterCountry,
  viewType,
  geoFilter,
  location,
  // Redux props
  filter,
  user,
  currentCategory,
  hobby: hobbyProp = [],
  hotels: hotelsProp = [],
  places: placesProp = [],
  countries = [],
  chatAgent
}) {
  const { ActionFilter, AppData, Geolocation, theme, Header, Tab, SearchBar, ListItem, Icon, Alert, t } = utils

  const { isDarkMode, bg, txt } = useTheme(theme)
  useEscapeKey(onCancel)

  const [searchHotel, setSearchHotel] = useState('')
  const [hotels, setHotels] = useState([])
  const [places, setPlaces] = useState([])
  const [country, setCountry] = useState([])
  const [hobby, setHobby] = useState([])
  const [isLoadingHotels, setLoadingHotels] = useState(true)
  const [pageTab, setPageTab] = useState(0)
  const [geoData, setGeoData] = useState(false)

  const page = useRef(0)

  // --- Инициализация ---

  const visibleHobby = useMemo(() => filterVisibleHobby(hobbyProp, filter), [hobbyProp, filter])

  const notNullCountries = useMemo(() => (chatAgent ? countries : countries.filter(c => c.col_new_all > 0)), [countries, chatAgent])

  const initFilter = useCallback(
    async (geo = '', loc = null) => {
      let h = []

      if (!geo && (!hotelsProp || hotelsProp.length === 0)) {
        h = await AppData.setAppHotelsWithPage(countries, user.android_id_install, filter.selectedCountry, page.current, PAGE_SIZE, currentCategory.id)
      }

      setHotels(h.length > 0 ? h : hotelsProp)
      setPlaces(placesProp)
      setCountry(notNullCountries)
      setHobby(visibleHobby)
      setLoadingHotels(false)

      // Два сценария геолокации: без location и с location
      if (geo && !loc && hotelsProp.length === 0) {
        Geolocation.getCurrentPosition(info => {
          ActionFilter.changeLocation({ setHotels, setLoadingHotels }, info.coords)
        })
      } else if (geo && loc && hotelsProp.length === 0) {
        ActionFilter.changeLocation({ setHotels, setLoadingHotels }, loc)
      }
    },
    [AppData, Geolocation, ActionFilter, countries, user, filter, hotelsProp, placesProp, currentCategory, notNullCountries, visibleHobby]
  )

  useEffect(() => {
    // Начальный таб и флаг геоданных
    const isGeo = geoFilter === 'geo'
    if (viewType === 'hotel') {
      setPageTab(0)
      setGeoData(isGeo)
      if (isGeo) setLoadingHotels(true)
    } else if (viewType === 'theme') {
      setPageTab(2)
      setGeoData(isGeo)
      if (isGeo) setLoadingHotels(true)
    }

    initFilter(geoFilter, location)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // --- Поиск ---

  const handleSubmitSearch = useCallback(async () => {
    setHotels([])
    setLoadingHotels(true)

    const result = await AppData.setAppHotelsSearch(countries, user.android_id_install, filter.selectedCountry, 0, 100, searchHotel)

    if (result.length > 0) {
      setHotels(uniqBy(result, 'id'))
      setLoadingHotels(false)
    } else {
      setLoadingHotels(false)
      Alert.alert(t('common.attention'), t('containers.filterdialog.filternull'))
    }
  }, [AppData, countries, user, filter, searchHotel, Alert, t])

  const handleClearSearch = useCallback(() => {
    setHotels(hotelsProp)
    setLoadingHotels(false)
  }, [hotelsProp])

  // --- Пагинация ---

  const onEndReached = useCallback(async () => {
    if (geoData || searchHotel) return
    page.current += 1
    const h = await AppData.setAppHotelsWithPage(countries, user.android_id_install, filter.selectedCountry, page.current, PAGE_SIZE, currentCategory.id)
    setHotels(prev => prev.concat(h))
  }, [geoData, searchHotel, AppData, countries, user, filter, currentCategory])

  // --- Геолокация ---

  const toggleGeo = useCallback(() => {
    setLoadingHotels(true)
    setHotels([])

    if (!geoData) {
      setGeoData(true)
      Geolocation.getCurrentPosition(info => {
        ActionFilter.changeLocation({ setHotels, setLoadingHotels }, info.coords)
      })
    } else {
      setGeoData(false)
      initFilter()
    }
  }, [geoData, Geolocation, ActionFilter, initFilter])

  // --- keyExtractors ---

  const keyExtractorHotels = useCallback((item, i) => `hotel-${item.id}-${i}`, [])
  const keyExtractorPlaces = useCallback((item, i) => `place-${item.uid ?? item.id}-${i}`, [])
  const keyExtractorHobby = useCallback((item, i) => `hobby-${item.id}-${i}`, [])
  const keyExtractorCountry = useCallback((item, i) => `country-${item.id}-${i}`, [])

  // --- renderItem обёртки ---

  const renderCountry = useCallback(
    ({ item }) => <CountryItem item={item} ActionFilter={ActionFilter} ListItem={ListItem} callComponent={callComponent} onCancel={onCancel} bg={bg} txt={txt} />,
    [ActionFilter, ListItem, callComponent, onCancel, bg, txt]
  )

  const renderHotel = useCallback(
    ({ item }) => (
      <HotelItem item={item} ActionFilter={ActionFilter} ListItem={ListItem} callComponent={callComponent} onCancel={onCancel} places={places} bg={bg} txt={txt} isDarkMode={isDarkMode} t={t} />
    ),
    [ActionFilter, ListItem, callComponent, onCancel, places, bg, txt, isDarkMode, t]
  )

  const renderPlace = useCallback(
    ({ item }) => <PlaceItem item={item} ActionFilter={ActionFilter} ListItem={ListItem} callComponent={callComponent} onCancel={onCancel} bg={bg} txt={txt} />,
    [ActionFilter, ListItem, callComponent, onCancel, bg, txt]
  )

  const renderHobby = useCallback(
    ({ item }) => <HobbyItem item={item} ActionFilter={ActionFilter} ListItem={ListItem} Icon={Icon} callComponent={callComponent} onCancel={onCancel} bg={bg} txt={txt} />,
    [ActionFilter, ListItem, Icon, callComponent, onCancel, bg, txt]
  )

  // --- Переиспользуемые блоки ---

  const searchBar = useMemo(
    () => (
      <SearchBar
        placeholder={t('containers.filterdialog.search')}
        onChangeText={setSearchHotel}
        value={searchHotel}
        lightTheme={!isDarkMode}
        inputStyle={{ backgroundColor: bg, outlineStyle: 'none' }}
        inputContainerStyle={{ backgroundColor: bg, outlineStyle: 'none', borderRadius: 20 }}
        autoCapitalize="none"
        autoCorrect={false}
        onSubmitEditing={handleSubmitSearch}
        returnKeyType="search"
        onClear={handleClearSearch}
      />
    ),
    [searchHotel, isDarkMode, bg, handleSubmitSearch, handleClearSearch, t]
  )

  const hotelList = useMemo(
    () => (
      <FlatList
        data={hotels}
        keyExtractor={keyExtractorHotels}
        renderItem={renderHotel}
        onEndReached={onEndReached}
        onEndReachedThreshold={5}
        ListFooterComponent={FOOTER}
        style={{ backgroundColor: bg }}
      />
    ),
    [hotels, keyExtractorHotels, renderHotel, onEndReached, bg]
  )

  // --- Табы ---

  const tabIndicator = useMemo(() => ({ backgroundColor: MAIN_COLOR }), [])

  const tabItemStyle = useCallback(
    index => ({
      titleStyle: { fontSize: 14, color: pageTab === index ? MAIN_COLOR : txt },
      buttonStyle: { borderBottomColor: pageTab === index ? MAIN_COLOR : bg, backgroundColor: bg }
    }),
    [pageTab, txt, bg]
  )

  const countryTabContent = (
    <View style={{ height: LIST_HEIGHT }}>
      <FlatList data={country} keyExtractor={keyExtractorCountry} renderItem={renderCountry} ListFooterComponent={FOOTER} />
    </View>
  )

  const hotelTabContent = (
    <View style={{ height: LIST_HEIGHT }}>
      {searchBar}
      {hotels.length === 0 && isLoadingHotels ? <LoadingView bg={bg} label="Загрузка..." /> : hotelList}
    </View>
  )

  const placesTabContent = (
    <View style={{ height: LIST_HEIGHT }}>
      {places.length === 0 ? (
        <LoadingView bg={bg} />
      ) : (
        <FlatList style={{ backgroundColor: bg }} data={places} keyExtractor={keyExtractorPlaces} renderItem={renderPlace} ListFooterComponent={FOOTER_TALL} />
      )}
    </View>
  )

  const hobbyTabContent = (
    <View style={{ height: LIST_HEIGHT }}>
      {hobby.length === 0 ? (
        <LoadingView bg={bg} />
      ) : (
        <FlatList style={{ backgroundColor: bg }} data={hobby} keyExtractor={keyExtractorHobby} renderItem={renderHobby} ListFooterComponent={FOOTER_TALL} />
      )}
    </View>
  )

  const renderTabsAgentWithCountry = () => (
    <>
      <Tab value={pageTab} onChange={setPageTab} indicatorStyle={tabIndicator}>
        <Tab.Item title="страны" {...tabItemStyle(0)} />
        <Tab.Item title={filter.selectCategory.name_filter_tip1.toUpperCase()} {...tabItemStyle(1)} />
        <Tab.Item title={filter.selectCategory.name_filter_tip2.toUpperCase()} {...tabItemStyle(2)} />
      </Tab>
      {pageTab === 0 && countryTabContent}
      {pageTab === 1 && hotelTabContent}
      {pageTab === 2 && placesTabContent}
    </>
  )

  const renderTabsNoAgent = () => (
    <>
      <Tab value={pageTab} onChange={setPageTab} indicatorStyle={tabIndicator}>
        <Tab.Item title={filter.selectCategory.name_filter_tip1.toUpperCase()} {...tabItemStyle(0)} />
        <Tab.Item title={filter.selectCategory.name_filter_tip2.toUpperCase()} {...tabItemStyle(1)} />
        <Tab.Item title={filter.selectCategory.name_filter_tip3.toUpperCase()} {...tabItemStyle(2)} />
      </Tab>
      {pageTab === 0 && hotelTabContent}
      {pageTab === 1 && placesTabContent}
      {pageTab === 2 && hobbyTabContent}
    </>
  )

  // --- Хедер ---

  const leftIcon = useMemo(
    () => (
      <TouchableOpacity onPress={onCancel}>
        <Icon name="close" color="red" />
      </TouchableOpacity>
    ),
    [onCancel, Icon]
  )

  const rightButtons = useMemo(() => {
    if (currentCategory.is_show_geo !== 1) return null
    return (
      <View style={{ flexDirection: 'row', flex: 1 }}>
        <TouchableOpacity onPress={toggleGeo}>{geoData ? <Icon name="location-off" color="red" /> : <Icon name="location-on" color={MAIN_COLOR} />}</TouchableOpacity>
      </View>
    )
  }, [currentCategory, geoData, toggleGeo, Icon])

  const headerProps = android ? { containerStyle: { borderTopLeftRadius: 15, borderTopRightRadius: 15 } } : {}

  return (
    <>
      <Header
        {...headerProps}
        onlineTurHeader
        statusBarProps={{ translucent: true }}
        leftComponent={leftIcon}
        centerComponent={{
          text: filter.selectCategory.name_filter_root,
          style: { color: txt, fontSize: 14, fontWeight: 'bold', paddingTop: 2 }
        }}
        backgroundColor={isDarkMode ? bg : '#ececec'}
        rightComponent={rightButtons}
        containerStyle={{ borderRadius: 10 }}
      />
      <View style={{ flex: 1, backgroundColor: bg, borderRadius: 10 }}>
        {filter.chatAgent && filter.selectedCountry !== '-1' && renderTabsAgentWithCountry()}
        {filter.chatAgent && filter.selectedCountry === '-1' && countryTabContent}
        {!filter.chatAgent && renderTabsNoAgent()}
      </View>
    </>
  )
}

export default FilterDialog
