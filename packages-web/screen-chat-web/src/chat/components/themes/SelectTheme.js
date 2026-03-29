import isEmpty from 'lodash/isEmpty'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ActivityIndicator, Appearance, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity as RNTouchableOpacity, View } from 'react-native'

const FONT_SIZE = 16

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'red',
    top: -14,
    right: -24
  }
})

// Extract ThemeListItem to reduce redundancy
const ThemeListItem = ({ item, onSelect, onLongPress, bg, txt, newsSelect, selectType, isAgent, filterNew, ListItem, Badge }) => {
  const col = item.col_new_msg > 0 ? item.col_new_msg : 0

  return (
    <>
      <ListItem
        key={item.id.toString()}
        onPress={() => onSelect(item, isAgent, selectType, filterNew)}
        onLongPress={() => onLongPress(item)}
        containerStyle={{ backgroundColor: bg, margin: 0, padding: 10 }}>
        <ListItem.Content>
          {!newsSelect && item.col_new_all > 0 ? (
            <Text style={{ fontSize: FONT_SIZE, color: txt }}>
              {item.title}
              {col > 0 && (
                <View style={{ width: 22 }}>
                  <Badge style={{ position: 'absolute', width: 10, top: -24 }}>{col}</Badge>
                </View>
              )}
            </Text>
          ) : (
            <ListItem.Title style={{ fontSize: FONT_SIZE, color: selectType === 1 && col === 0 ? 'grey' : txt }}>{item.title}</ListItem.Title>
          )}
          {!!item.msg && <Text style={{ fontSize: 12, color: selectType === 0 ? txt : 'grey' }}>{item.msg}</Text>}
        </ListItem.Content>
      </ListItem>
      <View style={{ height: 1, backgroundColor: '#ededed' }} />
    </>
  )
}

const SectionHeader = ({ isDarkMode, bg, txt, t, label }) => (
  <View style={{ width: '100%', backgroundColor: isDarkMode ? bg : '#efefef', padding: 14 }}>
    <Text style={{ fontSize: 18, fontWeight: 'bold', color: txt }}>{t(label)}</Text>
  </View>
)

