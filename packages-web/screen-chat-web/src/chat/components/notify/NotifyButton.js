import { useMemo } from 'react'
import { Platform, TouchableOpacity } from 'react-native'

const IS_IOS = Platform.OS === 'ios'
const IS_ANDROID = Platform.OS === 'android'

const SIZE = { top: IS_ANDROID ? 110 : 90, fab: IS_ANDROID ? 55 : 45 }

const BASE_STYLE = {
  position: 'absolute',
  right: 10,
  top: SIZE.top,
  height: SIZE.fab,
  width: SIZE.fab,
  borderRadius: 30,
  alignItems: 'center',
  justifyContent: 'center'
}

const IOS_EXTRA = {
  opacity: 0.8,
  shadowColor: '#000',
  shadowOpacity: 0.5,
  shadowOffset: { width: 2, height: 2 },
  shadowRadius: 1
}

const ANDROID_EXTRA = {
  elevation: 6
}

const PLATFORM_EXTRA = IS_IOS ? IOS_EXTRA : ANDROID_EXTRA

function NotifyButton({ utils, notifyEnabled, setNotifyEnabled }) {
  const { Icon } = utils

  const buttonStyle = useMemo(
    () => ({
      ...BASE_STYLE,
      ...PLATFORM_EXTRA,
      backgroundColor: notifyEnabled ? 'rgb(45,176,40)' : 'rgb(188,188,188)'
    }),
    [notifyEnabled]
  )

  return (
    <TouchableOpacity style={buttonStyle} onPress={() => setNotifyEnabled(!notifyEnabled)}>
      <Icon type="MaterialIcons" name={notifyEnabled ? 'notifications' : 'notifications-off'} style={{ color: '#fff' }} />
    </TouchableOpacity>
  )
}

export default NotifyButton
