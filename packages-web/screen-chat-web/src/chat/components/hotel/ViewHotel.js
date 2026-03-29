import compact from 'lodash/compact'
import isArray from 'lodash/isArray'
import isEmpty from 'lodash/isEmpty'
import split from 'lodash/split'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, Appearance, Dimensions, Image, ImageBackground, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

import png360 from '../../../../images/360.png'
import CreditCardIcon from '../../../../images/credit-card-pngrepo-com.png'
import ActionIcon from '../../../../images/heart-pngrepo-com.png'
import AskIcon from '../../../../images/question-pngrepo-com.png'
import ShopIcon from '../../../../images/shopping-cart-pngrepo-com.png'
import ChatIcon from '../../../../images/speech-bubble-pngrepo-com.png'

const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
const { getAppConstants } = GLOBAL_OBJ.onlinetur.storage
const { MAIN_COLOR } = GLOBAL_OBJ.onlinetur.constants

const { width, height } = Dimensions.get('window')
const SCALE_FONT = Platform.isPad ? 6 : 16
const SCALE_FONT_SUB = Platform.isPad ? 6 : 13
const IS_WEB = Platform.OS === 'web'

// --- Вспомогательные функции ---

const parseHotelId = pathname => {
  const url = compact(split(pathname, '/'))
  return url[2] === 'h' ? url[3] : ''
}

const buildSubtitle = hotel => {
  if (hotel.cn && hotel.rn) return `${hotel.cn} • ${hotel.rn}`
  if (hotel.cn) return hotel.cn
  if (hotel.rn) return hotel.rn
  return ''
}

const buildReviewUrl = (path, hotel, user, t) => {
  let url = `${path}/bestt.php?i=ols${hotel.id}&only=1&t=0;3`
  if (user?.id_user) {
    url += `&apid=${user.id_user}${user.is_sotr === 1 ? '&agn=2' : ''}`
    url += `&ue=${btoa(user.login)}&uk=${user.hash_ml}&un=${btoa(encodeURI(user.my_name))}`
  }
  return url
}

const getPhotos = hotel => {
  if (isEmpty(hotel)) {
    return [{ type: 'image', string: getAppConstants().url_api + getAppConstants().url_null_image }]
  }
  return hotel.content.filter(item => item.type === 'image')
}

const getSubject = hotel => (isEmpty(hotel) ? null : hotel.content.find(item => item.type === 'text'))

// --- Атомарные компоненты ---

function HotelInfoRow({ label, value, txt }) {
  if (!value || value === '') return null
  return (
    <View>
      <Text style={{ fontSize: SCALE_FONT_SUB, fontWeight: 'bold', color: txt, paddingBottom: 10 }}>{label}</Text>
      <Text style={{ fontSize: 15, paddingBottom: 10, color: txt }}>{value}</Text>
    </View>
  )
}

function BottomButton({ onPress, icon, label, txt }) {
  return (
    <TouchableOpacity onPress={onPress} style={{ alignItems: 'center', justifyContent: 'center', width: 60 }}>
      <Image source={icon} style={styles.iconContainer} />
      <Text numberOfLines={1} style={{ fontSize: 11, color: txt }}>
        {label}
      </Text>
    </TouchableOpacity>
  )
}

function CarouselItem({ item, isMobile }) {
  return (
    <View style={styles.carouselItem}>
      <Image style={{ width: (isMobile ? width : width / 2) - 100, height: 400, borderRadius: 10 }} source={{ uri: item.string }} />
    </View>
  )
}

function CarouselPhotoItem({ item, ImageLoad, onPress360 }) {
  const is360 = item.is_image360 === 1
  return (
    <View style={styles.carouselItem}>
      {is360 ? (
        <TouchableOpacity onPress={() => onPress360(item.image_path)} style={{ width: width - 60, height: 300 }}>
          <ImageLoad style={{ width: width - 60, height: 300, borderRadius: 10 }} source={{ uri: item.image_path_min }} />
          <Image source={png360} style={styles.icon360} />
        </TouchableOpacity>
      ) : (
        <ImageLoad style={{ width: width - 60, height: 300, borderRadius: 10 }} source={{ uri: item.image_path_min }} />
      )}
    </View>
  )
}

// --- Основной компонент ---

