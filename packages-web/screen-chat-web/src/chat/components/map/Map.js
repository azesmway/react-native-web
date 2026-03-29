import compact from 'lodash/compact'
import isEmpty from 'lodash/isEmpty'
import split from 'lodash/split'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Dimensions, Platform, View } from 'react-native'

const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
const { WIDTH_MAX } = GLOBAL_OBJ.onlinetur.constants
const { width } = Dimensions.get('window')

const MAPS_API_KEY = ''

// --- Вспомогательные функции ---

const parseHotelId = pathname => {
  const url = compact(split(pathname, '/'))
  return url[2] === 'h' ? url[3] : ''
}

const buildRegion = (latitude, longitude) => ({
  latitude: latitude ?? 0,
  longitude: longitude ?? 0,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421
})

const buildCamera = (latitude, longitude) => ({
  center: { latitude: latitude ?? 0, longitude: longitude ?? 0 },
  pitch: 0,
  heading: 0,
  altitude: 1,
  zoom: 16
})

// --- Основной компонент ---

function Map({ utils, pathname, setHeaderParams, user }) {
  const { MapView, Marker, chatServiceGet, t } = utils

  const mapRef = useRef(null)

  const [params, setParams] = useState({})
  const [isLoading, setLoading] = useState(true)

  useEffect(() => {
    const initData = async () => {
      const android_id_install = user?.android_id_install ?? ''
      const token = user?.device?.token ?? ''

      const idHotel = parseHotelId(pathname)
      const isHotel = Boolean(idHotel)
      const newParams = {
        screen: 'map',
        linkMap: true,
        app: true,
        title: pathname.includes('/h/') ? t('screens.map.title') : t('screens.map.place')
      }

      if (isHotel) {
        const hotel = await chatServiceGet.getViewHotel(idHotel, android_id_install, token)
        newParams.latitude = hotel.latitude
        newParams.longitude = hotel.longitude
      }

      setParams(newParams)
      setLoading(false)
      setHeaderParams(newParams)
    }

    initData()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    )
  }

  const { latitude, longitude } = params
  const coordinate = { latitude: Number(latitude), longitude: Number(longitude) }

  return (
    <View
      style={{
        flex: 1,
        width: '100%',
        height: '100%',
        alignSelf: 'center',
        padding: width < WIDTH_MAX ? 10 : 0,
        marginTop: 3
      }}>
      <MapView
        ref={mapRef}
        googleMapsApiKey={MAPS_API_KEY}
        style={{ flex: 1 }}
        initialRegion={buildRegion(latitude, longitude)}
        initialCamera={buildCamera(latitude, longitude)}
        mapType="hybrid"
        provider="google"
        scrollingEnabled
        zoomEnabled
        zoomControlEnabled
        showsMyLocationButton
        showsUserLocation
        cacheEnabled
        loadingEnabled>
        <Marker coordinate={coordinate} />
      </MapView>
    </View>
  )
}

export default Map
