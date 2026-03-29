/**
 * -----------------------------------------------------------------------
 *  Author      : Alexey Zolotarеv
 *  E-mail      : azesm@me.com
 * -----------------------------------------------------------------------
 */

import { fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { Platform } from 'react-native'

const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
const { getAppConfig, getSelectCategory } = GLOBAL_OBJ.onlinetur.storage
const JSON_DATA = getAppConfig()

export const baseQuery = fetchBaseQuery({
  baseUrl: JSON_DATA.constants.url_main,
  prepareHeaders: (headers, { getState }) => {
    return headers
  }
})

export const baseQueryWithReauth = async (args, api, extraOptions) => {
  const lang = api.getState().app.appLangInterface
  const user = api.getState().user.user
  const cat = getSelectCategory() // api.getState().filter.filterChat.selectCategory
  const app = Platform.OS === 'ios' ? '11' : Platform.OS === 'web' ? '12' : '12'

  args += '&category_id=' + (cat.id ? cat.id : '1') + '&lg=' + lang + '&app=' + app

  if (user && user.device && user.device.token) {
    args += '&apid=' + user.id_user + (user.is_sotr === 1 ? '&agn=2' : '')
  }

  args += '&site=' + (Platform.OS === 'web' ? getAppConfig().siteName : Platform.OS === 'ios' ? 'ios' : 'android')

  return baseQuery(args, api, extraOptions)
}
