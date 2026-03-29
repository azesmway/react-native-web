import { useState } from 'react'
import { Dimensions, Image, Modal, Platform, StatusBar, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native'

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const STATUS_BAR_HEIGHT = StatusBar.currentHeight || 0

interface MessageProps {
  id: string
  text?: string
  image?: string
  sender: {
    id: string
    name: string
    avatar?: string
    isVerified?: boolean
  }
  createdAt: string | Date
  isCurrentUser?: boolean
  isEdited?: boolean
  reactions?: {
    emoji: string
    count: number
    users: string[]
  }[]
  replyTo?: {
    id: string
    text: string
    sender: string
  }
  onReactionAdd?: (messageId: string, emoji: string) => void
  onReply?: (messageId: string) => void
  onEdit?: (messageId: string) => void
  onDelete?: (messageId: string) => void
  onCopy?: (messageId: string) => void
  onForward?: (messageId: string) => void
  onSelect?: (messageId: string) => void
  onAvatarPress?: (userId: string) => void
  user: any
  utils: any
}

const Message: React.FC<MessageProps> = ({
  id,
  text,
  image,
  sender,
  createdAt,
  isEdited = false,
  reactions = [],
  replyTo,
  onReactionAdd,
  onReply,
  onEdit,
  onDelete,
  onCopy,
  onForward,
  onSelect,
  onAvatarPress,
  user,
  utils
}) => {
  const { MaterialIcons } = utils
  const isCurrentUser = sender.id === user.id_user

  const [menuVisible, setMenuVisible] = useState(false)
  const [showReactions, setShowReactions] = useState(false)
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 })

  const formatTime = (date: string | Date) => {
    const d = new Date(date)
    return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (date: string | Date) => {
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

  const commonEmojis = ['👍', '❤️', '🔥', '🥰', '😁', '😮', '😢', '👎']

  const handleLongPress = (event: any) => {
    if (event.nativeEvent) {
      setMenuPosition({
        x: event.nativeEvent.pageX,
        y: event.nativeEvent.pageY
      })
    }
    setMenuVisible(true)
  }

  const handleReactionPress = (emoji: string) => {
    onReactionAdd?.(id, emoji)
    setShowReactions(false)
    setMenuVisible(false)
  }

  const renderReactions = () => {
    if (reactions.length === 0) return null

    return (
      <View style={[styles.reactionsContainer, isCurrentUser ? styles.currentUserReactions : styles.otherUserReactions]}>
        {reactions.map((reaction, index) => (
          <TouchableOpacity key={index} style={[styles.reactionBadge, reaction.users.includes('currentUserId') && styles.reactionBadgeActive]} onPress={() => onReactionAdd?.(id, reaction.emoji)}>
            <Text style={styles.reactionEmoji}>{reaction.emoji}</Text>
            <Text style={styles.reactionCount}>{reaction.count}</Text>
          </TouchableOpacity>
        ))}
      </View>
    )
  }

  const renderReplyPreview = () => {
    if (!replyTo) return null

    return (
      <View style={[styles.replyPreview, isCurrentUser ? styles.currentUserReply : styles.otherUserReply]}>
        <View style={styles.replyLine} />
        <View style={styles.replyContent}>
          <Text style={styles.replySender}>{replyTo.sender}</Text>
          <Text style={styles.replyText} numberOfLines={1}>
            {replyTo.text}
          </Text>
        </View>
      </View>
    )
  }

  return (
    <>
      <TouchableOpacity activeOpacity={0.8} onLongPress={handleLongPress} delayLongPress={200} style={[styles.container, isCurrentUser ? styles.currentUserContainer : styles.otherUserContainer]}>
        {!isCurrentUser && (
          <TouchableOpacity style={styles.avatarContainer} onPress={() => onAvatarPress?.(sender.id)} activeOpacity={0.7}>
            {sender.avatar && sender.avatar.includes('/avatars/') ? (
              <Image source={{ uri: sender.avatar }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Text style={styles.avatarText}>{sender.name.charAt(0).toUpperCase()}</Text>
              </View>
            )}
            {sender.isVerified && (
              <View style={styles.verifiedBadge}>
                <MaterialIcons name="check-circle" size={14} color="#40A7E3" />
              </View>
            )}
          </TouchableOpacity>
        )}

        <View style={[styles.contentContainer, isCurrentUser ? styles.currentUserContent : styles.otherUserContent]}>
          {!isCurrentUser && <Text style={styles.senderName}>{sender.name}</Text>}

          <View style={[styles.messageWrapper, isCurrentUser ? styles.currentUserWrapper : styles.otherUserWrapper]}>
            {renderReplyPreview()}

            <View style={[styles.messageBubble, isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble, image && styles.imageBubble]}>
              {image && (
                <TouchableOpacity activeOpacity={0.9}>
                  <Image source={{ uri: image }} style={styles.messageImage} />
                </TouchableOpacity>
              )}

              {text ? <Text style={[styles.messageText, isCurrentUser ? styles.currentUserText : styles.otherUserText, !image && styles.messageTextOnly]}>{text}</Text> : null}

              <View style={styles.messageFooter}>
                {isEdited && <Text style={[styles.editedText, isCurrentUser ? styles.currentUserMeta : styles.otherUserMeta]}>edited</Text>}
                <Text style={[styles.timeText, isCurrentUser ? styles.currentUserMeta : styles.otherUserMeta]}>{formatTime(createdAt)}</Text>
                {isCurrentUser && <MaterialIcons name="done-all" size={14} color="#5F9BFF" style={styles.readIcon} />}
              </View>
            </View>
          </View>

          {renderReactions()}
        </View>
      </TouchableOpacity>

      {/* Контекстное меню */}
      <Modal visible={menuVisible} transparent animationType="fade" onRequestClose={() => setMenuVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View
                style={[
                  styles.menuContainer,
                  {
                    top: menuPosition.y - 200,
                    left: menuPosition.x - 150
                  }
                ]}>
                <View style={styles.menuHeader}>
                  <Text style={styles.menuDate}>
                    {formatDate(createdAt)} в {formatTime(createdAt)}
                  </Text>
                </View>

                <View style={styles.reactionsRow}>
                  {commonEmojis.map((emoji, index) => (
                    <TouchableOpacity key={index} style={styles.emojiButton} onPress={() => handleReactionPress(emoji)}>
                      <Text style={styles.emojiText}>{emoji}</Text>
                    </TouchableOpacity>
                  ))}
                  <TouchableOpacity
                    style={styles.moreEmojisButton}
                    onPress={() => {
                      setShowReactions(true)
                      setMenuVisible(false)
                    }}>
                    <MaterialIcons name="add" size={20} color="#007AFF" />
                  </TouchableOpacity>
                </View>

                <View style={styles.menuDivider} />

                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => {
                      onReply?.(id)
                      setMenuVisible(false)
                    }}>
                    <MaterialIcons name="reply" size={22} color="#007AFF" />
                    <Text style={styles.actionText}>Reply</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => {
                      onForward?.(id)
                      setMenuVisible(false)
                    }}>
                    <MaterialIcons name="forward" size={22} color="#007AFF" />
                    <Text style={styles.actionText}>Forward</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => {
                      onCopy?.(id)
                      setMenuVisible(false)
                    }}>
                    <MaterialIcons name="content-copy" size={22} color="#007AFF" />
                    <Text style={styles.actionText}>Copy</Text>
                  </TouchableOpacity>

                  {isCurrentUser && (
                    <>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => {
                          onEdit?.(id)
                          setMenuVisible(false)
                        }}>
                        <MaterialIcons name="edit" size={22} color="#007AFF" />
                        <Text style={styles.actionText}>Edit</Text>
                      </TouchableOpacity>

                      <View style={styles.menuDivider} />

                      <TouchableOpacity
                        style={[styles.actionButton, styles.deleteButton]}
                        onPress={() => {
                          onDelete?.(id)
                          setMenuVisible(false)
                        }}>
                        <MaterialIcons name="delete" size={22} color="#FF3B30" />
                        <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Палітра емодзі */}
      <Modal visible={showReactions} transparent animationType="slide" onRequestClose={() => setShowReactions(false)}>
        <TouchableWithoutFeedback onPress={() => setShowReactions(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.emojiPickerContainer}>
                <View style={styles.emojiPickerHeader}>
                  <Text style={styles.emojiPickerTitle}>Choose reaction</Text>
                  <TouchableOpacity style={styles.closeButton} onPress={() => setShowReactions(false)}>
                    <MaterialIcons name="close" size={24} color="#007AFF" />
                  </TouchableOpacity>
                </View>
                <View style={styles.emojiGrid}>
                  {['👍', '❤️', '🔥', '🥰', '😁', '😮', '😢', '👎', '🤔', '🤯', '🥱', '😎', '💯', '✨', '🎉', '💔', '⚡', '🏆', '📌', '💡', '🔔', '💬', '👀', '💪'].map((emoji, index) => (
                    <TouchableOpacity key={index} style={styles.gridEmojiButton} onPress={() => handleReactionPress(emoji)}>
                      <Text style={styles.gridEmojiText}>{emoji}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
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
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 8,
    width: 260,
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
    paddingVertical: 4
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 12
  },
  actionText: {
    fontSize: 16,
    color: '#007AFF'
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
  }
})

export default Message
