import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ActivityIndicator, Appearance, PermissionsAndroid, Platform, SectionList, Text, TouchableOpacity, View } from 'react-native'

// Вынесено за пределы компонента — чистая функция без зависимостей
const formatContacts = contacts =>
  contacts
    .filter(c => c.phoneNumbers?.length > 0)
    .map(c => ({
      title: c.displayName,
      data: c.phoneNumbers.map(p => p.number)
    }))

const requestAndroidPermission = async t => {
  await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_CONTACTS, {
    title: t('common.contact'),
    message: t('containers.contactlist.access')
  })
}

function ContactList({ utils, android, closeModalContact, onSelectContact }) {
  const { getAll, checkPermission, requestPermission, t, Alert, theme, Icon, Header, SearchBar } = utils

  const [contacts, setContacts] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  // Храним исходный список для фильтрации без лишних запросов
  const allContactsRef = useRef([])

  const isDarkMode = Appearance.getColorScheme() === 'dark'
  const colors = isDarkMode ? theme.dark.colors : theme.light.colors

  // --- Загрузка контактов ---

  const loadContacts = useCallback(async () => {
    const raw = await getAll()
    const formatted = formatContacts(raw)
    allContactsRef.current = raw
    setContacts(formatted)
    setIsLoading(false)
  }, [getAll])

  const handlePermissionDenied = useCallback(() => {
    Alert.alert(t('common.errorTitle'), t('containers.contactlist.denied'))
  }, [Alert, t])

  const initData = useCallback(async () => {
    try {
      if (Platform.OS === 'android') {
        await requestAndroidPermission(t)
      }

      const permission = await checkPermission()

      if (permission === 'authorized') {
        await loadContacts()
        return
      }

      // iOS: запрашиваем разрешение если не выдано
      if (Platform.OS === 'ios') {
        const granted = await requestPermission()
        if (granted === 'authorized') {
          await loadContacts()
        } else {
          handlePermissionDenied()
        }
      } else {
        handlePermissionDenied()
      }
    } catch (error) {
      console.error('ContactList: permission/load error:', error)
      setIsLoading(false)
    }
  }, [checkPermission, requestPermission, loadContacts, handlePermissionDenied, t])

  useEffect(() => {
    if (Platform.OS !== 'web') {
      initData()
    } else {
      setIsLoading(false)
    }
  }, [initData])

  // --- Поиск ---

  const handleSearch = useCallback(text => {
    setSearchQuery(text)

    const query = text.toUpperCase()
    const filtered = allContactsRef.current.filter(item => {
      const family = item.familyName?.toUpperCase() ?? ''
      const given = item.givenName?.toUpperCase() ?? ''
      return family.includes(query) || given.includes(query)
    })

    setContacts(formatContacts(filtered))
  }, [])

  // --- UI ---

  const headerProps = useMemo(() => (android ? { containerStyle: { borderTopLeftRadius: 15, borderTopRightRadius: 15 } } : {}), [android])

  const renderLeftIcon = useCallback(
    () => (
      <TouchableOpacity onPress={closeModalContact}>
        <Icon name="close" color="red" />
      </TouchableOpacity>
    ),
    [closeModalContact, Icon]
  )

  const renderItem = useCallback(
    ({ item, index, section }) => (
      <TouchableOpacity
        key={String(index)}
        style={{ paddingVertical: 10, paddingLeft: 10 }}
        containerStyle={{ backgroundColor: colors.background }}
        onPress={() => onSelectContact(section.title, item)}>
        <Text style={{ paddingLeft: 10, color: colors.text }}>{item}</Text>
      </TouchableOpacity>
    ),
    [colors, onSelectContact]
  )

  const renderSectionHeader = useCallback(({ section: { title } }) => <Text style={{ fontSize: 18, marginLeft: 10, color: colors.text }}>{title}</Text>, [colors.text])

  const keyExtractor = useCallback((item, index) => `${item}-${index}`, [])

  return (
    <View style={{ flex: 1 }}>
      <Header
        onlineTurHeader
        statusBarProps={{ translucent: true }}
        leftComponent={renderLeftIcon()}
        centerComponent={{
          text: t('common.contact'),
          style: { color: colors.text, fontSize: 16, fontWeight: 'bold', paddingTop: 2 }
        }}
        backgroundColor={isDarkMode ? colors.background : '#ececec'}
        {...headerProps}
      />

      <SearchBar
        placeholder={t('containers.contactlist.search')}
        onChangeText={handleSearch}
        value={searchQuery}
        lightTheme={!isDarkMode}
        inputStyle={{ backgroundColor: colors.background }}
        inputContainerStyle={{ backgroundColor: colors.background }}
        autoCapitalize="none"
        autoCorrect={false}
      />

      {isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator />
        </View>
      ) : (
        <SectionList sections={contacts} keyExtractor={keyExtractor} renderItem={renderItem} renderSectionHeader={renderSectionHeader} />
      )}
    </View>
  )
}

// Аналог PureComponent — ререндер только при изменении пропсов
export default ContactList
