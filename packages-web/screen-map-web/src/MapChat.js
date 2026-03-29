// import { constApp, Storage } from 'app-core'
// import { AppHeaderWithBack } from 'app-header'
// import { Images } from 'app-res'
// import HomeIcon from 'app-res/src/icons/home-pngrepo-com.png'
// import ChatIcon from 'app-res/src/icons/speech-bubble-pngrepo-com.png'
// import StarIcon from 'app-res/src/icons/trophy-pngrepo-com.png'
// import { chatServiceGet } from 'app-services'
// import { chatSelector, filterSelector, userSelector } from 'app-store'
// import { withRouter } from 'app-utils'
import React, { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Dimensions, Image, Platform, Text, TouchableOpacity, View } from 'react-native'
// import { Icon } from 'react-native-elements'
// import Spinner from 'react-native-loading-spinner-overlay'
// import MapView, { Marker, Polygon, PROVIDER_GOOGLE } from 'react-native-maps'
// import { Modal, Portal } from 'react-native-paper'
// import { scale } from 'react-native-size-matters'
// import { connect } from 'react-redux'

const markerIcon = require('../images/marker.png')

const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
const { MAIN_COLOR } = GLOBAL_OBJ.onlinetur.constants

const MapChat = ({ filter, currentCategory, user, places, history, selectHotel, selectPlace, utils }) => {
  const { chatServiceGet, theme, Icon, MapView, PROVIDER_GOOGLE, Marker, Spinner, Portal, Modal } = utils

  const mapRef = useRef(null)
  const [region, setRegion] = useState({
    minLng: 0,
    minLat: 0,
    maxLng: 0,
    maxLat: 0,
    zoom: 0
  })
  const [markers, setMarkers] = useState([])
  const [spinner, setSpinner] = useState(false)
  const [tooltipView, setTooltipView] = useState(null)
  const [loadingHotel, setLoadingHotel] = useState(true)
  const [modalView, setModalView] = useState(false)

  const getRequestRegion = async rg => {
    const zoom = region.zoom

    return await chatServiceGet.getRegionByGeo(zoom, region.minLat + ',' + region.minLng + ',' + region.maxLat + ',' + region.maxLng)
  }

  const getHotel = id => {
    if (id) {
      setModalView(true)
      setLoadingHotel(true)
      chatServiceGet.getViewHotel(id).then(result => {
        if (result && result.id) {
          setLoadingHotel(false)
          setTooltipView(result)
        } else {
          setLoadingHotel(false)
          setModalView(false)
        }
      })
    }
  }

  useEffect(() => {
    if (region.minLng !== 0 && region.zoom >= 15) {
      setSpinner(true)
      getRequestRegion(region).then(result => {
        const m = result.filter(r => r.oid !== 0 && selectHotel && r.oid !== selectHotel.id)
        setMarkers(m)
        setSpinner(false)
      })
    }
  }, [region])

  const getBoundByRegion = (region, scale = 1) => {
    const calcMinLatByOffset = (lng, offset) => {
      const factValue = lng - offset
      if (factValue < -90) {
        return (90 + offset) * -1
      }
      return factValue
    }

    const calcMaxLatByOffset = (lng, offset) => {
      const factValue = lng + offset
      if (factValue > 90) {
        return (90 - offset) * -1
      }
      return factValue
    }

    const calcMinLngByOffset = (lng, offset) => {
      const factValue = lng - offset
      if (factValue < -180) {
        return (180 + offset) * -1
      }
      return factValue
    }

    const calcMaxLngByOffset = (lng, offset) => {
      const factValue = lng + offset
      if (factValue > 180) {
        return (180 - offset) * -1
      }
      return factValue
    }

    const latOffset = (region.latitudeDelta / 2) * scale
    const lngD = region.longitudeDelta < -180 ? 360 + region.longitudeDelta : region.longitudeDelta
    const lngOffset = (lngD / 2) * scale

    return {
      minLng: calcMinLngByOffset(region.longitude, lngOffset), // westLng - min lng
      minLat: calcMinLatByOffset(region.latitude, latOffset), // southLat - min lat
      maxLng: calcMaxLngByOffset(region.longitude, lngOffset), // eastLng - max lng
      maxLat: calcMaxLatByOffset(region.latitude, latOffset) // northLat - max lat
    }
  }

  const getParams = () => {
    let params = {}
    params.screen = 'geomap'
    params.title = 'Карта'

    return params
  }

  const ViewHotel = ({ hotel }) => {
    let hclass = <Text style={{ fontSize: 12, color: 'blue' }}>{hotel.hclass ? hotel.hclass : ''}</Text>

    if (hotel.hclass && hotel.hclass.indexOf('*') > -1) {
      let stars = Number(hotel.hclass.replace('*', ''))
      let view = []

      for (let i = 0; i < stars; i++) {
        view.push(<Icon key={i.toString()} name={'star'} color={'#ecce00'} size={16} />)
      }
      hclass = <View style={{ flexDirection: 'row', marginTop: 2 }}>{view}</View>
    }

    const img = hotel.cover_image ? { uri: hotel.cover_image } : null
    const name = hotel.title.replace(/\*/g, '')

    return (
      <>
        <View style={{ paddingBottom: 10 }}>
          <View style={{ width: Dimensions.get('window').width - 100 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#06839b' }}>{name}</Text>
            {hclass}
          </View>
          <Text>{hotel.cn + ', ' + hotel.rn}</Text>
        </View>
        <View style={{ flexDirection: 'row' }}>
          <Image source={img} style={{ width: 140, height: 100 }} />
          <View style={{ width: Dimensions.get('window').width - 200, marginLeft: 10 }}>
            {hotel.adres ? (
              <Text>
                <Text style={{ color: theme.text }}>{'Адрес: '}</Text>
                <Text style={{ color: 'blue' }}>{hotel.adres}</Text>
              </Text>
            ) : (
              <></>
            )}
            {hotel.phone ? (
              <Text>
                <Text style={{ color: theme.text }}>{'Телефон: '}</Text>
                <Text style={{ color: 'blue' }}>{hotel.phone}</Text>
              </Text>
            ) : (
              <></>
            )}
            {hotel.www ? (
              <Text>
                <Text style={{ color: theme.text }}>{'Сайт: '}</Text>
                <Text style={{ color: 'blue' }}>{hotel.www}</Text>
              </Text>
            ) : (
              <></>
            )}
            <Text>
              <Text style={{ color: theme.text }}>{'цена DBL от '}</Text>
              <Text style={{ color: 'blue' }}>{hotel.min_price ? '$' + hotel.min_price : 0}</Text>
            </Text>
          </View>
        </View>
        <View style={{ justifyContent: 'space-between', flexDirection: 'row', marginTop: 30 }}>
          <TouchableOpacity
            onPress={() => {
              setLoadingHotel(false)
              setModalView(false)
              setTooltipView(null)
              history('/y/' + hotel.chat_c + '/h/' + hotel.id)
            }}
            style={{ alignItems: 'center', flex: 0.33 }}>
            {/*<Image source={ChatIcon} style={{ width: scale(SCALE), height: scale(SCALE), opacity: 0.5 }} />*/}
            <Text style={{ color: MAIN_COLOR, fontSize: 16 }}>{'Чат'}</Text>
            <Text style={{ color: MAIN_COLOR, fontSize: 16 }}>{'отеля'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setLoadingHotel(false)
              setModalView(false)
              setTooltipView(null)
              history('/rt/' + hotel.id + '/c/1')
            }}
            style={{ alignItems: 'center', flex: 0.33 }}>
            {/*<Image source={StarIcon} style={{ width: scale(SCALE), height: scale(SCALE), opacity: 0.5 }} />*/}
            <Text style={{ color: MAIN_COLOR, fontSize: 16 }}>{'Рейтинг'}</Text>
            <Text style={{ color: MAIN_COLOR, fontSize: 16 }}>{'отеля'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setLoadingHotel(false)
              setModalView(false)
              setTooltipView(null)
              history('/y/' + hotel.chat_c + '/h/' + hotel.id + '/view')
            }}
            style={{ alignItems: 'center', flex: 0.33 }}>
            {/*<Image source={HomeIcon} style={{ width: scale(SCALE), height: scale(SCALE), opacity: 0.5 }} />*/}
            <Text style={{ color: MAIN_COLOR, fontSize: 16 }}>{'Лендинг'}</Text>
            <Text style={{ color: MAIN_COLOR, fontSize: 16 }}>{'отеля'}</Text>
          </TouchableOpacity>
        </View>
      </>
    )
  }

  const latitudeHotel = selectHotel && selectHotel.lat ? Number(selectHotel.lat) : selectHotel && selectHotel.latitude ? Number(selectHotel.latitude) : undefined
  const longitudeHotel = selectHotel && selectHotel.lon ? Number(selectHotel.lon) : selectHotel && selectHotel.longitude ? Number(selectHotel.longitude) : undefined

  const latitudePlace = selectPlace && selectPlace.lat ? Number(selectPlace.lat) : selectPlace && selectPlace.latitude ? Number(selectPlace.latitude) : undefined
  const longitudePlace = selectPlace && selectPlace.lon ? Number(selectPlace.lon) : selectPlace && selectPlace.longitude ? Number(selectPlace.longitude) : undefined

  const latitude = places[0].lat ? Number(places[0].lat) : 55.755864
  const longitude = places[0].lon ? Number(places[0].lon) : 37.617698

  return (
    <>
      <MapView
        style={{ flex: 1 }}
        initialRegion={{
          latitude: latitudeHotel ? Number(latitudeHotel) : latitudePlace ? Number(latitudePlace) : Number(latitude),
          longitude: longitudeHotel ? Number(longitudeHotel) : longitudePlace ? Number(longitudePlace) : Number(longitude),
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421
        }}
        initialCamera={{
          center: {
            latitude: latitudeHotel ? Number(latitudeHotel) : latitudePlace ? Number(latitudePlace) : Number(latitude),
            longitude: longitudeHotel ? Number(longitudeHotel) : longitudePlace ? Number(longitudePlace) : Number(longitude)
          },
          pitch: 0,
          heading: 0,
          altitude: 1,
          zoom: 14
        }}
        ref={mapRef}
        scrollingEnabled={true}
        zoomEnabled={true}
        mapType={'hybrid'}
        showsMyLocationButton={true}
        zoomControlEnabled={true}
        loadingEnabled={true}
        provider={PROVIDER_GOOGLE}
        onRegionChangeComplete={async currentRegion => {
          const coords = await mapRef?.current?.getCamera()

          if (region.zoom !== coords.zoom) {
            const bound = getBoundByRegion(currentRegion)
            setRegion({
              minLng: bound.minLng,
              minLat: bound.minLat,
              maxLng: bound.maxLng,
              maxLat: bound.maxLat,
              zoom: coords.zoom
            })
          }
        }}>
        {latitudeHotel && (
          <Marker
            key={'123234234234'}
            coordinate={{
              latitude: Number(latitudeHotel),
              longitude: Number(longitudeHotel)
            }}
            onPress={() => getHotel(selectHotel && (selectHotel.lat || selectHotel.latitude) ? selectHotel.id : null)}>
            <Image source={markerIcon} style={{ width: 30, height: 40, tintColor: 'red' }} />
          </Marker>
        )}
        {markers.length > 0 ? (
          markers.map((m, i) => {
            const lat = m.lat ? m.lat : m.latitude ? m.latitude : 55.755864
            const lon = m.lon ? m.lon : m.longitude ? m.longitude : 37.617698

            return (
              <Marker
                key={i}
                // icon={markerIcon}
                // image={markerIcon}
                coordinate={{
                  latitude: Number(lat),
                  longitude: Number(lon)
                }}
                onPress={() => getHotel(m.oid)}>
                <Image source={markerIcon} style={{ width: 30, height: 40 }} />
              </Marker>
            )
          })
        ) : (
          <></>
        )}
        {/*{markers.length > 0 ? (*/}
        {/*  markers.map((m, i) => {*/}
        {/*    if (m.p && m.p.length > 0) {*/}
        {/*      const p = []*/}

        {/*      for (let i = 0; i < m.p.length; i++) {*/}
        {/*        p.push({*/}
        {/*          latitude: m.p[i][0],*/}
        {/*          longitude: m.p[i][1]*/}
        {/*        })*/}
        {/*      }*/}
        {/*      return <Polygon key={i * 100000} coordinates={p} />*/}
        {/*    }*/}
        {/*  })*/}
        {/*) : (*/}
        {/*  <></>*/}
        {/*)}*/}
      </MapView>
      <Spinner visible={spinner} textContent={'Загрузка...'} animation={'fade'} textStyle={{ marginBottom: 20, color: '#fff' }} />
      <Portal>
        <Modal
          visible={modalView}
          onDismiss={() => {
            setTooltipView(null)
            setModalView(false)
            setLoadingHotel(false)
          }}
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ width: Dimensions.get('window').width - 40, height: 300, backgroundColor: '#fff', borderRadius: 10, borderWidth: 0.5, padding: 10 }}>
            {loadingHotel ? (
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator color={'#000'} />
              </View>
            ) : tooltipView ? (
              <ViewHotel hotel={tooltipView} />
            ) : (
              <></>
            )}
          </View>
        </Modal>
      </Portal>
    </>
  )
}

export default MapChat
