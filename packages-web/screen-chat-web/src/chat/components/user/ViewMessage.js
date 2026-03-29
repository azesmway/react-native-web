import { useCallback, useMemo } from 'react'
import { Appearance, Dimensions, Image, Linking, Platform, Text, View } from 'react-native'

import CountryIcon from '../../../../images/earth_globe_com.png'
import HotelIcon from '../../../../images/hotel_hand_drawn_com.png'
import MoneyIcon from '../../../../images/money-pngrepo-com.png'

const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
const { MAIN_COLOR } = GLOBAL_OBJ.onlinetur.constants
const { width } = Dimensions.get('window')

const HELP_URL = 'https://stuzon.com/pom_link1.php?idn=169&id=1913'

// --- Вспомогательные функции ---

const getLikesLabel = (prih, rash) => {
  const total = Number(prih) + Number(rash)
  const suffix = total === 0 || total >= 5 ? 'лайков' : total >= 2 ? 'лайка' : 'лайк'
  return `Всего: ${total} ${suffix} (получил: ${prih}, поставил: ${rash})`
}

// --- Атомарные компоненты ---

function StatRow({ icon, text, color = MAIN_COLOR }) {
  return (
    <View style={{ flexDirection: 'row', marginTop: 10 }}>
      <View style={{ width: 32, alignItems: 'center', justifyContent: 'center' }}>{icon}</View>
      <View style={{ justifyContent: 'center' }}>
        <Text style={{ marginLeft: 1, fontSize: 16, color, fontWeight: 'bold' }}>{text}</Text>
      </View>
    </View>
  )
}

// --- Основной компонент ---

function ViewMessage({ utils, modalUser, setModalUser }) {
  const { Modal, Portal, isMobile, theme, Button, Icon } = utils

  const isDarkMode = Appearance.getColorScheme() === 'dark'
  const colors = isDarkMode ? theme.dark.colors : theme.light.colors
  const { background: bg, text: txt } = colors

  const handleClose = useCallback(() => setModalUser({}), [setModalUser])

  const handleHelp = useCallback(() => {
    setModalUser({})
    Linking.openURL(HELP_URL)
  }, [setModalUser])

  const likesLabel = useMemo(() => (modalUser?.viewMessage ? getLikesLabel(modalUser.viewMessage.prih_like, modalUser.viewMessage.rash_like) : ''), [modalUser?.viewMessage])

  if (!modalUser?.viewModalMessage) return null

  const { viewModalMessage, viewMessage } = modalUser
  const summColor = viewMessage.summ >= 50 ? 'green' : '#939393'

  return (
    <Portal>
      <Modal visible={viewModalMessage} onDismiss={handleClose} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <View
          style={{
            width: isMobile ? width : width / 3,
            borderRadius: 10,
            backgroundColor: '#ffffff',
            alignSelf: 'center',
            height: 300
          }}>
          {/* Заголовок */}
          <View style={{ alignItems: 'center', marginTop: 10, marginBottom: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: txt }}>{'Информация о пользователе'}</Text>
          </View>

          {/* Статистика */}
          <View style={{ marginLeft: 20, marginRight: 40 }}>
            <StatRow icon={<Icon name="favorite" color={summColor} size={26} />} text={likesLabel} color={summColor} />
            <StatRow icon={<Image source={CountryIcon} style={{ width: 20, height: 20 }} />} text={`Посетил: ${viewMessage.cnt_pos_country ?? '0'} стран`} />
            <StatRow icon={<Image source={HotelIcon} style={{ width: 20, height: 20 }} />} text={`Посетил: ${viewMessage.cnt_pos_hotels ?? '0'} отелей`} />
            <StatRow icon={<Image source={MoneyIcon} style={{ width: 20, height: 20 }} />} text={`Баланс: ${Math.trunc(viewMessage.summ)}р.`} />
          </View>

          {/* Кнопки */}
          <View style={{ width: '100%', flexDirection: 'row', bottom: 20, position: 'absolute' }}>
            <View style={{ width: '50%', alignItems: 'center' }}>
              <Button mode="contained" style={{ backgroundColor: '#e4ecf6' }} onPress={handleHelp}>
                <Text style={{ color: txt }}>{'Помощь'}</Text>
              </Button>
            </View>
            <View style={{ width: '50%', alignItems: 'center' }}>
              <Button mode="contained" style={{ backgroundColor: '#e4ecf6' }} onPress={handleClose}>
                <Text style={{ color: txt }}>{'OK'}</Text>
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </Portal>
  )
}

export default ViewMessage
