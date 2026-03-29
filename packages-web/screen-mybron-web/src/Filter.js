import { useCallback, useEffect, useMemo, useState } from 'react'
import { Appearance, Platform, TouchableOpacity, View } from 'react-native'

const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
const { MAIN_COLOR } = GLOBAL_OBJ.onlinetur.constants

const Filter = ({ utils, android, countries, currentFilter, setCurrentFilter, closeModalFilter }) => {
  const { theme, Header, t, TextInput, moment, DatePickerModal, Icon, chatServiceGet } = utils

  // Memoize initial category hotel data
  const categoryHotel = useMemo(
    () => [
      { id: 0, title: t('screens.ratings.components.filter.any') },
      { id: 5, title: '5*' },
      { id: 4, title: '4*' },
      { id: 3, title: '3*' },
      { id: 2, title: '2*' },
      { id: 1, title: '1*' }
    ],
    [t]
  )

  const [state, setState] = useState({
    visibleModal: false,
    visibleModalPlaces: false,
    valueCountries: '',
    countriesAll: [],
    selectedCountries: [],
    valuePlaces: t('screens.ratings.components.filter.resorts'),
    placesAll: [],
    selectedPlaces: [],
    selectedHClass: [],
    visibleModalHClass: false,
    valueHClass: t('screens.ratings.components.filter.any'),
    dateFrom: undefined,
    dateTo: '',
    isDatePickerVisibleFrom: false,
    isDatePickerVisibleTo: false
  })

  // Initialize filter on mount
  useEffect(() => {
    const { dateFrom, dateTo } = currentFilter
    setState(prev => ({
      ...prev,
      dateFrom: dateFrom !== '' ? dateFrom : moment(new Date()).format('YYYY-MM-DD'),
      dateTo: dateTo !== '' ? dateTo : moment(new Date()).format('YYYY-MM-DD')
    }))
  }, [currentFilter, moment])

  const getValueCountries = useCallback(
    selectedCountries => {
      return countries.filter(c => c.id_country && selectedCountries.includes(c.id_country.toString())).map(c => c.title)
    },
    [countries]
  )

  const changeSelectedCountries = useCallback(
    async selectedCountries => {
      const places = await chatServiceGet.getRatingPlaces(selectedCountries.join(','))
      const valueCountries = getValueCountries(selectedCountries)

      setState(prev => ({
        ...prev,
        selectedCountries,
        valueCountries: valueCountries.length > 0 ? valueCountries.join(',') : t('screens.ratings.components.filter.country'),
        selectedPlaces: [],
        valuePlaces: t('screens.ratings.components.filter.resorts'),
        placesAll: places
      }))
    },
    [chatServiceGet, getValueCountries, t]
  )

  const changeSelectedPlaces = useCallback(
    selectedPlaces => {
      const valPlaces = state.placesAll.filter(p => p.uid && selectedPlaces.includes(p.uid.toString())).map(p => p.name)

      setState(prev => ({
        ...prev,
        selectedPlaces,
        valuePlaces: valPlaces.length > 0 ? valPlaces.join(',') : t('screens.ratings.components.filter.resorts')
      }))
    },
    [state.placesAll, t]
  )

  const changeSelectedHClass = useCallback(
    selectedHClass => {
      const valPlaces = categoryHotel.filter(c => c.id > -1 && selectedHClass.includes(c.id.toString())).map(c => c.title)

      setState(prev => ({
        ...prev,
        selectedHClass,
        valueHClass: valPlaces.length > 0 ? valPlaces.join(',') : t('screens.ratings.components.filter.any')
      }))
    },
    [categoryHotel, t]
  )

  const handleConfirmFrom = useCallback(date => {
    setState(prev => ({ ...prev, dateFrom: date.date, isDatePickerVisibleFrom: false }))
  }, [])

  const handleConfirmTo = useCallback(date => {
    setState(prev => ({ ...prev, dateTo: date.date, isDatePickerVisibleTo: false }))
  }, [])

  const saveFilter = useCallback(() => {
    setCurrentFilter({
      dateFrom: state.dateFrom ? moment(state.dateFrom).format('YYYY-MM-DD') : '',
      dateTo: state.dateTo ? moment(state.dateTo).format('YYYY-MM-DD') : '',
      pattern: ''
    })
    closeModalFilter()
  }, [state.dateFrom, state.dateTo, moment, setCurrentFilter, closeModalFilter])

  const clearDates = useCallback(() => {
    setState(prev => ({ ...prev, dateFrom: '', dateTo: '' }))
  }, [])

  // Memoize theme values
  const { isDarkMode, bg, txt } = useMemo(() => {
    const isDark = Appearance.getColorScheme() === 'dark'
    return {
      isDarkMode: isDark,
      bg: isDark ? theme.dark.colors.background : theme.light.colors.background,
      txt: isDark ? theme.dark.colors.text : theme.light.colors.text
    }
  }, [theme])

  // Memoize header props
  const headerProps = useMemo(() => (android ? { containerStyle: { borderTopLeftRadius: 15, borderTopRightRadius: 15 } } : {}), [android])

  const renderLeftIcon = useMemo(
    () => (
      <TouchableOpacity onPress={closeModalFilter}>
        <Icon name="close" color="red" />
      </TouchableOpacity>
    ),
    [closeModalFilter, Icon]
  )

  const renderRightButtons = useMemo(
    () => (
      <View style={{ flexDirection: 'row', flex: 1 }}>
        <TouchableOpacity onPress={clearDates}>
          <Icon name="remove-done" color="red" style={{ paddingRight: 20 }} />
        </TouchableOpacity>
        <TouchableOpacity onPress={saveFilter}>
          <Icon name="done" color={MAIN_COLOR} />
        </TouchableOpacity>
      </View>
    ),
    [clearDates, saveFilter, Icon]
  )

  return (
    <>
      <Header
        {...headerProps}
        onlineTurHeader
        statusBarProps={{ translucent: true }}
        leftComponent={renderLeftIcon}
        centerComponent={{ text: t('screens.ratings.components.filter.filter'), style: { color: txt, fontSize: 16, fontWeight: 'bold', paddingTop: 2 } }}
        backgroundColor={isDarkMode ? bg : '#ececec'}
        rightComponent={renderRightButtons}
      />
      <View style={{ width: '100%', flexDirection: 'row', alignContent: 'stretch', padding: 20 }}>
        <TextInput
          label={t('components.chat.actionmodal.component.actionmodal.dateFrom')}
          value={state.dateFrom ? moment(state.dateFrom).format('DD MMM YYYY') : ''}
          onChangeText={() => {}}
          style={{ backgroundColor: 'transparent', flex: 0.5, color: theme.text }}
          editable={false}
          onTouchStart={() => setState(prev => ({ ...prev, isDatePickerVisibleFrom: true }))}
          onClick={() => setState(prev => ({ ...prev, isDatePickerVisibleFrom: true }))}
        />
        <TextInput
          label={t('components.chat.actionmodal.component.actionmodal.dateTo')}
          value={state.dateTo ? moment(state.dateTo).format('DD MMM YYYY') : ''}
          onChangeText={() => {}}
          style={{ backgroundColor: 'transparent', flex: 0.5, color: theme.text }}
          editable={false}
          onTouchStart={() => setState(prev => ({ ...prev, isDatePickerVisibleTo: true }))}
          onClick={() => setState(prev => ({ ...prev, isDatePickerVisibleTo: true }))}
        />
      </View>
      {state.isDatePickerVisibleFrom && (
        <DatePickerModal
          locale="ru"
          mode="single"
          visible={state.isDatePickerVisibleFrom}
          onDismiss={() => setState(prev => ({ ...prev, isDatePickerVisibleFrom: false }))}
          date={new Date()}
          onConfirm={handleConfirmFrom}
        />
      )}
      {state.isDatePickerVisibleTo && (
        <DatePickerModal
          locale="ru"
          mode="single"
          visible={state.isDatePickerVisibleTo}
          onDismiss={() => setState(prev => ({ ...prev, isDatePickerVisibleTo: false }))}
          date={new Date()}
          onConfirm={handleConfirmTo}
        />
      )}
    </>
  )
}

export default Filter
