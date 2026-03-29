/**
 * -----------------------------------------------------------------------
 *  Author      : Alexey Zolotarеv
 *  E-mail      : azesm@me.com
 * -----------------------------------------------------------------------
 */

import { getLocales } from 'expo-localization'
import { I18n } from 'i18n-js'

import en from './locales/en.json'
import ru from './locales/ru.json'

const i18n = new I18n()

i18n.store(en)
i18n.store(ru)

const locales = getLocales()

if (Array.isArray(locales)) {
  i18n.locale = locales[0].languageCode
}

i18n.defaultLocale = 'ru'
i18n.translations = {
  ru,
  en
}

function setLocale(locale) {
  i18n.locale = locale
}

function getLocale() {
  return i18n.locale
}

// @ts-ignore
const t = (key, optional = {}) => i18n.t(key, optional)

export { getLocale, setLocale, t }
