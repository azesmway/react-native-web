import { router } from 'expo-router'
import _ from 'lodash'
import isEmpty from 'lodash/isEmpty'
import md5 from 'md5'
import React, { createRef, PureComponent } from 'react'
import { ActivityIndicator, Dimensions, FlatList, Image, Linking, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

import BarIcon from '../../images/bar-chart-pngrepo-com.png'
import BookIcon from '../../images/book-pngrepo-com.png'
import BookIconBlue from '../../images/home-pngrepo-com.png'
import PlusMinus from '../../images/plus-minus'
import AskIcon from '../../images/question-pngrepo-com.png'
import ShareIcon from '../../images/share-pngrepo-com.png'
import ShopIcon from '../../images/shopping-cart-pngrepo-com.png'
import placeholder from '../../images/sky.jpg'
import ChatIcon from '../../images/speech-bubble-pngrepo-com.png'

const WIDTH_TOOLTIP = 200
let HEIGHT_TOOLTIP = 200

const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
const { MAIN_COLOR } = GLOBAL_OBJ.onlinetur.constants
const { getMyRating, getAppConstants, getSelectCategory } = GLOBAL_OBJ.onlinetur.storage
const { width, height } = Dimensions.get('window')

class Item extends PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      expanded: false,
      isFavorite: false,
      tooltipOpen: false,
      dataTours: [],
      dataToursLoaded: false,
      nullToursBar: 0
    }

    this.dataToursBar = createRef()

    this.changeHotelsInMyRating = item => {
      const { hotels, setHotels } = this.props
      const { isFavorite } = this.state
      let newHotels = Object.assign([], hotels)

      this.setState({ isFavorite: !isFavorite }, () => {
        if (!isFavorite) {
          let add = true
          for (var i = 0; i < newHotels.length; i++) {
            if (newHotels[i].huid === item.huid) {
              add = false
            }
          }

          if (add) {
            item.my_rating = 0
            item.notSave = true
            newHotels.push(item)
            setHotels(newHotels)
          }
        } else {
          for (var j = 0; j < newHotels.length; j++) {
            if (newHotels[j].huid === item.huid) {
              newHotels.splice(j, 1)
            }
          }

          setHotels(newHotels)
        }
      })
    }

    this.setFavorite = () => {
      const { hotels, item } = this.props

      let fav = false
      for (let i = 0; i < hotels.length; i++) {
        if (hotels[i].huid === item.huid) {
          fav = true
        }
      }

      let myRating = []

      if (getMyRating() && getMyRating().length > 0) {
        let r = getMyRating()[0]

        if (r) {
          myRating = r.list
        }
      }

      if (!fav && myRating) {
        for (let i = 0; i < myRating.length; i++) {
          if (myRating[i].huid === item.huid) {
            fav = true
          }
        }
      }

      this.setState({ isFavorite: fav })
    }

    this.onUrlPress = url => {
      Linking.canOpenURL(url).then(supported => {
        if (!supported) {
          console.error('No handler for URL:', url)
        } else {
          Linking.openURL(url, '_blank')
        }
      })
    }

    this.setStartSearch = async (start, cuid, huid, puid, hclass, index, hotelList, user) => {
      const { moment, chatServiceGet } = this.props.utils
      const { dataTours } = this.state
      const path = getAppConstants().url_beta
      const startDate = moment().add('+6', 'day').format('DD.MM.YYYY')
      const endDate = moment().add('+9', 'day').format('DD.MM.YYYY')

      // eslint-disable-next-line max-len
      const url = `https://beta.distant-office.ru/results.php?json=1&ad=1&onlyRoom=on&flightFrom=-1&country=${cuid}&dateStart=${startDate}&dateBack=${endDate}&date_plus=0&nightsMin=3&nightsMax=14&pansionType=&adult=2&accomType=44&hotels[]=${huid}&roomsCount=1&resnewtable=1&advancedsearch=1&submit=1&category_id=1&lg=ru&app=11&site=ios`

      const prices = await chatServiceGet.getPriceHotelsRatingId(url)

      if (prices && prices.searchid) {
        let tours = `${path}/results_online.php?searchid=${prices.searchid}&jsonp=1`

        if (user && user.device && user.device.token) {
          tours += '&apid=' + user.id_user + (user.is_sotr === 1 ? '&agn=2' : '')
        }

        this.dataToursBar.current = 0
        this.setState({ nullToursBar: new Date().getTime() }, () => {})

        const timer = ms => new Promise(res => setTimeout(res, ms))

        let count = 0
        for (let i = 0; i < prices.delays.length; i++) {
          // setLoadingPrice(' Шаг ' + (i + 1) + ' из ' + prices.delays.length + ', загружено цен: ' + (count && String(count) !== '' ? count : '0'))
          await timer(prices.delays[i] * 1000)
          const pricesList = await chatServiceGet.getPriceHotelsRatingList(tours)
          const stop = i + 1 === prices.delays.length
          count = pricesList.length

          this.dataToursBar.current = this.dataToursBar.current + 0.25

          if (!pricesList.error) {
            this.setState({ dataTours: dataTours.concat(pricesList) }, () => {})
          }

          this.setState({ nullToursBar: new Date().getTime() }, () => {})
        }

        this.setState({ dataToursLoaded: true })
      }
    }

    this.renderItem = ({ item, index }) => {
      const { Icon } = this.props.utils

      return (
        <View
          style={{
            borderRadius: 10,
            padding: 16,
            marginHorizontal: 10,
            marginVertical: 10,
            width: '100%',
            minHeight: 200,
            backgroundColor: '#ebeef6'
          }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row' }}>
              <Icon name={'flight-takeoff'} color={'#878787'} size={20} />
              <Text style={{ paddingLeft: 5, fontSize: 20, color: MAIN_COLOR, fontWeight: 'bold' }}>{item.dateIn}</Text>
            </View>
            <View>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#505050' }}>{this.formatNumber(Number(item.price_RUB), item.currency)}</Text>
            </View>
          </View>
          <View style={{ height: 0.5, backgroundColor: '#ccc', marginVertical: 4 }} />
          <View style={{ flexDirection: 'row', marginVertical: 4 }}>
            <Icon name={'bed'} color={'#fab302'} size={20} />
            <Text style={{ width: '90%', paddingLeft: 5, color: '#3e3e3e', fontSize: 14 }}>{item.roomType}</Text>
          </View>
          <View style={{ flexDirection: 'row', marginVertical: 4 }}>
            <Icon name={'restaurant'} color={'#fab302'} size={20} />
            <Text style={{ paddingLeft: 5, color: '#3e3e3e', fontSize: 14 }}>{item.pansion}</Text>
          </View>
          <View style={{ flexDirection: 'row', marginVertical: 4 }}>
            <Icon name={'access-time'} color={'#fab302'} size={20} />
            <Text style={{ paddingLeft: 5, color: '#3e3e3e', fontWeight: 'bold', fontSize: 14 }}>
              {item.nights}
              <Text>{' ночи'}</Text>
            </Text>
          </View>
          <View style={{ flexDirection: 'row', marginVertical: 4 }}>
            <Icon name={'calendar-month'} color={'#fab302'} size={20} />
            <Text style={{ width: '80%', paddingLeft: 5, color: '#3e3e3e', fontStyle: 'italic' }}>{item.title}</Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              Linking.openURL('https://onlinetur.ru' + item.price_url, '_blank')
            }}
            style={{ width: 30, height: 30, backgroundColor: '#fff', borderRadius: 15, alignItems: 'center', justifyContent: 'center', position: 'absolute', bottom: 20, right: 20 }}>
            <Icon name={'navigate-next'} />
          </TouchableOpacity>
        </View>
      )
    }
  }

  componentDidMount = () => {
    this.setFavorite()
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const { item, index, setVisibleModalSearch, hotelList, user } = this.props
    const { isFavorite, expanded } = this.state

    if (prevState.expanded !== expanded && expanded) {
      this.setStartSearch(true, item.cuid, item.huid, item.puid, item.hclass, index, hotelList, user).then()

      return
    }

    if (prevState.isFavorite === isFavorite) {
      this.setFavorite()
    }
  }

  renderTooltip = (item, history, country, shareRating, user) => {
    const { ListItem, t } = this.props.utils
    const { setModalLogin } = this.props
    let id_country = 0

    if (country && country.length > 0) {
      id_country = country[0].id
    }

    return (
      <View style={{ width: WIDTH_TOOLTIP - 10 }}>
        <ListItem
          key={1}
          bottomDivider
          onPress={() =>
            this.setState({ tooltipOpen: false }, () => {
              history('/y/' + country[0].id + '/h/' + item.huid + '/view')
            })
          }
          containerStyle={styles.listItem}>
          <Image source={BookIconBlue} style={styles.iconContainer} />
          <ListItem.Content>
            <ListItem.Subtitle style={{ color: '#000' }}>{t('tooltip.hotelPage')}</ListItem.Subtitle>
          </ListItem.Content>
        </ListItem>
        <ListItem
          key={4}
          bottomDivider
          onPress={() =>
            this.setState({ tooltipOpen: false }, () => {
              shareRating && shareRating(item.huid)
            })
          }
          containerStyle={styles.listItem}>
          <Image source={ShareIcon} style={styles.iconContainer} />
          <ListItem.Content>
            <ListItem.Subtitle style={{ color: '#000' }}>{t('tooltip.share')}</ListItem.Subtitle>
          </ListItem.Content>
        </ListItem>
        {user.notour === 1 ? (
          <ListItem
            key={2}
            bottomDivider
            onPress={() => {
              if (!user.id_user) {
                this.setState({ tooltipOpen: false }, () => {
                  setModalLogin(true)
                })

                return
              }
              this.setState({ tooltipOpen: false }, () => {
                let urlOrder = '&nsh=1&only=1&t=0;3'

                if (!isEmpty(user)) {
                  let txtMd5 = md5(user.login + 'sdlkgfls')
                  txtMd5 = txtMd5.substring(0, 4)

                  let urlLogin = encodeURI(user.login)
                  let urlEmail = encodeURI(user.my_name)

                  urlOrder += `&un=${urlEmail}&ue=${urlLogin}&uk=${txtMd5}&dg=15&fo=1&nsh=1`

                  if (user.phone) {
                    urlOrder += `&ut=${user.phone}`
                  }

                  urlOrder += '&ref=' + (user && user.referral && user.referral.code ? user.referral.code : '')
                } else {
                  urlOrder += '&ut=&un=&ue=&uk=&dg=15&fo=1&nsh=1'
                }
                const path = getAppConstants().url_main_link
                let url = path + '/poisk.php?get=1&online=1&hotels[]=' + item.huid + '&c=' + item.cuid + urlOrder

                if (user && user.device && user.device.token) {
                  url += '&apid=' + user.id_user + (user.is_sotr === 1 ? '&agn=2' : '')
                }

                Linking.openURL(url, '_blank')
              })
            }}
            containerStyle={styles.listItem}>
            <Image source={ShopIcon} style={styles.iconContainer} />
            <ListItem.Content>
              <ListItem.Subtitle style={{ color: '#000' }}>{t('tooltip.tur')}</ListItem.Subtitle>
            </ListItem.Content>
          </ListItem>
        ) : (
          <></>
        )}
        {item.auth === 1 ? (
          <ListItem
            key={5}
            bottomDivider
            onPress={() =>
              this.setState({ tooltipOpen: false }, () => {
                history('/ah/' + (Number(item.huid) + 100000))
              })
            }
            containerStyle={styles.listItem}>
            <Image source={BarIcon} style={styles.iconContainer} />
            <ListItem.Content>
              <ListItem.Subtitle style={{ color: '#000' }}>{t('tooltip.actions')}</ListItem.Subtitle>
            </ListItem.Content>
          </ListItem>
        ) : null}
        <ListItem
          key={3}
          bottomDivider
          onPress={() =>
            this.setState({ tooltipOpen: false }, () => {
              const path = getAppConstants().url_main_link
              let url = path + '/bestt.php?i=ols' + item.huid + '&only=1&t=0;3'

              if (user && user.device && user.device.token) {
                url += '&apid=' + user.id_user + (user.is_sotr === 1 ? '&agn=2' : '')
              }

              Linking.openURL(url, '_blank')
            })
          }
          containerStyle={styles.listItem}>
          <Image source={ChatIcon} style={styles.iconContainer} />
          <ListItem.Content>
            <ListItem.Subtitle style={{ color: '#000' }}>{t('tooltip.review')}</ListItem.Subtitle>
          </ListItem.Content>
        </ListItem>
        <ListItem
          key={0}
          onPress={() =>
            this.setState({ tooltipOpen: false }, () => {
              history('/y/' + id_country + '/h/' + item.huid)
            })
          }
          containerStyle={styles.listItem}>
          <Image source={AskIcon} style={styles.iconContainer} />
          <ListItem.Content>
            <ListItem.Subtitle style={{ color: '#000' }}>{t('tooltip.chat')}</ListItem.Subtitle>
          </ListItem.Content>
        </ListItem>
      </View>
    )
  }

  formatNumber = (q, cur) => {
    return q.toLocaleString('ru-RU', {
      style: 'currency',
      currency: cur === '$' ? 'USD' : 'RUB',
      currencyDisplay: 'symbol',
      minimumFractionDigits: 0
    })
  }

  renderPrice = (item, index, path, url) => {
    const { Icon } = this.props.utils
    const { setVisibleModalSearch, history, indexTab, user, setModalLogin } = this.props

    if (indexTab === 1 && item.price_RUB && item.price_RUB !== -1) {
      return (
        <View style={{ alignItems: 'flex-end', flex: 1 }}>
          <TouchableOpacity
            onPress={() => {
              if (item.grp_link) {
                Linking.openURL(path + item.grp_link + url, '_blank')
              } else {
                history(item.action_link)
              }
            }}
            style={{ flexDirection: 'row' }}>
            <Text style={{ fontSize: 14, color: '#0651ef', fontWeight: 'bold' }}>{'Туры '}</Text>
            <Text style={{ fontSize: 14, color: '#0651ef', fontWeight: 'bold' }}>{'от ' + this.formatNumber(Number(item.price_RUB), item.cur)}</Text>
          </TouchableOpacity>
        </View>
      )
    }

    if (indexTab === 1 && item.price_RUB && item.price_RUB === -1) {
      return (
        <View style={{ alignItems: 'flex-end', flex: 1 }}>
          <TouchableOpacity
            onPress={() => {
              setVisibleModalSearch(true, item.cuid, item.huid, item.puid, item.hclass, index)
            }}
            style={{ flexDirection: 'row' }}>
            <Icon name={'search'} color={MAIN_COLOR} />
            <Text style={{ fontSize: 15, color: item.auth === 1 ? 'green' : MAIN_COLOR }}>{'На Ваши даты цен еще нет'}</Text>
          </TouchableOpacity>
        </View>
      )
    }

    if (indexTab === 2 && item.price_RUB && item.price_RUB !== -1) {
      return (
        <View style={{ alignItems: 'flex-end', flex: 1 }}>
          <TouchableOpacity
            onPress={() => {
              if (item.grp_link) {
                Linking.openURL(path + item.grp_link + url, '_blank')
              } else {
                history(item.action_link)
              }
            }}
            style={{ flexDirection: 'row' }}>
            <Text style={{ fontSize: 16, color: '#0651ef', fontWeight: 'bold' }}>{'Отель '}</Text>
            <Text style={{ fontSize: 16, color: '#0651ef', fontWeight: 'bold' }}>{'от ' + this.formatNumber(Number(item.price_RUB), item.cur)}</Text>
          </TouchableOpacity>
        </View>
      )
    }

    if (indexTab === 2 && item.price_RUB && item.price_RUB === -1) {
      return (
        <View style={{ alignItems: 'flex-end', flex: 1 }}>
          <TouchableOpacity
            onPress={() => {
              setVisibleModalSearch(true, item.cuid, item.huid, item.puid, item.hclass, index)
            }}
            style={{ flexDirection: 'row' }}>
            <Icon name={'search'} color={MAIN_COLOR} />
            <Text style={{ fontSize: 16, color: item.auth === 1 ? 'green' : MAIN_COLOR }}>{'На Ваши даты цен еще нет'}</Text>
          </TouchableOpacity>
        </View>
      )
    }

    if (!user.id_user) {
      return (
        <View style={{ alignItems: 'flex-end', flex: 1 }}>
          <TouchableOpacity
            onPress={() => {
              setModalLogin(true)
            }}
            style={{ flexDirection: 'row' }}>
            <Icon name={'search'} color={MAIN_COLOR} />
            <Text style={{ fontSize: 16, color: item.auth === 1 ? 'green' : MAIN_COLOR, fontWeight: 'bold' }}>{'Цены'}</Text>
          </TouchableOpacity>
        </View>
      )
    }

    return (
      <View style={{ alignItems: 'flex-end', flex: 1 }}>
        <TouchableOpacity
          onPress={() => {
            setVisibleModalSearch(true, item.cuid, item.huid, item.puid, item.hclass, index)
          }}
          style={{ flexDirection: 'row' }}>
          <Icon name={'search'} color={MAIN_COLOR} />
          <Text style={{ fontSize: 16, color: item.auth === 1 ? 'green' : MAIN_COLOR, fontWeight: 'bold' }}>{indexTab === 1 ? 'Цены' : 'Отель'}</Text>
        </TouchableOpacity>
      </View>
    )
  }

  renderContentItem = () => {
    const { isMobile, ListItem, Icon } = this.props.utils
    const { item, history, index, ratingHotelView, country, user, openModalGrade, routeExpo } = this.props
    let hclass = <Text style={{ fontSize: 12, color: 'blue' }}>{item.hclass}</Text>
    let path = user && user.referral && user.referral.ref_user && user.referral.ref_user.landing ? user.referral.ref_user.landing : getAppConstants().url_main
    path = path.substr(path.length - 1) === '/' ? path : path + '/'

    let url = ''
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

    if (user && user.device && user.device.token) {
      url += '&apid=' + user.id_user + (user.is_sotr === 1 ? '&agn=2' : '')
    }

    const cat = getSelectCategory()
    const lang = 'ru'
    // Mobile.getStoreState().app.appLangInterface
    const app = Platform.OS === 'ios' ? '11' : Platform.OS === 'web' ? '12' : '12'
    url += '&category_id=' + (cat.id ? cat.id : '1') + '&lg=' + lang + '&app=' + app

    if (item.hclass.indexOf('*') > -1) {
      let stars = Number(item.hclass.replace('*', ''))
      let view = []

      for (let i = 0; i < stars; i++) {
        view.push(<Icon key={i.toString()} name={'star'} color={'#ecce00'} size={16} />)
      }
      hclass = <View style={{ flexDirection: 'row', marginTop: 2 }}>{view}</View>
    }

    const img = item.cover_image ? { uri: item.cover_image } : placeholder

    return (
      <ListItem
        containerStyle={{
          marginTop: index === 0 ? 0 : 5,
          padding: 0,
          borderRadius: 10,
          backgroundColor: Number(item.huid) === Number(ratingHotelView) ? '#dee7ff' : '#fff',
          borderWidth: 1,
          height: 114
        }}>
        <ListItem.Content style={{ justifyContent: 'flex-start', paddingRight: 20, paddingBottom: 10 }}>
          <View style={{ flexDirection: 'row', width: '100%', marginLeft: 10, marginTop: 10 }}>
            <View>
              <Image source={img} style={{ width: 120, height: 90 }} resizeMethod={'scale'} />
              {Number(ratingHotelView) === 0 ? (
                Number(index) < 10 ? (
                  <Text style={{ fontSize: 32, color: '#fff', fontWeight: 'bold', position: 'absolute', left: 5, top: 22 }}>{'Топ-10'}</Text>
                ) : (
                  <></>
                )
              ) : (
                <></>
              )}
              {Number(index) > 9 || Number(ratingHotelView) !== 0 ? (
                <Text style={{ fontSize: 32, fontWeight: 'bold', color: '#fff', position: 'absolute', left: 42, top: 22 }}>{item.nb0}</Text>
              ) : (
                <></>
              )}
            </View>
            <View style={{ width: '80%', paddingLeft: 5 }}>
              <View style={{ marginBottom: 5, flexDirection: 'row' }}>
                <TouchableOpacity onPress={() => history('/y/' + country[0].id + '/h/' + item.huid + '/view')}>
                  <Text style={{ fontSize: isMobile ? 18 : 16, fontWeight: 'bold', color: '#7a7a7a' }}>{item.name}</Text>
                </TouchableOpacity>
                {item.review_id !== '' ? <Image source={BookIcon} style={[styles.iconContainer, { marginLeft: 10 }]} /> : null}
              </View>
              {hclass}
              {item.price_h && item.price_h > 0 ? (
                <View style={{ position: 'absolute', right: -36, bottom: Number(index) < 10 ? 86 : 60 }}>
                  <Text style={{ fontSize: 14, color: item.auth === 1 ? 'green' : '#7a7a7a' }}>{'от ~' + this.formatNumber(item.price_h, item.cur)}</Text>
                </View>
              ) : (
                <View style={{ position: 'absolute', right: -36, bottom: Number(index) < 10 ? 86 : 60 }}>
                  <Text style={{ fontSize: 14, color: item.auth === 1 ? 'green' : '#7a7a7a' }}>{'Цена не указана'}</Text>
                </View>
              )}
              <View style={{ height: 5 }} />
              <View style={{ flexDirection: 'row', width: '100%' }}>
                {item.cname !== '' ? <Text style={{ fontSize: 14, color: '#7a7a7a' }}>{item.cname}</Text> : null}
                {isMobile && item.pname !== '' ? <Text style={{ fontSize: 14, color: '#7a7a7a' }}>{' • ' + item.pname}</Text> : null}
                <TouchableOpacity
                  onPress={() => {
                    history('/y/' + item.cuid + '/h/' + item.huid + '/map', {
                      state: {
                        latitude: item.latitude,
                        longitude: item.longitude,
                        latitudeDelta: 0.0922,
                        longitudeDelta: 0.0421,
                        title: item.name,
                        subtitle: item.name,
                        id_hotel: item.huid,
                        name_hotel: item.name,
                        post_title: item.cname
                      }
                    })
                  }}>
                  <Text style={{ fontSize: 14, color: MAIN_COLOR }}>{' • на карте'}</Text>
                </TouchableOpacity>
                <View style={{ position: 'absolute', right: -36, bottom: Number(index) < 10 ? -30 : -15 }}>{this.renderPrice(item, index, path, url)}</View>
              </View>
              <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity onPress={() => openModalGrade && openModalGrade(item.huid)} style={{ height: 28 }}>
                  <View style={{ height: '100%', justifyContent: 'center' }}>
                    <Text style={{ color: MAIN_COLOR, paddingBottom: 2 }}>{'Оценка: ' + item.rate}</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => openModalGrade && openModalGrade(item.huid)} style={{ height: 28 }}>
                  <View style={{ height: '100%', justifyContent: 'center' }}>
                    <PlusMinus color={MAIN_COLOR} height={28} width={28} />
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ListItem.Content>
      </ListItem>
    )
  }

  renderContentItemList = () => {
    const { ListItem, Icon } = this.props.utils
    const { item, index, ratingHotelView } = this.props
    let hclass = <Text style={{ fontSize: 12, color: 'blue' }}>{item.hclass}</Text>

    if (item.hclass.indexOf('*') > -1) {
      let stars = Number(item.hclass.replace('*', ''))
      let view = []

      for (let i = 0; i < stars; i++) {
        view.push(<Icon key={i.toString()} name={'star'} color={'#ecce00'} size={16} />)
      }
      hclass = <View style={{ flexDirection: 'row', marginTop: 2 }}>{view}</View>
    }

    return (
      <ListItem containerStyle={{ marginTop: index === 0 ? 0 : 5, padding: 0, borderRadius: 10, backgroundColor: Number(item.huid) === Number(ratingHotelView) ? '#dee7ff' : '#fff' }}>
        <ListItem.Content style={{ padding: 0, justifyContent: 'flex-start' }}>
          <View style={{ flexDirection: 'row', width: '100%', marginLeft: 10 }}>
            <View style={{ paddingLeft: 5, width: '90%', justifyContent: 'center' }}>
              <View style={{ flexDirection: 'row' }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#7a7a7a' }}>{item.name}</Text>
                {item.review_id !== '' ? <Image source={BookIcon} style={[styles.iconContainer, { marginLeft: 10 }]} /> : null}
                {hclass}
              </View>
            </View>
            <View style={{ flexDirection: 'row', marginLeft: 20, width: 50 }}>
              <View style={{ width: 1, backgroundColor: '#ccc' }} />
              <View style={{ alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                {item.nb && Number(item.nb) < 4 && Number(item.nb) > 0 ? (
                  <View>
                    <Text style={{ fontSize: 24, color: 'orange', fontWeight: 'bold' }}>{item.nb}</Text>
                  </View>
                ) : item && Number(item.nb) !== 0 ? (
                  <View style={{ flexDirection: 'row' }}>
                    <Text style={{ fontSize: 20, color: '#a4a4a4', alignSelf: 'flex-end' }}>{item.nb}</Text>
                  </View>
                ) : null}
              </View>
            </View>
          </View>
        </ListItem.Content>
      </ListItem>
    )
  }

  render() {
    const { isMobile, Icon, List, t, ProgressBar } = this.props.utils
    const { item, history, country, shareRating, user, list, ratingHotelView, index, setModalLogin, onPressShare, currentCategory, filter } = this.props
    const { expanded, dataToursLoaded, dataTours } = this.state

    if (!user.device) {
      HEIGHT_TOOLTIP = HEIGHT_TOOLTIP - 40
    }

    const img = item.cover_image ? { uri: item.cover_image } : placeholder
    let hclass = <Text style={{ fontSize: 12, color: 'blue' }}>{item.hclass}</Text>

    if (item.hclass.indexOf('*') > -1) {
      let stars = Number(item.hclass.replace('*', ''))
      let view = []

      for (let i = 0; i < stars; i++) {
        view.push(<Icon key={i.toString()} name={'star'} color={'#ecce00'} size={16} />)
      }
      hclass = <View style={{ flexDirection: 'row' }}>{view}</View>
    }

    let path = user && user.referral && user.referral.ref_user && user.referral.ref_user.landing ? user.referral.ref_user.landing : getAppConstants().url_main
    path = path.substr(path.length - 1) === '/' ? path : path + '/'

    let url = ''
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

    if (user && user.device && user.device.token) {
      url += '&apid=' + user.id_user + (user.is_sotr === 1 ? '&agn=2' : '')
    }

    const cat = getSelectCategory()
    const lang = 'ru'
    // Mobile.getStoreState().app.appLangInterface
    const app = Platform.OS === 'ios' ? '11' : Platform.OS === 'web' ? '12' : '12'
    url += '&category_id=' + (cat.id ? cat.id : '1') + '&lg=' + lang + '&app=' + app

    let id_country = 0

    if (country && country.length > 0) {
      id_country = country[0].id
    }

    const MARGIN = 10
    const BG_COLOR = '#e4ecf6'

    let price = item.price_rub_t && Number(item.price_rub_t) !== -1 ? item.price_rub_t : item.price_t
    let requestPrice = false
    let night = '7-10 ночей'

    if (item.price_RUB && item.price_RUB !== -1) {
      price = Number(item.price_RUB)
      requestPrice = true
      night = item.nights + ' ночи(ей)'
    } else if (item.price_RUB && item.price_RUB === -1) {
      price = Number(item.price_RUB)
      requestPrice = true
      night = ''
    }

    return (
      <View style={{ width: isMobile ? width : width / 2, alignSelf: 'center', marginBottom: 10 }}>
        <View style={{ position: 'absolute', width: '100%', height: '100%', backgroundColor: '#fff', opacity: 0.8, top: 0, borderRadius: 10 }} />
        <List.Accordion
          title={
            <View style={{ flexDirection: 'row', width: '100%' }}>
              <View style={{ top: 5 }}>
                {hclass}
                <View style={{ flexDirection: 'row', width: isMobile ? width / 1.7 : width / 2.8 }}>
                  <Text
                    lineBreakMode={'tail'}
                    numberOfLines={1}
                    ellipsizeMode={'tail'}
                    style={{ fontSize: isMobile ? 14 : 16, fontWeight: 'bold', color: '#7a7a7a', height: isMobile ? 26 : 26, top: 3 }}>
                    {item.name}
                  </Text>
                  {/*{item.review_id !== '' ? <Image source={BookIcon} style={[styles.iconContainer, { marginLeft: 10 }]} /> : null}*/}
                </View>
              </View>
              {item.price_rub_t && item.price_rub_t > 0 ? (
                <View style={{ position: 'absolute', right: 0, top: 3 }}>
                  <Text style={{ fontSize: 12, color: item.auth === 1 ? 'green' : requestPrice ? MAIN_COLOR : '#000' }}>
                    {price !== -1 && <Text style={{ fontSize: isMobile ? 16 : 18, fontWeight: 'bold' }}>{'от ' + this.formatNumber(Number(price * (requestPrice ? 1 : 2)), 'RUR')}</Text>}
                    {price === -1 && <Text style={{ fontSize: 14 }}>{'Мест нет'}</Text>}
                  </Text>
                </View>
              ) : (
                <View style={{ position: 'absolute' }}>
                  <Text style={{ fontSize: 12, color: item.auth === 1 ? 'green' : '#7a7a7a' }}>{'Цена не указана'}</Text>
                </View>
              )}
              {night !== '' ? (
                <View style={{ position: 'absolute', right: 0, top: 24 }}>
                  <Text style={{ fontSize: 12, color: item.auth === 1 ? 'green' : '#7a7a7a' }}>{night}</Text>
                </View>
              ) : (
                <></>
              )}
            </View>
          }
          description={
            <View style={{}}>
              <View style={{ flexDirection: 'row' }}>
                {item.cname !== '' ? <Text style={{ fontSize: 11, color: '#7a7a7a' }}>{item.cname}</Text> : null}
                {item.pname !== '' ? <Text style={{ fontSize: 11, color: '#7a7a7a' }}>{' • ' + item.pname}</Text> : null}
              </View>
              <View style={{}}>
                <Text style={{ color: '#7a7a7a', fontSize: 12 }}>{'Оценка: ' + item.rate}</Text>
              </View>
            </View>
          }
          background={expanded ? '#fff' : 'transparent'}
          theme={{
            colors: {
              background: expanded ? '#fff' : 'transparent'
            }
          }}
          left={() => (
            <View style={{ top: 0 }}>
              <Image source={img} style={{ width: isMobile ? 80 : 110, height: isMobile ? 80 : 110 }} />
              {Number(ratingHotelView) === 0 ? (
                Number(index) < 10 ? (
                  <Text style={{ fontSize: 16, color: '#fff', fontWeight: 'bold', position: 'absolute', left: isMobile ? 12 : 24, top: 0 }}>{'Топ-10'}</Text>
                ) : (
                  <></>
                )
              ) : (
                <></>
              )}
              {Number(index) > 9 || Number(ratingHotelView) !== 0 ? (
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#fff', position: 'absolute', left: isMobile ? 30 : 46, top: 10 }}>{item.nb0}</Text>
              ) : (
                <></>
              )}
            </View>
          )}
          right={() =>
            expanded ? (
              <View style={{ position: 'absolute', bottom: isMobile ? -33 : -55, right: isMobile ? 5 : 10 }}>
                <Icon name="keyboard-arrow-up" size={24} color="gray" />
              </View>
            ) : (
              <View style={{ position: 'absolute', bottom: isMobile ? -33 : -55, right: isMobile ? 5 : 10 }}>
                <Icon name="keyboard-arrow-down" size={24} color="gray" />
              </View>
            )
          }
          expanded={expanded}
          rippleColor={'#eaeaea'}
          onPress={() => this.setState({ expanded: !expanded })}
          titleStyle={{ padding: 0, margin: 0, backgroundColor: 'transparent', borderRadius: 10 }}
          descriptionStyle={{ padding: 0, margin: 0, backgroundColor: 'transparent', borderRadius: 10 }}
          containerStyle={{ padding: 0, margin: 0, backgroundColor: 'transparent', borderRadius: 10 }}
          contentStyle={{ paddingLeft: 10, margin: 0, backgroundColor: 'transparent', justifyContent: 'flex-start', borderRadius: 10 }}
          style={{
            padding: 0,
            margin: 0,
            backgroundColor: 'transparent',
            // marginBottom: 10,
            borderRadius: 10
            // height: Platform.OS === 'ios' ? 70 : 84,
            // width: Dimensions.get('window').width - 20,
          }}>
          <View style={{ width: '100%', backgroundColor: '#fff', paddingLeft: 0, marginBottom: 10, borderBottomLeftRadius: 10, borderBottomRightRadius: 10 }}>
            <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={{ width: isMobile ? width : width / 2, flexDirection: 'row', paddingLeft: 10, marginTop: 10 }}>
              <TouchableOpacity style={{ backgroundColor: BG_COLOR, borderRadius: 20, flexDirection: 'row' }} onPress={() => router.push('/y/' + country[0].id + '/h/' + item.huid + '/view')}>
                <Text style={{ color: '#2e2e2e', marginVertical: 10, marginHorizontal: MARGIN, textTransform: 'uppercase', fontSize: 11 }}>{t('tooltip.hotelPage')}</Text>
              </TouchableOpacity>
              <View style={{ width: 5 }} />
              <TouchableOpacity style={{ backgroundColor: BG_COLOR, borderRadius: 20, flexDirection: 'row' }} onPress={() => onPressShare && onPressShare(item.huid)}>
                <Text style={{ color: '#2e2e2e', marginVertical: 10, marginHorizontal: MARGIN, textTransform: 'uppercase', fontSize: 11 }}>{t('tooltip.share')}</Text>
              </TouchableOpacity>
              {user.notour === 1 ? (
                <>
                  <View style={{ width: 5 }} />
                  <TouchableOpacity
                    style={{ backgroundColor: BG_COLOR, borderRadius: 20, flexDirection: 'row' }}
                    onPress={() => {
                      if (!user.id_user) {
                        setModalLogin(true)

                        return
                      }

                      let urlOrder = '&nsh=1&only=1&t=0;3'

                      if (!_.isEmpty(user)) {
                        let txtMd5 = md5(user.login + 'sdlkgfls')
                        txtMd5 = txtMd5.substring(0, 4)

                        let urlLogin = encodeURI(user.login)
                        let urlEmail = encodeURI(user.my_name)

                        urlOrder += `&un=${urlEmail}&ue=${urlLogin}&uk=${txtMd5}&dg=15&fo=1&nsh=1`

                        if (user.phone) {
                          urlOrder += `&ut=${user.phone}`
                        }

                        urlOrder += '&ref=' + (user && user.referral && user.referral.code ? user.referral.code : '')
                      } else {
                        urlOrder += '&ut=&un=&ue=&uk=&dg=15&fo=1&nsh=1'
                      }

                      const path = getAppConstants().url_main_link

                      let url = path + '/poisk.php?get=1&online=1&hotels[]=' + item.huid + '&c=' + item.cuid + urlOrder

                      if (user && user.device && user.device.token) {
                        url += '&apid=' + user.id_user + (user.is_sotr === 1 ? '&agn=2' : '')
                      }

                      Linking.openURL(url, '_blank')
                    }}>
                    <Text style={{ color: '#2e2e2e', marginVertical: 10, marginHorizontal: MARGIN, textTransform: 'uppercase', fontSize: 11 }}>{t('tooltip.tur')}</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <></>
              )}

              {item.auth === 1 ? (
                <>
                  <View style={{ width: 5 }} />
                  <TouchableOpacity
                    style={{ backgroundColor: BG_COLOR, borderRadius: 20, flexDirection: 'row' }}
                    onPress={() =>
                      this.setState({ tooltipOpen: false }, () => {
                        router.navigate({
                          pathname: '/ah/' + (Number(item.huid) + 100000),
                          params: {
                            hotel: JSON.stringify(item),
                            user: JSON.stringify(user),
                            currentCategory: JSON.stringify(currentCategory),
                            isFinishAll: null,
                            filterApp: JSON.stringify(filter),
                            huid: item.huid
                          }
                        })
                      })
                    }>
                    <Text style={{ color: '#2e2e2e', marginVertical: 10, marginHorizontal: MARGIN, textTransform: 'uppercase', fontSize: 11 }}>{t('tooltip.actions')}</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <></>
              )}
              <View style={{ width: 5 }} />
              <TouchableOpacity
                style={{ backgroundColor: BG_COLOR, borderRadius: 20, flexDirection: 'row' }}
                onPress={() =>
                  this.setState({ tooltipOpen: false }, () => {
                    const path = getAppConstants().url_main_link
                    let url = path + '/bestt.php?i=ols' + item.huid + '&only=1&t=0;3'

                    if (user && user.device && user.device.token) {
                      url += '&apid=' + user.id_user + (user.is_sotr === 1 ? '&agn=2' : '')
                    }

                    Linking.openURL(url, '_blank')
                  })
                }>
                <Text style={{ color: '#2e2e2e', marginVertical: 10, marginHorizontal: MARGIN, textTransform: 'uppercase', fontSize: 11 }}>{t('tooltip.review')}</Text>
              </TouchableOpacity>
              <View style={{ width: 5 }} />
              <TouchableOpacity
                style={{ backgroundColor: BG_COLOR, borderRadius: 20, flexDirection: 'row' }}
                onPress={() =>
                  this.setState({ tooltipOpen: false }, () => {
                    history('/y/' + id_country + '/h/' + item.huid)
                  })
                }>
                <Text style={{ color: '#2e2e2e', marginVertical: 10, marginHorizontal: MARGIN, textTransform: 'uppercase', fontSize: 11 }}>{t('tooltip.chat')}</Text>
              </TouchableOpacity>
              <View style={{ width: 10 }} />
            </ScrollView>
            <View style={{ minHeight: 240 }}>
              {dataToursLoaded ? (
                dataTours.length > 0 ? (
                  <FlatList horizontal={true} data={dataTours} renderItem={this.renderItem} ListEmptyComponent={<ActivityIndicator />} />
                ) : (
                  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <Text>{'Данных по отелю пока нет'}</Text>
                  </View>
                )
              ) : (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                  <ActivityIndicator />
                  <Text>{'Получаем данные...'}</Text>
                  <View style={{ width: '50%', marginTop: 10 }}>
                    <ProgressBar progress={this.dataToursBar.current} color={MAIN_COLOR} />
                  </View>
                </View>
              )}
            </View>
          </View>
        </List.Accordion>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  itemContainer: {
    padding: 16
  },
  avatarContainer: {
    borderColor: '#c9c9c9',
    backgroundColor: 'transparent',
    borderWidth: 1,
    margin: 0,
    padding: 0
  },
  iconContainer: {
    width: 16,
    height: 16,
    // opacity: 0.5,
    marginTop: 8,
    marginLeft: 8
  },
  listItem: {
    height: 40
  }
})

export default Item