function ViewHotel({ utils, history, filter, user, pathname, expoRouter, setModalLogin, setHeaderParams, currentCategory }) {
  const { t, theme, Carousel, Switch, Icon, RenderHTML, Portal, Modal, PanoramaView, isMobile, chatServiceGet } = utils

  const isDarkMode = Appearance.getColorScheme() === 'dark'
  const colors = isDarkMode ? theme.dark.colors : theme.light.colors
  const { background: bg, text: txt, header: hd } = colors

  const tagsStyles = useMemo(() => ({ body: { color: txt } }), [txt])
  const path = getAppConstants().url_main_link

  const [isLoading, setIsLoading] = useState(true)
  const [hotel, setHotel] = useState({})
  const [payButton, setPayButton] = useState({})
  const [photos, setPhotos] = useState([])
  const [expanded, setExpanded] = useState(false)
  const [indexTab, setIndexTab] = useState(0)
  const [url360, setUrl360] = useState('')
  const [load360, setLoad360] = useState(false)

  // --- Инициализация ---

  useEffect(() => {
    const initData = async () => {
      const idHotel = parseHotelId(pathname)
      const android_id_install = user?.android_id_install ?? ''
      const token = user?.device?.token ?? ''

      const [hotelData, photosData] = await Promise.all([chatServiceGet.getViewHotel(idHotel, android_id_install, token), chatServiceGet.getViewHotelPhoto(Number(idHotel) + 100000)])

      if (!isEmpty(hotelData)) {
        const pay = await chatServiceGet.getViewHotelPay(Number(hotelData.id) + 100000, android_id_install, token, currentCategory.id)
        setHotel(hotelData)
        setPayButton(pay)
        setPhotos(photosData.code === 0 ? photosData.data : [])

        // Обновляем заголовок
        setHeaderParams({
          screen: 'view',
          title: hotelData.title ?? '',
          subtitle: buildSubtitle(hotelData),
          latitude: Number(hotelData.latitude),
          longitude: Number(hotelData.longitude),
          id_hotel: Number(hotelData.id),
          name_hotel: hotelData.title ?? ''
        })
      }

      setIsLoading(false)
    }

    initData()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // --- Мемоизированные данные ---

  const photo = useMemo(() => getPhotos(hotel), [hotel])
  const subject = useMemo(() => getSubject(hotel), [hotel])

  const containerWidth = isMobile ? width : width / 2

  // --- Колбэки ---

  const handleToggleTab = useCallback(() => setIndexTab(i => (i === 0 ? 1 : 0)), [])
  const handleExpand = useCallback(() => setExpanded(true), [])
  const handleClose360 = useCallback(() => {
    setUrl360('')
    setLoad360(false)
  }, [])
  const handleOpen360 = useCallback(url => {
    setUrl360(url)
    setLoad360(false)
  }, [])

  const renderItem = useCallback(({ item }) => <CarouselItem item={item} isMobile={isMobile} />, [isMobile])

  const renderItemPhoto = useCallback(({ item }) => <CarouselPhotoItem item={item} ImageLoad={utils.ImageLoad} onPress360={handleOpen360} />, [utils.ImageLoad, handleOpen360])

  const handleBron = useCallback(() => {
    isEmpty(user) ? setModalLogin(true) : history('/mb')
  }, [user, history, setModalLogin])

  const handleBonus = useCallback(() => {
    if (isEmpty(user)) {
      setModalLogin(true)
      return
    }
    history('/bonus', { state: { id_hotel: Number(hotel.id) + 100000 } })
  }, [user, hotel, history, setModalLogin])

  const handleReview = useCallback(() => {
    const url = buildReviewUrl(path, hotel, user, t)
    expoRouter.push({
      pathname: '/web',
      params: {
        url: encodeURI(url),
        title: hotel.title,
        subtitle: t('screens.ratings.components.itemmenu.reviews')
      }
    })
  }, [path, hotel, user, t, expoRouter])

  // --- Рендер ---

  if (isLoading) {
    return <ActivityIndicator />
  }

  return (
    <>
      <ImageBackground source={{ uri: photo[0]?.string }} resizeMode="cover" style={{ width: '100%', height: '100%' }}>
        <View style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0.8, backgroundColor: '#fff' }} />

        <ScrollView style={{ flex: 1 }}>
          <View style={{ width: containerWidth, alignSelf: 'center', backgroundColor: 'rgba(255,255,255,0.8)', minHeight: height - 60 }}>
            {/* Карусель */}
            <View style={{ width: containerWidth, alignSelf: 'center' }}>
              <Carousel
                data={indexTab === 0 ? photo : photos}
                renderItem={indexTab === 0 ? renderItem : renderItemPhoto}
                sliderWidth={containerWidth}
                sliderHeight={400}
                itemWidth={containerWidth - 100}
                enableSnap
                loop
                ListEmptyComponent={
                  <View style={{ width: containerWidth - 100, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', height: 400 }}>
                    <Text style={{ fontSize: 16, textAlign: 'center', color: txt }}>{'Данный отель еще не лайкнул\nни одной фотографии от гостей'}</Text>
                  </View>
                }
              />

              {/* Переключатель фото */}
              <View style={{ flexDirection: 'row', marginVertical: 15, justifyContent: 'space-between' }}>
                <View style={{ alignItems: 'flex-start', justifyContent: 'center' }}>
                  <Text style={{ paddingLeft: 10, color: txt }}>{'Фото от'}</Text>
                </View>
                <View style={{ alignItems: 'center', flexDirection: 'row' }}>
                  <Text style={{ fontWeight: indexTab === 0 ? 'bold' : 'normal', color: txt }}>{'Отеля '}</Text>
                  <Switch value={indexTab === 1} color="orange" onValueChange={handleToggleTab} />
                  <Text style={{ fontWeight: indexTab === 1 ? 'bold' : 'normal', color: txt }}>{' Гостей'}</Text>
                </View>
                <View style={{ alignItems: 'flex-end', justifyContent: 'center' }}>
                  <TouchableOpacity onPress={() => history(`/l/h/${Number(hotel.id)}`)}>
                    <Text style={{ paddingRight: 10, color: MAIN_COLOR }}>{'Обзоры'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Информация об отеле */}
            <View style={{ width: containerWidth, padding: 10, borderRadius: 10, alignSelf: 'center' }}>
              <Text style={{ fontWeight: 'bold', fontSize: SCALE_FONT, color: txt }}>{t('screens.viewhotel.headerHotel')}</Text>
              <View style={{ width: '100%', height: 1, backgroundColor: '#ccc', marginVertical: 10 }} />
              <HotelInfoRow label={t('screens.viewhotel.address')} value={hotel.adres} txt={txt} />
              <HotelInfoRow label={t('screens.viewhotel.phone')} value={hotel.phone} txt={txt} />
              <HotelInfoRow label={t('screens.viewhotel.site')} value={hotel.www} txt={txt} />
            </View>

            {/* Описание */}
            <View style={{ padding: 10 }}>
              <Text style={{ fontSize: 16, paddingBottom: 10, fontWeight: 'bold', color: txt }}>{subject?.string?.[0]?.title}</Text>
              <RenderHTML contentWidth={width} source={{ html: subject?.string?.[0]?.text ?? '' }} tagsStyles={tagsStyles} />

              {!expanded ? (
                <View style={{ width: '100%', alignItems: 'flex-end', paddingTop: 10 }}>
                  <TouchableOpacity onPress={handleExpand}>
                    <Text style={{ color: hd, fontSize: 14 }}>{t('screens.viewhotel.more')}</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                subject?.string?.map((item, index) => {
                  if (index === 0 || !item?.text) return null
                  return (
                    <View key={`subject-${index}`}>
                      <Text style={{ fontSize: 16, paddingVertical: 10, fontWeight: 'bold', color: txt }}>{item.title}</Text>
                      {isArray(item.text) ? (
                        item.text.map((line, i) => <Text key={`line-${i}`} style={{ color: txt }}>{` • ${line}`}</Text>)
                      ) : (
                        <RenderHTML contentWidth={width} source={{ html: item.text }} tagsStyles={tagsStyles} />
                      )}
                    </View>
                  )
                })
              )}
            </View>
          </View>
        </ScrollView>
      </ImageBackground>

      {/* Нижняя панель */}
      <View style={[styles.bottomBar, { backgroundColor: bg, width: containerWidth }]}>
        <BottomButton onPress={() => history(pathname.replace('/view', '') + '/b/123')} icon={ActionIcon} label={t('screens.viewhotel.price')} txt={txt} />
        <BottomButton onPress={handleBron} icon={ShopIcon} label={t('screens.viewhotel.bron')} txt={txt} />
        <BottomButton onPress={handleBonus} icon={CreditCardIcon} label={t('screens.viewhotel.card')} txt={txt} />
        <BottomButton onPress={handleReview} icon={ChatIcon} label={t('screens.viewhotel.speech')} txt={txt} />
        <BottomButton onPress={() => history(pathname.replace('/view', ''))} icon={AskIcon} label={t('screens.viewhotel.ask')} txt={txt} />
      </View>

      {/* 360° панорама */}
      {url360 !== '' && (
        <Portal>
          <Modal visible style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            {!load360 && <ActivityIndicator />}
            {!IS_WEB && <PanoramaView style={{ flex: 1 }} dimensions={{ height: height, width: width }} inputType="mono" imageUrl={url360} onImageLoaded={() => setLoad360(true)} />}
            <View style={{ position: 'absolute', top: 60, right: 20 }}>
              <TouchableOpacity onPress={handleClose360}>
                <Icon name="close" color="#fff" size={45} />
              </TouchableOpacity>
            </View>
          </Modal>
        </Portal>
      )}
    </>
  )
}

const styles = StyleSheet.create({
  carouselItem: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 2,
    borderRadius: 10,
    borderColor: '#fff',
    borderWidth: 1
  },
  icon360: {
    width: 60,
    height: 60,
    position: 'absolute',
    top: 300 / 2 - 30,
    left: (width - 60) / 2 - 30
  },
  bottomBar: {
    position: 'absolute',
    flexDirection: 'row',
    height: 60,
    bottom: 0,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    alignSelf: 'center',
    borderRadius: 20
  },
  iconContainer: {
    width: 24,
    height: 24
  }
})

export default ViewHotel
