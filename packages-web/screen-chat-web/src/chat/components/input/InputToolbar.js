import isEmpty from 'lodash/isEmpty'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Appearance, Platform } from 'react-native'

import ReviewEditor from '../review'
import { ErrorToolbar } from './components/ErrorToolbar'
import { useFileOperations } from './hooks/useFileOperations'
import { useKeyboardHeight } from './hooks/useKeyboardHeight'
import { usePasteHandler } from './hooks/usePasteHandler'
import { InputToolbarView } from './InputToolbarView'
import PreModeration from './pre'

const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
const { getBookLimit, getSafeAreaInsets } = GLOBAL_OBJ.onlinetur.storage
const { HEIGHT_INPUT } = GLOBAL_OBJ.onlinetur.constants
const TMP_CHAT = '/y/5/h/1649161'
const MAX_INPUT_HEIGHT = 200

// Константы выносим за пределы компонента
const VIDEO_PATTERN = 'dzen.ru/video/watch'
const STUZON_LINK = 'https://stuzon.com/pom_link1.php?idn=169&id=2144'

function InputToolbar(props) {
  const {
    filter,
    user,
    imagesLength,
    images360,
    textMessage: propsTextMessage,
    heightInput: propsHeightInput,
    isSendMessage: propsIsSendMessage,
    setChatTextMessage,
    setHeightInput,
    setSendMessageAI,
    setModalLogin,
    pathname,
    utils,
    images,
    setChatImages,
    messageContainerRef
  } = props

  const { theme, t, EmojiPickerModal, emojiData, parseExpensiMark, MarkdownTextInput, mobile, isMobile } = utils

  // State
  const [textMessage, setTextMessage] = useState(propsTextMessage || '')
  const [heightInput, setHeightInputLocal] = useState(propsHeightInput || HEIGHT_INPUT)
  const [isSendMessage, setIsSendMessage] = useState(propsIsSendMessage || false)
  const [viewCamera, setViewCamera] = useState(false)
  const [viewEmoji, setViewEmoji] = useState(false)
  const [viewReview, setViewReview] = useState(false)

  const refInput = useRef(null)
  const { keyboardHeight } = useKeyboardHeight()
  const { readFile } = useFileOperations()

  usePasteHandler(readFile, mobile)

  // Мемоизируем chat, чтобы не лазить в window при каждом рендере
  const chat = useMemo(() => GLOBAL_OBJ.onlinetur?.currentComponent, [])

  // Sync props to state с useMemo для стабильности
  useEffect(() => {
    setIsSendMessage(propsIsSendMessage || false)
  }, [propsIsSendMessage])

  useEffect(() => {
    setHeightInputLocal(propsHeightInput || HEIGHT_INPUT)
  }, [propsHeightInput])

  useEffect(() => {
    setTextMessage(propsTextMessage || '')

    if (propsTextMessage !== '') {
      const count = propsTextMessage.split('\n').length
      const newHeight = Math.min(HEIGHT_INPUT * count, MAX_INPUT_HEIGHT)

      if (newHeight !== heightInput) {
        setHeightInputLocal(newHeight)
        setHeightInput(newHeight)
      }
    }
  }, [propsTextMessage])

  // Мемоизируем обработчики
  const handleTextChange = useCallback(
    text => {
      const count = text.split('\n').length
      const newHeight = Math.min(HEIGHT_INPUT * count, MAX_INPUT_HEIGHT)

      // Проверка на видео
      if (text.includes(VIDEO_PATTERN) && chat) {
        chat.setState({
          openYoutube: true,
          visibleModal: true,
          openYoutubeLink: STUZON_LINK
        })
        return
      }

      // Обновляем состояние
      setTextMessage(text)

      if (newHeight !== heightInput) {
        setHeightInputLocal(newHeight)
        setHeightInput(newHeight)

        setTimeout(() => {
          messageContainerRef.current?.scrollToEnd({ animated: true })
        }, 300)
      }

      setChatTextMessage(text)
    },
    [heightInput, setChatTextMessage, setHeightInput, chat]
  )

  const handleSend = useCallback(
    (text, send) => {
      if (pathname === TMP_CHAT && text?.text) {
        const lowerText = text.text.toLowerCase()
        if (lowerText === 'привет') {
          chat?.onSend?.(text, send)
        } else if (lowerText === 'хуй') {
          setSendMessageAI(1)
          setTimeout(() => setSendMessageAI(3), 3000)
        } else {
          setSendMessageAI(1)
          setTimeout(() => setSendMessageAI(2), 3000)
        }
      } else {
        chat?.onSend?.(text, send)
      }

      // Сбрасываем высоту после отправки
      setTimeout(() => {
        setHeightInputLocal(HEIGHT_INPUT)
        setHeightInput(HEIGHT_INPUT)
      }, 1000)
    },
    [pathname, setSendMessageAI, setHeightInput, chat]
  )

  const handleSaveReview = useCallback(review => {
    setViewReview(false)
  }, [])

  // Мемоизируем toggle функции
  const toggleViewCamera = useCallback(() => setViewCamera(prev => !prev), [])
  const toggleViewEmoji = useCallback(() => setViewEmoji(prev => !prev), [])
  const toggleViewReview = useCallback(() => setViewReview(prev => !prev), [])

  // Мемоизируем вычисляемые значения для темы
  const { bg, txt } = useMemo(() => {
    const isDarkMode = Appearance.getColorScheme() === 'dark'
    return {
      bg: isDarkMode ? theme.dark.colors.background : theme.light.colors.white,
      txt: isDarkMode ? theme.dark.colors.text : theme.light.colors.text
    }
  }, [theme])

  // Мемоизируем bottomPosition
  const bottomPosition = useMemo(() => (Platform.OS === 'web' ? 0 : keyboardHeight - (keyboardHeight > 0 ? 60 : 24)), [keyboardHeight])

  // Мемоизируем проверку ошибок
  const errorState = useMemo(() => {
    if (isEmpty(user)) {
      return {
        hasError: true,
        errorText1: t('chat.component.chat.errorText1') + ',',
        errorText2: t('chat.component.chat.errorText2'),
        auth: true
      }
    }

    if (!isEmpty(user) && filter.selectedHobby === 105) {
      const bookLimit = getBookLimit()
      if (!isEmpty(bookLimit) && Number(bookLimit.balance_summ) < Number(bookLimit.book_limit)) {
        return {
          hasError: true,
          errorText1: bookLimit.book_limit_info,
          auth: false
        }
      }
    }

    return { hasError: false }
  }, [user, filter.selectedHobby, t])

  // Ранний возврат при ошибке
  if (errorState.hasError) {
    return <ErrorToolbar errorText1={errorState.errorText1} errorText2={errorState.errorText2} auth={errorState.auth} setModalLogin={setModalLogin} />
  }

  return (
    <InputToolbarView
      // Props
      textMessage={textMessage}
      heightInput={heightInput}
      isSendMessage={isSendMessage}
      imagesLength={imagesLength}
      images360={images360}
      theme={theme}
      t={t}
      parseExpensiMark={parseExpensiMark}
      MarkdownTextInput={MarkdownTextInput}
      utils={utils}
      pathname={pathname}
      viewCamera={viewCamera}
      viewEmoji={viewEmoji}
      viewReview={viewReview}
      bottomPosition={getSafeAreaInsets().top}
      position={'relative'}
      bg={bg}
      txt={txt}
      // Handlers (все мемоизированы)
      onTextChange={handleTextChange}
      onSendPress={handleSend}
      toggleViewCamera={toggleViewCamera}
      toggleViewEmoji={toggleViewEmoji}
      toggleViewReview={toggleViewReview}
      refInput={refInput}
      PreModeration={PreModeration}
      EmojiPickerModal={EmojiPickerModal}
      emojiData={emojiData}
      setChatTextMessage={setChatTextMessage}
      setTextMessage={setTextMessage}
      ReviewEditor={ReviewEditor}
      onSaveReview={handleSaveReview}
      onCancelReview={toggleViewReview}
      chat={chat}
      keyboardHeight={keyboardHeight}
      isMobile={isMobile}
      images={images}
      setChatImages={setChatImages}
    />
  )
}

// Мемоизируем весь компонент
export default React.memo(InputToolbar)
