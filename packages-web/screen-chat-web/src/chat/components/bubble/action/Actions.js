import isEmpty from 'lodash/isEmpty'
import { PureComponent } from 'react'
import { ActivityIndicator, Dimensions, ImageBackground, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

import triangle from '../../../../../images/triangle.png'

const WIDTH_TOOLTIP = 200
const HEIGHT_TOOLTIP = 240

const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
const { width } = Dimensions.get('window')
const { MAIN_COLOR, WIDTH_MAX } = GLOBAL_OBJ.onlinetur.constants

class Actions extends PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      isLoading: false,
      action: {},
      visible: false,
      current: {},
      visibleActionView: false,
      isAdd: null,
      isActionSelectOpen: false,
      isModalBGTransparent: true,
      isModalBGBlurred: false,
      visibleModal: false,
      actionMessage: null,
      isVisibleDialog: false,
      textVisibleDialog: '',
      tooltipOpen: false
    }

    this.initData = () => {
      const { chatServiceGet } = this.props.utils

      const { chatAction } = this.props

      if (!chatAction) {
        this.setState({ isLoading: true, visibleActionView: true }, async () => {
          const { appUser, currentMessage } = this.props
          const android_id_install = !isEmpty(appUser) ? appUser.android_id_install : ''
          const token = !isEmpty(appUser) ? appUser.device.token : ''
          const result = await chatServiceGet.dataListAction(android_id_install, token, currentMessage.id)

          if (result.code === 0) {
            this.setState({
              action: result,
              isLoading: false,
              current: result.promo && result.promo.length > 0 ? result.promo[0] : {}
            })
          } else {
            this.setState({ isLoading: false })
          }
        })
      } else {
        const { appUser, currentMessage } = this.props
        const android_id_install = !isEmpty(appUser) ? appUser.android_id_install : ''
        const token = !isEmpty(appUser) ? appUser.device.token : ''
        chatServiceGet.dataListAction(android_id_install, token, currentMessage.id).then(result => {
          if (result.code === 0) {
            this.setState({
              action: result,
              isLoading: false,
              current: result.promo && result.promo.length > 0 ? result.promo[0] : {}
            })
          } else {
            this.setState({ isLoading: false })
          }
        })
      }
    }

    this.onSelect = (el, i) => {
      const { action } = this.state

      this.setState({ visible: false, current: action.promo[i] }, async () => {})
    }

    this.sendBronRequest = async id_promo => {
      const { Alert, chatServiceGet, t } = this.props.utils

      const { appUser, webAlerter } = this.props
      const android_id_install = !isEmpty(appUser) ? appUser.android_id_install : ''
      const token = !isEmpty(appUser) ? appUser.device.token : ''

      const result = await chatServiceGet.setPromoBron(android_id_install, token, id_promo)

      if (result.code === 0) {
        this.setState({ isLoading: false, actionMessage: null })
        const msg = result.msg && result.msg !== '' ? result.msg : t('containers.action.success')

        Alert.alert(t('common.attention'), msg)
      } else {
        Alert.alert(t('common.attention'), result.error)
      }
    }

    this.onBronPress = async (price_for_promo, id_promo) => {
      const { Alert, t } = this.props.utils

      Alert.alert(t('common.attention'), t('containers.action.bron') + price_for_promo + t('containers.action.bron1'), [
        { text: t('common.cancel'), style: 'destructive' },
        { text: t('common.yes'), onPress: async () => await this.sendBronRequest(id_promo) }
      ])
    }

    this.onCancelAction = () => {
      this.initData()
    }
  }

  async componentDidMount() {
    this.initData()
  }

  renderTopCoordView() {
    const { Icon } = this.props.utils

    const { action } = this.state

    let styleView =
      Platform.OS === 'web'
        ? {
            right: -10,
            top: -5,
            zIndex: 100
          }
        : {
            right: -7,
            top: -8,
            zIndex: 100
          }

    return (
      <TouchableOpacity
        onPress={() => {
          this.props.openModalActionSelect({
            action: action,
            onSelect: this.onSelect
          })
        }}
        style={{ position: 'absolute', top: 0, right: 0, zIndex: 30 }}>
        <ImageBackground source={triangle} style={{ width: 40, height: 40, zIndex: 35 }}>
          <View style={{ ...styleView }}>
            <Icon name={'keyboard-arrow-down'} fontSize={'large'} size={40} color={'#fd6a02'} style={{ color: '#fd6a02' }} />
          </View>
        </ImageBackground>
      </TouchableOpacity>
    )
  }

  renderActionButton() {
    const { t } = this.props.utils

    return (
      <View style={{ height: 40, alignItems: 'flex-end', paddingTop: 10, marginRight: 5 }}>
        <TouchableOpacity onPress={() => this.initData()}>
          <Text style={{ fontSize: 16, color: MAIN_COLOR }}>{t('common.moreAction')}</Text>
        </TouchableOpacity>
      </View>
    )
  }

  renderActionText() {
    const { t, Button } = this.props.utils

    return (
      <View style={{ width: '100%', marginTop: 20, flexDirection: 'row' }}>
        <Button
          title={t('containers.action.view')}
          onPress={() => this.initData()}
          containerStyle={{ width: '100%' }}
          type="outline"
          icon={{
            name: 'redeem',
            color: MAIN_COLOR
          }}
        />
      </View>
    )
  }

  renderTooltipMenu() {
    const { ListItem, chatServiceGet, t, Icon } = this.props.utils

    const { openModalAction, moreAction, chatAction } = this.props
    const { current, action } = this.state

    return (
      <View style={{ width: WIDTH_TOOLTIP - 10 }}>
        <ListItem
          key={0}
          bottomDivider
          onPress={() => {
            this.setState({ tooltipOpen: false }, () => {
              if (chatAction) {
                this.setState({ isLoading: true, visibleActionView: true }, async () => {
                  const { appUser, currentMessage } = this.props
                  const android_id_install = !isEmpty(appUser) ? appUser.android_id_install : ''
                  const token = !isEmpty(appUser) ? appUser.device.token : ''
                  const result = await chatServiceGet.dataListAction(android_id_install, token, currentMessage.id)

                  if (result.code === 0) {
                    this.setState(
                      {
                        action: result,
                        isLoading: false,
                        current: result.promo && result.promo.length > 0 ? result.promo[0] : {}
                      },
                      () => {
                        openModalAction(result, result.promo && result.promo.length > 0 ? result.promo[0] : {}, -1)
                      }
                    )
                  } else {
                    this.setState({ isLoading: false })
                  }
                })
              } else {
                openModalAction(action, current, -1)
              }
            })
          }}>
          <Icon name={'edit'} size={26} />
          <ListItem.Content>
            <ListItem.Subtitle style={{ color: '#000' }}>{t('tooltip.edit')}</ListItem.Subtitle>
          </ListItem.Content>
        </ListItem>
        <ListItem
          key={2}
          onPress={() => {
            this.setState({ tooltipOpen: false }, () => {
              moreAction()
            })
          }}>
          <Icon name={'more-horiz'} size={26} color={'#868686'} />
          <ListItem.Content>
            <ListItem.Subtitle style={{ color: '#000' }}>{t('tooltip.more')}</ListItem.Subtitle>
          </ListItem.Content>
        </ListItem>
      </View>
    )
  }

  renderRightView() {
    const { t } = this.props.utils

    const { current } = this.state

    return (
      <View
        style={{
          width: 120,
          alignItems: 'flex-end',
          justifyContent: 'center'
        }}>
        {current.is_bron === 0 && current.is_finish === 0 ? (
          <>
            <Text style={{ color: MAIN_COLOR, fontWeight: 'bold' }}>{current && current.button_bron_name && current.button_bron_name.toUpperCase()}</Text>
            {/*<Icon name={'keyboard-arrow-right'} color={MAIN_COLOR} />*/}
            <Text style={{ fontWeight: 'bold', fontSize: 22, color: 'green' }}>{current.symbol + ' ' + current.price_full}</Text>
          </>
        ) : null}
        {current.is_bron === 1 && current.is_finish === 0 ? (
          <View style={{ width: '100%', marginTop: 20, flexDirection: 'row' }}>
            <Text style={{ color: '#fd6a02', fontWeight: 'bold', fontSize: 16 }}>{t('containers.action.booked')}</Text>
          </View>
        ) : null}
        {current.is_finish === 1 ? (
          <View style={{ flexDirection: 'row' }}>
            <Text style={{ color: '#b4b4b4', fontWeight: 'bold', fontSize: 16 }}>{t('containers.action.completed')}</Text>
          </View>
        ) : null}
      </View>
    )
  }

  renderContent() {
    const { t, moment, ListItem, theme } = this.props.utils

    const { appUser, currentMessage } = this.props
    const { current } = this.state

    const d1 = new Date(moment(current.date_zaezd).format())
    const cat1 = ['RO', 'BB', 'HB', 'FB', 'AI']
    const cat2 = ['DBL', 'SGL', 'TRPL', 'SGL+CHD', 'SGL+2CHD', 'DBL+CHD', 'DBL+2CHD', 'TRPL+CHD', 'TRPL+2CHD']

    let propsItem = {}

    if (current.is_bron === 0 && current.is_finish === 0 && appUser.id_user !== currentMessage.id_user) {
      propsItem = {
        onPress: () => this.onBronPress(current.price_for_promo, current.id_promo)
      }
    }

    return (
      <>
        {this.renderTopCoordView()}
        <ListItem {...propsItem} style={{ margin: 0, padding: 0 }}>
          <ListItem.Content>
            {current.room_title ? <Text style={{ fontWeight: 'bold', fontSize: 16, color: theme.text }}>{current.room_title}</Text> : null}
            <View style={{ flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: '#ccc', paddingBottom: 5, paddingTop: 10 }}>
              <View style={{ flex: 0.6 }}>
                <Text style={styles.titleText}>{t('screens.actions.night')}</Text>
              </View>
              <View style={{ flex: 0.4, alignItems: 'flex-end' }}>
                <Text style={styles.dataText}>{current.cnt_days}</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: '#ccc', paddingBottom: 5, paddingTop: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.titleText}>{t('containers.action.checkin')}</Text>
                <Text style={styles.dataText}>{moment(current.date_zaezd).format('HH:mm, DD MMM YYYY')}</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: '#ccc', paddingBottom: 5, paddingTop: 10 }}>
              <View style={{ flex: 0.6 }}>
                <Text style={styles.titleText}>{t('containers.action.food')}</Text>
              </View>
              <View style={{ flex: 0.4, alignItems: 'flex-end' }}>
                <Text style={styles.dataText}>{cat1[current.id_categ1]}</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: '#ccc', paddingBottom: 5, paddingTop: 10 }}>
              <View style={{ flex: 0.6 }}>
                <Text style={styles.titleText}>{t('containers.action.accommodation')}</Text>
              </View>
              <View style={{ flex: 0.4, alignItems: 'flex-end' }}>
                <Text style={styles.dataText}>{cat2[current.id_categ2]}</Text>
              </View>
            </View>
            {current.count_room > -1 ? (
              <>
                <View style={{ flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: '#ccc', paddingBottom: 5, paddingTop: 10 }}>
                  <View style={{ flex: 0.6 }}>
                    <Text style={styles.titleText}>{t('containers.action.place')}</Text>
                  </View>
                  <View style={{ flex: 0.4, alignItems: 'flex-end' }}>
                    <Text style={styles.dataText}>{current.count_room - current.count_bron}</Text>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: '#ccc', paddingBottom: 5, paddingTop: 10 }}>
                  <View style={{ flex: 0.6 }}>
                    <Text style={styles.titleText}>{t('containers.action.d2')}</Text>
                  </View>
                  <View style={{ flex: 0.4, alignItems: 'flex-end' }}>
                    <Text style={styles.dataText}>{current.day_to_finish}</Text>
                  </View>
                </View>
              </>
            ) : null}
          </ListItem.Content>
          {this.renderRightView()}
        </ListItem>
      </>
    )
  }

  render() {
    const { Tooltip, t } = this.props.utils

    const { appUser, currentMessage, actionItem, chatAction, selectedHotel, history } = this.props
    const { isLoading, visibleActionView, tooltipOpen, current } = this.state
    const w = Platform.isPad ? (width < WIDTH_MAX ? width - 80 : WIDTH_MAX) : width

    if (isLoading) {
      return (
        <View style={{ width: '100%', height: 40, alignItems: 'center', alignContent: 'center' }}>
          <ActivityIndicator animating size="small" color={MAIN_COLOR} />
        </View>
      )
    }

    if (chatAction) {
      if (appUser.hotels_user && appUser.hotels_user.indexOf(Number(selectedHotel) + 100000) > -1) {
        return (
          <Tooltip
            popover={this.renderTooltipMenu()}
            width={WIDTH_TOOLTIP}
            height={HEIGHT_TOOLTIP - 120}
            backgroundColor={'#fff'}
            overlayColor={'rgba(100, 100, 100, 0.8)'}
            visible={tooltipOpen}
            // onDismiss={() => this.setState({ tooltipOpen: false })}
            highlightColor={'#fff'}
            onOpen={() => this.setState({ tooltipOpen: true })}>
            <View style={{ alignItems: 'center', width: '100%' }}>
              <View style={{ alignItems: 'center', padding: 5 }}>
                <Text style={{ fontSize: 14, fontWeight: 'bold', color: 'red' }}>{'АКЦИЯ!'}</Text>
                <Text style={{ fontSize: 14, fontWeight: 'bold', color: 'blue' }}>{currentMessage.text}</Text>
                <Text style={{ fontSize: 14, fontWeight: 'bold', color: 'green' }}>{currentMessage.name_hotel}</Text>
                <Text style={{ fontSize: 14, color: 'green' }}>{currentMessage.post_title}</Text>
              </View>
            </View>
          </Tooltip>
        )
      }

      return (
        <TouchableOpacity onPress={() => history('/ah/' + currentMessage.id_hotel)}>
          <View style={{ alignSelf: 'center', alignItems: 'center', width: w }}>
            <View style={{ alignItems: 'center', padding: 5, width: Dimensions.get('window').width - 80 }}>
              <Text numberOfLines={2} ellipsizeMode={'tail'} style={{ fontSize: 14, fontWeight: 'bold', color: 'blue' }}>
                {currentMessage.text}
              </Text>
              <Text numberOfLines={2} ellipsizeMode={'tail'} style={{ fontSize: 14, fontWeight: 'bold', color: 'green' }}>
                {currentMessage.name_hotel}
              </Text>
              <Text numberOfLines={2} ellipsizeMode={'tail'} style={{ fontSize: 14, color: 'green' }}>
                {currentMessage.post_title}
              </Text>
            </View>
          </View>
          <View style={{ width: w }}>
            {current.is_bron === 0 && current.is_finish === 0 ? (
              <Text style={{ fontWeight: 'bold', fontSize: 18, color: 'green', alignSelf: 'center' }}>{'от ' + current.symbol + ' ' + current.price_full}</Text>
            ) : null}
            {!current.user_cashback || current.user_cashback === undefined || current.user_cashback === '0' || Number(current.user_cashback) === 0 ? null : (
              <View style={{ flexDirection: 'row', flex: 1, borderBottomWidth: 0.5, borderBottomColor: '#ccc', paddingBottom: 5, paddingTop: 10 }}>
                <View style={{ flex: 0.6 }}>
                  <Text style={styles.titleTextAction}>{t('containers.action.cashbackAction')}</Text>
                </View>
                <View style={{ flex: 0.4, alignItems: 'flex-end' }}>
                  <Text style={styles.dataTextAction}>{current.user_cashback + '%'}</Text>
                </View>
              </View>
            )}
          </View>
          <Text style={{ alignSelf: 'center', fontSize: 14, fontWeight: 'bold', color: MAIN_COLOR, marginBottom: 20 }}>{'Открыть Акцию'}</Text>
        </TouchableOpacity>
      )
    }

    if (!visibleActionView) {
      return actionItem ? this.renderActionText() : this.renderActionButton()
    }

    if (isEmpty(appUser)) {
      return (
        <View style={{ width: '100%', height: 40, alignItems: 'center', alignContent: 'center', textAlign: 'center', marginTop: actionItem ? 20 : 0 }}>
          <Text style={{ color: 'red' }}>{t('containers.action.auth1')}</Text>
          <Text style={{ color: 'red' }}>{t('containers.action.auth2')}</Text>
        </View>
      )
    }

    if (appUser.id_user === currentMessage.id_user) {
      return (
        <Tooltip
          popover={this.renderTooltipMenu()}
          width={WIDTH_TOOLTIP}
          height={HEIGHT_TOOLTIP - 120}
          backgroundColor={'#fff'}
          overlayColor={'rgba(100, 100, 100, 0.8)'}
          visible={tooltipOpen}
          // onDismiss={() => this.setState({ tooltipOpen: false })}
          highlightColor={'#fff'}
          onOpen={() => this.setState({ tooltipOpen: true })}>
          {this.renderContent()}
        </Tooltip>
      )
    }

    return this.renderContent()
  }
}

const styles = StyleSheet.create({
  titleText: { color: '#949494', fontWeight: 'bold', fontSize: 14 },
  dataText: { color: '#015286', fontSize: 16 }
})

export default Actions
