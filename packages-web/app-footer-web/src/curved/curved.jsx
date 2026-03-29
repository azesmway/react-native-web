import React, { useCallback, useMemo } from 'react'
import { Appearance, Dimensions, Image, Platform, Text, TouchableOpacity, View } from 'react-native'

const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
const { MAIN_COLOR } = GLOBAL_OBJ.onlinetur.constants
const { getSafeAreaInsets } = GLOBAL_OBJ.onlinetur.storage

// Extract constants
const IMAGE_SIZE = { width: 26, height: 26 }
const BUTTON_SIZE = 52
const BUTTON_RADIUS = 28
const BUTTON_BG_COLOR = '#ffea00'

// Pre-compute static shadow styles
const SHADOW_IOS = {
  shadowColor: '#000',
  shadowOffset: { width: 2, height: 3 },
  shadowOpacity: 0.2,
  shadowRadius: 3.41,
  elevation: 1
}

const SHADOW_ANDROID = {
  shadowColor: '#000',
  shadowOffset: { width: 3, height: 3 },
  shadowOpacity: 0.2,
  shadowRadius: 3.41,
  elevation: 2
}

const CURVED_IOS = {
  shadowColor: '#DDDDDD',
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 1,
  shadowRadius: 5
}

const CURVED_ANDROID = {}

// Static base styles
const CONTAINER_STYLE = {
  alignSelf: 'center',
  position: 'absolute',
  bottom: getSafeAreaInsets().bottom,
  backgroundColor: 'transparent'
}

const INNER_CONTAINER_STYLE = { backgroundColor: 'transparent' }

const HIGHLIGHTED_BUTTON_BASE = {
  position: 'absolute',
  width: BUTTON_SIZE,
  height: BUTTON_SIZE,
  borderRadius: BUTTON_RADIUS,
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: BUTTON_BG_COLOR
}

const REGULAR_BUTTON_BASE = {
  position: 'absolute',
  width: 80,
  height: 50,
  alignItems: 'center',
  justifyContent: 'center',
  bottom: Platform.OS === 'web' ? 0 : 5
}

const Curved = props => {
  const { position, leftIcon, centerIcon, rightIcon } = props.footerBar
  const { isMobile, Icon, CurvedViewComponent, getPathUp, theme, scale } = props.utils
  const { width } = Dimensions.get('window')

  const isDarkMode = Appearance.getColorScheme() === 'dark'
  const textColor = isDarkMode ? theme.dark.colors.text : theme.light.colors.text

  // Use pre-computed static values
  const shadow = Platform.OS === 'ios' ? SHADOW_IOS : SHADOW_ANDROID
  const curved = Platform.OS === 'ios' ? CURVED_IOS : CURVED_ANDROID

  const path = useMemo(() => getPathUp(isMobile ? width : width / 2, 100, isMobile ? 50 : 40, true, position), [isMobile, width, position, getPathUp])

  const circleWidth = useMemo(() => scale(isMobile ? 50 : 36), [isMobile, scale])

  // Memoize computed dimensions
  const dimensions = useMemo(
    () => ({
      containerWidth: isMobile ? width : width / 2,
      containerHeight: isMobile ? 90 : 110,
      highlightedBottom: isMobile ? 22 : 42,
      highlightedBottomAlt: isMobile ? 22 : 32
    }),
    [isMobile, width]
  )

  // Memoize position-specific styles
  const positionStyles = useMemo(
    () => ({
      center: { alignSelf: 'center', bottom: dimensions.highlightedBottom },
      right: {
        alignSelf: 'flex-end',
        bottom: dimensions.highlightedBottomAlt,
        left: dimensions.containerWidth - circleWidth * 1.6
      },
      left: {
        alignSelf: 'flex-start',
        bottom: dimensions.highlightedBottomAlt,
        left: isMobile ? circleWidth / 1.6 : circleWidth / 1.25
      }
    }),
    [dimensions, circleWidth, isMobile]
  )

  const renderIcon = useCallback(
    (iconConfig, size = 22) => (
      <>
        {iconConfig.icon && <Icon type={iconConfig.type} name={iconConfig.icon} size={iconConfig.size || size} color={size === 38 ? 'red' : MAIN_COLOR} />}
        {iconConfig.img && <Image source={iconConfig.img} style={IMAGE_SIZE} />}
        {iconConfig.name && <Text style={{ color: textColor, fontSize: 12, textAlign: size === 22 ? 'center' : undefined }}>{iconConfig.name}</Text>}
      </>
    ),
    [textColor, Icon]
  )

  const renderHighlightedButton = useCallback(
    (iconConfig, onPress, styleOverrides) => (
      <TouchableOpacity onPress={onPress} style={[HIGHLIGHTED_BUTTON_BASE, shadow, styleOverrides]}>
        {renderIcon(iconConfig, 38)}
      </TouchableOpacity>
    ),
    [shadow, renderIcon]
  )

  const renderRegularButton = useCallback(
    (iconConfig, onPress, styleOverrides) => (
      <TouchableOpacity onPress={onPress} style={[REGULAR_BUTTON_BASE, styleOverrides]}>
        {renderIcon(iconConfig)}
      </TouchableOpacity>
    ),
    [renderIcon]
  )

  return (
    <View style={CONTAINER_STYLE}>
      <View style={INNER_CONTAINER_STYLE}>
        <CurvedViewComponent
          style={{ ...curved, backgroundColor: 'transparent' }}
          width={dimensions.containerWidth}
          height={dimensions.containerHeight}
          bgColor={'#f6f6f6'}
          path={path}
          borderColor={'#c3c3c3'}
          borderWidth={1}
          circleWidth={50}
        />

        {position === 'CENTER' && renderHighlightedButton(centerIcon, centerIcon.onPress, positionStyles.center)}
        {position === 'RIGHT' && renderHighlightedButton(rightIcon, rightIcon.onPress, positionStyles.right)}
        {position === 'LEFT' && renderHighlightedButton(leftIcon, leftIcon.onPress, positionStyles.left)}

        {position !== 'CENTER' && renderRegularButton(centerIcon, centerIcon.onPress, { alignSelf: 'center', borderRadius: 30 })}
        {position !== 'LEFT' && renderRegularButton(leftIcon, leftIcon.onPress, { left: 10 })}
        {position !== 'RIGHT' && renderRegularButton(rightIcon, rightIcon.onPress, { right: 10 })}
      </View>
    </View>
  )
}

export default Curved
