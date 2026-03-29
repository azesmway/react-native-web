import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { Appearance, Dimensions, Image, Linking, Platform, Text, TouchableOpacity, View } from 'react-native'

import ChatIcon from '../images/speech-bubble-pngrepo-com.png'

const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
const { width } = Dimensions.get('window')
const { MAIN_COLOR } = GLOBAL_OBJ.onlinetur.constants

const WIDTH_TOOLTIP = 200

const STATUS_COLORS = {
  0: '#0bc425',
  1: '#b4a200',
  2: '#0bc425',
  3: '#b4a200',
  4: 'red',
  5: '#a6a6a6',
  6: 'red',
  10: '#7b7b7b',
  default: '#7b7b7b'
}

const CAT1 = ['RO', 'BB', 'HB', 'FB', 'AI']
const CAT2 = ['DBL', 'SGL', 'TRPL', 'SGL+CHD', 'SGL+2CHD', 'DBL+CHD', 'DBL+2CHD', 'TRPL+CHD', 'TRPL+2CHD']

const Item = memo(({ item: propItem, utils, user, value, history }) => {
  const [item, setItem] = useState(propItem || {})
  const [isVisibleDialog, setIsVisibleDialog] = useState(false)
  const [textVisibleDialog, setTextVisibleDialog] = useState('')
  const [actionCurrent, setActionCurrent] = useState(null)
  const [openMessage, setOpenMessage] = useState(false)
  const [textMessage, setTextMessage] = useState('')

  const { t, Alert, chatServicePost, chatServiceGet, moment, theme, ListItem, Icon, Portal, Dialog, Paragraph, TextInput, Button } = utils

  const isDarkMode = useMemo(() => Appearance.getColorScheme() === 'dark', [])
  const colors = useMemo(() => {
    const themeColors = isDarkMode ? theme.dark.colors : theme.light.colors
    return {
      bg: themeColors.background,
      txt: themeColors.text,
      hd: themeColors.header
    }
  }, [isDarkMode, theme])

  useEffect(() => {
    setItem(propItem)
  }, [propItem])

  const getColorStatus = useCallback(status => STATUS_COLORS[status] || STATUS_COLORS.default, [])

  const requestMessage = useCallback(
    async (current, action, message = '') => {
      const body = new FormData()
      const token = user.device?.token || ''
      const android_id_install = user.device?.android_id_install || ''

      body.append('token', token)
      body.append('android_id_install', android_id_install)
      body.append('id_promo', current.id_promo)
      body.append('id_promo_user', current.id_promo_users || -1)
      body.append('id_action', action.id)
      body.append('msg', message)

      const result = await chatServicePost.fetchRequestMessage(body)

      if (result.code === 0) {
        setItem(result.promo?.[0] || {})
      } else {
        setIsVisibleDialog(true)
        setTextVisibleDialog(t('containers.request.compensation'))
        setOpenMessage(false)
      }
    },
    [user, chatServicePost, t]
  )

  const handleActionBron = useCallback(
    async action => {
      if (item?.is_my_bron === 0 && item?.status === 2 && action.id === 2) {
        Alert.prompt(
          t('common.attention'),
          t('containers.request.compensation'),
          [
            {
              text: t('common.ok'),
              style: 'destructive',
              onPress: async text => {
                await requestMessage(item, action, text)
              }
            },
            { text: t('common.cancel'), style: 'cancel' }
          ],
          'plain-text'
        )
      } else {
        Alert.alert(t('common.attention'), action.name + t('containers.request.question'), [
          { text: t('common.cancel'), style: 'destructive' },
          {
            text: t('common.yes'),
            onPress: async () => {
              await requestMessage(item, action)
            }
          }
        ])
      }
    },
    [item, Alert, t, requestMessage]
  )

  const handleActionBronWeb = useCallback(
    action => {
      if (item?.is_my_bron === 0 && item?.status === 2 && action.id === 2) {
        setIsVisibleDialog(true)
        setTextVisibleDialog(t('containers.request.compensation'))
        setActionCurrent(action)
        setOpenMessage(true)
      } else {
        setIsVisibleDialog(true)
        setTextVisibleDialog(action.name + t('containers.request.question'))
        setActionCurrent(action)
        setOpenMessage(false)
      }
    },
    [item, t]
  )

  const getInfo = useCallback(
    async id => {
      const result = await chatServiceGet.fetchChatParams(id)
      if (result?.code === 0) {
        history('/y/' + result.id_post + '/h/' + (result.id_hotel - 100000) + '/b/105')
      }
    },
    [chatServiceGet, history]
  )

  const handleDialogConfirm = useCallback(() => {
    setIsVisibleDialog(false)
    setTextVisibleDialog('')
    if (actionCurrent) {
      requestMessage(item, actionCurrent, textMessage)
    }
  }, [item, actionCurrent, textMessage, requestMessage])

  const handleDialogDismiss = useCallback(() => {
    setIsVisibleDialog(false)
    setTextVisibleDialog('')
  }, [])

  const renderTitle = useMemo(() => {
    if (item.room_title) {
      return <Text style={{ fontWeight: 'bold', fontSize: 16, color: item.is_finish === 1 ? 'gray' : colors.hd }}>{item.room_title}</Text>
    }
    return <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#ccc' }}>{t('screens.actions.noroom')}</Text>
  }, [item.room_title, item.is_finish, colors.hd, t])

  const renderStars = useMemo(() => {
    if (!item.hclass) return null
    const stars = Array.from({ length: item.hclass }, (_, i) => <Icon key={i} name="star" color="yellow" size={12} />)
    return <View style={{ flexDirection: 'row' }}>{stars}</View>
  }, [item.hclass, Icon])

  const d1 = useMemo(() => new Date(moment(item.date_zaezd).format()), [item.date_zaezd, moment])

  return (
    <>
      <ListItem bottomDivider containerStyle={{ backgroundColor: 'rgba(255,255,255,0.5)' }}>
        <ListItem.Content>
          <Text style={{ fontSize: 12, color: colors.txt }}>{item.name_country + ' / ' + item.rname}</Text>
          <Text style={{ fontSize: 18, color: '#008485', fontWeight: 'bold' }}>{item.name_hotel}</Text>
          {renderStars}
          {renderTitle}
          <View style={{ flexDirection: 'row' }}>
            <Text style={{ fontWeight: 'bold', color: colors.txt }}>{t('containers.action.checkin')}</Text>
            <Text
              style={{
                color: item.is_finish === 1 ? 'grey' : colors.hd,
                textDecorationLine: item.is_finish === 1 ? 'line-through' : 'none'
              }}>
              {moment(item.date_zaezd).format('HH:mm, DD MMM YYYY')}
            </Text>
          </View>
          <View style={{ flexDirection: 'row' }}>
            <Text style={{ fontWeight: 'bold', color: colors.txt }}>{t('containers.action.nights')}</Text>
            <Text
              style={{
                color: item.is_finish === 1 ? 'grey' : colors.hd,
                textDecorationLine: item.is_finish === 1 ? 'line-through' : 'none'
              }}>
              {item.cnt_days}
            </Text>
          </View>
          <View style={{ flexDirection: 'row' }}>
            <Text style={{ color: colors.txt }}>{t('containers.action.food')}</Text>
            <Text style={{ color: colors.hd }}>{CAT1[item.id_categ1]}</Text>
            <Text style={{ color: colors.txt }}>{t('containers.action.accommodation')}</Text>
            <Text style={{ color: colors.hd }}>{CAT2[item.id_categ2]}</Text>
          </View>
          <View style={{ flexDirection: 'row' }}>
            <Text style={{ color: colors.txt }}>{t('screens.actions.deposit')}</Text>
            <Text style={{ color: colors.hd }}>{(item.is_finish === 1 ? '~ ' : '') + item.symbol + item.price_for_promo}</Text>
          </View>
          <View style={{ flexDirection: 'row' }}>
            <Text style={{ color: colors.txt }}>{t('screens.actions.pay')}</Text>
            <Text style={{ color: colors.hd }}>{(item.is_finish === 1 ? '~ ' : '') + item.symbol + Math.floor(item.price_full - (item.price_full * item.price_proc) / 100)}</Text>
          </View>
          <Text style={{ color: colors.txt }}>{t('screens.actions.freepay')}</Text>
          <Text style={{ color: colors.hd }}>{moment(d1).format('HH:mm, DD MMM YYYY')}</Text>
          {item.is_finish === 1 && (
            <View style={{ position: 'absolute', right: -36, top: 10 }}>
              <Text style={{ color: 'red' }}>{t('screens.actions.req')}</Text>
            </View>
          )}
          {item.is_finish === 0 && (
            <View style={{ flexDirection: 'row' }}>
              <Text style={{ color: colors.txt }}>{t('containers.action.place') + item.count_room}</Text>
              <Text style={{ color: colors.txt }}>{(item.count_room > 0 ? t('containers.action.d1') : ' ' + t('containers.action.d2')) + item.day_to_finish}</Text>
            </View>
          )}
          {value === 1 && (
            <TouchableOpacity style={{ alignItems: 'flex-start', width: '100%' }} onPress={() => Linking.openURL('mailto:' + item.client_email)}>
              <Text style={{ fontSize: 16, color: MAIN_COLOR, fontWeight: 'bold' }}>{item.client_name}</Text>
              <Text style={{ fontSize: 16, color: MAIN_COLOR, fontWeight: 'bold' }}>{item.client_email}</Text>
            </TouchableOpacity>
          )}
        </ListItem.Content>
        <View style={{ alignItems: 'flex-end', height: '100%' }}>
          <View style={{ marginBottom: 30 }}>
            <View style={{ right: -10 }}>
              <TouchableOpacity onPress={() => getInfo(item.id_chat)} style={{ width: '50%', alignItems: 'center', justifyContent: 'center' }}>
                <Image source={ChatIcon} style={{ width: 30, height: 30 }} />
              </TouchableOpacity>
            </View>
          </View>
          <View style={{ alignItems: 'flex-end', justifyContent: 'center' }}>
            <Text style={{ color: MAIN_COLOR, fontWeight: 'bold' }}>{'Итого'}</Text>
            <Text style={{ fontWeight: 'bold', fontSize: 18, color: 'green' }}>{item.symbol + ' ' + item.price_full}</Text>
            <Text style={{ color: getColorStatus(item.status), textAlign: 'right', paddingTop: 10 }}>{item.status_name}</Text>
          </View>
        </View>
      </ListItem>
      {isVisibleDialog && (
        <Portal>
          <Dialog visible={isVisibleDialog} onDismiss={handleDialogDismiss} style={{ width: width - 20, alignSelf: 'center' }}>
            <Dialog.Title>{t('common.attention')}</Dialog.Title>
            <Dialog.Content>
              <Paragraph>{textVisibleDialog}</Paragraph>
              <Paragraph />
              {openMessage && <TextInput style={{ backgroundColor: 'transparent', color: colors.txt }} label={t('containers.request.message')} value={textMessage} onChangeText={setTextMessage} />}
            </Dialog.Content>
            <Dialog.Actions>
              {actionCurrent && (
                <Button onPress={handleDialogConfirm} style={{ marginRight: 20 }}>
                  {t('common.yes')}
                </Button>
              )}
              <Button onPress={handleDialogDismiss} mode="contained" style={{ backgroundColor: 'red' }}>
                {t('common.cancel')}
              </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      )}
    </>
  )
})

Item.displayName = 'Item'

export default Item
