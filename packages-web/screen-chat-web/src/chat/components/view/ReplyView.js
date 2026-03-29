import { useCallback, useMemo } from 'react'
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

const COLORS = {
  BORDER: '#757575',
  BACKGROUND: '#ededed',
  ACCENT: 'rgb(63,81,181)',
  NAME: 'rgb(51,181,229)',
  MESSAGE: '#757575',
  CLOSE: 'red'
}

const HEIGHT_REPLY = 100
const HEIGHT_IMAGES_MOBILE = 70
const HEIGHT_IMAGES_DESKTOP = 130

const EMPTY_REPLY = {
  replyId: null,
  id_parent: '',
  name_parent: '',
  msg_parent: '',
  id_post: '',
  data: {}
}

function ReplyView({ utils, nameParent, msgParent, chatComponent, setChatReplyMessage }) {
  const { Icon, isMobile } = utils

  // Не используется в рендере, но сохраняем для совместимости с внешним кодом
  const HEIGHT_IMAGES = isMobile ? HEIGHT_IMAGES_MOBILE : HEIGHT_IMAGES_DESKTOP

  const handleClearReply = useCallback(() => setChatReplyMessage(EMPTY_REPLY), [setChatReplyMessage])

  const thumbnail = useMemo(() => {
    const imageMin = chatComponent?.props?.replyMessage?.data?.image_min
    if (!imageMin?.length || imageMin[0] === '') return null
    return <Image source={{ uri: imageMin[0] }} style={styles.thumbnail} />
  }, [chatComponent?.props?.replyMessage?.data?.image_min])

  return (
    <View style={styles.container}>
      <View style={styles.accent} />

      <View style={styles.contentRow}>
        {thumbnail}
        <View style={styles.textContainer}>
          <Text style={styles.nameText}>{nameParent}</Text>
          <Text style={styles.messageText} ellipsizeMode="tail" numberOfLines={2}>
            {msgParent}
          </Text>
        </View>
      </View>

      <View style={styles.closeContainer}>
        <TouchableOpacity onPress={handleClearReply}>
          <Icon name="close" size={35} color={COLORS.CLOSE} />
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    height: HEIGHT_REPLY,
    flexDirection: 'row',
    paddingLeft: 6,
    borderTopColor: COLORS.BORDER,
    backgroundColor: COLORS.BACKGROUND,
    opacity: 0.7
  },
  accent: {
    height: HEIGHT_REPLY,
    width: 4,
    backgroundColor: COLORS.ACCENT
  },
  contentRow: {
    flex: 1,
    flexDirection: 'row'
  },
  thumbnail: {
    marginLeft: 5,
    marginTop: 5,
    width: 40,
    height: 40
  },
  textContainer: {
    flexDirection: 'column',
    flex: 5
  },
  nameText: {
    color: COLORS.NAME,
    paddingLeft: 10,
    paddingTop: 5,
    fontWeight: 'bold',
    fontSize: 16
  },
  messageText: {
    color: COLORS.MESSAGE,
    paddingLeft: 10,
    paddingTop: 5,
    fontSize: 14
  },
  closeContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingRight: 10,
    paddingTop: 10
  }
})

export default ReplyView
