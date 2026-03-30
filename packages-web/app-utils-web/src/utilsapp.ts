import 'moment/locale/ru'

import moment from 'moment'
moment.locale(['ru'])

import firebase from './firebase/config'
import { matchPath, useWithRouter, withRouter } from './helpers'
import { getLocale, setLocale, t } from './i18n'
import SvgIcon from './svg'
import theme from './theme'
import colors from './theme'
import { getObjectAssign, ios26 } from './utils'
import VideoUrl from './videoUrl'

export { colors, firebase, getLocale, getObjectAssign, ios26, matchPath, moment, setLocale, SvgIcon, t, theme, useWithRouter, VideoUrl, withRouter }
