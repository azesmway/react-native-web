import { memo, useMemo, useCallback } from 'react'
import { Appearance, Image, StyleSheet, TouchableOpacity, View } from 'react-native'

import HelpIcon from '../images/information-pngrepo-com.png'
import AskIcon from '../images/question-pngrepo-com.png'
import ShopIcon from '../images/shopping-cart-pngrepo-com.png'
import RatingIcon from '../images/trophy-pngrepo-com.png'

// Extract icon configuration outside component to prevent recreation
const ICON_CONFIG = [
  { icon: HelpIcon, pathSuffix: '/view' },
  { icon: ShopIcon, path: '/mb' },
  { icon: RatingIcon, pathKey: 'huid' },
  { icon: AskIcon, pathSuffix: '' }
]

const ItemMenu = ({ router, item, actions, theme }) => {
  // Memoize color scheme check
  const { bg } = useMemo(() => {
    const isDarkMode = Appearance.getColorScheme() === 'dark'
    return {
      bg: isDarkMode ? theme.dark.colors.background : theme.light.colors.background
    }
  }, [theme])

  // Memoize base path calculation
  const basePath = useMemo(() => `/y/${item.id_post}/h/${Number(item.id_otel) - 100000}`, [item.id_post, item.id_otel])

  // Build icons array with actual paths
  const icons = useMemo(
    () => [
      { icon: HelpIcon, path: `${basePath}/view` },
      { icon: ShopIcon, path: '/mb' },
      { icon: RatingIcon, path: `/rt/${item.huid}/c/1` },
      { icon: AskIcon, path: basePath }
    ],
    [basePath, item.huid]
  )

  // Memoize container style
  const containerStyle = useMemo(
    () => ({
      marginLeft: actions ? 0 : 20,
      flex: 1,
      width: '100%',
      paddingVertical: 5,
      backgroundColor: 'transparent'
    }),
    [actions, bg]
  )

  // Memoize navigation handler
  const handlePress = useCallback(
    path => () => {
      router.replace(path)
    },
    [router]
  )

  return (
    <View style={containerStyle}>
      <View style={styles.row}>
        {icons.map((iconData, index) => (
          <View key={index} style={styles.iconWrapper}>
            <TouchableOpacity onPress={handlePress(iconData.path)}>
              <Image source={iconData.icon} style={styles.iconContainer} />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row'
  },
  iconWrapper: {
    flex: 0.4,
    alignItems: 'center'
  },
  iconContainer: {
    width: 24,
    height: 24
  }
})

export default memo(ItemMenu)
