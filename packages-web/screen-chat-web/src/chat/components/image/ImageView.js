import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { Platform, Text, View } from 'react-native'

const DialogBox = lazy(() => import('../dialogbox'))

const IS_WEB = Platform.OS === 'web'

const parseDate = rawDate => {
  if (!rawDate || rawDate === -1) return ''
  const parts = rawDate.split(' ')
  parts[0] = parts[0].replace(/:/g, '-')
  return `${parts[0]} ${parts[1]}`
}

const extractSrcs = images => images.map(img => img.src)

function ImageView({ utils, imagesView, setImagesView }) {
  const { ReactPhotoSphereViewer, Lightbox, moment } = utils

  const [photoIndex, setPhotoIndex] = useState(-1)

  useEffect(() => {
    if (imagesView.images && photoIndex === -1) {
      setPhotoIndex(imagesView.click ?? 0)
    } else if (!imagesView.images) {
      setPhotoIndex(-1)
    }
  }, [imagesView.images, imagesView.click]) // eslint-disable-line react-hooks/exhaustive-deps

  const { modalIsOpen, img360, images, currentMessage } = imagesView ?? {}
  const { user, post_title, name_hotel } = currentMessage ?? {}

  // ← ВСЕ хуки до любых ранних return
  const imgs = useMemo(() => (images ? extractSrcs(images) : []), [images])

  const title = useMemo(() => (name_hotel ? `${post_title}, ${name_hotel}` : (post_title ?? '')), [post_title, name_hotel])

  const date = useMemo(() => (images && photoIndex >= 0 ? parseDate(images[photoIndex]?.date) : ''), [images, photoIndex])

  const handleClose = useCallback(() => setImagesView({}), [setImagesView])
  const handlePrev = useCallback(() => setPhotoIndex(i => (i + imgs.length - 1) % imgs.length), [imgs.length])
  const handleNext = useCallback(() => setPhotoIndex(i => (i + 1) % imgs.length), [imgs.length])

  const imageTitle = useMemo(
    () => (
      <View style={{ marginTop: 10 }}>
        <Text style={{ color: '#fff', paddingLeft: 10, fontWeight: 'bold' }}>{user?.name}</Text>
        <Text style={{ color: '#fff', paddingLeft: 10, fontWeight: 'bold' }}>{date ? moment(date, 'YYYY-MM-DD hh:mm:ss').format('MMM YYYY') : ''}</Text>
      </View>
    ),
    [user?.name, date, moment]
  )

  // ← только после всех хуков
  if (!images || photoIndex === -1) return null

  if (img360 && IS_WEB) {
    return (
      <Suspense fallback={null}>
        <DialogBox title={title} isOpenDialog={modalIsOpen} handleCloseDialog={handleClose} dialogWidth="98%" dialogHeight="98vh" disableTitle>
          <ReactPhotoSphereViewer src={images[0]?.src ?? images} height="100vh" width="100%" />
        </DialogBox>
      </Suspense>
    )
  }

  if (img360) return null

  return (
    <Lightbox
      mainSrc={imgs[photoIndex]}
      nextSrc={imgs[(photoIndex + 1) % imgs.length]}
      prevSrc={imgs[(photoIndex + imgs.length - 1) % imgs.length]}
      onCloseRequest={handleClose}
      onMovePrevRequest={handlePrev}
      onMoveNextRequest={handleNext}
      imageTitle={imageTitle}
    />
  )
}

export default ImageView
