import { useCallback, useMemo, useState } from 'react'
import { Appearance, Dimensions, Image, Platform, Pressable, Text, TouchableOpacity, View } from 'react-native'

import triangle from '../images/triangle.png'

const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
const { MAIN_COLOR } = GLOBAL_OBJ.onlinetur.constants

// Pre-compiled regex for better performance
const TITLE_CLEANUP_REGEX = /\r\n|\n|\r|<p><\/p>|<br><\/p>|<\/?strong>/g

// Extracted shared styles
const createStyles = (width, isMobile, txt) => ({
  container: {
    width: isMobile ? width : width / 2,
    height: isMobile ? 130 : 170,
    backgroundColor: 'transparent',
    margin: 0,
    padding: 0
  },
  containerWithRadius: {
    borderRadius: 5
  },
  overlay: {
    position: 'absolute',
    width: isMobile ? width : width / 2,
    height: isMobile ? 130 : 170,
    backgroundColor: '#fff',
    opacity: 0.3,
    borderRadius: 5,
    top: 0
  },
  content: {
    top: -10,
    backgroundColor: 'transparent'
  },
  dateText: {
    fontFamily: 'sans-serif',
    color: txt,
    fontSize: 13
  },
  titleBase: {
    fontFamily: 'sans-serif',
    color: '#272727',
    fontSize: isMobile ? 13 : 16
  },
  titleBold: {
    fontWeight: 'bold'
  },
  subtitle: {
    paddingTop: 20,
    fontSize: 12,
    color: '#272727'
  },
  subtitleText: {
    fontFamily: 'sans-serif',
    color: txt,
    fontSize: 14
  },
  imageContainerLeft: {
    top: -15,
    left: -8,
    backgroundColor: 'transparent',
    borderRadius: 10
  },
  imageStyle: {
    width: 150,
    height: 100,
    backgroundColor: 'transparent',
    borderRadius: 10
  },
  rightImageContainer: {
    marginTop: 15,
    marginRight: 10
  },
  rightContainer: {
    paddingRight: 0,
    alignSelf: 'flex-start',
    backgroundColor: 'transparent'
  },
  triangleButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: 'transparent'
  },
  triangleImage: {
    width: 60,
    height: 60
  },
  iconContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    paddingTop: 8,
    paddingRight: 4
  }
})

export default function NewsItem(props) {
  const { item, index, onPressNews, changeSpeak, utils } = props
  const [speak, setSpeak] = useState(item.speak)

  // Cache calculations
  const isDarkMode = useMemo(() => Appearance.getColorScheme() === 'dark', [])

  // Memoize title cleanup
  const cleanTitle = useCallback(title => {
    return title.replace(TITLE_CLEANUP_REGEX, '')
  }, [])

  // Extract duplicate rendering logic
  const renderImage = useCallback((item, styles) => {
    if (!item.cover_image) return null

    return <Image source={{ uri: item.cover_image }} style={styles.imageStyle} />
  }, [])

  const handleChangeSpeak = useCallback(() => {
    // { state: { speak }, setState: setSpeak },
    changeSpeak(item)
  }, [changeSpeak, item, speak])

  const renderSpeakButton = useCallback(
    (item, color, styles) => {
      const { Icon } = utils

      return (
        <TouchableOpacity onPress={handleChangeSpeak} style={styles.triangleButton}>
          <Image source={triangle} style={styles.triangleImage} />
          <View style={styles.iconContainer}>
            <Icon name={speak ? 'volume-up' : 'volume-off'} color={color} />
          </View>
        </TouchableOpacity>
      )
    },
    [utils, speak, handleChangeSpeak]
  )

  const renderContent = useCallback(
    (item, title, txt, isMobile, styles) => {
      const { ListItem, moment } = utils
      const isReview = item.channel === 'onlinetur_reviews'
      const titleStyle = isReview ? [styles.titleBase, styles.titleBold] : styles.titleBase

      return (
        <ListItem.Content style={styles.content}>
          <Text style={styles.dateText}>{moment(item.published_at).format('DD MMM YYYY HH:mm')}</Text>
          <ListItem.Title lineBreakMode="tail" numberOfLines={3} ellipsizeMode="tail" style={titleStyle}>
            {title}
          </ListItem.Title>
          {!isMobile && (
            <ListItem.Subtitle style={styles.subtitle}>
              <Text style={styles.subtitleText} numberOfLines={4}>
                {item.short_description}
              </Text>
            </ListItem.Subtitle>
          )}
        </ListItem.Content>
      )
    },
    [utils]
  )

  const { ListItem, theme, isMobile } = utils
  const txt = isDarkMode ? theme.dark.colors.text : theme.light.colors.text
  const { width } = Dimensions.get('window')

  const color = item.speak ? MAIN_COLOR : 'red'
  const title = cleanTitle(item.title)

  const styles = createStyles(width, isMobile, txt)
  const isOdd = index % 2 !== 0
  const containerStyle = isOdd ? [styles.container, styles.containerWithRadius] : styles.container

  return (
    <ListItem Component={Pressable} key={item.id.toString()} onPress={() => onPressNews(item)} containerStyle={containerStyle}>
      <View style={styles.overlay} />
      {isOdd ? (
        <>
          {renderContent(item, title, txt, isMobile, styles)}
          <View style={styles.rightContainer}>
            <View style={[styles.imageContainer, styles.rightImageContainer]}>{renderImage(item, styles)}</View>
            {renderSpeakButton(item, color, styles)}
          </View>
        </>
      ) : (
        <>
          <View style={styles.imageContainerLeft}>{renderImage(item, styles)}</View>
          {renderContent(item, title, txt, isMobile, styles)}
          {renderSpeakButton(item, color, styles)}
        </>
      )}
    </ListItem>
  )
}
