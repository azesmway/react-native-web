/**
 * -----------------------------------------------------------------------
 *  Author      : Alexey Zolotarеv
 *  E-mail      : azesm@me.com
 * -----------------------------------------------------------------------
 */

export const getRTKQueryDataPosts = async (android_id_install, token, fcmToken, id, expoToken, device) => {
  const { appApi, dispatch } = await import('app-store-web')
  const { data } = await dispatch(
    appApi.endpoints.getDataPosts.initiate({
      android_id_install: android_id_install,
      token: token,
      fcmToken: fcmToken,
      category: id,
      expoToken: expoToken,
      device: device ? device : ''
    })
  )

  return data
}

export const getRTKQueryDataPostsAgent = async (android_id_install, token, fcmToken, id, expoToken, device) => {
  const { appApi, dispatch } = await import('app-store-web')
  const { data } = await dispatch(
    appApi.endpoints.getDataPostsAgent.initiate({
      android_id_install: android_id_install,
      token: token,
      fcmToken: fcmToken,
      category: id,
      expoToken: expoToken,
      device: device ? device : ''
    })
  )

  return data
}

export const getRTKQueryCategoryList = async (android_id_install, token) => {
  const { appApi, dispatch } = await import('app-store-web')
  const { data, error } = await dispatch(
    appApi.endpoints.getCategoryList.initiate({
      android_id_install: android_id_install,
      token: token
    })
  )

  return data
}

export const getRTKQueryRatingCategory = async id_category => {
  const { appApi, dispatch } = await import('app-store-web')
  const { data } = await dispatch(
    appApi.endpoints.getRatingCategory.initiate(
      {
        id_category: id_category
      },
      { subscribe: false, forceRefetch: true }
    )
  )

  return data
}
