import isEmpty from 'lodash/isEmpty'
import md5 from 'md5'
import { useCallback, useMemo } from 'react'
import { Image, Linking, Platform, StyleSheet, Text, TouchableOpacity } from 'react-native'

import HelpIcon from '../../../../images/information-pngrepo-com-white.png'
import BronIcon from '../../../../images/shopping-cart-pngrepo-com.png'
import RatIcon from '../../../../images/trophy-pngrepo-com.png'

const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
const { getAppConstants } = GLOBAL_OBJ.onlinetur.storage

const IS_ANDROID = Platform.OS === 'android'

const FAB_STYLE = {
  opacity: 0.8,
  position: 'absolute',
  right: 10,
  borderRadius: 30,
  alignItems: 'center',
  justifyContent: 'center',
  shadowColor: '#000',
  shadowOpacity: 0.5,
  shadowOffset: { width: 2, height: 2 },
  shadowRadius: 1
}

// --- Вспомогательные функции ---

const getAppPlatform = () => (Platform.OS === 'ios' ? '11' : '12')

const buildSearchUrl = (user, countries, country, hotel, place) => {
  const base = getAppConstants().url_main_link
  const app = getAppPlatform()
  const ref = user?.referral?.code ?? ''

  let url = `${base}/poisk.php?get=1&&app=${app}&ref=${ref}`

  const current = countries.find(item => item.id === Number(country))
  if (current?.id_country) url += `&country=${current.id_country}`
  if (hotel && hotel !== -1) url += `&hotels[]=${hotel}`
  if (place && place !== -1) url += `&place=${place}`

  if (!isEmpty(user)) {
    const hash = md5(user.login + 'sdlkgfls').substring(0, 4)
    url += `&un=${encodeURI(user.my_name)}&ue=${encodeURI(user.login)}&uk=${hash}&dg=15&fo=1&nsh=1`
    if (user.phone) url += `&ut=${user.phone}`
  } else {
    url += '&un=&ue=&uk=&dg=15&fo=1&nsh=1'
  }

  return url
}

const findRatingLink = (ratingCategories, hobby) => {
  if (!ratingCategories?.length) return ''
  const index = ratingCategories.findIndex(cat => cat.chat?.includes(`/b/${hobby}`))
  return index !== -1 ? `/r/${index + 1}` : ''
}

// --- Компонент кнопки FAB ---

function FabButton({ top, size, color, onPress, children }) {
  return (
    <TouchableOpacity style={[FAB_STYLE, { top, height: size, width: size, backgroundColor: color }]} onPress={onPress}>
      {children}
    </TouchableOpacity>
  )
}

// --- Основной компонент ---

function ChatFooter({ utils, hotel, hotelName, messages, chatRendered, history, hobby, user, filter, ratingCategories, expoRouter, countries, country, place }) {
  const { t } = utils
  const { selectedFav, chatAgent } = filter

  // --- Вычисление позиций ---

  const { fab, q } = useMemo(
    () => ({
      fab: IS_ANDROID ? 55 : 45,
      q: IS_ANDROID ? 80 : 50
    }),
    []
  )

  const isHotelOrSpecialHobby = (hotel !== -1 && hobby === -1) || hobby === 105 || hobby === 135

  const tops = useMemo(() => {
    const base0 = 92 + q
    const step = IS_ANDROID ? 58 : 53

    return {
      top0: base0,
      top1: base0 + step,
      top2: base0 + step * 2,
      top3: base0 + step * 3
    }
  }, [q])

  const linkToRating = useMemo(() => findRatingLink(ratingCategories, hobby), [ratingCategories, hobby])

  // --- Колбэки ---

  const handleOpenModal = useCallback(() => {
    const url = `/y/${country}/h/${hotel}/view`
    expoRouter.push(url)
  }, [country, hotel, expoRouter])

  const handleOpenSearch = useCallback(() => {
    const url = buildSearchUrl(user, countries, country, hotel, place)
    Linking.openURL(url, '_blank')
  }, [user, countries, country, hotel, place])

  // --- Ранние возвраты ---

  if (messages.length > 1) return null
  if (!chatRendered) return null

  // --- Позиции кнопок в зависимости от контекста ---

  const searchTop = isHotelOrSpecialHobby ? tops.top1 : tops.top0
  const ratingTop = isHotelOrSpecialHobby ? tops.top2 : tops.top1
  const bronTop = isHotelOrSpecialHobby ? tops.top2 : tops.top1

  const showHotelButton = isHotelOrSpecialHobby
  const showSearchButton = (!user?.id_user || user.notour === 1) && Number(selectedFav) === 0 && !chatAgent
  const showRatingButton = linkToRating !== ''
  const showBronButton = hobby === 105

  return (
    <>
      {showHotelButton && (
        <FabButton top={tops.top0} size={fab} color="rgb(93,116,175)" onPress={handleOpenModal}>
          <Image source={HelpIcon} style={styles.iconContainer} />
        </FabButton>
      )}

      {showSearchButton && (
        <FabButton top={searchTop} size={fab} color="#02b0b6" onPress={handleOpenSearch}>
          <Text style={styles.turText}>{t('common.tur')}</Text>
        </FabButton>
      )}

      {showRatingButton && (
        <FabButton top={ratingTop} size={fab} color="#caffbc" onPress={() => history(linkToRating)}>
          <Image source={RatIcon} style={styles.iconContainer} />
        </FabButton>
      )}

      {showBronButton && (
        <FabButton top={bronTop} size={fab} color="#ffce71" onPress={() => history('/mb')}>
          <Image source={BronIcon} style={styles.iconContainer} />
        </FabButton>
      )}
    </>
  )
}

const styles = StyleSheet.create({
  iconContainer: {
    width: 30,
    height: 30
  },
  turText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18
  }
})

export default ChatFooter
