import isEmpty from 'lodash/isEmpty'
import md5 from 'md5'
import { createRef, PureComponent } from 'react'
import { ActivityIndicator, Appearance, Platform, StyleSheet, TouchableOpacity, View } from 'react-native'

import requestModalModel from './model/RequestModalModel'

const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
const { MAIN_COLOR } = GLOBAL_OBJ.onlinetur.constants
const { getAppConstants } = GLOBAL_OBJ.onlinetur.storage

const IS_IOS = Platform.OS === 'ios'
const IS_LEGACY_IOS = IS_IOS && parseInt(Platform.Version, 10) < 13

// --- Вспомогательные функции ---

const buildOrderUrl = user => {
  let url = `${getAppConstants().url_main}/myorder.php`
  if (isEmpty(user)) return url

  const hash = md5(user.login + 'sdlkgfls').substring(0, 4)
  url += `?un=${encodeURI(user.my_name)}&ue=${encodeURI(user.login)}&uk=${hash}&dg=15&fo=1&nsh=1`
  if (user.phone) url += `&ut=${user.phone}`
  return url
}

// --- Переиспользуемые компоненты ---

const DROPDOWN_SHADOW = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.25,
  shadowRadius: 3.84,
  elevation: 5
}

function DropdownArrow({ Icon }) {
  return (
    <View style={{ flex: 1, alignItems: 'flex-end', paddingBottom: 5 }}>
      <Icon name="keyboard-arrow-down" size={24} color="gray" />
    </View>
  )
}

function ModalDropdownInput({ TextInput, ModalDropdown, Icon, label, options, defaultIndex, onSelect, bg, txt, isDarkMode, dropdownRef }) {
  const dropdownStyle = {
    paddingLeft: 10,
    paddingTop: 33,
    backgroundColor: bg
  }

  const dropdownPopupStyle = {
    width: '45%',
    backgroundColor: bg,
    ...DROPDOWN_SHADOW
  }

  return (
    <TextInput
      label={label}
      value=" "
      onChangeText={() => {}}
      style={{ backgroundColor: 'transparent' }}
      render={() => (
        <ModalDropdown
          ref={dropdownRef}
          onSelect={onSelect}
          defaultIndex={defaultIndex}
          defaultValue={options[defaultIndex]}
          numberOfLines={1}
          renderRightComponent={() => <DropdownArrow Icon={Icon} />}
          options={options}
          style={dropdownStyle}
          textStyle={{ fontSize: 16, paddingBottom: 10, color: txt }}
          dropdownStyle={dropdownPopupStyle}
          dropdownTextStyle={{ fontSize: 16, color: txt, backgroundColor: bg }}
          dropdownTextHighlightStyle={{ fontSize: 16, color: isDarkMode ? '#fff' : txt }}
        />
      )}
    />
  )
}

// --- Основной компонент ---

class RequestModal extends PureComponent {
  constructor(props) {
    super(props)

    // Миксин методов из модели
    Object.assign(this, new requestModalModel(this, this.props.utils))

    const { t } = this.props.utils

    this.state = {
      msg: '',
      promo_msg: '',
      cnt_days: 0,
      price_full: 0,
      id_categ1: 0,
      id_categ2: 0,
      id_curr: 0,
      promo_count_room: 0,
      date_zaezd: new Date(),
      isDatePickerVisible: false,
      isTimePickerVisible: false,
      promo_button_bron_name: t('components.chat.actionmodal.component.requestmodal.bron'),
      hours: 0,
      price_proc: 15,
      is_add: this.props.isAdd,
      promo_price: 0,
      images: [],
      isSave: false,
      id_promo: null,
      idCateg1: [],
      categ1Name: '',
      idCateg2: [],
      categ2Name: '',
      currency: [t('components.chat.actionmodal.component.requestmodal.select')],
      id_user: 0,
      idNumber: [],
      idNumberIds: [],
      id_number: 0,
      room_title: '',
      roomSelect: '',
      isFocus: false
    }

    this.valRef = createRef()
  }

