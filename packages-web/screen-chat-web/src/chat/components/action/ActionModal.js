import { createRef, PureComponent } from 'react'
import { Appearance, FlatList, Keyboard, KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native'

import DaysModal from './DaysModal'
import ActionModalModel from './model/ActionModalModel'
import VariantsModal from './VariantsModal'

const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
const { MAIN_COLOR } = GLOBAL_OBJ.onlinetur.constants

class ActionModal extends PureComponent {
  constructor(props) {
    super(props)

    /**
     * Инициализируем модели
     * @type {GetData}
     */
    Object.assign(this, new ActionModalModel(this, this.props.utils))

    const { t } = this.props.utils

    this.state = {
      msg: '',
      room_title: '',
      id_room: -1,
      promo_msg: '',
      cnt_days: 7,
      price_full: 0,
      id_categ1: 0,
      id_number: 0,
      id_curr: 0,
      promo_count_room: 0,
      date_zaezd: new Date().setDate(new Date().getDate() + 14),
      isDatePickerVisible: false,
      isTimePickerVisible: false,
      hours: 0,
      price_proc: 15,
      is_add: this.props.isAdd,
      promo_price: 0,
      images: [],
      isSave: false,
      id_promo: null,
      idCateg1: [],
      idNumber: [],
      idNumberDesc: [],
      idNumberIds: [],
      idNumberType: [],
      room_type: '',
      categ1Name: '',
      idCateg2: [],
      categ2Name: '',
      currency: [t('components.chat.actionmodal.component.actionmodal.select')],
      day_to_return: 2,
      promButtonName: [],
      promButtonIds: [],
      idPromButton: 0,
      promo_id_button_bron: null,

      variants: [],
      variantsModal: false,

      days: [],
      daysModal: false
    }

    this.valRef = createRef()
    this.promRef = createRef()

    this.openCloseVarints = () => {
      const { variantsModal } = this.state

      this.setState({ variantsModal: !variantsModal })
    }

    this.openCloseDays = () => {
      const { daysModal } = this.state

      this.setState({ daysModal: !daysModal })
    }

    this.changeVarints = variants => {
      this.setState({ variants: variants, variantsModal: false })
    }

    this.changeDays = days => {
      this.setState({ days: days, daysModal: false })
    }
  }

  async componentDidMount() {
    await this.initData()
  }

  renderLeftIcon = () => {
    const { Icon } = this.props.utils
    const { closeModalAction } = this.props

    return (
      <TouchableOpacity onPress={() => closeModalAction()}>
        <Icon name={'close'} color={'red'} />
      </TouchableOpacity>
    )
  }

  render() {
    const { t, theme, Header, TextInput, ModalDropdown, Icon, moment, DateTimePickerModal } = this.props.utils

    const { android } = this.props
    const {
      msg,
      promo_msg,
      cnt_days,
      price_full,
      promo_count_room,
      date_zaezd,
      isDatePickerVisible,
      isTimePickerVisible,
      hours,
      price_proc,
      images,
      is_add,
      idCateg1,
      idCateg2,
      categ1Name,
      categ2Name,
      id_categ1,
      id_categ2,
      id_curr,
      currency,
      day_to_return,
      idNumber,
      id_number,
      room_title,
      idNumberIds,
      idNumberDesc,
      idNumberType,
      promButtonName,
      promButtonIds,
      idPromButton,
      variantsModal,
      variants,
      days,
      daysModal
    } = this.state

    let props = {}
    if (android) {
      props = {
        containerStyle: { borderTopLeftRadius: 15, borderTopRightRadius: 15 }
      }
    }

    let isDarkMode = Appearance.getColorScheme() === 'dark'
    let bg = isDarkMode ? theme.dark.colors.background : theme.light.colors.background
    let txt = isDarkMode ? theme.dark.colors.text : theme.light.colors.text

    return (
      <>
        {parseInt(Platform.Version, 10) < 13 ? <View style={{ height: 20 }} /> : null}
        <Header
          {...props}
          onlineTurHeader
          statusBarProps={{ translucent: true }}
          leftComponent={this.renderLeftIcon()}
          centerComponent={{ text: t('chat.model.onEvents.actionCreate'), style: { color: txt, fontSize: 16, fontWeight: 'bold', paddingTop: 2 } }}
          backgroundColor={isDarkMode ? bg : '#ececec'}
          rightComponent={{
            icon: 'done',
            color: 'blue',
            onPress: () => {
              this.onSaveAction()
            }
          }}
        />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={100} style={{ flex: 1 }}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 10 }} scrollEnabled>
              {is_add !== 1 ? (
                <>
                  <TextInput
                    label={t('components.chat.actionmodal.component.actionmodal.beforePayment')}
                    value={msg}
                    onChangeText={text => this.setState({ msg: text })}
                    style={{ backgroundColor: 'transparent', color: theme.text }}
                  />
                  <TextInput
                    label={t('components.chat.actionmodal.component.actionmodal.afterPayment')}
                    value={promo_msg}
                    onChangeText={text => this.setState({ promo_msg: text })}
                    style={{ backgroundColor: 'transparent', color: theme.text }}
                  />
                </>
              ) : null}
              <View>
                {idNumber.length > 0 ? (
                  <TextInput
                    label={t('components.chat.actionmodal.component.actionmodal.room')}
                    value={' '}
                    onChangeText={text => console.log(text)}
                    style={{ backgroundColor: 'transparent', color: theme.text }}
                    render={props => (
                      <ModalDropdown
                        onSelect={index => this.setState({ id_number: index, room_title: idNumber[index], id_room: idNumberIds[index], room_type: idNumberType[index] })}
                        defaultIndex={id_number}
                        defaultValue={idNumber[id_number]}
                        numberOfLines={3}
                        renderRightComponent={() => (
                          <View style={{ alignItems: 'flex-end', paddingBottom: 5 }}>
                            <Icon name="keyboard-arrow-down" size={24} color="gray" />
                          </View>
                        )}
                        options={idNumber}
                        style={{
                          borderBottomWidth: 1,
                          borderBottomColor: '#bbb',
                          paddingLeft: 10,
                          paddingTop: 33,
                          backgroundColor: bg
                        }}
                        textStyle={{ flex: 1, fontSize: 16, paddingBottom: 10, color: txt }}
                        dropdownStyle={{
                          width: '80%',
                          height: '50%',
                          shadowColor: '#000',
                          shadowOffset: {
                            width: 0,
                            height: 2
                          },
                          shadowOpacity: 0.25,
                          shadowRadius: 3.84,
                          elevation: 5,
                          backgroundColor: bg
                        }}
                        dropdownTextStyle={{ fontSize: 16, color: txt, backgroundColor: bg }}
                        renderRow={(item, index, highlighted) => {
                          return (
                            <View style={{ padding: 10, backgroundColor: bg }}>
                              <Text style={{ color: txt }}>{idNumber[index]}</Text>
                              <Text style={{ fontSize: 11, color: txt }}>{idNumberDesc[index]}</Text>
                            </View>
                          )
                        }}>
                        <View style={{ paddingBottom: 10 }}>
                          <Text style={{ fontSize: 16, color: theme.text }}>{idNumber[id_number]}</Text>
                          <Text style={{ fontSize: 11, color: '#888888', width: '80%' }}>{idNumberDesc[id_number]}</Text>
                        </View>
                      </ModalDropdown>
                    )}
                  />
                ) : (
                  <TextInput
                    label={t('components.chat.actionmodal.component.actionmodal.room')}
                    value={room_title}
                    onChangeText={text => this.setState({ room_title: text })}
                    style={{ backgroundColor: 'transparent', color: theme.text }}
                  />
                )}
              </View>
              <View style={{ width: '100%', flexDirection: 'row', alignContent: 'stretch' }}>
                <View style={{ width: '50%', paddingRight: 3 }}>
                  <View style={{ flexDirection: 'row' }}>
                    <TextInput
                      label={t('components.chat.actionmodal.component.actionmodal.night')}
                      value={cnt_days.toString()}
                      onChangeText={text => this.setState({ cnt_days: Number(text) })}
                      style={{ backgroundColor: 'transparent', flex: 0.9, color: theme.text }}
                      keyboardType={'numeric'}
                    />
                    <View style={{ flex: 0.1, alignItems: 'center', justifyContent: 'center' }}>
                      <TouchableOpacity onPress={() => (price_full > 0 ? this.openCloseDays() : {})}>
                        <Icon name={'settings'} size={30} color="gray" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
                <View style={{ width: '50%', paddingLeft: 3 }}>
                  <TextInput
                    label={t('components.chat.actionmodal.component.actionmodal.price')}
                    value={price_full.toString()}
                    onChangeText={text => this.setState({ price_full: Number(text) })}
                    style={{ backgroundColor: 'transparent', color: theme.text }}
                    keyboardType={'numeric'}
                  />
                </View>
              </View>
              <View style={{ width: '100%', flexDirection: 'row', alignContent: 'stretch' }}>
                <View style={{ width: '50%', paddingRight: 3 }}>
                  {idCateg1.length > 0 ? (
                    <TextInput
                      label={categ1Name}
                      value={' '}
                      onChangeText={text => console.log(text)}
                      style={{ backgroundColor: 'transparent', color: theme.text }}
                      render={props => (
                        <ModalDropdown
                          onSelect={index => this.setState({ id_categ1: index })}
                          defaultIndex={id_categ1}
                          defaultValue={idCateg1[id_categ1]}
                          numberOfLines={1}
                          renderRightComponent={() => (
                            <View style={{ flex: 1, alignItems: 'flex-end', paddingBottom: 5 }}>
                              <Icon name="keyboard-arrow-down" size={24} color="gray" />
                            </View>
                          )}
                          options={idCateg1}
                          style={{
                            borderBottomWidth: 1,
                            borderBottomColor: '#bbb',
                            paddingLeft: 10,
                            paddingTop: 33,
                            backgroundColor: bg
                          }}
                          textStyle={{ fontSize: 16, paddingBottom: 10, color: txt }}
                          dropdownStyle={{
                            width: '45%',
                            shadowColor: '#000',
                            shadowOffset: {
                              width: 0,
                              height: 2
                            },
                            shadowOpacity: 0.25,
                            shadowRadius: 3.84,
                            elevation: 5,
                            backgroundColor: bg
                          }}
                          dropdownTextStyle={{ fontSize: 16, color: txt, backgroundColor: bg }}
                          dropdownTextHighlightStyle={{ fontSize: 16, color: isDarkMode ? '#fff' : txt }}
                        />
                      )}
                    />
                  ) : null}
                </View>
                <View style={{ width: '50%', paddingLeft: 3 }}>
                  {price_full > 0 ? (
                    <TouchableOpacity onPress={() => this.openCloseVarints()} style={{ flex: 1, backgroundColor: '#eaeaea', alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ color: variants.length > 0 ? 'green' : 'red', textAlign: 'center' }}>Варианты размещения</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={{ flex: 1, backgroundColor: '#eaeaea', alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ color: '#a8a8a8', textAlign: 'center' }}>Варианты размещения</Text>
                    </View>
                  )}
                </View>
              </View>
              <View style={{ width: '100%', flexDirection: 'row', alignContent: 'stretch' }}>
                <View style={{ width: '50%', paddingRight: 3 }}>
                  <TextInput
                    label={t('components.chat.actionmodal.component.actionmodal.quantity')}
                    value={promo_count_room.toString()}
                    onChangeText={text => this.setState({ promo_count_room: Number(text) })}
                    style={{ backgroundColor: 'transparent', color: theme.text }}
                    keyboardType={'numeric'}
                  />
                </View>
                <View style={{ width: '50%', paddingLeft: 3, flexDirection: 'row' }}>
                  <TextInput
                    label={t('components.chat.actionmodal.component.actionmodal.date')}
                    value={moment(date_zaezd).format('DD MMM YYYY')}
                    onChangeText={text => {}}
                    style={{ backgroundColor: 'transparent', width: 122, color: theme.text }}
                    editable={false}
                    onTouchStart={() => this.setState({ isDatePickerVisible: true })}
                  />
                  <TextInput
                    label=" "
                    value={'14:00'}
                    onChangeText={text => {}}
                    style={{ backgroundColor: 'transparent', flex: 1, marginLeft: -15, color: theme.text }}
                    editable={false}
                    onTouchStart={() => this.setState({ isTimePickerVisible: true })}
                  />
                </View>
              </View>
              <View style={{ width: '100%', flexDirection: 'row', alignContent: 'stretch' }}>
                <View style={{ width: '50%', paddingRight: 3 }}>
                  <TextInput
                    label={t('components.chat.actionmodal.component.actionmodal.button')}
                    value={promButtonName[idPromButton]}
                    onChangeText={text => console.log(text)}
                    style={{ backgroundColor: 'transparent', color: theme.text }}
                    render={props => {
                      return (
                        <ModalDropdown
                          ref={this.promRef}
                          onSelect={index => this.setState({ idPromButton: index, promo_id_button_bron: promButtonIds[index] })}
                          defaultIndex={idPromButton}
                          defaultValue={promButtonName[idPromButton]}
                          numberOfLines={1}
                          renderRightComponent={() => (
                            <View style={{ flex: 1, alignItems: 'flex-end', paddingBottom: 5 }}>
                              <Icon name="keyboard-arrow-down" size={24} color="gray" />
                            </View>
                          )}
                          options={promButtonName}
                          style={{
                            // borderBottomWidth: 1,
                            borderBottomColor: '#bbb',
                            paddingLeft: 10,
                            paddingTop: 33,
                            marginBottom: 2,
                            backgroundColor: bg
                          }}
                          textStyle={{ fontSize: 16, paddingBottom: 10, color: txt }}
                          dropdownStyle={{
                            width: '45%',
                            height: 250,
                            shadowColor: '#000',
                            shadowOffset: {
                              width: 0,
                              height: 2
                            },
                            shadowOpacity: 0.25,
                            shadowRadius: 3.84,
                            elevation: 5,
                            backgroundColor: bg
                          }}
                          dropdownTextStyle={{ fontSize: 16, color: txt, backgroundColor: bg }}
                          dropdownTextHighlightStyle={{ fontSize: 16, color: isDarkMode ? '#fff' : txt }}
                        />
                      )
                    }}
                  />
                </View>
                <View style={{ width: '50%', paddingLeft: 3 }}>
                  <TextInput
                    label={t('components.chat.actionmodal.component.actionmodal.hour')}
                    value={hours.toString()}
                    onChangeText={text => this.setState({ hours: Number(text) })}
                    style={{ backgroundColor: 'transparent', color: theme.text }}
                    keyboardType={'numeric'}
                  />
                </View>
              </View>
              <View style={{ width: '100%', flexDirection: 'row', alignContent: 'stretch' }}>
                <View style={{ width: '50%', paddingRight: 3 }}>
                  <TextInput
                    label={t('components.chat.actionmodal.component.actionmodal.currency')}
                    value={currency[id_curr]}
                    onChangeText={text => console.log(text)}
                    style={{ backgroundColor: 'transparent', color: theme.text }}
                    render={props => {
                      return (
                        <ModalDropdown
                          ref={this.valRef}
                          onSelect={index => this.setState({ id_curr: index })}
                          defaultIndex={id_curr}
                          defaultValue={currency[id_curr]}
                          numberOfLines={1}
                          renderRightComponent={() => (
                            <View style={{ flex: 1, alignItems: 'flex-end', paddingBottom: 5 }}>
                              <Icon name="keyboard-arrow-down" size={24} color="gray" />
                            </View>
                          )}
                          options={currency}
                          style={{
                            // borderBottomWidth: 1,
                            borderBottomColor: '#bbb',
                            paddingLeft: 10,
                            paddingTop: 33,
                            marginBottom: 2,
                            backgroundColor: bg
                          }}
                          textStyle={{ fontSize: 16, paddingBottom: 10, color: txt }}
                          dropdownStyle={{
                            width: '45%',
                            height: 200,
                            shadowColor: '#000',
                            shadowOffset: {
                              width: 0,
                              height: 2
                            },
                            shadowOpacity: 0.25,
                            shadowRadius: 3.84,
                            elevation: 5,
                            backgroundColor: bg
                          }}
                          dropdownTextStyle={{ fontSize: 16, color: txt, backgroundColor: bg }}
                          dropdownTextHighlightStyle={{ fontSize: 16, color: isDarkMode ? '#fff' : txt }}
                        />
                      )
                    }}
                  />
                </View>
                <View style={{ width: '50%', paddingLeft: 3, flexDirection: 'row' }}>
                  <View style={{ flex: 1 }}>
                    <TextInput
                      label={t('components.chat.actionmodal.component.actionmodal.cashback')}
                      value={price_proc.toString()}
                      onChangeText={text => this.setState({ price_proc: Number(text) })}
                      onEndEditing={() => {
                        if (price_proc < 15) {
                          this.setState({ price_proc: 15 })
                        }
                      }}
                      style={{ backgroundColor: 'transparent', color: theme.text }}
                      keyboardType={'numeric'}
                    />
                  </View>
                  <Text style={{ alignSelf: 'flex-end', paddingBottom: 10, fontSize: 16, color: theme.text }}>{'%'}</Text>
                </View>
              </View>
              <View style={{ width: '100%' }}>
                <TextInput
                  label={t('components.chat.actionmodal.component.actionmodal.term')}
                  value={day_to_return.toString()}
                  onChangeText={text => this.setState({ day_to_return: Number(text) })}
                  style={{ backgroundColor: 'transparent', color: theme.text }}
                  keyboardType={'numeric'}
                />
              </View>
              <Text />
              {is_add === 0 ? (
                <TouchableOpacity onPress={() => this.getImagesVideo()} style={{ alignSelf: 'center' }}>
                  <Text style={{ color: MAIN_COLOR, fontSize: 16 }}>{t('components.chat.actionmodal.component.actionmodal.addImage')}</Text>
                </TouchableOpacity>
              ) : null}
              {images.length > 0 ? (
                <View style={{ height: 73, opacity: 0.7 }}>
                  <FlatList data={images} keyExtractor={this.keyExtractor} horizontal={true} renderItem={this.renderPreviewImage} />
                </View>
              ) : null}
            </ScrollView>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
        {isDatePickerVisible && (
          <DateTimePickerModal
            date={new Date(date_zaezd)}
            isVisible={isDatePickerVisible}
            mode="date"
            onConfirm={this.handleConfirm}
            onCancel={this.hideDatePicker}
            locale={'ru-RU'}
            is24Hour={true}
            cancelTextIOS={t('common.cancel')}
            confirmTextIOS={t('common.confirm')}
            headerTextIOS={t('components.chat.actionmodal.component.actionmodal.arrivalDate')}
            minimumDate={new Date()}
          />
        )}
        {isTimePickerVisible && (
          <DateTimePickerModal
            date={new Date(date_zaezd)}
            isVisible={isTimePickerVisible}
            mode="time"
            onConfirm={this.handleConfirmTime}
            onCancel={this.hideTimePicker}
            locale={'ru-RU'}
            is24Hour={true}
            cancelTextIOS={t('common.cancel')}
            confirmTextIOS={t('common.confirm')}
            headerTextIOS={t('components.chat.actionmodal.component.actionmodal.arrivalTime')}
          />
        )}
        {variantsModal && (
          <VariantsModal
            variantsModal={variantsModal}
            openCloseVarints={this.openCloseVarints}
            changeVarints={this.changeVarints}
            variants={variants}
            items={currency}
            id_categ={id_curr}
            price_full={price_full}
            utils={this.props.utils}
          />
        )}
        {daysModal && (
          <DaysModal
            daysModal={daysModal}
            openCloseDays={this.openCloseDays}
            changeDays={this.changeDays}
            days={days}
            items={currency}
            id_categ={id_curr}
            price_full={price_full}
            utils={this.props.utils}
          />
        )}
      </>
    )
  }
}

export default ActionModal
