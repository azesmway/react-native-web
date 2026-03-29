import isEmpty from 'lodash/isEmpty'
import md5 from 'md5'
import React, { useCallback, useMemo } from 'react'
import { Dimensions, Image, Linking, Platform, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native'

const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
const { getAppConfig, getAppConstants } = GLOBAL_OBJ.onlinetur.storage

// Move constants outside component to avoid recreation
const CATEGORY_DESCRIPTIONS = {
  // eslint-disable-next-line max-len
  1: 'Откройте дверь в мир, где каждый день — это праздник света, тепла и водной стихии. Отели категории «СОЛНЦЕ, МОРЕ/АКВА» созданы для тех, кто мечтает о беззаботном отдыхе у воды, ярких впечатлениях и энергии природы.',
  // eslint-disable-next-line max-len
  4: 'Роскошь, достойная вас: отели класса Deluxe и Luxury. Погрузитесь в мир безупречного комфорта и изысканного стиля — откройте для себя отели категории Deluxe и Luxury, где каждая деталь создана для вашего безупречного отдыха.',
  // eslint-disable-next-line max-len
  12: 'Откройте для себя новый уровень отдыха — там, где забота о здоровье становится стилем жизни. Наши отели созданы для тех, кто ценит баланс активности и релакса, осознанное питание и качественные тренировки.',
  // eslint-disable-next-line max-len
  2: 'Откройте для себя отель, где гастрономия — не просто дополнение к отдыху, а главная достопримечательность. Мы создаём пространство для истинных ценителей вкуса, где каждое блюдо — произведение искусства, а каждый десерт — маленькое чудо.',
  5: 'Забудьте о стрессе в отпуске — мы создали пространство, где каждый день превращается в праздник для ваших детей, а родители могут по‑настоящему расслабиться.',
  7: 'Оставьте повседневность за порогом — погрузитесь в атмосферу исключительной близости и утончённого удовольствия. Наши отели созданы для тех, кто ценит интимность, стиль и безупречный сервис.',
  8: 'Ищете место, где каждая деталь создана для вашего удобства? Наши номера — это пространство, в котором продуман каждый элемент для безмятежного отдыха и продуктивной работы.',
  // eslint-disable-next-line max-len
  9: 'Путешествуете, чтобы увидеть мир во всей красе? Наши отели — идеальная база для насыщенных городских приключений. Мы находимся в сердце событий и знаем, как сделать ваше путешествие незабываемым.',
  10: 'Откройте мир изысканных напитков, где каждая капля — история, а каждый бокал — повод для восхищения. Наши отели созданы для ценителей тонких ароматов, редких сортов и безупречного сервиса.',
  // eslint-disable-next-line max-len
  13: 'Мы верим: настоящее гостеприимство — в безупречном сервисе, где каждая мелочь продумана, а каждое желание предугадано. Наши отели задают эталон обслуживания, превращая обычный отдых в опыт премиум‑класса.',
  // eslint-disable-next-line max-len
  11: 'Отели категории «SPA и ЛЕЧЕНИЕ»: гармония тела и духа в пространстве безупречного комфорта. Позвольте себе паузу для здоровья и красоты. Наши отели — это оазисы восстановления, где современные медицинские методики встречаются с древними традициями оздоровления.',
  // eslint-disable-next-line max-len
  3: 'Откройте двери в мир, где каждая деталь — произведение искусства, а каждый взгляд из окна — картина, достойная галереи. Наши отели созданы для тех, кто ценит визуальную гармонию и ищет эмоции через красоту.',
  // eslint-disable-next-line max-len
  15: 'Готовы окунуться в океан ярких эмоций, музыки и безудержного веселья? Наши отели — это круглогодичные фестивальные площадки, где каждый вечер превращается в грандиозное событие. Здесь не спят — здесь живут на полную!',
  // eslint-disable-next-line max-len
  16: 'Мечтаете просыпаться под шепот заснеженных пиков и засыпать с воспоминаниями о головокружительных спусках? Наши отели — идеальная точка старта для любителей горных приключений. Здесь комфорт встречается с адреналином, а уют — с духом открытий.',
  // eslint-disable-next-line max-len
  14: 'Ищете место, где отдых превращается в череду ярких событий? Наши отели — живая сцена для торжеств, фестивалей и незабываемых впечатлений. Здесь не бывает скучно: программа составлена так, чтобы каждый гость нашёл развлечение по душе.'
}

const SCALE = Platform.isPad ? 10 : 26

const MainMenu = ({ user, history, filter, currentCategory, urlOrder, ratingCategories, doOpen = undefined, expoRouter, utils, isMobile, setModalLogin }) => {
  const { theme } = utils

  // Memoize expensive calculations
  const mainChat = useMemo(() => {
    const typeApp = getAppConfig().typeApp
    return typeApp === 'main' || typeApp === 'skidki'
  }, [])

  const colorScheme = useColorScheme()
  const { width } = Dimensions.get('window')

  // Memoize theme colors to prevent recalculation
  const themeColors = useMemo(() => {
    const isDarkMode = colorScheme === 'dark'
    return {
      isDarkMode,
      bg: isDarkMode ? theme.dark.colors.background : theme.light.colors.background,
      bgW: isDarkMode ? theme.dark.colors.white : theme.light.colors.white,
      txt: isDarkMode ? theme.dark.colors.text : theme.light.colors.text,
      txtSub: isDarkMode ? theme.dark.colors.textSecondary : theme.light.colors.textSecondary,
      divider: isDarkMode ? '#5b5b5b' : '#e5e5e5'
    }
  }, [colorScheme])

  // Memoize styles to prevent recreation on every render
  const styles = useMemo(
    () =>
      StyleSheet.create({
        itemContainer: {
          borderRadius: 10,
          backgroundColor: '#fdfdfd',
          borderWidth: 1,
          borderColor: '#c9c9c9',
          padding: 10
        },
        avatarContainer: {
          borderColor: '#c9c9c9',
          backgroundColor: 'transparent',
          borderWidth: 1,
          margin: 0,
          padding: 0
        },
        iconContainer: {
          width: Platform.OS !== 'web' ? SCALE : 30,
          height: Platform.OS !== 'web' ? SCALE : 30
        },
        cardContainer: {
          marginTop: 10,
          width: isMobile ? width : width / 2
        },
        overlay: {
          position: 'absolute',
          width: '100%',
          height: '100%',
          backgroundColor: '#fff',
          opacity: 0.3,
          top: 0,
          borderRadius: 10
        },
        imageWrapper: {
          borderRadius: 2,
          marginTop: isMobile ? 5 : 10
        },
        cardImage: {
          width: 200,
          aspectRatio: 16 / 9,
          borderRadius: 10
        },
        titleButton: {
          position: 'absolute',
          top: 10,
          width: '100%',
          paddingHorizontal: 10
        },
        titleText: {
          textTransform: 'uppercase',
          fontWeight: 'bold',
          color: '#ffffff',
          textShadowColor: 'rgba(0, 0, 0, 1)',
          textShadowOffset: { width: 1, height: 1 },
          textShadowRadius: 5,
          fontSize: isMobile ? 20 : 30,
          textDecorationLine: 'underline'
        },
        descriptionContainer: {
          paddingHorizontal: isMobile ? 5 : 10,
          paddingBottom: 15
        },
        descriptionText: {
          fontFamily: 'sans-serif',
          color: '#272727',
          fontSize: 14,
          marginTop: 10
        }
      }),
    [isMobile, width]
  )

  // Memoize referral code extraction
  const referralCode = useMemo(() => user?.referral?.code || '', [user?.referral?.code])

  const openExpert = useCallback(() => {
    Linking.openURL(`${urlOrder}&ref=${referralCode}`, '_blank')
  }, [urlOrder, referralCode])

  const openTur = useCallback(() => {
    let url = `${getAppConstants().url_main_link}/poisk.php?get=1&&ref=${referralCode}`

    if (!isEmpty(user)) {
      const txtMd5 = md5(user.login + 'sdlkgfls').substring(0, 4)
      const urlLogin = encodeURI(user.login)
      const urlEmail = encodeURI(user.my_name)

      url += `&un=${urlEmail}&ue=${urlLogin}&uk=${txtMd5}&dg=15&fo=1&nsh=1`

      if (user.phone) {
        url += `&ut=${user.phone}`
      }
    } else {
      url += '&un=&ue=&uk=&dg=15&fo=1&nsh=1'
    }

    Linking.openURL(url, '_blank')
  }, [user, referralCode])

  const handleItemPress = useCallback(
    index => {
      if (doOpen) {
        doOpen()
      } else {
        history('/r/' + index)
      }
    },
    [doOpen, history]
  )

  // Memoize CategoryCard component to avoid recreation
  const CategoryCard = useCallback(
    ({ item, index, isOdd }) => (
      <View style={styles.cardContainer}>
        <View style={styles.overlay} />
        <View style={[styles.imageWrapper, isOdd ? { alignItems: 'flex-start' } : { alignItems: 'flex-end' }]}>
          <Image source={{ uri: item.img }} style={[styles.cardImage, isOdd ? { marginLeft: isMobile ? 5 : 10 } : { marginRight: 10 }]} />
          <TouchableOpacity onPress={() => handleItemPress(index)} style={[styles.titleButton, { alignItems: isOdd ? 'flex-end' : 'flex-start' }]}>
            <Text numberOfLines={1} ellipsizeMode={'tail'} style={styles.titleText}>
              {item.name}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionText}>{CATEGORY_DESCRIPTIONS[item.id]}</Text>
        </View>
      </View>
    ),
    [styles, isMobile, handleItemPress]
  )

  const HeaderComponent = useMemo(
    () => (
      <View
        style={{
          width: isMobile ? width : width / 2,
          alignItems: 'center',
          marginVertical: 20
        }}>
        <Text style={{ color: '#3a3a3a', fontSize: 20, fontWeight: 'bold' }}>{'ВЫБОР ОТЕЛЯ'}</Text>
        <Text style={{ color: '#474747', fontSize: 16 }}>{'по рейтингу трэвел-экспертов'}</Text>
      </View>
    ),
    [isMobile, width]
  )

  return (
    <View style={{ alignItems: 'center', width }}>
      {HeaderComponent}
      {ratingCategories.map((item, index) => {
        return <CategoryCard key={String(index)} item={item} index={index} isOdd={index % 2 !== 0} />
      })}
      <View style={{ height: 150 }} />
      {/*<FlatList*/}
      {/*  data={ratingCategories}*/}
      {/*  renderItem={renderItem}*/}
      {/*  keyExtractor={keyExtractor}*/}
      {/*  ListFooterComponent={ListFooterComponent}*/}
      {/*  removeClippedSubviews={true}*/}
      {/*  maxToRenderPerBatch={10}*/}
      {/*  windowSize={10}*/}
      {/*  initialNumToRender={5}*/}
      {/*/>*/}
    </View>
  )
}

export default MainMenu
