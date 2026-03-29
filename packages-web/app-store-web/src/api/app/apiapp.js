import { createApi } from '@reduxjs/toolkit/query/react'
import { Platform } from 'react-native'

import { baseQueryWithReauth } from '../query/query'

const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
const { getAppConfig } = GLOBAL_OBJ.onlinetur.storage
const JSON_DATA = getAppConfig()

export const appApi = createApi({
  reducerPath: 'appApi',
  tagTypes: ['App'],
  baseQuery: baseQueryWithReauth,
  endpoints: builder => ({
    getDataPosts: builder.query({
      query: ({ android_id_install, token, fcmToken, category, short, expoToken, device }) => {
        const path = JSON_DATA.constants.url_api3_path
        const deviceId = android_id_install !== 'null' && android_id_install !== 'undefined' && android_id_install ? android_id_install : ''
        const sh = short ? '&short=1' : ''

        // eslint-disable-next-line max-len
        let url = `${path}/get_list_posts.php?token=${token}&push_id=${fcmToken ? fcmToken : ''}&expo_push_id=${expoToken ? expoToken : ''}&del=0&android_id_install=${deviceId}&id_categories=${category}${sh}${device}`

        if (deviceId !== '') {
          // eslint-disable-next-line max-len
          url = `${path}/get_list_posts.php?token=${token}&push_id=${fcmToken ? fcmToken : ''}&expo_push_id=${expoToken ? expoToken : ''}&del=0&android_id_install=${deviceId}&id_categories=${category}${sh}${device}`
        }

        return url
      }
    }),
    getDataPostsAgent: builder.query({
      query: ({ android_id_install, token, fcmToken, category, expoToken, device }) => {
        const path = JSON_DATA.constants.url_api3_path
        const deviceId = android_id_install !== 'null' && android_id_install !== 'undefined' && android_id_install ? android_id_install : ''

        // eslint-disable-next-line max-len
        return `${path}/get_list_posts.php?token=${token}&sotr_chat=1&del=0&tip_chat=1&push_id=${fcmToken ? fcmToken : ''}&expo_push_id=${expoToken ? expoToken : ''}&android_id_install=${deviceId}&id_categories=${category}${device}`
      }
    }),
    getUserCross: builder.query({
      query: logout => {
        const url = JSON_DATA.constants.url_auth + JSON_DATA.constants.url_auth_api3 + JSON_DATA.constants.url_cross + '?_dc=' + new Date().getTime() + (logout ? '&logout=1' : '')

        return url
      }
    }),
    getCategoryList: builder.query({
      query: ({ android_id_install, token }) => {
        const deviceId = android_id_install !== 'null' && android_id_install !== 'undefined' && android_id_install ? android_id_install : ''
        const path = JSON_DATA.constants.url_api3_path

        return `${path}/get_list_categories.php?android_id_install=${deviceId}&token=${token}`
      }
    }),
    getRatingCategory: builder.query({
      query: id_category => {
        return JSON_DATA.constants.url_categories
      }
    })
  })
})

export const { useGetDataPostsQuery, useGetDataPostsAgentQuery, useGetUserCrossQuery, useGetCategoryListQuery, useGetRatingCategoryQuery } = appApi