  async componentDidMount() {
    if (this.props.save) {
      await this.initData()
    }
  }

  // --- Рендер вспомогательных элементов ---

  renderLoading = () => (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <ActivityIndicator size="large" color={MAIN_COLOR} />
    </View>
  )

  renderLeftIcon = () => {
    const { Icon } = this.props.utils
    const { closeModalRequest } = this.props
    return (
      <TouchableOpacity onPress={closeModalRequest}>
        <Icon name="close" color="red" />
      </TouchableOpacity>
    )
  }

  renderRightsButtons = () => {
    const { Icon, t, Alert } = this.props.utils
    const { closeModalRequest } = this.props
    return (
      <View style={{ flexDirection: 'row', flex: 1 }}>
        <TouchableOpacity
          onPress={async () => {
            const result = await this.onSaveAction()
            if (result.code === 0) {
              closeModalRequest()
            } else {
              this.setState({ isSave: false }, () => {
                Alert.alert(t('common.errorTitle'), result.error)
              })
            }
          }}>
          <Icon name="done" color={MAIN_COLOR} />
        </TouchableOpacity>
      </View>
    )
  }

  render() {
    const { t, WebView, Header, Dropdown, theme, TextInput, ModalDropdown, Icon, moment, DateTimePickerModal } = this.props.utils
    const { user, save, android } = this.props
    const {
      cnt_days,
      price_full,
      date_zaezd,
      isDatePickerVisible,
      isTimePickerVisible,
      idCateg1,
      idCateg2,
      categ1Name,
      categ2Name,
      id_categ1,
      id_categ2,
      id_curr,
      currency,
      idNumber,
      roomSelect,
      isFocus
    } = this.state

    // --- WebView режим (просмотр заказов) ---
    if (!save) {
      return <WebView useWebKit javaScriptEnabled domStorageEnabled source={{ uri: buildOrderUrl(user) }} renderLoading={this.renderLoading} startInLoadingState />
    }

    const isDarkMode = Appearance.getColorScheme() === 'dark'
    const colors = isDarkMode ? theme.dark.colors : theme.light.colors
    const bg = colors.background
    const txt = colors.text

    const headerProps = android ? { containerStyle: { borderTopLeftRadius: 15, borderTopRightRadius: 15 } } : {}

    const dropdownSharedProps = { TextInput, ModalDropdown, Icon, bg, txt, isDarkMode }

    const datePickerSharedProps = {
      date: new Date(date_zaezd),
      locale: 'ru-RU',
      is24Hour: true,
      cancelTextIOS: t('common.cancel'),
      confirmTextIOS: t('common.confirm'),
      minimumDate: new Date()
    }

    return (
      <>
        {IS_LEGACY_IOS && <View style={{ height: 20 }} />}

        <Header
          {...headerProps}
          onlineTurHeader
          statusBarProps={{ translucent: true }}
          leftComponent={this.renderLeftIcon()}
          centerComponent={{
            text: t('chat.model.onEvents.price'),
            style: { color: txt, fontSize: 16, fontWeight: 'bold', paddingTop: 2 }
          }}
          backgroundColor={isDarkMode ? bg : '#ececec'}
          rightComponent={this.renderRightsButtons()}
        />

        <View style={{ margin: 10 }}>
          {/* Выбор номера */}
          {idNumber.length > 0 && (
            <Dropdown
              containerStyle={{ backgroundColor: bg }}
              style={[styles.dropdown, isFocus && { borderColor: 'blue' }, { backgroundColor: bg }]}
              placeholderStyle={[styles.placeholderStyle, { color: txt }]}
              selectedTextStyle={[styles.selectedTextStyle, { color: txt }]}
              inputSearchStyle={[styles.inputSearchStyle, { color: txt }]}
              iconStyle={styles.iconStyle}
              itemTextStyle={{ color: txt }}
              data={idNumber}
              labelField="label"
              valueField="value"
              placeholder={isFocus ? '...' : t('components.chat.actionmodal.component.requestmodal.rooms')}
              value={roomSelect}
              onFocus={() => this.setState({ isFocus: true })}
              onBlur={() => this.setState({ isFocus: false })}
              onChange={item => this.setState({ isFocus: false, roomSelect: item.value })}
            />
          )}

          {/* Ночи и цена */}
          <View style={{ width: '100%', flexDirection: 'row' }}>
            <View style={{ flex: 1, paddingRight: 3 }}>
              <TextInput
                label={t('components.chat.actionmodal.component.requestmodal.night')}
                value={cnt_days.toString()}
                onChangeText={text => this.setState({ cnt_days: Number(text) })}
                style={{ backgroundColor: 'transparent' }}
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1, paddingLeft: 3 }}>
              <TextInput
                label={t('components.chat.actionmodal.component.requestmodal.price')}
                value={price_full.toString()}
                onChangeText={text => this.setState({ price_full: Number(text) })}
                style={{ backgroundColor: 'transparent' }}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Категории */}
          <View style={{ width: '100%', flexDirection: 'row' }}>
            <View style={{ flex: 1, paddingRight: 3 }}>
              {idCateg1.length > 0 && (
                <ModalDropdownInput {...dropdownSharedProps} label={categ1Name} options={idCateg1} defaultIndex={id_categ1} onSelect={index => this.setState({ id_categ1: index })} />
              )}
            </View>
            <View style={{ flex: 1, paddingLeft: 3 }}>
              {idCateg2.length > 0 && (
                <ModalDropdownInput {...dropdownSharedProps} label={categ2Name} options={idCateg2} defaultIndex={id_categ2} onSelect={index => this.setState({ id_categ2: index })} />
              )}
            </View>
          </View>

          {/* Валюта и дата */}
          <View style={{ width: '100%', flexDirection: 'row' }}>
            <View style={{ width: '50%', paddingRight: 3 }}>
              <ModalDropdownInput
                {...dropdownSharedProps}
                label={t('components.chat.actionmodal.component.requestmodal.currency')}
                options={currency}
                defaultIndex={id_curr}
                onSelect={index => this.setState({ id_curr: index })}
                dropdownRef={this.valRef}
              />
            </View>
            <View style={{ width: '50%', paddingLeft: 3, flexDirection: 'row' }}>
              <TextInput
                label={t('components.chat.actionmodal.component.requestmodal.date')}
                value={moment(date_zaezd).format('DD MMM YYYY')}
                onChangeText={() => {}}
                style={{ backgroundColor: 'transparent', width: 122 }}
                editable={false}
                onTouchStart={() => this.setState({ isDatePickerVisible: true })}
              />
              <TextInput
                label=" "
                value="14:00"
                onChangeText={() => {}}
                style={{ backgroundColor: 'transparent', flex: 1, marginLeft: -15 }}
                editable={false}
                onTouchStart={() => this.setState({ isTimePickerVisible: true })}
              />
            </View>
          </View>
        </View>

        {/* Пикер даты */}
        {isDatePickerVisible && (
          <DateTimePickerModal
            {...datePickerSharedProps}
            isVisible
            mode="date"
            onConfirm={this.handleConfirm}
            onCancel={this.hideDatePicker}
            headerTextIOS={t('components.chat.actionmodal.component.requestmodal.arrivalDate')}
          />
        )}

        {/* Пикер времени */}
        {isTimePickerVisible && (
          <DateTimePickerModal
            {...datePickerSharedProps}
            isVisible
            mode="time"
            onConfirm={this.handleConfirmTime}
            onCancel={this.hideTimePicker}
            headerTextIOS={t('components.chat.actionmodal.component.requestmodal.arrivalTime')}
          />
        )}
      </>
    )
  }
}

const styles = StyleSheet.create({
  dropdown: {
    height: 50,
    borderColor: 'gray',
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc'
  },
  placeholderStyle: { fontSize: 16 },
  selectedTextStyle: { fontSize: 16 },
  iconStyle: { width: 20, height: 20 },
  inputSearchStyle: { height: 40, fontSize: 16 }
})

export default RequestModal
