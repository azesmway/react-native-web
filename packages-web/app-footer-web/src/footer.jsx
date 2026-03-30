import React, { lazy, Suspense } from 'react'
import { Platform, View } from 'react-native'

const Curved = lazy(() => import('./curved'))

const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
const { getSafeAreaInsets } = GLOBAL_OBJ.onlinetur.storage

const StatusBar = props => {
  const { footerBar } = props

  if (footerBar.type && footerBar.type === 'curved') {
    return (
      <View style={{ width: '100%', position: 'absolute', bottom: 0, backgroundColor: '#fff', height: getSafeAreaInsets().bottom, alignSelf: 'center' }}>
        <Suspense fallback={null}>
          <Curved footerBar={footerBar} />
        </Suspense>
      </View>
    )
  }

  return <></>
}

export default StatusBar
