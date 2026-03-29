import compact from 'lodash/compact'
import isEmpty from 'lodash/isEmpty'
import { useEffect, useMemo, useState } from 'react'
import { Dimensions, Platform, Text, View } from 'react-native'

const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
const { WIDTH_MAX, WIDTH_BLOCK } = GLOBAL_OBJ.onlinetur.constants

const DEFAULT_FIELD = 'Не указан'

function useHotelId(pathname) {
  return useMemo(() => {
    const parts = compact(pathname.split('/'))
    return parts[2] === 'h' ? parts[3] : ''
  }, [pathname])
}

function useHotel(chatServiceGet, hotelId, user) {
  const [hotel, setHotel] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function fetch() {
      const android_id_install = user?.android_id_install ?? ''
      const token = user?.device?.token ?? ''

      const data = await chatServiceGet.getViewHotel(hotelId, android_id_install, token)

      if (!cancelled) {
        setHotel(!isEmpty(data) ? data : null)
        setIsLoading(false)
      }
    }

    fetch()
    return () => {
      cancelled = true
    }
  }, [chatServiceGet, hotelId, user])

  return { hotel, isLoading }
}

function ContactRow({ label, value, textStyle }) {
  return (
    <View style={{ flexDirection: 'row' }}>
      <Text style={{ fontWeight: 'bold', ...textStyle }}>{label}</Text>
      <Text style={{ paddingBottom: 10, ...textStyle }}>{value}</Text>
    </View>
  )
}

function resolveContactData(hotel, params, t) {
  const base = {
    screen: 'contacts',
    title: t('screens.contacts.title')
  }

  if (!hotel) {
    return {
      params: { ...params, ...base, subtitle: t('screens.contacts.subtitle') },
      latitude: params.latitude ?? 0,
      longitude: params.longitude ?? 0,
      adres: params.adres ?? DEFAULT_FIELD,
      phone: params.phone ?? DEFAULT_FIELD,
      www: params.www ?? DEFAULT_FIELD
    }
  }

  return {
    params: { ...params, ...base, subtitle: hotel.title },
    latitude: hotel.latitude ?? 0,
    longitude: hotel.longitude ?? 0,
    adres: hotel.adres ?? DEFAULT_FIELD,
    phone: hotel.phone ?? DEFAULT_FIELD,
    www: hotel.www ?? DEFAULT_FIELD
  }
}

const { width } = Dimensions.get('window')
const containerWidth = width < WIDTH_MAX ? width : WIDTH_BLOCK
const isNarrow = width < WIDTH_MAX

export default function Contacts({ utils, location, user }) {
  const { t, MapView, theme, chatServiceGet } = utils

  const params = location.state ?? {}
  const hotelId = useHotelId(location.pathname)
  const { hotel, isLoading } = useHotel(chatServiceGet, hotelId, user)

  const { latitude, longitude, adres, phone, www } = useMemo(() => resolveContactData(hotel, params, t), [hotel, params, t])

  const coord = useMemo(
    () => ({
      latitude: Number(latitude),
      longitude: Number(longitude),
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421
    }),
    [latitude, longitude]
  )

  const textStyle = { color: theme.text }

  if (isLoading) return null

  return (
    <View
      style={{
        flex: 1,
        width: containerWidth,
        alignSelf: 'center',
        padding: isNarrow ? 10 : 0,
        backgroundColor: '#fff',
        marginTop: 3
      }}>
      <MapView
        style={{ width: '100%', height: '50%' }}
        region={coord}
        ref={map => {
          this.map = map
        }}
        scrollingEnabled
        zoomEnabled
        mapType="satellite">
        <MapView.Marker coordinate={coord} centerOffset={{ x: -18, y: -60 }} anchor={{ x: 0.69, y: 1 }} />
      </MapView>
      <View style={{ paddingTop: 20, padding: 20 }}>
        <ContactRow label={t('screens.contacts.address')} value={adres} textStyle={textStyle} />
        <ContactRow label={t('screens.contacts.tel')} value={phone} textStyle={textStyle} />
        <ContactRow label={t('screens.contacts.site')} value={www} textStyle={textStyle} />
      </View>
    </View>
  )
}
