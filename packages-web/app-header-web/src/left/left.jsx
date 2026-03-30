import { usePathname, useRouter } from 'expo-router'
import compact from 'lodash/compact'
import isArray from 'lodash/isArray'
import isEmpty from 'lodash/isEmpty'
import split from 'lodash/split'
import React, { useMemo } from 'react'
import { Dimensions, Platform, Text, TouchableOpacity, View } from 'react-native'

const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
const { width } = Dimensions.get('window')
const theme = GLOBAL_OBJ.onlinetur.theme
const MAIN_COLOR = '#8f7806'
const LEFT_DRAWER = 5
const LEFT_TEXT = 10
const SUBTITLE_COLOR = 'rgb(87,120,147)'

// Shared style objects
const styles = {
  container: { flexDirection: 'row' },
  leftMargin: isMobile => ({ marginLeft: isMobile ? 10 : LEFT_TEXT }),
  centerJustify: { justifyContent: 'center' },
  mainText: { fontSize: 18, fontWeight: 'bold', color: MAIN_COLOR },
  upperCaseText: { fontSize: 16, fontWeight: 'bold', color: MAIN_COLOR, textTransform: 'uppercase' },
  subtitleText: { fontSize: 12, color: 'red' },
  smallSubtitle: { fontSize: 12, color: theme.text }
}

