import isEmpty from 'lodash/isEmpty'
import React, { useEffect, useState } from 'react'
import { Alert, Appearance, Dimensions, FlatList, Image, ImageBackground, Platform, Text, View } from 'react-native'

import bg_ah from '../images/bg_ah.jpg'

// import FilterHotel from './FilterHotel'
// import Item from './Item'
// import UserName from './UserName'

const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
const { width } = Dimensions.get('window')
const { WIDTH_MAX, MAIN_COLOR, WIDTH_BLOCK } = GLOBAL_OBJ.onlinetur.constants
const { getAppConstants } = GLOBAL_OBJ.onlinetur.storage

const ActionsHotel = props => {
  const { Card, theme, moment, chatServiceGet, Icon, t, ImageLoad, Portal, Modal, Carousel, ListItem, isMobile } = props.utils
  const { history, router, user, currentCategory, filterApp, setHeaderParams } = props
  let { hotel, ahId } = props.globPath

  if (hotel) {
    hotel = JSON.parse(hotel)
  }
  const [actions, setActions] = useState([])
  const [photo, setPhoto] = useState([])
  const [visibleModal, setVisibleModal] = useState(false)
  const [isModalBGBlurred, setModalBGBlurred] = useState(false)
  const [isModalBGTransparent, setModalBGTransparent] = useState(true)
  const [action, setAction] = useState({})
  const [isFilterOpen, setFilterOpen] = useState(false)
  const [isRequestOpen, setRequestOpen] = useState(false)
  const [isNameOpen, setNameOpen] = useState(false)
  const [bronResult, setBronResult] = useState({})
  const [filterRef, setFilterRef] = useState(null)
  const [hotelInfo, setHotelInfo] = useState([])
  const [currentFilter, setCurrentFilter] = useState({
    dateFrom: '',
    dateTo: '',
    pattern: '',
    sort: '',
    sortList: []
  })

  let isDarkMode = Appearance.getColorScheme() === 'dark'
  let bg = isDarkMode ? theme.dark.colors.background : theme.light.colors.background
  let txt = isDarkMode ? theme.dark.colors.text : theme.light.colors.text

  const getActions = async () => {
    const token = user && user.device && user.device.token ? user.device.token : ''
    const android_id_install = user && user.android_id_install ? user.android_id_install : ''

    let sort = ''
    sort += currentFilter.dateFrom !== '' ? '&date_from=' + moment(currentFilter.dateFrom).format('YYYY-MM-DD') : ''
    sort += currentFilter.dateTo !== '' ? '&date_to=' + moment(currentFilter.dateTo).format('YYYY-MM-DD') : ''

    const actionsList = await chatServiceGet.getListHotelActions(token, android_id_install, currentCategory.id, hotel && hotel.huid ? Number(hotel.huid) + 100000 : ahId, 20, 0, sort)

    if (actionsList.code === 0) {
      setActions(actionsList.data.slice(1))

      const images = actionsList.data[0].info_hotel.content.filter(function (item) {
        return item.type === 'image'
      })

      const info = actionsList.data[0].info_hotel.content.filter(function (item) {
        return item.type === 'text'
      })

      setHotelInfo(info[0].array)
      setPhoto(images)
    }
  }

  const getParams = () => {
    let params = {}
    params.title = hotel.name_hotel
    params.subtitle = hotel.name_country
    params.screen = 'actions_hotel'
    params.openModalFilter = openModalFilter
    params.badge = currentFilter.dateFrom !== '' || currentFilter.dateTo !== '' ? 1 : 0
    params.history = history

    setHeaderParams(params)
  }

  useEffect(() => {
    getActions().then(() => {
      getParams()
    })
  }, [currentFilter])

  const getHclass = () => {
    let view = []

    for (let i = 0; i < hotel.hclass; i++) {
      view.push(<Icon key={i.toString()} name={'star'} color={'blue'} size={12} />)
    }

    return <View style={{ flexDirection: 'row' }}>{view}</View>
  }

  const succesBron = () => {
    Alert.alert(t('common.attention'), bronResult.msg && bronResult.msg !== '' ? bronResult.msg : t('containers.action.success'))
  }

  const sendBronRequest = async id_promo => {
    const android_id_install = !isEmpty(user) ? user.android_id_install : ''
    const token = !isEmpty(user) ? user.device.token : ''

    const result = await chatServiceGet.setPromoBron(android_id_install, token, id_promo)

    if (result.code === 0) {
      setBronResult(result)
      openModalName()
    } else {
      Alert.alert(t('common.attention'), result.error)
    }
  }

  const onBronPress = async (price_for_promo, id_promo) => {
    Alert.alert(t('common.attention'), t('containers.action.bron') + price_for_promo + t('containers.action.bron1'), [
      { text: t('common.cancel'), style: 'destructive' },
      { text: t('common.yes'), onPress: async () => await sendBronRequest(id_promo) }
    ])
  }

  const openModalRequest = () => {
    setRequestOpen(true)
    setVisibleModal(true)
  }

  const closeModalRequest = () => {
    setRequestOpen(false)
    setVisibleModal(false)
  }

  const openModalFilter = () => {
    setFilterOpen(true)
    setVisibleModal(true)
  }

  const closeModalFilter = () => {
    setFilterOpen(false)
    setVisibleModal(false)
  }

  const openModalName = () => {
    setNameOpen(true)
    setVisibleModal(true)
  }

  const closeModalName = () => {
    setNameOpen(false)
    setVisibleModal(false)
  }

  const onRequestPress = async action => {
    if (!user.id_user) {
      Alert.alert(t('common.attention'), t('chat.model.onEvents.bron'))

      return
    }

    setAction(action)
    openModalRequest()
  }

  const emptyActions = () => (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <Text style={{ paddingTop: 40, fontSize: 20, fontWeight: 'bold', color: '#8a8a8a' }}>{t('common.empty')}</Text>
    </View>
  )

  const renderItem = ({ item, index }, parallaxProps) => {
    // return <Image key={index.toString()} style={{ width: width - 60, height: 240 }} borderRadius={10} source={{ uri: item.string }} />
    return <Image style={{ width: (isMobile ? width : width / 2) - 40, height: 400, borderRadius: 10 }} source={{ uri: item.string }} parallaxFactor={0.8} {...parallaxProps} />
  }

  const renderModalContent = android => {
    // if (isFilterOpen) {
    //   return <FilterHotel setCurrentFilter={setCurrentFilter} currentFilter={currentFilter} android={false} closeModalFilter={closeModalFilter} />
    // } else if (isRequestOpen) {
    //   return <RequestModal user={user} filter={filterApp} isAdd={0} save={true} request={action} android={android} closeModalRequest={closeModalRequest} />
    // } else if (isNameOpen) {
    //   return <UserName user={user} filter={filterApp} isAdd={0} save={true} request={action} android={true} closeModalName={closeModalName} bronResult={bronResult} succesBron={succesBron} />
    // }

    return <View />
  }

  const renderModal = () => {
    return (
      <Portal>
        <Modal visible={visibleModal} onDismiss={() => closeModalRequest()} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <View
            style={{
              width: Dimensions.get('window').width < WIDTH_MAX ? Dimensions.get('window').width : WIDTH_BLOCK,
              borderRadius: 10,
              backgroundColor: bg,
              alignSelf: 'center',
              height: Dimensions.get('window').height,
              marginTop: 140
            }}>
            {renderModalContent(true)}
          </View>
        </Modal>
      </Portal>
    )
  }

  const renderHeaderComponent = () => {
    const token = user && user.device && user.device.token ? user.device.token : ''
    const android_id_install = user && user.android_id_install ? user.android_id_install : ''
    const url = `${getAppConstants().url_main}/bestt.php?i=ols${hotel.id_otel - 100000}&only=1&t=0;0&android_id_install=${android_id_install}&token=${token}`

    return (
      <View style={{ width: isMobile ? width : width / 2, alignSelf: 'center' }}>
        <Card containerStyle={{ margin: 0, padding: 0, borderWidth: 0 }}>
          <Carousel data={photo} renderItem={renderItem} sliderWidth={isMobile ? width : width / 2} sliderHeight={400} itemWidth={(isMobile ? width : width / 2) - 40} enableSnap loop />
        </Card>
        <View style={{ padding: 10 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: txt }}>{t('screens.actions.info')}</Text>
        </View>
        <ListItem
          onPress={() => {
            router.push({
              pathname: '/web',
              params: { url: url, title: hotel.name_hotel, subtitle: t('components.common.chatfooter.about') }
            })
          }}
          containerStyle={{ backgroundColor: bg }}>
          <Icon name={'visibility'} color={'#969696'} />
          <ListItem.Content>
            <Text style={{ color: MAIN_COLOR, fontSize: 16 }}>{t('screens.actions.open')}</Text>
          </ListItem.Content>
          <ListItem.Chevron />
        </ListItem>
        <View style={{ padding: 10 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: txt }}>{t('screens.actions.actionsHotel')}</Text>
        </View>
      </View>
    )
  }
  // <Item item={item} user={user} onBronPress={onBronPress} onRequestPress={onRequestPress} isFinishAll={isFinishAll} idHotel={hotel.id_otel} />
  return (
    <ImageBackground source={bg_ah} resizeMode={'cover'} style={{ width: '100%', height: '100%' }}>
      <View style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0.5, backgroundColor: '#fff' }} />
      <FlatList
        ListHeaderComponent={renderHeaderComponent()}
        style={{ flex: 1 }}
        contentContainerStyle={{
          alignItems: 'center'
        }}
        data={actions}
        ListEmptyComponent={emptyActions}
        renderItem={({ item }) => <></>}
        ListFooterComponent={<View style={{ height: 50 }} />}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
      />
      {renderModal()}
    </ImageBackground>
  )
}

export default ActionsHotel
