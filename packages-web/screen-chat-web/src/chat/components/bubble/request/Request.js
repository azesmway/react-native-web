import isEmpty from 'lodash/isEmpty'
import { Component } from 'react'
import { ActivityIndicator, Appearance, Platform, Text, TouchableOpacity, View } from 'react-native'

const WIDTH_TOOLTIP = 200

class Request extends Component {
  constructor(props) {
    super(props)

    this.state = {
      visibleRequestView: false,
      current: {},
      action: null,
      isLoading: false,
      tooltipOpen: false,
      isVisibleDialog: false,
      textVisibleDialog: '',
      actionCurrent: null,
      openMessage: false,
      textMessage: ''
    }

    this.initData = () => {
      const { chatServiceGet } = this.props.utils

      const { setStatusName } = this.props

      this.setState({ isLoading: true, visibleRequestView: true }, async () => {
        const { appUser, currentMessage } = this.props
        const android_id_install = !isEmpty(appUser) ? appUser.android_id_install : ''
        const token = !isEmpty(appUser) ? appUser.device.token : ''
        const result = await chatServiceGet.dataListRequest(android_id_install, token, currentMessage.id)

        if (result.code === 0) {
          this.setState({ action: result, isLoading: false, current: result.promo && result.promo.length > 0 ? result.promo[0] : {} }, () => {
            setStatusName({
              name: result.promo[0].status_name,
              color: this.getColorStatus(result.promo[0].status)
            })
          })
        } else {
          this.setState({ isLoading: false })
        }
      })
    }

    this.requestMessage = async (current, action, message = '') => {
      const { chatServicePost, t, Alert } = this.props.utils

      const { appUser, setStatusName } = this.props
      let body = new FormData()
      let token = appUser.device ? appUser.device.token : ''
      let android_id_install = appUser.device ? appUser.android_id_install : ''
      body.append('token', token)
      body.append('android_id_install', android_id_install)
      body.append('id_promo', current.id_promo)
      body.append('id_promo_user', current.id_promo_users ? current.id_promo_users : -1)
      body.append('id_action', action.id)
      body.append('msg', message)

      const result = await chatServicePost.fetchRequestMessage(body)

      if (result.code === 0) {
        this.setState({ action: result, isLoading: false, current: result.promo ? result.promo[0] : {} }, () => {
          setStatusName({
            name: result.promo[0].status_name,
            color: this.getColorStatus(result.promo[0].status)
          })
        })
      } else if (result.code !== 0) {
        Alert.alert('Ошибка!', result.error)
      }
    }

    this.setActionBron = async action => {
      const { t, Alert } = this.props.utils

      const { current } = this.state

      if (current && current.is_my_bron === 0 && current.status === 2 && action.id === 2) {
        Alert.prompt(
          t('common.attention'),
          t('containers.request.compensation'),
          [
            {
              text: t('common.ok'),
              style: 'destructive',
              onPress: async text => {
                await this.requestMessage(current, action, text)
              }
            },
            { text: t('common.cancel'), style: 'cancel', onPress: text => {} }
          ],
          'plain-text'
        )
      } else {
        Alert.alert(t('common.attention'), action.name + t('containers.request.question'), [
          { text: t('common.cancel'), style: 'destructive' },
          {
            text: t('common.yes'),
            onPress: async () => {
              await this.requestMessage(current, action)
            }
          }
        ])
      }
    }

    this.setActionBronWeb = async action => {
      const { t } = this.props.utils

      const { current } = this.state

      if (current && current.is_my_bron === 0 && current.status === 2 && action.id === 2) {
        this.setState({
          isVisibleDialog: true,
          textVisibleDialog: t('containers.request.compensation'),
          actionCurrent: action,
          openMessage: true
        })
      } else {
        this.setState({
          isVisibleDialog: true,
          textVisibleDialog: action.name + t('containers.request.question'),
          actionCurrent: action,
          openMessage: false
        })
      }
    }

    this.getColorStatus = status => {
      let colorText
      switch (status) {
        case 0:
          colorText = '#0bc425'
          break
        case 1:
          colorText = '#fde502'
          break
        case 2:
          colorText = '#0bc425'
          break
        case 3:
          colorText = '#fde502'
          break
        case 4:
          colorText = 'red'
          break
        case 5:
          colorText = '#a6a6a6'
          break
        case 6:
          colorText = 'red'
          break
        case 10:
          colorText = '#7b7b7b'
          break
        default:
          colorText = '#7b7b7b'
          break
      }

      return colorText
    }
  }

  renderButtonActions = () => {
    const { current } = this.state

    if (!current.actions || current.actions.length === 0) {
      return null
    }

    const length = current.actions.length

    return (
      <View style={{ width: WIDTH_TOOLTIP - 10 }}>
        {current.actions.map((action, index) => {
          let color = '#000000'
          let tip = null

          if (action.tip === 1) {
            tip = {
              name: 'done',
              color: 'green'
            }
            color = 'green'
          } else if (action.tip === 2) {
            tip = {
              name: 'close',
              color: 'red'
            }
            color = 'red'
          }
          return (
            <TouchableOpacity
              key={action.id.toString()}
              onPress={() => {
                this.setState({ tooltipOpen: false }, () => {
                  if (Platform.OS !== 'web') {
                    this.setActionBron(action)
                  } else {
                    this.setActionBronWeb(action)
                  }
                })
              }}
              style={{ justifyContent: 'center', height: 46, paddingLeft: 10, borderBottomWidth: index < length - 1 ? 1 : 0, borderBottomColor: '#ccc' }}>
              <Text style={{ color: color, fontSize: 16 }}>{action.name}</Text>
            </TouchableOpacity>
          )
        })}
      </View>
    )
  }

