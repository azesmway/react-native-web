import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ActivityIndicator, Appearance, Dimensions, FlatList, ImageBackground, Platform, Text, View } from 'react-native'

import bg_mb from '../images/bg_mb.jpg'
import Filter from './Filter'
import Item from './Item'

const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
const { width, height } = Dimensions.get('window')
const { WIDTH_MAX, MAIN_COLOR, WIDTH_BLOCK } = GLOBAL_OBJ.onlinetur.constants

const MyBron = ({ utils, user, currentCategory, pathname, setHeaderParams, history }) => {
  const [value, setValue] = useState(0)
  const [visibleModal, setVisibleModal] = useState(false)
  const [bronList, setBronList] = useState([])
  const [bronList1, setBronList1] = useState([])
  const [bronList2, setBronList2] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentFilter, setCurrentFilterState] = useState({
    dateFrom: '',
    dateTo: '',
    pattern: ''
  })

  const { chatServiceGet, theme, t, Portal, Modal, Tab, isMobile } = utils

  // Memoize static filter ID
  const filterId = useMemo(() => (pathname.indexOf('/mb/') > -1 ? pathname.substring(4) : null), [pathname])

  const filterBronData = useCallback((data, id) => {
    if (!id) return data
    return data.filter(item => Number(item.id_chat) === Number(id))
  }, [])

  const buildSortQuery = useCallback(
    (isOwner, { dateFrom, dateTo, pattern }) => {
      const params = new URLSearchParams({
        id_categories: currentCategory.id,
        is_owner: isOwner ? '1' : '0',
        is_my_bron: isOwner ? '0' : '1',
        lim: '100',
        ofs: '0',
        date_from: dateFrom,
        date_to: dateTo,
        pattern: pattern
      })
      return '&' + params.toString()
    },
    [currentCategory.id]
  )

  const initData = useCallback(async () => {
    const token = user?.device?.token ?? ''
    const android_id_install = user?.android_id_install ?? ''

    const sort1 = buildSortQuery(false, currentFilter)
    const sort2 = buildSortQuery(true, currentFilter)

    const [bronList1Result, bronList2Result] = await Promise.all([chatServiceGet.getListMyBron(token, android_id_install, sort1), chatServiceGet.getListMyBron(token, android_id_install, sort2)])

    if (bronList1Result.code === 0) {
      const filtered = filterBronData(bronList1Result.data, filterId)
      setBronList1(filtered)
      if (!filterId) {
        setBronList(filtered)
      }
    }

    if (bronList2Result.code === 0) {
      const filtered = filterBronData(bronList2Result.data, filterId)
      setBronList2(filtered)
    }

    setIsLoading(false)
  }, [user, currentFilter, filterId, chatServiceGet, buildSortQuery, filterBronData])

  const getParams = useCallback(() => {
    const params = {
      screen: 'my_bron',
      title: user?.hotels_user?.length > 0 ? t('components.common.leftmenu.mysales') : t('components.common.leftmenu.mybron'),
      openModalFilter: () => setVisibleModal(true)
    }

    if (filterId) {
      params.close = 1
      params.closeOneBron = () => {
        history('/mb')
        initData()
      }
    } else {
      params.close = 0
    }

    setHeaderParams(params)
  }, [user, pathname, t, setHeaderParams, history, initData, filterId])

  useEffect(() => {
    getParams()
    initData().then()
  }, [getParams, initData])

  const handleChange = useCallback(
    newValue => {
      setValue(newValue)
      setBronList(newValue === 0 ? bronList1 : bronList2)
    },
    [bronList1, bronList2]
  )

  const setCurrentFilter = useCallback(filter => {
    setIsLoading(true)
    setCurrentFilterState(filter)
  }, [])

  useEffect(() => {
    if (currentFilter.dateFrom || currentFilter.dateTo || currentFilter.pattern) {
      initData().then()
    }
  }, [currentFilter, initData])

  const isDarkMode = Appearance.getColorScheme() === 'dark'
  const colors = useMemo(
    () => ({
      bg: isDarkMode ? theme.dark.colors.background : theme.light.colors.background,
      txt: isDarkMode ? theme.dark.colors.text : theme.light.colors.text,
      bg_b: isDarkMode ? theme.dark.colors.white : theme.light.colors.white
    }),
    [isDarkMode, theme]
  )

  const renderModal = useCallback(
    () => (
      <Portal>
        <Modal visible={visibleModal} onDismiss={() => setVisibleModal(false)} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <View
            style={{
              width: Dimensions.get('window').width < WIDTH_MAX ? Dimensions.get('window').width : WIDTH_BLOCK,
              borderRadius: 10,
              backgroundColor: colors.bg,
              alignSelf: 'center',
              height: Dimensions.get('window').height,
              marginTop: 140
            }}>
            <Filter android={true} closeModalFilter={() => setVisibleModal(false)} setCurrentFilter={setCurrentFilter} currentFilter={currentFilter} utils={utils} />
          </View>
        </Modal>
      </Portal>
    ),
    [visibleModal, currentFilter, colors.bg, utils, setCurrentFilter]
  )

  const emptyActions = useMemo(
    () => (
      <View style={{ width: width < WIDTH_MAX ? '100%' : WIDTH_BLOCK, alignItems: 'center', height: height, backgroundColor: colors.bg }}>
        <Text style={{ paddingTop: 40, fontSize: 20, fontWeight: 'bold', color: colors.txt }}>{t('common.empty')}</Text>
      </View>
    ),
    [colors.bg, colors.txt, t]
  )

  const renderItem = useCallback(({ item, index }) => <Item key={index.toString()} item={item} user={user} history={history} value={value} utils={utils} />, [user, history, value, utils])

  const listFooter = useMemo(() => <View style={{ height: 50, width: width < WIDTH_MAX ? '100%' : WIDTH_BLOCK }} />, [])

  return (
    <ImageBackground source={bg_mb} resizeMode={'cover'} style={{ width: '100%', height: '100%' }}>
      <View style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0.5, backgroundColor: '#fff' }} />
      <View style={{ width: isMobile ? width : width / 2, height: '100%', alignSelf: 'center', backgroundColor: 'rgba(255,255,255,0.5)' }}>
        {isLoading ? (
          <View style={{ width: '100%', alignItems: 'center', height: '100%', alignSelf: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size={'large'} color={MAIN_COLOR} />
            <Text style={{ color: colors.txt }}>{'Загрузка...'}</Text>
          </View>
        ) : (
          <>
            <Tab value={value} onChange={handleChange} indicatorStyle={{ backgroundColor: MAIN_COLOR }}>
              <Tab.Item title="Брони" titleStyle={{ color: value === 0 ? MAIN_COLOR : '#8f8f8f', fontWeight: 'bold' }} buttonStyle={{ backgroundColor: value === 0 ? colors.bg_b : 'transparent' }} />
              <Tab.Item title="Продажи" titleStyle={{ color: value === 1 ? MAIN_COLOR : '#8f8f8f', fontWeight: 'bold' }} buttonStyle={{ backgroundColor: value === 1 ? colors.bg_b : 'transparent' }} />
            </Tab>
            <FlatList data={bronList} ListEmptyComponent={emptyActions} renderItem={renderItem} ListFooterComponent={listFooter} />
          </>
        )}
        {renderModal()}
      </View>
    </ImageBackground>
  )
}

export default MyBron
