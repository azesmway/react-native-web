import { Dimensions, Modal, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

const ContextMenu = ({ isCurrentUser, menuVisible, setMenuVisible, menuPosition, MaterialIcons, BlurView, options, runFunctionByIndex, onPressRowLike, currentMessage, onPressRowFavorite }) => {
  const formatTime = date => {
    const d = new Date(date)
    return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = date => {
    const d = new Date(date)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const weekAgo = new Date(today)
    weekAgo.setDate(weekAgo.getDate() - 7)

    if (d.toDateString() === today.toDateString()) {
      return 'Сегодня'
    } else if (d.toDateString() === yesterday.toDateString()) {
      return 'Вчера'
    } else if (d > weekAgo) {
      return d.toLocaleDateString('ru-RU', { weekday: 'long' })
    } else {
      return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
    }
  }

  const menuIcons = {
    Копировать: 'content-copy',
    Ответить: 'reply',
    Поделиться: 'share',
    Редактировать: 'edit',
    Удалить: 'delete-outline', // или "delete"
    Пожаловаться: 'outlined-flag', // или "report"
    Заблокировать: 'block',
    Предупреждение: 'warning-amber', // или "warning"
    'Снять предупреждение': 'warning', // или "warning"
    Забанить: 'gavel', // или "block" с молоточком
    'Снять бан': 'block', // или "block" с молоточком, но с другим цветом
    'На Zagrebon': 'telegram', // или "share" с логотипом
    'Все сообщения': 'forum', // или "chat"
    'Вся переписка': 'chat', // или "comment"
    Закрыть: 'close'
  }

  const getIconColor = title => {
    switch (title) {
      case 'Удалить':
      case 'Заблокировать':
      case 'Забанить':
      case 'Пожаловаться':
        return '#FF3B30' // Красный для опасных действий
      case 'Предупреждение':
        return '#FF9500' // Оранжевый для предупреждений
      default:
        return '#007AFF' // Синий для обычных действий
    }
  }

  const commonEmojis = ['📌', '❤️', '🔥', '😁', '😢', '👍', '👎']

  return (
    <Modal visible={menuVisible} transparent animationType="fade" onRequestClose={() => setMenuVisible(false)}>
      <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
        <BlurView intensity={20} style={styles.modalBlur}>
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.menuContainer,
                {
                  position: 'absolute',
                  top: menuPosition.top,
                  left: menuPosition.left
                }
              ]}>
              {/*<View style={styles.menuHeader}>*/}
              {/*  <Text style={styles.menuDate}>*/}
              {/*    {formatDate(createdAt)} в {formatTime(createdAt)}*/}
              {/*  </Text>*/}
              {/*</View>*/}

              <View style={styles.reactionsRow}>
                {commonEmojis.map((emoji, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.emojiButton}
                    onPress={() => {
                      if (index === 0) {
                        onPressRowFavorite(currentMessage)
                      } else if (index === 1) {
                        onPressRowLike(currentMessage)
                      }

                      setMenuVisible(false)
                    }}>
                    <Text style={styles.emojiText}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
                {/*  <TouchableOpacity*/}
                {/*    style={styles.moreEmojisButton}*/}
                {/*    onPress={() => {*/}
                {/*      setShowReactions(true)*/}
                {/*      setMenuVisible(false)*/}
                {/*    }}>*/}
                {/*    <MaterialIcons name="add" size={20} color="#007AFF" />*/}
                {/*  </TouchableOpacity>*/}
              </View>

              <View style={styles.menuDivider} />

              <ScrollView style={styles.actionButtons}>
                {options.map((name, index) => {
                  return (
                    <TouchableOpacity
                      key={String(index)}
                      style={[styles.actionButton, { borderBottomWidth: index === options.length - 1 ? 0 : 1 }]}
                      onPress={() => {
                        runFunctionByIndex(index)
                        setMenuVisible(false)
                      }}>
                      <MaterialIcons name={menuIcons[name]} size={22} color={getIconColor(name)} />
                      <Text style={styles.actionText}>{name}</Text>
                    </TouchableOpacity>
                  )
                })}

                {/*<TouchableOpacity*/}
                {/*  style={styles.actionButton}*/}
                {/*  onPress={() => {*/}
                {/*    onForward?.(id)*/}
                {/*    setMenuVisible(false)*/}
                {/*  }}>*/}
                {/*  <MaterialIcons name="forward" size={22} color="#007AFF" />*/}
                {/*  <Text style={styles.actionText}>Forward</Text>*/}
                {/*</TouchableOpacity>*/}

                {/*<TouchableOpacity*/}
                {/*  style={styles.actionButton}*/}
                {/*  onPress={() => {*/}
                {/*    onCopy?.(id)*/}
                {/*    setMenuVisible(false)*/}
                {/*  }}>*/}
                {/*  <MaterialIcons name="content-copy" size={22} color="#007AFF" />*/}
                {/*  <Text style={styles.actionText}>Copy</Text>*/}
                {/*</TouchableOpacity>*/}

                {/*{isCurrentUser && (*/}
                {/*  <>*/}
                {/*    <TouchableOpacity*/}
                {/*      style={styles.actionButton}*/}
                {/*      onPress={() => {*/}
                {/*        onEdit?.(id)*/}
                {/*        setMenuVisible(false)*/}
                {/*      }}>*/}
                {/*      <MaterialIcons name="edit" size={22} color="#007AFF" />*/}
                {/*      <Text style={styles.actionText}>Edit</Text>*/}
                {/*    </TouchableOpacity>*/}

                {/*    <View style={styles.menuDivider} />*/}

                {/*    <TouchableOpacity*/}
                {/*      style={[styles.actionButton, styles.deleteButton]}*/}
                {/*      onPress={() => {*/}
                {/*        onDelete?.(id)*/}
                {/*        setMenuVisible(false)*/}
                {/*      }}>*/}
                {/*      <MaterialIcons name="delete" size={22} color="#FF3B30" />*/}
                {/*      <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>*/}
                {/*    </TouchableOpacity>*/}
                {/*  </>*/}
                {/*)}*/}
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </BlurView>
      </TouchableWithoutFeedback>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 2,
    marginVertical: 1
  },
  currentUserContainer: {
    justifyContent: 'flex-end'
  },
  otherUserContainer: {
    justifyContent: 'flex-start'
  },
  avatarContainer: {
    width: 36,
    height: 36,
    marginRight: 8,
    alignSelf: 'flex-end',
    position: 'relative'
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18
  },
  avatarPlaceholder: {
    backgroundColor: '#40A7E3',
    justifyContent: 'center',
    alignItems: 'center'
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600'
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: 'white',
    borderRadius: 10,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center'
  },
  contentContainer: {
    maxWidth: SCREEN_WIDTH * 0.75
  },
  currentUserContent: {
    alignItems: 'flex-end'
  },
  otherUserContent: {
    alignItems: 'flex-start'
  },
  senderName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#40A7E3',
    marginBottom: 2,
    marginLeft: 4
  },
  messageWrapper: {
    maxWidth: '100%'
  },
  currentUserWrapper: {
    alignItems: 'flex-end'
  },
  otherUserWrapper: {
    alignItems: 'flex-start'
  },
  messageBubble: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 80,
    maxWidth: '100%'
  },
  currentUserBubble: {
    backgroundColor: '#EFFDDE',
    borderBottomRightRadius: 4
  },
  otherUserBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4
  },
  imageBubble: {
    padding: 0,
    overflow: 'hidden'
  },
  messageImage: {
    width: 270,
    height: 150,
    borderRadius: 16
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20
  },
  messageTextOnly: {
    paddingVertical: 4
  },
  currentUserText: {
    color: '#000000'
  },
  otherUserText: {
    color: '#000000'
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 2,
    gap: 4
  },
  timeText: {
    fontSize: 11
  },
  currentUserMeta: {
    color: '#8E8E93'
  },
  otherUserMeta: {
    color: '#8E8E93'
  },
  editedText: {
    fontSize: 11,
    marginRight: 4
  },
  readIcon: {
    marginLeft: 2
  },
  replyPreview: {
    flexDirection: 'row',
    marginBottom: 4,
    maxWidth: '90%'
  },
  currentUserReply: {
    alignSelf: 'flex-end'
  },
  otherUserReply: {
    alignSelf: 'flex-start'
  },
  replyLine: {
    width: 2,
    backgroundColor: '#40A7E3',
    marginRight: 6,
    borderRadius: 1
  },
  replyContent: {
    flex: 1
  },
  replySender: {
    fontSize: 12,
    fontWeight: '600',
    color: '#40A7E3',
    marginBottom: 2
  },
  replyText: {
    fontSize: 12,
    color: '#8E8E93'
  },
  reactionsContainer: {
    flexDirection: 'row',
    marginTop: 4,
    gap: 4,
    maxWidth: '100%',
    flexWrap: 'wrap'
  },
  currentUserReactions: {
    justifyContent: 'flex-end'
  },
  otherUserReactions: {
    justifyContent: 'flex-start'
  },
  reactionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    gap: 2,
    borderWidth: 1,
    borderColor: '#E5E5EA'
  },
  reactionBadgeActive: {
    backgroundColor: '#EFFDDE',
    borderColor: '#40A7E3'
  },
  reactionEmoji: {
    fontSize: 12
  },
  reactionCount: {
    fontSize: 11,
    color: '#8E8E93',
    fontWeight: '500'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  menuContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 8,
    // width: 260,
    ...Platform.select({
      web: {
        boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.15)'
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8
      }
    })
  },
  menuHeader: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA'
  },
  menuDate: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center'
  },
  reactionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    paddingHorizontal: 4
  },
  emojiButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center'
  },
  emojiText: {
    fontSize: 22
  },
  moreEmojisButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center'
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#E5E5EA',
    marginVertical: 4
  },
  actionButtons: {
    paddingVertical: 4,
    maxHeight: 400
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA'
  },
  actionText: {
    fontSize: 14,
    color: '#636363'
  },
  deleteButton: {
    marginTop: 0
  },
  deleteText: {
    color: '#FF3B30'
  },
  emojiPickerContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    width: SCREEN_WIDTH * 0.9,
    maxHeight: 400,
    alignSelf: 'center',
    marginTop: 'auto',
    marginBottom: 'auto'
  },
  emojiPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA'
  },
  emojiPickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000'
  },
  closeButton: {
    padding: 4
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8
  },
  gridEmojiButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7'
  },
  gridEmojiText: {
    fontSize: 24
  },
  modalBlur: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)'
  }
})

export default ContextMenu