  renderContent(current) {
    const { moment, theme, ListItem, t } = this.props.utils

    let isDarkMode = Appearance.getColorScheme() === 'dark'
    let bg = isDarkMode ? theme.dark.colors.background : theme.light.colors.background
    let txt = isDarkMode ? theme.dark.colors.text : theme.light.colors.text

    const d1 = new Date(moment(current.date_zaezd).format())
    const cat1 = ['RO', 'BB', 'HB', 'FB', 'AI']
    const cat2 = ['DBL', 'SGL', 'TRPL', 'SGL+CHD', 'SGL+2CHD', 'DBL+CHD', 'DBL+2CHD', 'TRPL+CHD', 'TRPL+2CHD']

    return (
      <ListItem>
        <ListItem.Content>
          {current.room_title ? <Text style={{ fontWeight: 'bold', fontSize: 16, color: 'blue' }}>{current.room_title}</Text> : null}
          <View style={{ flexDirection: 'row' }}>
            <Text style={{ fontWeight: 'bold', color: txt }}>{t('screens.actions.night')}</Text>
            <Text style={{ color: 'blue' }}>{current.cnt_days}</Text>
          </View>
          <View style={{ flexDirection: 'row' }}>
            <Text style={{ fontWeight: 'bold', color: txt }}>{t('containers.action.checkin')}</Text>
            <Text style={{ color: 'blue' }}>{moment(current.date_zaezd).format('DD MMM YYYY, HH:mm')}</Text>
          </View>
          <View style={{ flexDirection: 'row' }}>
            <Text style={{ color: txt }}>{t('containers.action.food')}</Text>
            <Text style={{ color: 'blue' }}>{cat1[current.id_categ1]}</Text>
            <Text style={{ color: txt }}>{t('containers.action.accommodation')}</Text>
            <Text style={{ color: 'blue' }}>{cat2[current.id_categ2]}</Text>
          </View>
          <View style={{ flexDirection: 'row' }}>
            <Text style={{ color: txt }}>{t('screens.actions.price')}</Text>
            <Text style={{ color: 'blue' }}>{Math.floor(current.price_full - (current.price_full * current.price_proc) / 100) + current.symbol}</Text>
          </View>
        </ListItem.Content>
        <ListItem.Chevron />
      </ListItem>
    )
  }

  render() {
    const { Button, theme, Tooltip, t, Portal, Dialog, Paragraph, TextInput } = this.props.utils

    const { isLoading, current, visibleRequestView, tooltipOpen, isVisibleDialog, textVisibleDialog, openMessage, textMessage, actionCurrent } = this.state

    if (isLoading) {
      return (
        <View style={{ width: '100%', height: 40, alignItems: 'center', alignContent: 'center', marginTop: 10 }}>
          <ActivityIndicator animating size="small" color={'#0bc425'} />
        </View>
      )
    }

    if (!visibleRequestView) {
      return (
        <View style={{ width: '100%', height: 40, alignItems: 'center', alignContent: 'center', marginTop: 10, marginBottom: 10 }}>
          <Button type={'outline'} title={t('containers.request.status_request')} onPress={() => this.initData()} />
        </View>
      )
    }

    return (
      <>
        <View style={{ padding: 0, margin: 0, marginTop: 10, borderRightWidth: 1, borderTopWidth: 1, borderColor: '#ccc' }}>
          {!current.actions || current.actions.length === 0 ? (
            this.renderContent(current)
          ) : (
            <Tooltip
              popover={this.renderButtonActions()}
              width={WIDTH_TOOLTIP}
              height={current.actions.length * 50}
              backgroundColor={'#fff'}
              overlayColor={'rgba(100, 100, 100, 0.8)'}
              visible={tooltipOpen}
              onOpen={() => this.setState({ tooltipOpen: true })}>
              {this.renderContent(current)}
            </Tooltip>
          )}
          {isVisibleDialog && (
            <Portal>
              <Dialog visible={isVisibleDialog} onDismiss={() => this.setState({ isVisibleDialog: false, textVisibleDialog: '' })} style={{ width: 500, alignSelf: 'center' }}>
                <Dialog.Title>{t('common.attention')}</Dialog.Title>
                <Dialog.Content>
                  <Paragraph>{textVisibleDialog}</Paragraph>
                  <Paragraph />
                  {openMessage ? (
                    <TextInput
                      style={{ backgroundColor: 'transparent', color: theme.text }}
                      label={t('containers.request.message')}
                      value={textMessage}
                      onChangeText={text => this.setState({ textMessage: text })}
                    />
                  ) : null}
                </Dialog.Content>
                <Dialog.Actions>
                  {actionCurrent && (
                    <Button
                      onPress={() =>
                        this.setState({ isVisibleDialog: false, textVisibleDialog: '' }, async () => {
                          await this.requestMessage(current, actionCurrent, textMessage)
                        })
                      }
                      style={{ marginRight: 20 }}>
                      {t('common.yes')}
                    </Button>
                  )}
                  <Button onPress={() => this.setState({ isVisibleDialog: false, textVisibleDialog: '' })} mode="contained" style={{ backgroundColor: 'red' }}>
                    {t('common.cancel')}
                  </Button>
                </Dialog.Actions>
              </Dialog>
            </Portal>
          )}
        </View>
      </>
    )
  }
}

export default Request
