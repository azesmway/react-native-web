/**
 * -----------------------------------------------------------------------
 *  Author      : Alexey Zolotarеv
 *  E-mail      : azesm@me.com
 * -----------------------------------------------------------------------
 */

import isEmpty from 'lodash/isEmpty'
import { memo, useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, Platform, View } from 'react-native'

const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
const { MAIN_COLOR } = GLOBAL_OBJ.onlinetur.constants
const { getAppConstants } = GLOBAL_OBJ.onlinetur.storage

// Memoized loading component to avoid re-renders
const LoadingView = memo(() => (
  <View style={{ flex: 1, alignItems: 'center' }}>
    <ActivityIndicator animating size="large" color={MAIN_COLOR} />
  </View>
))

// Memoized web loading component
const WebLoadingView = memo(() => (
  <View style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
    <ActivityIndicator size="large" />
  </View>
))

const Bonus = memo(({ utils, setHeaderParams, user, location }) => {
  const [isLoadingIFrame, setIsLoadingIFrame] = useState(true)
  const { WebView, t } = utils

  // Set header params on mount
  useEffect(() => {
    const params = {
      screen: 'bonus',
      title: t('screens.bonus.title'),
      subtitle: t('screens.bonus.subtitle')
    }
    setHeaderParams(params)
  }, [setHeaderParams, t])

  // Memoize URL construction to avoid recalculation on every render
  const urlBonus = useMemo(() => {
    const token = !isEmpty(user.device) ? user.device.token : ''
    const android_id_install = user.android_id_install
    const path = getAppConstants().url_api_main
    let url = `${path}/v2/bonus?android_id_install=${android_id_install}&token=${token}&mobile=1`

    if (location?.state?.id_hotel) {
      url += `&id_hotel=${location.state.id_hotel}`
    }

    return url
  }, [user.device, user.android_id_install, location?.state?.id_hotel])

  // Handlers
  const handleIframeLoad = () => setIsLoadingIFrame(false)
  const handleIframeError = () => console.log('error')

  if (Platform.OS === 'web') {
    return (
      <>
        {isLoadingIFrame && <WebLoadingView />}
        <iframe src={urlBonus} style={{ width: '100vw', height: '100vh' }} frameBorder="0" onLoad={handleIframeLoad} onError={handleIframeError} />
      </>
    )
  }

  return (
    <WebView
      style={{ flex: 1 }}
      useWebKit
      javaScriptEnabled
      domStorageEnabled
      source={{ uri: urlBonus }}
      renderLoading={LoadingView}
      startInLoadingState
      scalesPageToFit
      automaticallyAdjustContentInsets={false}
      mediaPlaybackRequiresUserAction
    />
  )
})

Bonus.displayName = 'Bonus'

export default Bonus
