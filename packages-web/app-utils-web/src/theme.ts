/**
 * -----------------------------------------------------------------------
 *  Author      : Alexey Zolotarеv
 *  E-mail      : azesm@me.com
 * -----------------------------------------------------------------------
 */

// @flow
import { DefaultTheme } from '@react-navigation/native'
import { Platform } from 'react-native'
// android: 'rgb(63,81,181)',
const theme = {
  light: {
    ...DefaultTheme,
    dark: false,
    colors: {
      ...DefaultTheme.colors,
      primary: '#FF5D54',
      background: '#f8f8f8',
      backgroundHeader: Platform.select({
        android: '#FFFFFF',
        ios: '#FFFFFF'
      }),
      press: '#DFDFEA',
      text: '#6a6a6a',
      border: '#DFDFEA',
      notification: '#8582EF',
      header: '#6D96FD',
      backgroundPrimary: '#FFFFFF',
      backgroundSecondary: '#F6F6FB',
      textPrimary: '#131921',
      textSecondary: '#818181',
      iconInactive: '#818181',
      iconActive: '#131921',
      textInactive: '#ADAFC6',
      textActive: '#131921',
      textSuccess: '#57E3A0',
      white: '#FFF',
      black: '#000',
      tags: '#DFDFEA',
      tagsText: '#131921',
      filter: '#000',
      answer: '#262E3A',
      link: '#0145fc',
      storyBackground: '#262E3A',
      backgroundEvents: '#EDEDED',
      questBackground: '#FF7C74',
      leftTop: 'rgb(194,230,247)',
      main: 'rgb(66,154,220)'
    },
    ...DefaultTheme.fonts
  },
  dark: {
    ...DefaultTheme,
    dark: true,
    colors: {
      ...DefaultTheme.colors,
      primary: '#FF5D54',
      background: '#262E3A',
      backgroundHeader: '#262E3A',
      press: '#414E5E',
      text: '#DFDFEA',
      border: '#414E5E',
      notification: '#8582EF',
      header: '#6D96FD',
      backgroundPrimary: '#262E3A',
      backgroundSecondary: '#1E2630',
      textPrimary: '#DFDFEA',
      textSecondary: '#9096A4',
      iconInactive: '#818181',
      iconActive: '#FFFFFF',
      textInactive: '#ADAFC6',
      textActive: '#FFFFFF',
      textSuccess: '#57E3A0',
      white: '#FFF',
      black: '#000',
      tags: '#DFDFEA',
      tagsText: '#131921',
      filter: '#FFF',
      answer: '#515458',
      link: '#ffffff',
      storyBackground: '#262E3A',
      backgroundEvents: '#313844',
      questBackground: '#FF7C74',
      leftTop: 'rgb(140,186,192)',
      main: 'rgb(66,154,220)'
    },
    ...DefaultTheme.fonts
  }
}

export type TTheme = typeof theme.light & typeof theme.dark
export type TThemeColors = typeof theme.light.colors & typeof theme.dark.colors

export default theme
