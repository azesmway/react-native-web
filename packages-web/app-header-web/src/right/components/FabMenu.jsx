import isEmpty from 'lodash/isEmpty'
import md5 from 'md5'
import React, { lazy, PureComponent, Suspense } from 'react'
import { Linking, Platform, Text, View } from 'react-native'

const DialogBox = lazy(() => import('./DialogBox'))

const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
const { MAIN_COLOR } = GLOBAL_OBJ.onlinetur.constants
const { getAppConfig, getAppConstants } = GLOBAL_OBJ.onlinetur.storage

class FabMenu extends PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      openModal: false,
      isLoadingIFrame: false,
      dialog: {},
      visibleAction: false,
      save: true,
      request: null
    }

    this.openModal = type => {
      const { t, Icon } = this.props.utils

      if (type === 0) {
        this.setState({
          dialog: {
            type: 'bron',
            label: t('components.common.chatfooter.bron')
          },
          openModal: true
        })
      } else if (type === 1) {
        this.setState({
          dialog: {
            type: 'hotel',
            icon: <Icon name={'info'} fontSize={'large'} />,
            label: t('components.common.chatfooter.about')
          },
          openModal: true
        })
      } else if (type === 2) {
        this.setState({
          dialog: {
            type: 'price',
            icon: <Icon name={'attach'} fontSize={'large'} />,
            label: t('components.common.chatfooter.price')
          },
          openModal: true
        })
      } else if (type === 3) {
        this.setState({
          dialog: {
            type: 'contact',
            icon: <Icon name={'map'} />,
            label: t('components.common.chatfooter.contact'),
            style: 'green'
          },
          openModal: true
        })
      }
    }

    this.openRequest = async () => {
      const { chatServiceGet } = this.props.utils
      const { user, filter, setModalRequest } = this.props
      const catHotel = await chatServiceGet.getPromoRequest(user.android_id_install, user.device.token, Number(filter.selectedHotel) + 100000)

      if (catHotel && !catHotel.promo) {
        this.setState({ visibleAction: true, save: false }, () => {
          GLOBAL_OBJ.onlinetur.props = {
            save: this.state.save,
            request: null,
            isAdd: 1
          }
          setModalRequest(true)
        })
      } else {
        this.setState({ visibleAction: true, save: false, request: catHotel.promo[0] }, () => {
          GLOBAL_OBJ.onlinetur.props = {
            save: this.state.save,
            request: this.state.request,
            isAdd: 1
          }
          setModalRequest(true)
        })
      }
    }

    this.closeRequest = () => {
      const { setModalRequest } = this.props

      this.setState({ visibleAction: false }, () => {
        GLOBAL_OBJ.onlinetur.props = {}
        setModalRequest(false)
      })
    }

    this.handleCloseDialog = () => {
      this.setState({ openModal: false })
    }

    this.openSearch = () => {
      const { countries, country, hotel, place, user } = this.props
      const app = Platform.OS === 'ios' ? '11' : Platform.OS === 'web' ? '12' : '12'
      const mainChat = getAppConfig().typeApp === 'main' ? getAppConstants().url_main_link : getAppConfig().typeApp === 'skidki' ? getAppConstants().url_main_link : getAppConstants().url_main_link
      let url = mainChat + '/poisk.php?get=1&&app=' + app + '&ref=' + (user && user.referral && user.referral.code ? user.referral.code : '')

      const current = countries.filter(function (item) {
        return item.id === Number(country)
      })

      if (current && current[0] && current[0].id_country) {
        url += '&country=' + current[0].id_country
      }

      if (hotel && hotel !== -1) {
        url += '&hotels[]=' + hotel
      }

      if (place && place !== -1) {
        url += '&place=' + place
      }

      if (!isEmpty(user)) {
        let txtMd5 = md5(user.login + 'sdlkgfls')
        txtMd5 = txtMd5.substring(0, 4)

        let urlLogin = encodeURI(user.login)
        let urlEmail = encodeURI(user.my_name)

        url += `&un=${urlEmail}&ue=${urlLogin}&uk=${txtMd5}&dg=15&fo=1&nsh=1`

        if (user.phone) {
          url += `&ut=${user.phone}`
        }
      } else {
        url += '&un=&ue=&uk=&dg=15&fo=1&nsh=1'
      }

      Linking.openURL(url, '_blank')
    }
  }

  renderTur = (user, chatAgent) => {
    const { Icon, MenuOption } = this.props.utils

    if (!getAppConfig().leftMenu.tur) {
      return null
    }

    return !user.id_user || (user.notour === 1 && !chatAgent) ? (
      <MenuOption onSelect={() => this.openSearch()}>
        <View style={{ flexDirection: 'row', padding: 10, paddingLeft: 15 }}>
          <Icon name={'shopping-cart'} color={MAIN_COLOR} />
          <Text style={{ fontSize: 15, paddingTop: 2, paddingLeft: 10 }}>{'Поиск тура'}</Text>
        </View>
      </MenuOption>
    ) : null
  }

  render() {
    const { Icon, MenuOption } = this.props.utils
    const { openModal, dialog } = this.state
    const { hotel, chatRendered, hobby, user, filter, ratingCategories, history } = this.props
    const { chatAgent } = filter

    let url = ''
    let android_id_install = ''
    let token = ''

    if (!isEmpty(user)) {
      android_id_install = user.android_id_install
      token = user.device.token
    }

    let hotelId = Number(hotel) + 100000

    if (dialog.type === 'hotel') {
      url = `${getAppConstants().url_main}/bestt.php?i=ols${hotel}&only=1&t=0;0&android_id_install=${android_id_install}&token=${token}`
    } else if (dialog.type === 'price') {
      url = `${getAppConstants().url_main}/bestt.php?i=ols${hotel}&only=1&t=0;1&android_id_install=${android_id_install}&token=${token}`
    } else if (dialog.type === 'contact') {
      url = `${getAppConstants().url_main}/bestt.php?i=ols${hotel}&t=0;2&only=1&android_id_install=${android_id_install}&token=${token}`
    } else if (dialog.type === 'bron') {
      url = `${getAppConstants().url_api_main}/v2/bron?android_id_install=${android_id_install}&token=${token}&id_hotel=${hotelId}`
    }

    if (!chatRendered) {
      return null
    }

    let linkToRating = ''

    if (ratingCategories && ratingCategories.length > 0) {
      for (let i = 0; i < ratingCategories.length; i++) {
        if (ratingCategories[i].chat && ratingCategories[i].chat.indexOf('/b/' + hobby) > -1) {
          linkToRating = '/r/' + (i + 1)
          break
        }
      }
    }

    return (
      <>
        {(hotel !== -1 && hobby === -1) || hobby === 105 || hobby === 135 ? (
          <MenuOption onSelect={() => this.openModal(1)}>
            <View style={{ flexDirection: 'row', padding: 10, paddingLeft: 15 }}>
              <Icon name={'info-outline'} color={MAIN_COLOR} />
              <Text style={{ fontSize: 15, paddingTop: 2, paddingLeft: 10 }}>{'Помощь'}</Text>
            </View>
          </MenuOption>
        ) : null}
        {/*{hobby === -1 && messages.length < 2 ? (*/}
        {/*  <TouchableOpacity*/}
        {/*    style={{*/}
        {/*      // width: 150,*/}
        {/*      height: 33,*/}
        {/*      position: 'absolute',*/}
        {/*      top: top0 + 10,*/}
        {/*      right: 70,*/}
        {/*      backgroundColor: 'rgb(93,116,175)',*/}
        {/*      justifyContent: 'center',*/}
        {/*      shadowColor: '#000',*/}
        {/*      shadowOpacity: 0.5,*/}
        {/*      shadowOffset: { width: 0, height: 2 },*/}
        {/*      shadowRadius: 10,*/}
        {/*      borderRadius: 5*/}
        {/*    }}*/}
        {/*    onPress={() => this.openModal(1)}*/}
        {/*  >*/}
        {/*    <Text style={{ color: '#fff', fontWeight: 'bold', paddingLeft: 10, paddingRight: 10 }}>{t('components.common.chatfooter.about')}</Text>*/}
        {/*  </TouchableOpacity>*/}
        {/*) : null}*/}
        {this.renderTur(user, chatAgent)}
        {linkToRating !== '' ? (
          <MenuOption onSelect={() => history(linkToRating)}>
            <View style={{ flexDirection: 'row', padding: 10, paddingLeft: 15 }}>
              <Icon name={'emoji-events'} color={MAIN_COLOR} />
              <Text style={{ fontSize: 15, paddingTop: 2, paddingLeft: 10 }}>{'Перейти в рейтинг'}</Text>
            </View>
          </MenuOption>
        ) : null}
        {hobby === 105 ? (
          <MenuOption onSelect={() => history(linkToRating)}>
            <View style={{ flexDirection: 'row', padding: 10, paddingLeft: 15 }}>
              <Icon name={'shopping-cart'} color={MAIN_COLOR} />
              <Text style={{ fontSize: 15, paddingTop: 2, paddingLeft: 10 }}>{'Мои брони'}</Text>
            </View>
          </MenuOption>
        ) : null}
        {/*{messages.length < 2 && hobby === -1 ? (*/}
        {/*  <TouchableOpacity*/}
        {/*    style={{*/}
        {/*      // width: 150,*/}
        {/*      height: 33,*/}
        {/*      position: 'absolute',*/}
        {/*      top: top2 + 10,*/}
        {/*      right: 70,*/}
        {/*      backgroundColor: fabLeft3.style,*/}
        {/*      justifyContent: 'center',*/}
        {/*      shadowColor: '#000',*/}
        {/*      shadowOpacity: 0.5,*/}
        {/*      shadowOffset: { width: 0, height: 2 },*/}
        {/*      shadowRadius: 10,*/}
        {/*      borderRadius: 5*/}
        {/*    }}*/}
        {/*    onPress={() => this.openModal(3)}*/}
        {/*  >*/}
        {/*    <Text style={{ color: '#fff', fontWeight: 'bold', paddingLeft: 10, paddingRight: 10 }}>*/}
        {/*      {t('components.common.chatfooter.contact')}*/}
        {/*    </Text>*/}
        {/*  </TouchableOpacity>*/}
        {/*) : null}*/}
        {openModal && (
          <Suspense fallback={null}>
            <DialogBox title={dialog.label} isOpenDialog={openModal} handleCloseDialog={this.handleCloseDialog} dialogWidth={'90%'} dialogHeight={'80vh'} utils={this.props.utils}>
              <iframe src={url} allowFullScreen={true} width={'100%'} height={'100%'} frameBorder={'0'} />
            </DialogBox>
          </Suspense>
        )}
      </>
    )
  }
}

export default FabMenu
