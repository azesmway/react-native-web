import { useRouter } from 'expo-router'
import { memo, useCallback, useMemo } from 'react'
import { Dimensions, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
const { MAIN_COLOR } = GLOBAL_OBJ.onlinetur.constants
const MAIN_COLOR_TEXT = '#8f7806'
const SUBTITLE_COLOR = 'rgb(87,120,147)'

// Constants extracted for better performance
const SPECIAL_SCREENS = ['pushchat', 'geomap', 'web', 'agent', 'business', 'pushnews', 'pushagent', 'langs', 'remove']
const APP_SCREENS = new Set(['push', 'bonus', 'player', 'vk', 'map', 'phone', 'chanel'])
const TITLE_SCREENS = new Set(['article', 'map', 'actions_hotels', 'contacts'])

// Memoized SVG component
const BackIcon = memo(({ size, color, Svg, G, Path }) => (
  <Svg width={size} height={size} viewBox="0 0 1024 1024" className="icon" version="1.1" xmlns="http://www.w3.org/2000/svg" fill={color}>
    <G>
      <Path d="M768 903.232l-50.432 56.768L256 512l461.568-448 50.432 56.768L364.928 512z" fill={color} />
    </G>
  </Svg>
))

const BackHeader = props => {
  const { history, pathname, params } = props
  const { isMobile, Svg, G, Path } = props.utils
  const expoRouter = useRouter()
  const { width } = Dimensions.get('window')

  // Memoized navigation handler
  const buttonGoBack = useCallback(() => {
    const { screen, app, linkMap } = params

    if (app && APP_SCREENS.has(screen)) {
      history(linkMap ? pathname.replace('/map', '/view') : -1)
    } else if (SPECIAL_SCREENS.includes(screen)) {
      expoRouter?.canGoBack() ? expoRouter.back() : history(-1)
    } else if (screen === 'article') {
      history('/l')
    } else if (screen === 'contacts') {
      history(pathname.replace('/contacts', '/view'))
    } else if (screen === 'actions_hotels' || screen === 'actions_hotel') {
      history('/ah')
    }
  }, [params, history, pathname, expoRouter])

  // Memoized styles
  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flexDirection: 'row', marginLeft: Platform.OS === 'web' ? 0 : -10 },
        backButton: { justifyContent: 'center', alignItems: 'center', width: 35, marginLeft: -5 },
        titleContainer: {
          justifyContent: 'center',
          marginLeft: 3,
          width: width - 100
        },
        titleText: {
          color: MAIN_COLOR_TEXT,
          fontSize: isMobile ? 16 : 16,
          fontWeight: 'bold',
          width: width - 100,
          textTransform: 'uppercase'
        },
        subtitleText: {
          color: SUBTITLE_COLOR,
          fontSize: isMobile ? 12 : 14
        },
        actionsTitle: {
          color: MAIN_COLOR,
          fontSize: 18,
          fontWeight: 'bold'
        },
        specialTitle: {
          color: MAIN_COLOR_TEXT,
          fontSize: 18,
          fontWeight: 'bold'
        },
        actionsSubtitleContainer: { flexDirection: 'row' },
        actionsTitleText: {
          color: MAIN_COLOR_TEXT,
          fontWeight: 'bold'
        },
        actionsSubtitleText: {
          color: SUBTITLE_COLOR
        }
      }),
    [isMobile, width]
  )

  const iconSize = isMobile ? 20 : 26
  const { screen, title, subtitle } = params

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={buttonGoBack} style={styles.backButton}>
        <BackIcon size={iconSize} color={MAIN_COLOR} Svg={Svg} G={G} Path={Path} />
      </TouchableOpacity>

      {TITLE_SCREENS.has(screen) && (
        <View style={styles.titleContainer}>
          <Text numberOfLines={1} ellipsizeMode="tail" style={styles.titleText}>
            {title}
          </Text>
          {subtitle && <Text style={styles.subtitleText}>{subtitle}</Text>}
        </View>
      )}

      {screen === 'actions_hotel' && (
        <View style={styles.titleContainer}>
          <Text numberOfLines={1} ellipsizeMode="tail" style={styles.actionsTitle}>
            ЦЕНЫ И АКЦИИ
          </Text>
          <View style={styles.actionsSubtitleContainer}>
            {title && <Text style={styles.actionsTitleText}>{title} • </Text>}
            {subtitle && <Text style={styles.actionsSubtitleText}>{subtitle}</Text>}
          </View>
        </View>
      )}

      {SPECIAL_SCREENS.includes(screen) && (
        <View style={styles.titleContainer}>
          <Text numberOfLines={1} ellipsizeMode="tail" style={styles.specialTitle}>
            {title?.toUpperCase()}
          </Text>
          {subtitle && <Text style={styles.actionsSubtitleText}>{subtitle}</Text>}
        </View>
      )}
    </View>
  )
}

export default memo(BackHeader)
