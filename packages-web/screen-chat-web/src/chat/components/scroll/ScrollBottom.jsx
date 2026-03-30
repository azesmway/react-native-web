import React, { memo, useCallback, useEffect, useRef } from 'react'
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

import { getLastMessages, getNewMessages, getOldMessages } from '../../load/index'

const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
const { messagesIds, addToMessagesIds, setMessagesIds } = GLOBAL_OBJ.onlinetur.storage
const { MAIN_COLOR } = GLOBAL_OBJ.onlinetur.constants

// Extract filter utility
const filterUniqueMessages = messages => messages.filter(item => messagesIds().indexOf(item.id) === -1)

// Extract scroll helper
const scrollToEndWithDelay = (delay = 400) => {
  setTimeout(() => {
    GLOBAL_OBJ.onlinetur.chatRef.current?.scrollToEnd({ animated: true })
  }, delay)
}

const ScrollBottom = memo(props => {
  const {
    utils,
    filter,
    user,
    pathname,
    setChatScrollToBottom,
    setChatCountNewMessages,
    setChatMessagesNew,
    setChatBottomList,
    setChatOpenIdMessage,
    setChatMessages,
    setChatRendered,
    countNewMessages,
    isBottomList,
    chatRendered,
    images,
    replyMessage,
    openIdMessage,
    hobby,
    agent,
    willUnmount
  } = props

  const intervalRef = useRef(null)
  const { store, Icon, isMobile } = utils

  // Scroll to bottom handler
  const scrollToBottom = useCallback(() => {
    setChatScrollToBottom(true)

    if (countNewMessages > 0) {
      setChatCountNewMessages(0)
    }

    setTimeout(() => {
      if (!isBottomList) {
        GLOBAL_OBJ.onlinetur.chatRef.current?.scrollToEnd({ animated: true })
      }
    }, 400)
  }, [countNewMessages, isBottomList, setChatScrollToBottom, setChatCountNewMessages])

  // Get current new messages (polling)
  const getCurrentNewMessages = useCallback(async () => {
    if (filter.selectedFav !== '0' || filter.searchFav !== '' || !user.id_user) {
      return
    }

    intervalRef.current = setInterval(async () => {
      const state = store.getState()
      const messages = state.chat.messages
      const messageLastId = messages?.length > 0 ? messages[messages.length - 1].id : null

      if (!messageLastId) return

      const result = await getNewMessages(messageLastId, filter, user, pathname, false, utils)

      if (result?.data?.length > 0) {
        const lastUniq = filterUniqueMessages(result.data)

        if (lastUniq.length === 0) return

        await addToMessagesIds(lastUniq)
        setChatMessagesNew(lastUniq)

        if (state.chat.isBottomList && GLOBAL_OBJ.onlinetur.chatRef?.current) {
          scrollToEndWithDelay()
        } else {
          setChatCountNewMessages(state.chat.countNewMessages + lastUniq.length)
        }
      }
    }, 15000)
  }, [filter, user, pathname, store, utils, setChatMessagesNew, setChatCountNewMessages])

  // Load current new messages
  const loadCurrentNewMessages = useCallback(
    async (isBottom = false) => {
      setTimeout(async () => {
        const state = store.getState()
        const messages = state.chat.messages
        const messageLastId = messages?.length > 0 ? messages[messages.length - 1].id : null

        if (!messageLastId) return

        const result = await getNewMessages(messageLastId, filter, user, pathname, false, utils)

        if (result.data.length > 0) {
          const lastUniq = filterUniqueMessages(result.data)

          await addToMessagesIds(lastUniq)

          setChatScrollToBottom(false)
          setChatMessagesNew(lastUniq)
          setChatBottomList(false)
        } else if (isBottom && result.data.length === 0) {
          setChatCountNewMessages(0)
          setChatOpenIdMessage(false)
        }
      }, 1500)
    },
    [store, filter, user, pathname, utils, setChatScrollToBottom, setChatMessagesNew, setChatBottomList, setChatCountNewMessages, setChatOpenIdMessage]
  )

  // Load last chat messages
  const loadLastChatMessages = useCallback(async () => {
    setChatMessages([])
    setChatRendered(false)

    setMessagesIds()
    const result = await getLastMessages(-10, filter, user, pathname, utils)

    if (result.data.length > 0) {
      const old = await getOldMessages(result.oldMessageId, result.newMessageId, filter, user, pathname, hobby, true, agent, utils)

      if (old.data.length > 0) {
        setChatOpenIdMessage(false)
        setChatScrollToBottom(true)
        setChatMessages(old.data.concat(result.data))
      }
    }
  }, [pathname, user, filter, setChatMessages, hobby, agent, setChatScrollToBottom, setChatRendered, setChatOpenIdMessage, utils])

  // Clear interval helper
  const clearCurrentInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  // componentDidMount
  useEffect(() => {
    if (user?.id_user) {
      if (!openIdMessage) {
        getCurrentNewMessages().then()
      } else {
        loadCurrentNewMessages().then()
      }
    }
  }, [])

  // componentDidUpdate - isBottomList changed
  useEffect(() => {
    if (isBottomList) {
      setChatCountNewMessages(0)
    }
  }, [isBottomList, setChatCountNewMessages])

  // componentDidUpdate - openIdMessage changed
  useEffect(() => {
    if (openIdMessage && !isBottomList) {
      clearCurrentInterval()
      loadCurrentNewMessages().then()
    }
  }, [openIdMessage, isBottomList, clearCurrentInterval, loadCurrentNewMessages])

  // componentDidUpdate - openIdMessage && isBottomList
  useEffect(() => {
    if (openIdMessage && isBottomList) {
      clearCurrentInterval()
      setChatOpenIdMessage(false)
    }
  }, [openIdMessage, isBottomList, clearCurrentInterval, setChatOpenIdMessage])

  // componentDidUpdate - filter.searchFav changed
  useEffect(() => {
    if (filter.searchFav !== '') {
      clearCurrentInterval()
    }
  }, [filter.searchFav, clearCurrentInterval])

  // componentDidUpdate - filter.selectedFav changed
  useEffect(() => {
    if (filter.selectedFav !== '0') {
      clearCurrentInterval()
    }
  }, [filter.selectedFav, clearCurrentInterval])

  // componentWillUnmount
  useEffect(() => {
    return () => {
      clearCurrentInterval()
      setMessagesIds()
      willUnmount()
    }
  }, [clearCurrentInterval, willUnmount])

  // Early returns
  if (!chatRendered || images.length > 0 || replyMessage.replyId || isBottomList) {
    return null
  }

  const handlePress = () => {
    if (openIdMessage) {
      loadLastChatMessages().then()
    } else {
      scrollToBottom()
    }
  }

  return (
    <View style={[styles.scrollToBottomStyle, { right: isMobile ? 20 : 30 }]}>
      <TouchableOpacity onPress={handlePress}>
        <View style={styles.viewButton}>
          {countNewMessages > 0 ? (
            <View>
              <Icon name="keyboard-arrow-down" color={isMobile ? MAIN_COLOR : '#fff'} size={30} />
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{countNewMessages > 99 ? '99+' : countNewMessages}</Text>
              </View>
            </View>
          ) : (
            <Icon name="keyboard-arrow-down" color={'#fff'} size={30} />
          )}
        </View>
      </TouchableOpacity>
    </View>
  )
})