const SelectTheme = props => {
  const { utils, sotr, user, currentCategory, filter, fcmToken, expoToken, device, themes: propsThemes, onSelect, onCancel, chatAgent, android, newsSelect, setVisible } = props
  const { rtkQuery, theme, Header, ListItem, Badge, t, Icon } = utils

  const [allThemes, setAllThemes] = useState([])
  const [themes, setThemes] = useState([])
  const [notNull, setNotNull] = useState(true)
  const [themeAgent, setThemeAgent] = useState([])
  const [filterNew, setFilterNew] = useState({})

  const prevThemesLengthRef = useRef(0)

  const initThemes = useCallback(async () => {
    const initData = {
      token: user?.device ? (!isEmpty(user.device) ? user.device.token : '') : '',
      android_id_install: user?.android_id_install || '',
      fcmToken,
      expoToken,
      device,
      is_sotr: user?.is_sotr || 0
    }

    const data = await rtkQuery.getRTKQueryDataPosts(initData.android_id_install, initData.token, initData.fcmToken, currentCategory.id, initData.expoToken, initData.device.url)

    const countries = data.data.filter(item => item.tip === 0 && item.del === 0 && item.title !== '')

    let agentThemes = []
    if (sotr) {
      const agentData = await rtkQuery.getRTKQueryDataPostsAgent(initData.android_id_install, initData.token, initData.fcmToken, currentCategory.id, initData.expoToken, initData.device.url)

      agentThemes = agentData.data.filter(item => item.tip === 1 && item.del === 0 && item.title !== '')
    }

    const notNullThemes = countries.filter(item => item.col_new_all > 0)

    setAllThemes(countries)
    setThemes(notNullThemes)
    setThemeAgent(agentThemes)
    setFilterNew({ ...filter })
  }, [rtkQuery, user, currentCategory, filter, fcmToken, expoToken, device, sotr])

  useEffect(() => {
    initThemes().then()
  }, [initThemes])

  useEffect(() => {
    if (prevThemesLengthRef.current === 0 && propsThemes?.length > 0) {
      initThemes().then()
    }
    prevThemesLengthRef.current = propsThemes?.length || 0
  }, [propsThemes, initThemes])

  const toggleAllList = useCallback(() => {
    setNotNull(prev => !prev)
  }, [])

  const handleLongPress = useCallback(
    item => {
      if (user?.is_admin === 1) {
        setVisible(true, item)
      }
    },
    [user, setVisible]
  )

  const renderLeftIcon = useCallback(
    () => (
      <RNTouchableOpacity onPress={onCancel}>
        <Icon name="close" color="red" />
      </RNTouchableOpacity>
    ),
    [onCancel, Icon]
  )

  const renderRightsButtons = useCallback(
    () => (
      <RNTouchableOpacity onPress={toggleAllList}>
        <Icon name="more-vert" color="green" />
      </RNTouchableOpacity>
    ),
    [toggleAllList, Icon]
  )

  const isDarkMode = useMemo(() => Appearance.getColorScheme() === 'dark', [])
  const bg = useMemo(() => (isDarkMode ? theme.dark.colors.background : theme.light.colors.background), [isDarkMode, theme])
  const txt = useMemo(() => (isDarkMode ? theme.dark.colors.text : theme.light.colors.text), [isDarkMode, theme])

  const viewThemes = notNull ? themes : allThemes
  const containerProps = android ? { containerStyle: { borderTopLeftRadius: 15, borderTopRightRadius: 15 } } : {}

  return (
    <>
      <Header
        {...containerProps}
        onlineTurHeader
        statusBarProps={{ translucent: true }}
        leftComponent={renderLeftIcon()}
        centerComponent={
          <View style={{ width: '100%', marginTop: 3, alignItems: 'center' }}>
            <Text numberOfLines={2} style={{ fontSize: FONT_SIZE, fontWeight: 'bold', color: txt }}>
              {chatAgent ? currentCategory.default_title_profi : currentCategory.name_filter_root}
            </Text>
          </View>
        }
        backgroundColor={isDarkMode ? bg : '#ececec'}
        rightComponent={renderRightsButtons()}
      />
      {allThemes.length > 0 ? (
        <ScrollView>
          {sotr && chatAgent && <SectionHeader isDarkMode={isDarkMode} bg={bg} txt={txt} t={t} label="common.business" />}
          {sotr &&
            chatAgent &&
            themeAgent.length > 0 &&
            themeAgent.map(el => (
              <ThemeListItem
                key={el.id}
                item={el}
                onSelect={onSelect}
                onLongPress={handleLongPress}
                bg={bg}
                txt={txt}
                newsSelect={newsSelect}
                selectType={2}
                isAgent={true}
                filterNew={filterNew}
                ListItem={ListItem}
                Badge={Badge}
              />
            ))}
          {sotr &&
            viewThemes.map(el => (
              <ThemeListItem
                key={el.id}
                item={el}
                onSelect={onSelect}
                onLongPress={handleLongPress}
                bg={bg}
                txt={txt}
                newsSelect={newsSelect}
                selectType={1}
                isAgent={true}
                filterNew={filterNew}
                ListItem={ListItem}
                Badge={Badge}
              />
            ))}
          {sotr && !chatAgent && <SectionHeader isDarkMode={isDarkMode} bg={bg} txt={txt} t={t} label="common.business" />}
          {!sotr &&
            viewThemes.map(el => (
              <ThemeListItem
                key={el.id}
                item={el}
                onSelect={onSelect}
                onLongPress={handleLongPress}
                bg={bg}
                txt={txt}
                newsSelect={newsSelect}
                selectType={0}
                isAgent={false}
                filterNew={filterNew}
                ListItem={ListItem}
                Badge={Badge}
              />
            ))}
          {sotr &&
            !chatAgent &&
            themeAgent.length > 0 &&
            themeAgent.map(el => (
              <ThemeListItem
                key={el.id}
                item={el}
                onSelect={onSelect}
                onLongPress={handleLongPress}
                bg={bg}
                txt={txt}
                newsSelect={newsSelect}
                selectType={2}
                isAgent={true}
                filterNew={filterNew}
                ListItem={ListItem}
                Badge={Badge}
              />
            ))}
          <View style={{ height: 50 }} />
        </ScrollView>
      ) : (
        <View style={{ height: Dimensions.get('window').height / 1.6, backgroundColor: bg, margin: 0, padding: 10, justifyContent: 'center' }}>
          <ActivityIndicator />
        </View>
      )}
      <View style={{ height: 10 }} />
    </>
  )
}

export default SelectTheme