const LeftHeader = props => {
  const pathname = usePathname()
  const router = useRouter()
  const history = router.replace
  const { t, Icon, isMobile, Svg, Path } = props.utils
  const { filter, currentCategory, categories, setDrawer, setModalTheme, params, openDrawer } = props

  const handleHistoryPush = url => {
    if (url.includes('/h') || url.includes('/p')) {
      history(url)
    } else if (url.includes('/n')) {
      history('/l')
    } else {
      history(pathname + url)
    }
  }

  const renderDrawer = useMemo(
    () => (
      <TouchableOpacity style={{ marginLeft: isMobile ? 5 : LEFT_DRAWER, justifyContent: 'center' }} onPress={() => setDrawer(!openDrawer)}>
        <Svg width={isMobile ? 26 : 32} height={isMobile ? 26 : 32} viewBox="0 0 24 24" fill="none">
          <Path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M2 7a1 1 0 0 1 1-1h18a1 1 0 1 1 0 2H3a1 1 0 0 1-1-1zm0 5a1 1 0 0 1 1-1h18a1 1 0 1 1 0 2H3a1 1 0 0 1-1-1zm1 4a1 1 0 1 0 0 2h18a1 1 0 1 0 0-2H3z"
            fill={'rgb(66, 154, 220)'}
          />
        </Svg>
      </TouchableOpacity>
    ),
    [isMobile, props]
  )

  const renderTextWithIcon = (mainText, subtitle, iconName, onPress) => (
    <View style={{ ...styles.leftMargin(isMobile), ...styles.centerJustify }}>
      <TouchableOpacity onPress={onPress} style={{ flexDirection: 'row' }}>
        <View>
          <Text numberOfLines={1} ellipsizeMode="tail" style={[styles.upperCaseText, { width: isMobile ? 200 : '100%' }]}>
            {mainText}
          </Text>
          {subtitle && (
            <Text numberOfLines={1} ellipsizeMode="tail" style={[styles.subtitleText, { width: isMobile ? 200 : '100%' }]}>
              {subtitle}
            </Text>
          )}
        </View>
        {iconName && <Icon name={iconName} color={MAIN_COLOR} style={{ paddingTop: 8 }} />}
      </TouchableOpacity>
    </View>
  )

  const renderChoiceCategory = () => {
    if (!params || params.screen !== 'main') return null

    const categoryName = currentCategory?.name?.trim() || ''
    const showSyncIcon = categories && isArray(categories) && categories.length > 1

    return (
      <View style={{ ...styles.centerJustify, ...styles.leftMargin(isMobile) }}>
        <TouchableOpacity onPress={() => setDrawer(true)} style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ flexDirection: 'row' }}>
            <Text numberOfLines={1} ellipsizeMode="tail" style={{ fontSize: 16, fontWeight: 'bold', color: MAIN_COLOR, textTransform: 'uppercase' }}>
              {categoryName}
            </Text>
            {showSyncIcon && (
              <View style={{ position: 'absolute', right: -30, top: -3 }}>
                <TouchableOpacity onPress={() => params.openModalFilter()} style={{ marginLeft: 10 }}>
                  <Icon name="sync-alt" width={isMobile ? 18 : 20} height={isMobile ? 18 : 20} color={MAIN_COLOR} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>
    )
  }

  const renderChoiceTheme = () => {
    if (!params || params.screen !== 'chat') return null

    if (filter.selectedFav === '1') {
      return (
        <View style={{ ...styles.leftMargin(isMobile), ...styles.centerJustify }}>
          <Text numberOfLines={1} ellipsizeMode="tail" style={styles.mainText}>
            {filter.selectedFavName}
          </Text>
        </View>
      )
    }

    const isNoSelection = filter.selectedHotel === '-1' && filter.selectedPlace === '-1' && filter.selectedHobby === '-1'

    if (isNoSelection) {
      const displayName = filter.chatAgent ? filter.selectedAgentName : filter.selectedCountryName
      const showCountrySubtitle = filter.chatAgent && filter.selectedCountry !== '-1'
      const showBusinessChats = filter.chatAgent && filter.selectedCountry === '-1'

      return (
        <TouchableOpacity onPress={() => setModalTheme(true, {})} style={{ ...styles.centerJustify, ...styles.leftMargin(isMobile) }}>
          <View style={{ flexDirection: 'row' }}>
            <Text numberOfLines={1} ellipsizeMode="tail" style={{ ...styles.mainText, marginTop: 1 }}>
              {displayName}
            </Text>
            <Icon name="keyboard-arrow-down" color={MAIN_COLOR} />
          </View>
          {showCountrySubtitle && (
            <Text numberOfLines={1} ellipsizeMode="tail" style={styles.subtitleText}>
              {filter.selectedCountryName}
            </Text>
          )}
          {showBusinessChats && (
            <Text numberOfLines={1} ellipsizeMode="tail" style={styles.smallSubtitle}>
              Бизнес-чаты
            </Text>
          )}
        </TouchableOpacity>
      )
    }

    // Complex selection states
    const { selectedHobbyName, selectedHotelName, selectedPlaceName, chatAgent, selectedAgentName, selectedCountryName, selectedCountry } = filter

    if (!isEmpty(selectedHobbyName)) {
      const displayName = chatAgent ? selectedAgentName.toUpperCase() : (selectedHotelName || selectedHobbyName).toUpperCase().trim()
      const subtitle = selectedHotelName
        ? `${selectedCountryName}, ${selectedHotelName}, ${selectedHobbyName}`
        : Number(selectedCountry) !== -1
          ? `${selectedCountryName.toUpperCase().trim()}, ${selectedHobbyName}`
          : null

      return (
        <View style={styles.leftMargin(isMobile)}>
          <Text numberOfLines={1} ellipsizeMode="tail" style={styles.mainText}>
            {displayName}
          </Text>
          {subtitle && <Text style={styles.subtitleText}>{subtitle}</Text>}
        </View>
      )
    }

    if (!isEmpty(selectedHotelName) || !isEmpty(selectedPlaceName)) {
      const name = selectedHotelName || selectedPlaceName
      const displayName = chatAgent ? selectedAgentName.toUpperCase() : name.toUpperCase()
      const subtitle = `${selectedCountryName}, ${name}`
      const iconName = !chatAgent ? 'keyboard-arrow-right' : null

      return renderTextWithIcon(displayName, subtitle, iconName, () => !chatAgent && handleHistoryPush('/view'))
    }

    return (
      <View style={styles.leftMargin(isMobile)}>
        <Text numberOfLines={1} ellipsizeMode="tail" style={styles.mainText}>
          {t('common.loading')}
        </Text>
      </View>
    )
  }

  const renderView = () => {
    const url = compact(split(pathname, '/'))

    if (url[0] === 'b') {
      const displayName = filter.chatAgent ? filter.selectedAgentName.toUpperCase() : filter.selectedHobbyName.toUpperCase().trim()
      return (
        <View style={styles.container}>
          {renderDrawer}
          <View style={{ ...styles.centerJustify, ...styles.leftMargin(isMobile) }}>
            <Text numberOfLines={1} ellipsizeMode="tail" style={styles.upperCaseText}>
              {displayName}
            </Text>
          </View>
        </View>
      )
    }

    if (params.screen === 'chat' && filter.searchFav === '22') {
      return (
        <View style={styles.container}>
          {renderDrawer}
          <View style={{ ...styles.centerJustify, ...styles.leftMargin(isMobile) }}>
            <Text style={styles.upperCaseText}>{filter.nameUserFav}</Text>
            <Text style={styles.smallSubtitle}>{t('components.header.leftcomponent.user')}</Text>
          </View>
        </View>
      )
    }

    if (params.screen === 'chat' && filter.searchFav === '4') {
      return (
        <View style={styles.container}>
          {renderDrawer}
          <View style={{ ...styles.centerJustify, ...styles.leftMargin(isMobile) }}>
            <Text style={styles.upperCaseText}>{t('components.header.leftcomponent.answers')}</Text>
            <Text style={styles.smallSubtitle}>{t('components.header.leftcomponent.thread')}</Text>
          </View>
        </View>
      )
    }

    if (params.screen === 'view') {
      return (
        <View style={styles.container}>
          {renderDrawer}
          <View style={{ ...styles.centerJustify, ...styles.leftMargin(isMobile) }}>
            <TouchableOpacity onPress={() => handleHistoryPush(pathname.replace('/view', ''))} style={{ height: '100%', justifyContent: 'center' }}>
              <Text numberOfLines={1} ellipsizeMode="tail" style={styles.upperCaseText}>
                {params.title}
              </Text>
              {params.subtitle && (
                <Text numberOfLines={1} ellipsizeMode="tail" style={{ fontSize: 14, color: SUBTITLE_COLOR }}>
                  {params.subtitle}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )
    }

    if (params.clearHotelRating || (params.screen === 'actions_hotels' && params.badge > 0)) {
      const onPress = params.clearHotelRating
        ? () => {
            if (Platform.OS === 'web') {
              document.location.href = '/r/' + (Number(params.slideIndex) + 1)
            }
          }
        : () => params.onClearSearch()

      const subtitle = params.clearHotelRating && params.subtitle ? params.subtitle : 'Установлен фильтр по акциям'

      return (
        <View style={styles.container}>
          {renderDrawer}
          <TouchableOpacity onPress={onPress} style={{ ...styles.centerJustify, ...styles.leftMargin(isMobile) }}>
            <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
              <Icon name="close" color="red" size={30} style={{ paddingTop: 3 }} />
              <View style={styles.centerJustify}>
                <Text numberOfLines={1} ellipsizeMode="tail" style={styles.upperCaseText}>
                  {params.title}
                </Text>
                {subtitle && (
                  <Text numberOfLines={1} ellipsizeMode="tail" style={{ width: width < 560 ? 200 : 500, color: SUBTITLE_COLOR }}>
                    {subtitle}
                  </Text>
                )}
              </View>
            </View>
          </TouchableOpacity>
        </View>
      )
    }

    const standardScreens = ['bonus', 'news', 'profile', 'list_hotels', 'final_hotels', 'my-rating', 'actions_hotels', 'actions_hotel', 'my_bron', 'geomap']
    if (standardScreens.includes(params.screen)) {
      return (
        <View style={styles.container}>
          {renderDrawer}
          <View style={{ ...styles.centerJustify, ...styles.leftMargin(isMobile) }}>
            <Text numberOfLines={1} ellipsizeMode="tail" style={{ ...styles.upperCaseText, fontSize: isMobile ? 16 : 18 }}>
              {params.title}
            </Text>
            {params.subtitle && (
              <View style={{ flexDirection: 'row', width: isMobile ? width / 2 : undefined }}>
                <Text numberOfLines={1} ellipsizeMode="tail" style={{ color: SUBTITLE_COLOR, fontSize: isMobile ? 12 : 14 }}>
                  {params.subtitle}
                </Text>
                {params.screen === 'list_hotels' && (
                  <TouchableOpacity style={{ width: 30, height: 30, position: 'absolute', right: -30, top: -3 }} onPress={() => params.openModalFilter()}>
                    <Icon name="edit" size={isMobile ? 17 : 20} color={MAIN_COLOR} />
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        </View>
      )
    }

    return (
      <View style={styles.container}>
        {renderDrawer}
        {renderChoiceCategory()}
        {renderChoiceTheme()}
      </View>
    )
  }

  return renderView()
}

export default LeftHeader
