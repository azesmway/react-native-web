import { memo, useCallback, useMemo } from 'react'
import { Appearance, Dimensions, Platform, StyleSheet, Text, View } from 'react-native'

import placeholder from '../images/sky.jpg'
import ItemMenu from './ItemMenu'

const { width } = Dimensions.get('window')

const styles = StyleSheet.create({
  triangleCorner: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderRightWidth: 70,
    borderTopWidth: 70,
    borderRightColor: 'transparent',
    borderTopColor: 'red',
    position: 'absolute',
    top: 10,
    left: 10
  },
  triangleCornerTopRight: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 70,
    borderTopWidth: 70,
    borderLeftColor: 'transparent',
    borderTopColor: 'red',
    position: 'absolute',
    top: 10,
    right: 10
  },
  triangleText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    position: 'absolute',
    top: 15
  },
  textLeft: {
    left: 10
  },
  textRight: {
    right: 10
  },
  cardImage: {
    padding: 0,
    height: 200,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10
  },
  statusBanner: {
    width: '100%',
    height: 30,
    alignItems: 'center',
    justifyContent: 'center'
  },
  statusText: {
    fontWeight: 'bold'
  },
  cardContent: {
    padding: 10
  },
  locationRow: {
    flexDirection: 'row'
  },
  locationText: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#868686'
  },
  hotelName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0686ea'
  },
  priceRow: {
    flexDirection: 'row',
    paddingTop: 20
  },
  priceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1ba802'
  },
  cashbackText: {
    fontSize: 16,
    color: 'blue'
  },
  divider: {
    height: 1,
    backgroundColor: '#ccc',
    width: '96%',
    alignSelf: 'center'
  },
  starsRow: {
    flexDirection: 'row'
  }
})

// Helper function to check if cashback is valid
const hasCashback = cashback => {
  return cashback && cashback !== '0' && Number(cashback) !== 0
}

const ActionItem = ({ history, item, user, currentCategory, filterApp, index, utils, router }) => {
  const { theme, Icon, ListItem, Card, t, isMobile } = utils

  // Memoize theme colors
  const { bg } = useMemo(() => {
    const isDarkMode = Appearance.getColorScheme() === 'dark'
    return {
      bg: isDarkMode ? theme.dark.colors.background : theme.light.colors.background
    }
  }, [theme])

  // Memoize stars rendering
  const starsView = useMemo(() => {
    if (!item.hclass) return null

    const stars = []
    for (let i = 0; i < item.hclass; i++) {
      stars.push(<Icon key={i} name="star" color="blue" size={12} />)
    }
    return <View style={styles.starsRow}>{stars}</View>
  }, [item.hclass, Icon])

  // Memoize cashback triangle component
  const CashbackTriangle = useMemo(() => {
    if (!hasCashback(item.user_cashback)) return null

    const isLeft = index % 2 === 0
    const triangleStyle = isLeft ? styles.triangleCorner : styles.triangleCornerTopRight
    const textStyle = [styles.triangleText, isLeft ? styles.textLeft : styles.textRight]

    return (
      <>
        <View style={triangleStyle} />
        <Text style={textStyle}>{item.user_cashback}%</Text>
      </>
    )
  }, [item.user_cashback, index])

  // Memoize image source
  const imgSource = useMemo(() => (item.cover_image ? { uri: item.cover_image } : placeholder), [item.cover_image])

  // Memoize hotel ID
  const hotelId = useMemo(() => Number(item.id_otel), [item.id_otel])

  // Optimize navigation handler
  const handlePress = useCallback(() => {
    const itemData = {
      ...item,
      huid: hotelId - 100000,
      cuid: item.id_post,
      name: item.name_hotel
    }

    router.push({
      pathname: `/ah/${hotelId}`,
      params: {
        hotel: encodeURI(JSON.stringify(itemData)),
        isFinishAll: item.is_finish_all
      }
    })

    // if (Platform.OS !== 'web') {
    //   router.navigate({
    //     pathname: `/ah/${hotelId}`,
    //     params: {
    //       hotel: encodeURI(JSON.stringify(itemData)),
    //       user: encodeURI(JSON.stringify(user)),
    //       currentCategory: encodeURI(JSON.stringify(currentCategory)),
    //       isFinishAll: item.is_finish_all,
    //       filterApp: encodeURI(JSON.stringify(filterApp))
    //     }
    //   })
    // } else {
    //   history(`/ah/${hotelId}`)
    // }
  }, [item, hotelId, user, currentCategory, filterApp, router, history])

  // Memoize container width
  const containerWidth = useMemo(() => (isMobile ? width : width / 2), [isMobile])

  const showCashback = hasCashback(item.user_cashback)
  const isFinished = item.is_finish_all === 0

  return (
    <>
      <ListItem
        containerStyle={{
          width: containerWidth,
          alignSelf: 'center',
          margin: 10,
          padding: 0,
          backgroundColor: 'transparent'
        }}
        activeOpacity={0.6}
        underlayColor="#f5f5f5"
        onPress={handlePress}>
        <Card containerStyle={{ margin: 0, padding: 0, flex: 1, borderRadius: 10 }}>
          <Card.Image style={styles.cardImage} source={imgSource} />
          <View style={[styles.statusBanner, { backgroundColor: isFinished ? 'green' : 'yellow' }]}>
            <Text style={[styles.statusText, { color: isFinished ? '#fff' : '#000' }]}>{t(isFinished ? 'screens.actions.moment' : 'screens.actions.request')}</Text>
          </View>

          <View style={[styles.cardContent, { backgroundColor: bg }]}>
            <View style={styles.locationRow}>
              {item.name_country && <Text style={styles.locationText}>{item.name_country}</Text>}
              {item.rname && <Text style={styles.locationText}>{' • ' + item.rname}</Text>}
            </View>
            <Text style={styles.hotelName}>{item.name_hotel}</Text>
            {starsView}
            <View style={styles.priceRow}>
              <Text style={styles.priceText}>
                от ₽{item.price_min} до ₽{item.price_max} (за ночь)
              </Text>
            </View>
            {showCashback && <Text style={styles.cashbackText}>Кэшбек {item.user_cashback}%</Text>}
          </View>

          <View style={styles.divider} />
          <ItemMenu item={item} actions router={router} user={user} theme={theme} />
        </Card>
      </ListItem>
      {CashbackTriangle}
    </>
  )
}

export default memo(ActionItem)