ScrollBottom.displayName = 'ScrollBottom'

const styles = StyleSheet.create({
  scrollToBottomStyle: Platform.select({
    ios: {
      opacity: 0.9,
      position: 'absolute',
      right: 10,
      bottom: 100,
      height: 50,
      width: 50,
      borderRadius: 25,
      backgroundColor: 'transparent',
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.35,
      shadowRadius: 12,
      elevation: 8
    },
    android: {
      opacity: 0.9,
      position: 'absolute',
      right: 10,
      bottom: 20,
      height: 50,
      width: 50,
      borderRadius: 25,
      backgroundColor: 'transparent',
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.35,
      shadowRadius: 12,
      elevation: 8
    },
    web: {
      opacity: 0.9,
      position: 'absolute',
      bottom: 90,
      height: 50,
      width: 50,
      borderRadius: 25,
      backgroundColor: MAIN_COLOR,
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0px 0px 14px rgba(0, 0, 0, 0.35)'
    }
  }),
  viewButton: Platform.select({
    ios: {
      height: 50,
      width: 50,
      borderRadius: 25,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.27,
      shadowRadius: 4.65,
      elevation: 6
    },
    android: {
      position: 'absolute',
      right: -12,
      bottom: -30,
      height: 54,
      width: 54,
      borderRadius: 27,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.27,
      shadowRadius: 4.65,
      elevation: 6
    }
  }),
  badge: {
    position: 'absolute',
    right: -15,
    top: -18,
    backgroundColor: 'red',
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center'
  },
  badgeText: {
    color: '#fff'
  }
})

export default ScrollBottom
