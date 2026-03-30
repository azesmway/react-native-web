import React, { memo, useCallback, useMemo } from 'react'
import { Animated, Dimensions, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native'

import { SendIcon } from './components/SendIcon'
import SendMessageChat from './components/SendMessageChat'
import ViewCamera from './components/ViewCamera'
import Attach from './icons/attach'
import Camera from './icons/camera'
import Emoji from './icons/emoji'
import { styles } from './styles'

// Мемоизируем весь презентационный компонент
export const InputToolbarView = memo(
  ({
    // Props
    textMessage,
    heightInput,
    isSendMessage,
    imagesLength,
    images360,
    theme,
    t,
    utils,
    pathname,
    viewCamera,
    viewEmoji,
    viewReview,
    bottomPosition,
    position,
    bg,
    txt,

    // Handlers
    onTextChange,
    onSendPress,
    toggleViewCamera,
    toggleViewEmoji,
    toggleViewReview,
    refInput,
    PreModeration,
    EmojiPickerModal,
    emojiData,
    setChatTextMessage,
    setTextMessage,
    ReviewEditor,
    onSaveReview,
    onCancelReview,
    chat,
    keyboardHeight,
    isMobile,
    images,
    setChatImages
  }) => {
    // Мемоизируем ширину окна
    const windowWidth = useMemo(() => Dimensions.get('window').width, [])

    // Мемоизируем обработчик выбора эмодзи
    const handleEmojiSelect = useCallback(
      emoji => {
        setTextMessage(prev => prev + emoji)
        setChatTextMessage(textMessage + emoji)
        toggleViewEmoji()
      },
      [setTextMessage, setChatTextMessage, textMessage, toggleViewEmoji]
    )

    // Мемоизируем вычисляемые стили
    const inputDynamicStyle = useMemo(() => styles.getInputStyle(heightInput, txt, windowWidth), [heightInput, txt, windowWidth])

    const buttonDynamicStyle = useMemo(() => styles.getButtonStyle(heightInput), [heightInput])

    const attachButtonDynamicStyle = useMemo(() => styles.getAttachButtonStyle(heightInput), [heightInput])

    if (isMobile) {
      return (
        <>
          <View style={[styles.container, { backgroundColor: '#f0f0f0', marginBottom: keyboardHeight, padding: 6 }]}>
            {pathname === '/y/5/h/1649161' && <PreModeration onPressSend={onSendPress} />}
            <TouchableOpacity onPress={() => chat?.onPressAction?.(toggleViewCamera)} style={[attachButtonDynamicStyle, { width: isMobile ? 30 : 40 }]}>
              <Attach {...{ width: 25, height: 25 }} color={txt} utils={utils} />
            </TouchableOpacity>
            <View
              style={{
                alignItems: 'flex-start',
                justifyContent: 'center',
                padding: 5,
                backgroundColor: '#fff',
                borderRadius: 20,
                marginRight: 10,
                width: '92%'
              }}>
              <TextInput
                ref={refInput}
                multiline
                placeholder={t('common.enterMessage')}
                placeholderTextColor="#9e9e9e"
                onChangeText={onTextChange}
                autoCapitalize={'none'}
                autoCorrect={false}
                value={textMessage}
                // style={{ width: '92%', color: '#000', fontSize: 14, lineHeight: 14 }}
                style={[inputDynamicStyle, { width: '90%' }]}
              />
              {textMessage !== '' && (
                <View style={{ position: 'absolute', right: 10, bottom: 0 }}>
                  <SendMessageChat
                    onSend={onSendPress}
                    setChatTextMessage={setChatTextMessage}
                    textMessage={textMessage}
                    images={imagesLength}
                    images360={images360}
                    style={[attachButtonDynamicStyle, { width: isMobile ? 30 : 40 }]}>
                    <SendIcon textMessage={textMessage} imagesLength={imagesLength} images360={images360} isSendMessage={isSendMessage} utils={utils} />
                  </SendMessageChat>
                </View>
              )}
            </View>
          </View>

          {viewCamera && <ViewCamera utils={utils} viewCamera={viewCamera} setViewCamera={toggleViewCamera} images={images} setChatImages={setChatImages} />}

          {viewEmoji && (
            <EmojiPickerModal modalTitle="Выбрать смайлик" searchPlaceholder="Поиск..." visible={viewEmoji} onClose={toggleViewEmoji} onEmojiSelect={handleEmojiSelect} emojis={emojiData} />
          )}

          {viewReview && <ReviewEditor onSave={onSaveReview} visible={viewReview} onCancel={onCancelReview} utils={utils} />}
        </>
      )
    }

    return (
      <>
        <View style={[styles.container, { backgroundColor: '#f0f0f0', marginBottom: keyboardHeight }]}>
          {pathname === '/y/5/h/1649161' && <PreModeration onPressSend={onSendPress} />}
          <View style={styles.primary}>
            <TouchableOpacity onPress={() => chat?.onPressAction?.(toggleViewCamera)} style={[attachButtonDynamicStyle, { width: isMobile ? 30 : 40 }]}>
              <Attach {...{ width: 25, height: 25 }} color={txt} utils={utils} />
            </TouchableOpacity>

            <View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                padding: 5,
                backgroundColor: '#fff',
                borderRadius: 20,
                marginRight: 10
              }}>
              <TextInput
                ref={refInput}
                multiline
                placeholder={t('common.enterMessage')}
                placeholderTextColor="#9e9e9e"
                onChangeText={onTextChange}
                autoCapitalize={'none'}
                autoCorrect={false}
                value={textMessage}
                style={inputDynamicStyle}
              />
            </View>

            <TouchableOpacity onPress={toggleViewEmoji} style={[attachButtonDynamicStyle, { width: isMobile ? 30 : 40 }]}>
              <Emoji {...{ width: 25, height: 25 }} color="#a3a3a3" utils={utils} />
            </TouchableOpacity>

            <TouchableOpacity onPress={toggleViewCamera} style={[attachButtonDynamicStyle, { width: isMobile ? 30 : 40 }]}>
              <Camera {...{ width: 25, height: 25 }} color={txt} utils={utils} />
            </TouchableOpacity>

            <SendMessageChat
              onSend={onSendPress}
              setChatTextMessage={setChatTextMessage}
              textMessage={textMessage}
              images={imagesLength}
              images360={images360}
              style={[attachButtonDynamicStyle, { width: isMobile ? 30 : 40 }]}>
              <SendIcon textMessage={textMessage} imagesLength={imagesLength} images360={images360} isSendMessage={isSendMessage} utils={utils} />
            </SendMessageChat>
          </View>
        </View>

        {viewCamera && <ViewCamera utils={utils} viewCamera={viewCamera} setViewCamera={toggleViewCamera} images={images} setChatImages={setChatImages} />}

        {viewEmoji && <EmojiPickerModal modalTitle="Выбрать смайлик" searchPlaceholder="Поиск..." visible={viewEmoji} onClose={toggleViewEmoji} onEmojiSelect={handleEmojiSelect} emojis={emojiData} />}

        {viewReview && <ReviewEditor onSave={onSaveReview} visible={viewReview} onCancel={onCancelReview} utils={utils} />}
      </>
    )
  }
)

InputToolbarView.displayName = 'InputToolbarView'
