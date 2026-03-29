import React, { PureComponent } from 'react'
import { Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native'

import requestModalModel from '../model/RequestModalModel'
import FieldSelect from './FieldSelect'

const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
const { MAIN_COLOR } = GLOBAL_OBJ.onlinetur.constants

class RequestModal extends PureComponent {
  static defaultProps = {}

  constructor(props) {
    super(props)

    /**
     * Инициализируем модели
     * @type {GetData}
     */
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
      openSnackbar: false,
      textSnackbar: '',
      vertical: 'top',
      horizontal: 'center'
    }

    this.valRef = React.createRef()
    this.valRefTime = React.createRef()

    this.onDrop = picture => {
      this.setState({
        pictures: this.state.pictures.concat(picture)
      })
    }
  }

  async componentDidMount() {
    await this.initData()
  }

  renderLeftIcon = () => {
    const { Icon } = this.props.utils
    const { setModalRequest } = this.props

    return (
      <TouchableOpacity onPress={() => setModalRequest(false)}>
        <Icon name={'close'} color={'red'} />
      </TouchableOpacity>
    )
  }

  renderRightsButtons = () => {
    const { t } = this.props.utils
    const { setModalRequest } = this.props

    return (
      <View style={{ flexDirection: 'row', flex: 1 }}>
        <TouchableOpacity
          onPress={async () => {
            const result = await this.onSaveAction()

            if (result.code === 0) {
              setModalRequest(false)
            } else {
              this.setState({ openSnackbar: true, textSnackbar: result.error })
            }
          }}>
          <Text style={{ color: MAIN_COLOR, fontSize: 16, paddingTop: 2 }}>{t('common.build')}</Text>
        </TouchableOpacity>
      </View>
    )
  }

  render() {
    const { Header, t, TextInput, TextField, theme, moment, Snackbar } = this.props.utils
    const { android } = this.props
    const { cnt_days, price_full, date_zaezd, idCateg1, idCateg2, categ1Name, categ2Name, id_categ1, id_categ2, id_curr, currency, openSnackbar, textSnackbar, vertical, horizontal } = this.state

    let props = {}
    if (android) {
      props = {
        containerStyle: { borderTopLeftRadius: 15, borderTopRightRadius: 15 }
      }
    }

    return (
      <>
        <Header
          {...props}
          onlineTurHeader
          statusBarProps={{ translucent: true }}
          containerStyle={{ borderTopLeftRadius: 10, borderTopRightRadius: 10 }}
          leftComponent={this.renderLeftIcon()}
          centerComponent={{ text: t('chat.model.onEvents.price'), style: { color: '#000', fontSize: 16, fontWeight: 'bold', paddingTop: 2 } }}
          backgroundColor={'#ececec'}
          rightComponent={this.renderRightsButtons()}
        />
        <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 10 }} scrollEnabled>
          <View style={{ width: '100%', flexDirection: 'row', alignContent: 'stretch' }}>
            <View style={{ flex: 1, paddingRight: 3 }}>
              <TextInput
                label={t('components.chat.actionmodal.component.requestmodal.night')}
                value={cnt_days.toString()}
                onChangeText={text => this.setState({ cnt_days: text.replace(/[^0-9]/g, '') })}
                style={{ backgroundColor: 'transparent', color: theme.text }}
              />
            </View>
            <View style={{ flex: 1, paddingLeft: 3 }}>
              <TextInput
                label={t('components.chat.actionmodal.component.requestmodal.price')}
                value={price_full.toString()}
                onChangeText={text => this.setState({ price_full: text.replace(/[^0-9]/g, '') })}
                style={{ backgroundColor: 'transparent', color: theme.text }}
              />
            </View>
          </View>
          <View style={{ width: '100%', flexDirection: 'row', alignContent: 'stretch' }}>
            <View style={{ flex: 1, paddingRight: 3 }}>
              {idCateg1.length > 0 ? (
                <FieldSelect categName={categ1Name} id_categ={id_categ1} items={idCateg1} onSelectItem={this.onSelectItem} idCategName={'id_categ1'} utils={this.props.utils} />
              ) : null}
            </View>
            <View style={{ flex: 1, paddingLeft: 3 }}>
              {idCateg2.length > 0 ? (
                <FieldSelect categName={categ2Name} id_categ={id_categ2} items={idCateg2} onSelectItem={this.onSelectItem} idCategName={'id_categ2'} utils={this.props.utils} />
              ) : null}
            </View>
          </View>
          <View style={{ width: '100%', flexDirection: 'row', alignContent: 'stretch' }}>
            <View style={{ flex: 1, paddingRight: 3 }}>
              {currency.length > 1 ? (
                <FieldSelect
                  categName={t('components.chat.actionmodal.component.requestmodal.currency')}
                  id_categ={id_curr}
                  items={currency}
                  onSelectItem={this.onSelectItem}
                  idCategName={'id_curr'}
                  utils={this.props.utils}
                />
              ) : null}
            </View>
            <View style={{ flex: 1, paddingLeft: 3, flexDirection: 'row', paddingTop: 15 }}>
              <TextField
                inputRef={this.valRef}
                id="date"
                label={t('components.chat.actionmodal.component.requestmodal.arrivalDate')}
                type="date"
                defaultValue={moment(date_zaezd).format('YYYY-MM-DD')}
                onChange={this.handleConfirmWeb}
                style={{ flex: 1, color: theme.text }}
                InputLabelProps={{
                  style: {
                    paddingLeft: 15
                  }
                }}
                InputProps={{
                  style: {
                    paddingLeft: 10
                  }
                }}
              />
              <TextField
                inputRef={this.valRefTime}
                id="time"
                label={t('components.chat.actionmodal.component.requestmodal.arrivalTime')}
                type="time"
                defaultValue={'14:00'}
                onChange={this.handleConfirmTimeWeb}
                style={{ flex: 1, color: theme.text }}
                InputLabelProps={{
                  style: {
                    paddingLeft: 10
                  }
                }}
                InputProps={{
                  style: {
                    paddingLeft: 10
                  }
                }}
              />
            </View>
          </View>
          <View style={{ height: 500 }} />
        </ScrollView>
        <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={() => this.setState({ openSnackbar: false })} anchorOrigin={{ vertical, horizontal }}>
          <View style={{ backgroundColor: 'red', width: 400, height: 60, borderRadius: 5, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>{textSnackbar}</Text>
          </View>
        </Snackbar>
      </>
    )
  }
}

export default RequestModal
