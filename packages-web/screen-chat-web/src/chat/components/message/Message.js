import { useCallback, useMemo } from 'react'
import { Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

import CountryIcon from '../../../../images/earth_globe_com.png'
import HotelIcon from '../../../../images/hotel_hand_drawn_com.png'
import MoneyIcon from '../../../../images/money-pngrepo-com.png'
import Bubble from '../bubble'

const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
const { MAIN_COLOR } = GLOBAL_OBJ.onlinetur.constants
const IS_WEB = Platform.OS === 'web'
const IS_PAD = Platform.isPad

const TRANSPARENT_CONTAINER = { backgroundColor: 'transparent', margin: 0, padding: 0 }
const EMPTY_VIEW = <View style={{ width: 10 }} />

const BOT_OPTIONS = ['выбрать тур или отель', 'выбрать страну', 'забронировать', 'вопрос по заказу', 'свой вопрос']

// --- Атомарные компоненты ---

function StatItem({ icon, value, fontSize = 12, color = MAIN_COLOR, marginLeft = 1 }) {
  return (
    <View style={{ flexDirection: 'row', marginTop: 2 }}>
      <Image source={icon} style={{ marginLeft, width: 14, height: 14 }} />
      <Text style={{ marginLeft: 1, fontSize, color, fontWeight: 'bold' }}>{value ?? '0'}</Text>
    </View>
  )
}

function Stats({ Icon, currentMessage, likesCount, summDisplay, summColor }) {
  return (
    <View style={{ marginLeft: 5 }}>
      <View style={{ flexDirection: 'row' }}>
        <Icon name="favorite" color={summColor} size={18} />
        <Text style={{ color: summColor }}>{likesCount}</Text>
      </View>
      <StatItem icon={CountryIcon} value={currentMessage.cnt_pos_country} marginLeft={3} />
      <StatItem icon={HotelIcon} value={currentMessage.cnt_pos_hotels} marginLeft={3} />
      <StatItem icon={MoneyIcon} value={summDisplay} marginLeft={3} />
    </View>
  )
}

function BotMessage({ onOptionPress }) {
  return (
    <View style={{ backgroundColor: 'rgb(239,242,254)', padding: 20, borderRadius: 20, marginLeft: 10 }}>
      <Text>{'Привет!\n\nДавай я помогу быстро выбрать лучший тур из всех существующих предложений.\n\nКакая именно нужна помощь?\n'}</Text>
      <View style={{ flexDirection: 'row', maxWidth: 400, flexWrap: 'wrap' }}>
        {BOT_OPTIONS.map((text, i) => (
          <TouchableOpacity key={text} style={[styles.touch, i > 0 && { marginLeft: 5 }]} onPress={() => onOptionPress?.(text)}>
            <Text>{text}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )
}

// --- Основной компонент ---

function Message(props) {
  const { utils, currentMessage, nextMessage, position, user, history, bot, showUserAvatar, handlerViewMessage, renderBubble: renderBubbleProp, inverted, containerStyle } = props

  const { Icon, Avatar, ListItem } = utils

  // --- Вычисляемые значения ---

  const summ = Number(currentMessage?.summ ?? 0)
  const summColor = summ >= 50 ? 'green' : '#939393'
  const summDisplay = summ < 99 ? '99-' : summ > 99 ? '99+' : Math.trunc(summ)

  const likesCount = useMemo(() => {
    const total = Number(currentMessage?.prih_like ?? 0) + Number(currentMessage?.rash_like ?? 0)
    return total > 99 ? '99+' : total
  }, [currentMessage?.prih_like, currentMessage?.rash_like])

  const avatarOrder = useMemo(() => {
    const isCurrentUser = user?.id_user === currentMessage?.id_user
    if (IS_WEB || IS_PAD) return isCurrentUser ? 'before' : 'after'
    return position === 'right' ? 'after' : 'before'
  }, [user?.id_user, currentMessage?.id_user, position])

  const shouldHideAvatar = useMemo(() => {
    if (user?.id_user && currentMessage?.user?.id_user === user.id_user && !showUserAvatar) return true
    if (currentMessage?.user?.avatar === null) return true
    if (currentMessage?.user && nextMessage?.user && currentMessage.user._id === nextMessage.user._id) return true
    return false
  }, [user, currentMessage, nextMessage, showUserAvatar])

  // --- Рендер пузыря ---

  const bubbleNode = useMemo(() => {
    const { containerStyle: _cs, renderBubble: _rb, ...rest } = props
    return renderBubbleProp ? renderBubbleProp(rest) : <Bubble {...rest} />
  }, [props, renderBubbleProp])

  // --- Рендер аватара ---

  const avatarNode = useMemo(() => {
    if (shouldHideAvatar) return EMPTY_VIEW
    const { containerStyle: _cs, ...rest } = props
    return (
      <View style={{ justifyContent: 'flex-end' }}>
        <View style={{ marginLeft: position === 'left' ? 5 : 0 }}>
          <Avatar {...rest} onPressAvatar={() => handlerViewMessage(currentMessage)} />
        </View>
      </View>
    )
  }, [shouldHideAvatar, position, props, handlerViewMessage, currentMessage, Avatar])

  // --- Обёртка сообщения ---

  const renderMessageWrapper = useCallback(
    (children, onPress = null) => (
      <ListItem containerStyle={TRANSPARENT_CONTAINER} activeOpacity={0.6} underlayColor="#f5f5f5" {...(onPress && { onPress })}>
        <ListItem.Content style={[styles[position].containerUser, TRANSPARENT_CONTAINER]}>
          <View style={[styles[position].container, { marginBottom: nextMessage?.id ? 0 : 10 }, !inverted && { marginBottom: 2 }]}>{children}</View>
        </ListItem.Content>
      </ListItem>
    ),
    [ListItem, position, nextMessage, inverted]
  )

  // --- Рендер с аватаром ---

  const renderWithAvatar = useCallback(
    (onPress = null) =>
      renderMessageWrapper(
        <>
          {avatarOrder === 'before' && avatarNode}
          {bubbleNode}
          {avatarOrder === 'after' && avatarNode}
        </>,
        onPress
      ),
    [renderMessageWrapper, avatarOrder, avatarNode, bubbleNode]
  )

  // --- Ранний выход ---

  if (!currentMessage) return null

  // --- Bot ---

  if (bot) {
    return renderMessageWrapper(<BotMessage />)
  }

  // --- Action / Request ---

  const viewAction = currentMessage.tip === 5
  const viewRequest = currentMessage.tip === 6

  if (viewAction || viewRequest) {
    const handlePress = viewRequest ? () => history('/mb/' + currentMessage.id_parent) : null
    return renderWithAvatar(handlePress)
  }

  // --- Обычное сообщение ---

  const showAvatar = currentMessage.id !== -10000

  return (
    <View style={styles[position].container}>
      {showAvatar && avatarNode}
      {bubbleNode}
    </View>
  )
}

const styles = {
  touch: {
    padding: 10,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: '#0b999e',
    marginTop: 5
  },
  left: StyleSheet.create({
    container: {
      flexDirection: 'row',
      marginVertical: 5,
      width: '100%'
    },
    containerUser: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'flex-start',
      marginVertical: 5
    }
  }),
  right: StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'flex-end',
      marginVertical: 5
    },
    containerUser: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'flex-end',
      marginRight: IS_WEB ? 5 : 0,
      marginVertical: 5
    }
  })
}

export default Message
