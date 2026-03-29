import { Platform, StyleSheet } from 'react-native'

const INPUT_PADDING = 200
const BUTTON_WIDTH = 30
const MAX_INPUT_HEIGHT = 200

// Константы выносим за пределы компонента
const BASE_STYLES = StyleSheet.create({
  container: {
    // borderTopWidth: StyleSheet.hairlineWidth,
    // borderTopColor: '#b2b2b2',
    // borderBottomWidth: StyleSheet.hairlineWidth,
    // borderBottomColor: '#b2b2b2',
    // backgroundColor: '#fff'
    // width: '100%'
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#f0f0f0',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    outlineStyle: 'none'
  },
  primary: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    padding: 10
  },
  errorContainer: {
    width: '100%',
    backgroundColor: 'transparent',
    height: 46
  },
  errorCenter: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  errorText: {
    fontSize: 14,
    alignSelf: 'center',
    textAlign: 'center',
    color: 'red'
  },
  inputWrapper: {
    marginHorizontal: 10,
    justifyContent: 'center'
  },
  actionsRow: {
    flexDirection: 'row'
  }
  // inputWrapper: {
  //   flexDirection: 'row',
  //   alignItems: 'flex-end',
  //   padding: 10,
  //   backgroundColor: '#f0f0f0',
  //   borderTopWidth: 1,
  //   borderTopColor: '#ddd'
  // },
  // input: {
  //   flex: 1,
  //   backgroundColor: '#fff',
  //   borderRadius: 20,
  //   paddingHorizontal: 15,
  //   fontSize: 14,
  //   lineHeight: 16,
  //   minHeight: 28
  // },
  // inputScrollable: {
  //   borderRadius: 10
  // }
})

// Мемоизированные функции для динамических стилей
const getInputStyle = (heightInput, textColor, windowWidth) => {
  'worklet' // Для возможной работы с Reanimated
  const baseStyle = {
    color: textColor || '#000',
    fontSize: 14,
    width: windowWidth - INPUT_PADDING,
    marginTop: 3,
    marginLeft: 5,
    outlineStyle: 'none',
    borderWidth: 0
  }
  return heightInput >= MAX_INPUT_HEIGHT ? { ...baseStyle, height: MAX_INPUT_HEIGHT - 10 } : { ...baseStyle, height: heightInput }
}

const getButtonStyle = heightInput => {
  'worklet'
  return {
    width: BUTTON_WIDTH,
    alignItems: 'center',
    justifyContent: heightInput < 30 ? 'center' : 'flex-end',
    paddingBottom: heightInput < 30 ? 0 : 5
  }
}

const getAttachButtonStyle = heightInput => {
  'worklet'
  return {
    width: BUTTON_WIDTH,
    alignItems: 'center',
    justifyContent: heightInput < 30 ? 'center' : 'flex-end',
    bottom: 3
    // height: 33
  }
}

// Мемоизируем markdown стили, так как они не меняются
const markdownStyle = (() => {
  const FONT_FAMILY_MONOSPACE = Platform.select({
    ios: 'Courier',
    default: 'monospace'
  })

  const FONT_FAMILY_EMOJI = Platform.select({
    ios: 'System',
    android: 'Noto Color Emoji',
    default: 'System, Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji'
  })

  return {
    syntax: { color: 'gray' },
    link: { color: 'blue' },
    h1: { fontSize: 15 },
    emoji: { fontSize: 20, fontFamily: FONT_FAMILY_EMOJI },
    blockquote: { borderColor: 'gray', borderWidth: 6, marginLeft: 6, paddingLeft: 6 },
    code: { fontFamily: FONT_FAMILY_MONOSPACE, fontSize: 16, color: 'black', backgroundColor: 'lightgray' },
    pre: { fontFamily: FONT_FAMILY_MONOSPACE, fontSize: 20, color: 'black', backgroundColor: 'lightgray' },
    mentionHere: { color: 'green', backgroundColor: 'lime' },
    mentionUser: { color: 'blue', backgroundColor: 'cyan' }
  }
})()

export const styles = {
  ...BASE_STYLES,
  getInputStyle,
  getButtonStyle,
  getAttachButtonStyle,
  markdownStyle
}
