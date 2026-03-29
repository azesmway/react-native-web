import { useCallback, useMemo } from 'react'
import { Image, Platform, Text, TouchableOpacity, View } from 'react-native'

const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
const { setOpenCurrentMessageId } = GLOBAL_OBJ.onlinetur.storage

const parseParentImage = image_parent => {
  if (!image_parent || image_parent === '') return null
  try {
    return JSON.parse(image_parent)[0]?.path
  } catch {
    return image_parent
  }
}

function ReplyMessage({ id_parent, image_parent, msg_parent, name_parent, is_owner, history, onRefreshChat, setChatOpenIdMessage }) {
  const parentImage = useMemo(() => parseParentImage(image_parent), [image_parent])

  const txt = msg_parent && msg_parent !== 'null' && msg_parent !== '' ? msg_parent : ''

  const openNews = useCallback(() => {
    if (!id_parent) return

    if (Number(id_parent) < 0) {
      history('/n/' + Number(id_parent) * -1)
    } else {
      setOpenCurrentMessageId(Number(id_parent))
      setChatOpenIdMessage(true)
      onRefreshChat()
    }
  }, [id_parent, history, setChatOpenIdMessage, onRefreshChat])

  const imageNode = useMemo(() => {
    if (!parentImage) return null
    if (parentImage.includes('min.pdf')) return <View />
    return <Image source={{ uri: parentImage }} style={{ marginLeft: 10, width: 40, height: 40 }} />
  }, [parentImage])

  return (
    <View style={{ width: '100%' }}>
      <TouchableOpacity
        style={{
          opacity: 0.7,
          marginLeft: 16,
          marginRight: 10,
          flexDirection: 'row',
          backgroundColor: '#e8e8e8',
          padding: 5,
          borderRadius: 10
        }}
        onPress={openNews}>
        <View style={{ width: 2, backgroundColor: 'rgb(63,81,181)' }} />
        <View style={{ flex: 1, flexDirection: 'row' }}>
          {imageNode}
          <View style={{ flex: 1 }}>
            <Text style={{ color: 'rgb(63,81,181)', paddingLeft: 5, fontSize: 14, fontWeight: 'bold' }}>{name_parent}</Text>
            <Text ellipsizeMode="tail" numberOfLines={2} style={{ color: '#000', paddingLeft: 5, marginRight: 10, fontSize: 14 }}>
              {txt}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  )
}

export default ReplyMessage
