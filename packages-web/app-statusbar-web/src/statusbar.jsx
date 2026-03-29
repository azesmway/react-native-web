import { lazy, Suspense } from 'react'
import { View } from 'react-native'

const Radio = lazy(() => import('./components/radio'))

const StatusBar = props => {
  const { statusBar } = props

  if (statusBar.type && statusBar.type === 'radio') {
    return (
      <View style={{ width: '100%', height: 50, alignItems: 'center' }}>
        <Suspense>
          <Radio />
        </Suspense>
      </View>
    )
  }

  return <></>
}

export default StatusBar
