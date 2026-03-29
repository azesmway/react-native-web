import React, { Component, memo, useMemo } from 'react'
import { ActivityIndicator, Animated, Dimensions, ImageBackground, Keyboard, LayoutAnimation, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'

import bg from '../../../images/chatBg2.png'
import ChatFooter from '../components/chatfooter'
// import InputToolbar from '../components/input'
// import TestView from './test'
import InputToolbar from '../components/input'

const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
const { MAIN_COLOR, HEIGHT_INPUT } = GLOBAL_OBJ.onlinetur.constants
const { getSafeAreaInsets } = GLOBAL_OBJ.onlinetur.storage

const { height: screenHeight } = Dimensions.get('window')

// Move helper function outside component to avoid recreation
const getExactDaysDifference = (date1, date2) => {
  if (!date1 || !date2) return 0

  const start = new Date(date1)
  const end = new Date(date2)

  // Обнуляем время для точного подсчёта дней
  start.setHours(0, 0, 0, 0)
  end.setHours(0, 0, 0, 0)

  const timeDiff = end.getTime() - start.getTime()
  return timeDiff / (1000 * 3600 * 24)
}

const RenderRow = memo(
  ({ item, index, utils, messages, user, chatProps }) => {
    const { moment } = utils

    const messageProps = {
      user,
      key: item._id,
      currentMessage: item,
      previousMessage: messages[index - 1] || {},
      inverted: false,
      nextMessage: messages[index + 1] || {},
      renderUsernameOnMessage: true,
      position: item.user._id === user.id_user ? 'right' : 'left',
      parsePatterns: linkStyle => [
        {
          pattern: /#(\w*[а-яА-Яa-zA-Z_0-9]+\w*)/,
          onPress: chatProps.onPressHashtag,
          style: { color: 'blue' }
        }
      ]
    }

    const days = getExactDaysDifference(messageProps.previousMessage.createdAt, item.createdAt)

    if (days > 0) {
      return (
        <React.Fragment key={item._id}>
          <View style={styles.dateSeparatorContainer}>
            <View style={styles.dateSeparatorBox}>
              <Text style={styles.dateSeparatorText}>{moment(item.createdAt).format('DD MMMM YYYY')}</Text>
            </View>
          </View>
          {chatProps.renderMessage(messageProps, index)}
        </React.Fragment>
      )
    }

    return chatProps.renderMessage(messageProps, index)
  },
  (prev, next) => {
    return !next.item.update && prev.item._id === next.item._id
  }
)

const RenderChatFooter = memo(
  ({ messageContainerRef }) => {
    return <ChatFooter messageContainerRef={messageContainerRef} />
  },
  (prev, next) => {
    return prev.images.length !== next.images.length || prev.replyMessage.replyId !== next.replyMessage.replyId || prev.images360 !== next.images360
  }
)

const RenderInputToolbar = memo(({ messageContainerRef }) => {
  return <InputToolbar messageContainerRef={messageContainerRef} />
})

class ChatContent extends Component {
  constructor(props) {
    super(props)

    this._messageContainerRef = React.createRef()
    this._onEndReached = React.createRef(true)
    this.inputRef = React.createRef()

    this.state = {
      isLoading: true,
      // containerHeight: 0,
      keyboardHeight: new Animated.Value(0),
      inputHeight: 20,
      numberOfLines: 1,
      text: '',
      keyboardVisible: false
    }

    const { isMobile } = this.props.utils

    this.HEIGHT_IMAGES = isMobile ? 70 : 130
    this.HEIGHT_REPLY = isMobile ? 100 : 100

    this.lineHeight = 20
    this.minHeight = 20
    this.maxLines = 10
    this.maxHeight = 200
  }

  _keyboardWillShow = e => {
    Animated.timing(this.state.keyboardHeight, {
      toValue: e.endCoordinates.height,
      duration: Platform.OS === 'ios' ? 250 : 0,
      useNativeDriver: false
    }).start()

    this.setState({ keyboardVisible: true }, () => {
      // Прокручиваем вниз когда появляется клавиатура
      setTimeout(() => {
        this._messageContainerRef.current?.scrollToEnd({ animated: true })
      }, 200)
    })
  }

  _keyboardWillHide = () => {
    Animated.timing(this.state.keyboardHeight, {
      toValue: 0,
      duration: Platform.OS === 'ios' ? 250 : 0,
      useNativeDriver: false
    }).start()

    this.setState({ keyboardVisible: false })
  }

  // Метод для плавной анимации изменения высоты
  updateHeight = (height, lines) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    this.setState({
      inputHeight: height,
      numberOfLines: lines
    })
  }

  handleTextChange = text => {
    this.setState({ text }, () => {
      // Принудительно вызываем измерение после обновления текста
      setTimeout(() => {
        const lines = text.split('\n').length
        const curHeight = this.lineHeight * lines
        const newHeight = curHeight <= this.maxHeight ? curHeight : this.maxHeight
        this.updateHeight(newHeight, Math.min(lines, this.maxLines))
      }, 0)
    })
  }

  // handleContentSizeChange = event => {
  //   const { height } = event.nativeEvent.contentSize
  //   const newHeight = Math.max(this.minHeight, Math.min(height, this.maxHeight))
  //   const lines = Math.round(height / this.lineHeight)
  //
  //   // Используем LayoutAnimation для плавности
  //   LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
  //
  //   this.setState({
  //     inputHeight: newHeight,
  //     numberOfLines: Math.min(lines, this.maxLines)
  //   })
  // }

  getInputStyle = () => {
    const isScrollable = this.state.numberOfLines >= this.maxLines

    return [
      styles.input,
      {
        height: this.state.inputHeight
      },
      isScrollable && styles.inputScrollable
    ]
  }

  componentDidMount() {
    if (this._messageContainerRef?.current) {
      GLOBAL_OBJ.onlinetur.chatRef = this._messageContainerRef
    }

    // Calculate height once
    // this.updateContainerHeight()

    this.keyboardWillShowListener = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow', this._keyboardWillShow)

    this.keyboardWillHideListener = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide', this._keyboardWillHide)
  }

  componentWillUnmount() {
    // Отписываемся от событий при размонтировании компонента
    this.keyboardWillShowListener?.remove()
    this.keyboardWillHideListener?.remove()
  }

  componentDidUpdate(prevProps) {
    const { messages, heightInput, replyMessage, images } = this.props

    if (prevProps.messages.length !== messages.length) {
      setTimeout(() => {
        this._onEndReached.current = true
      }, 2000)
    }

    // if (prevProps.heightInput !== heightInput) {
    //   this.updateContainerHeight()
    //   setTimeout(() => {
    //     this._messageContainerRef.current?.scrollToEnd({ animated: true })
    //   }, 200)
    // }

    // if ((!prevProps.replyMessage.replyId && replyMessage.replyId) || (prevProps.replyMessage.replyId && !replyMessage.replyId)) {
    //   this.updateContainerHeight()
    //   setTimeout(() => {
    //     this._messageContainerRef.current?.scrollToEnd({ animated: true })
    //   }, 200)
    // }
    //
    // if ((prevProps.images.length === 0 && images.length > 0) || (prevProps.images.length > 0 && images.length === 0)) {
    //   this.updateContainerHeight()
    //   setTimeout(() => {
    //     this._messageContainerRef.current?.scrollToEnd({ animated: true })
    //   }, 200)
    // }
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { messages, heightInput, isBottomList, images, replyMessage, images360 } = this.props
    const { isLoading } = this.state

    return (
      nextProps.messages !== messages ||
      // nextProps.heightInput !== heightInput ||
      // nextProps.isBottomList !== isBottomList ||
      (nextProps.images.length > 0 && images.length === 0) ||
      (nextProps.images.length === 0 && images.length > 0) ||
      (nextProps.replyMessage.replyId && !replyMessage.replyId) ||
      (!nextProps.replyMessage.replyId && replyMessage.replyId) ||
      (nextProps.images360 && !images360) ||
      (!nextProps.images360 && images360) ||
      nextState.isLoading !== isLoading ||
      nextState.inputHeight !== this.state.inputHeight ||
      nextState.text !== this.state.text ||
      nextState.numberOfLines !== this.state.numberOfLines ||
      nextState.keyboardVisible !== this.state.keyboardVisible
    )
  }

  // updateContainerHeight = () => {
  //   const { heightInput, replyMessage, images } = this.props
  //
  //   let resizeHeight = heightInput <= HEIGHT_INPUT * 2 ? 96 : heightInput + 50
  //
  //   resizeHeight = replyMessage.replyId ? resizeHeight + this.HEIGHT_REPLY : resizeHeight
  //   resizeHeight = images.length > 0 ? resizeHeight + this.HEIGHT_IMAGES : resizeHeight
  //
  //   const containerHeight = Dimensions.get('window').height - resizeHeight
  //
  //   if (containerHeight !== this.state.containerHeight) {
  //     this.setState({ containerHeight })
  //   }
  // }

  handleOnScroll = event => {
    const { chatProps, setChatBottomList, isBottomList } = this.props

    const {
      nativeEvent: {
        contentOffset: { y: contentOffsetY },
        contentSize: { height: contentSizeHeight },
        layoutMeasurement: { height: layoutMeasurementHeight }
      }
    } = event

    if (contentOffsetY < 600 && this._onEndReached.current) {
      this._onEndReached.current = false
      chatProps.onEndReached()
    }

    const paddingToBottom = 44
    const isAtBottom = layoutMeasurementHeight + contentOffsetY >= contentSizeHeight - paddingToBottom

    if (isAtBottom !== isBottomList) {
      setChatBottomList(isAtBottom)
    }
  }

  // handleLayout = () => {
  //   const { isScrollToBottom, setChatBottomList } = this.props
  //   const tm = Platform.OS === 'web' ? 1000 : 300
  //
  //   if (isScrollToBottom) {
  //     setTimeout(() => {
  //       setChatBottomList(true)
  //       // this._messageContainerRef.current?.scrollToEnd({ animated: false })
  //
  //       setTimeout(() => {
  //         this._onEndReached.current = true
  //       }, 2000)
  //     }, tm)
  //   }
  // }

  handleLastMessageRender = () => {
    const { setChatBottomList } = this.props
    const { isLoading } = this.state

    if (isLoading) {
      setTimeout(() => {
        this.setState({ isLoading: false }, () => {
          this._messageContainerRef.current?.scrollToEnd({ animated: true })
          setChatBottomList(true)

          setTimeout(() => {
            this._onEndReached.current = true
          }, 2000)
        })
      }, 1000)
    }
  }

  renderMessage = (message, index, messages) => {
    const { user, chatProps, utils } = this.props
    const isLastMessage = index === messages.length - 1

    if (isLastMessage) {
      this.handleLastMessageRender()
    }

    return <RenderRow key={message._id} item={message} index={index} utils={utils} messages={messages} user={user} chatProps={chatProps} />
  }

  render() {
    const { isMobile } = this.props.utils
    const { messages, images, replyMessage, images360 } = this.props
    const { isLoading, keyboardVisible } = this.state

    return (
      <View style={[styles.container, { marginBottom: keyboardVisible ? 0 : getSafeAreaInsets().bottom }]}>
        <ImageBackground source={bg} resizeMode={isMobile ? 'cover' : 'repeat'} style={{ width: '100%', height: '100%' }}>
          <View style={styles.overlay} />
          <ScrollView
            ref={this._messageContainerRef}
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            onScroll={this.handleOnScroll}
            scrollEventThrottle={16}
            removeClippedSubviews={true}
            maintainVisibleContentPosition={{
              minIndexForVisible: 0
            }}>
            {messages.map((message, index) => this.renderMessage(message, index, messages))}
          </ScrollView>
          <RenderChatFooter messageContainerRef={this._messageContainerRef} images={images} replyMessage={replyMessage} images360={images360} />
          <RenderInputToolbar messageContainerRef={this._messageContainerRef} />
        </ImageBackground>
        {isLoading && (
          <ImageBackground source={bg} resizeMode={isMobile ? 'cover' : 'repeat'} style={{ position: 'absolute', width: '100%', height: '100%' }}>
            <View style={styles.overlay} />
            <View style={styles.loadingContainer}>
              <Text>Загрузка...</Text>
              <ActivityIndicator />
            </View>
          </ImageBackground>
        )}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff'
  },
  container: {
    flex: 1,
    justifyContent: 'flex-end'
  },
  scrollView: {
    flex: 1
  },
  scrollContent: {
    flexGrow: 1
  },
  content: {
    flex: 1
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderTopWidth: 1,
    borderTopColor: '#ddd'
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 15,
    fontSize: 14,
    lineHeight: 16,
    minHeight: 28
  },
  inputScrollable: {
    borderRadius: 10
  },
  overlay: { position: 'absolute', width: '100%', height: '100%', opacity: 0.85, backgroundColor: 'rgb(145,178,149)' },
  loadingContainer: { position: 'absolute', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  dateSeparatorContainer: { width: '100%', alignItems: 'center' },
  dateSeparatorBox: { width: 140, borderRadius: 10, backgroundColor: '#fff', alignItems: 'center', padding: 5 },
  dateSeparatorText: { color: '#5022ef' }
})

export default ChatContent
