import compact from 'lodash/compact'
import split from 'lodash/split'
import { useCallback, useMemo } from 'react'
import { FlatList, Image, ImageBackground, Platform, TouchableOpacity, View } from 'react-native'

import pdf from '../../../../images/pdf-pngrepo-com.png'
import ReplyView from '../view'

const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
const { getOpenCurrentMessageId } = GLOBAL_OBJ.onlinetur.storage

const CANCEL_ICON_STYLE = { fontWeight: 'bold' }

function ChatFooter({ utils, pathname, images, replyMessage, images360, setChatImages, setChatImages360, messageContainerRef }) {
  const { Icon, isMobile } = utils

  const HEIGHT_IMAGES = isMobile ? 70 : 130

  const url = useMemo(() => compact(split(pathname, '/')), [pathname])
  const isHobby = url[0] === 'b'

  const id = getOpenCurrentMessageId()
  if (Number(id) === -1) {
    setTimeout(() => {
      messageContainerRef.current?.scrollToEnd({ animated: true })
    }, 300)
  }

  // --- Удаление превью ---

  const removePreviewImage = useCallback(
    index => {
      setChatImages(images.filter((_, i) => i !== index))
    },
    [images, setChatImages]
  )

  // --- keyExtractor ---

  const keyExtractor = useCallback((item, index) => `${item.uri ?? item.localIdentifier}-${index}`, [])

  // --- Превью изображения ---

  const renderPreviewImage = useCallback(
    ({ item, index }) => {
      const isPdf = item.mimeType === 'application/pdf' || item.mime === 'application/pdf'
      const onPress = () => removePreviewImage(index)
      const cancelIcon = <Icon name="cancel" color="red" size={25} style={CANCEL_ICON_STYLE} />

      if (isPdf) {
        return (
          <TouchableOpacity style={{ marginRight: 3, width: isMobile ? 70 : 170, height: HEIGHT_IMAGES }} onPress={onPress}>
            <View style={{ alignItems: 'center' }}>
              <Image source={pdf} style={{ width: isMobile ? 70 : 90, height: isMobile ? 70 : 110, marginTop: 7 }} />
              <View style={{ position: 'absolute', zIndex: 100, right: 0 }}>{cancelIcon}</View>
            </View>
          </TouchableOpacity>
        )
      }

      return (
        <TouchableOpacity style={{ marginRight: 3, height: HEIGHT_IMAGES, aspectRatio: 4 / 3 }} onPress={onPress}>
          <ImageBackground source={{ uri: item.uri }} style={{ marginRight: 3, flex: 1 }}>
            <View style={{ alignItems: 'flex-end' }}>{cancelIcon}</View>
          </ImageBackground>
        </TouchableOpacity>
      )
    },
    [isMobile, HEIGHT_IMAGES, removePreviewImage, Icon]
  )

  // --- Переиспользуемые блоки ---

  const replyView = useMemo(() => <ReplyView chatComponent={null} nameParent={replyMessage.name_parent} msgParent={replyMessage.msg_parent} imageMin={[]} hobby={isHobby} />, [replyMessage, isHobby])

  const imagesPreviewList = useMemo(() => <FlatList data={images} keyExtractor={keyExtractor} horizontal renderItem={renderPreviewImage} />, [images, keyExtractor, renderPreviewImage])

  const imagesContainer = useCallback(children => <View style={{ height: HEIGHT_IMAGES, backgroundColor: '#fafafa', opacity: 0.7 }}>{children}</View>, [HEIGHT_IMAGES])

  // --- Рендер ---

  const hasReply = Boolean(replyMessage.replyId)
  const hasImages = images.length > 0

  if (hasReply && hasImages) {
    return (
      <>
        {replyView}
        {imagesContainer(imagesPreviewList)}
      </>
    )
  }

  if (hasReply) return replyView

  if (hasImages) return imagesContainer(imagesPreviewList)

  if (images360) {
    return imagesContainer(
      <TouchableOpacity style={{ marginRight: 3, width: isMobile ? 70 : 170, height: HEIGHT_IMAGES }} onPress={() => setChatImages360(null)}>
        <ImageBackground source={{ uri: images360.uri }} style={{ marginRight: 3, width: isMobile ? 70 : 170, height: HEIGHT_IMAGES }}>
          <View style={{ alignItems: 'flex-end' }}>
            <Icon name="cancel" color="red" size={25} style={CANCEL_ICON_STYLE} />
          </View>
        </ImageBackground>
      </TouchableOpacity>
    )
  }

  return null
}

export default ChatFooter
