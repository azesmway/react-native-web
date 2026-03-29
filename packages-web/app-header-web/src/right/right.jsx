import compact from 'lodash/compact'
import isEmpty from 'lodash/isEmpty'
import split from 'lodash/split'
import { createRef, lazy, PureComponent, Suspense, useRef } from 'react'
import { Button, Linking, Modal, Platform, Text, TouchableOpacity, View } from 'react-native'

const ActionsFilter = lazy(() => import('./components/ActionsFilter'))
const FabMenu = lazy(() => import('./components/FabMenu'))
const ShareRating = lazy(() => import('./components/ShareRating'))
const MyRating = lazy(() => import('./components/MyRating'))
const RatingsListCounties = lazy(() => import('./components/RatingsListCounties'))
const ShowSearch = lazy(() => import('./components/ShowSearch'))
const AddNewTheme = lazy(() => import('./components/newtheme'))

const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
const { MAIN_COLOR } = GLOBAL_OBJ.onlinetur.constants
const { getSelectCategory, getAppConfig, getSafeAreaInsets } = GLOBAL_OBJ.onlinetur.storage
const WIDTH_MENU = 250

class RightComponent extends PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      isMenuOpen: false,
      isFilterOpen: false,
      loadingExit: false,
      isFilterMenuOpen: false,
      radioView: false,
      open: false,
      vertical: 'top',
      horizontal: 'center',
      search: '',
      showLoading: false,
      visible: false
    }

    this.button = {
      news: {
        url: '/menu',
        icon: 'more-vert'
      },
      main: {
        url: '/u',
        icon: 'settings'
      },
      article: {
        url: '/n',
        icon: 'more-vert'
      },
      chat: {
        url: '/filter',
        icon: 'more-vert'
      }
    }

    this.setVisibleCreateTheme = view => {
      this.setState({ visible: view })
    }

    this.handleCloseSearch = () => {
      this.setState({ open: false })
    }

    this.handleCloseNewsMenu = () => {
      this.setState({ isMenuOpen: false })
    }

    this.handleOpenMenu = () => {
      this.setState({ isMenuOpen: true })
    }

    this.handleCloseFilter = () => {
      this.setState({ isFilterOpen: false })
    }

    this.handleOpenFilter = (viewType, geo) => {
      const { params } = this.props

      this.setState({ isFilterMenuOpen: false }, () => {
        params.openModalFilter(viewType, geo)
      })
    }

    this.handleCloseFilterMenu = () => {
      this.setState({ isFilterMenuOpen: false })
    }

    this.handleHistoryPush = (history, url) => {
      const { user, setModalLogin } = this.props

      if (isEmpty(user)) {
        setModalLogin(true)

        return
      }

      history(url)
    }

    this.signOutUser = async history => {
      const { firebase, appApi, dispatch } = this.props.utils
      const { logOut, currentCategory, user, setCategories, setAllCountries, setAllAgent, setUser, setAgentTowns, changeOfflineMode, changeMyRatingLocal, changeMyRatingServer } = this.props
      let data = {}

      dispatch(appApi.endpoints.getUserCross.initiate(true)).then(() => {
        data.filter = {
          selectedCountry: currentCategory.default_id_filter_root,
          selectedHotel: '-1',
          selectedHobby: '-1',
          selectedPlace: '-1',

          selectedCountryName: currentCategory.default_title_filter_root,
          selectedHotelName: '',
          selectedHobbyName: '',
          selectedPlaceName: '',

          selectedCountryHide: 0,
          selectedHotelHide: 0,
          selectedHobbyHide: 0,
          selectedPlaceHide: 0,

          selectedFav: '0',
          selectedFavName: '',

          searchFav: '',
          idUserFav: '0',
          nameUserFav: '',

          chatAgent: false,
          selectedAgent: currentCategory.default_id_profi,
          selectedAgentName: currentCategory.default_title_profi,

          selectCategory: currentCategory
        }

        data.user = {}

        firebase
          .auth()
          .signOut()
          .then(function () {
            setCategories([])
            setAllCountries([])
            setAllAgent([])

            setUser({})
            setAgentTowns([])
            changeOfflineMode(false)

            logOut(data)

            changeMyRatingLocal([])
            changeMyRatingServer([])
            history('/')
          })
          .catch(function (error) {
            console.log(error)
          })
      })
    }

    this.clearFilter = async () => {
      const { history } = this.props

      this.setState({ isMenuOpen: false })
      history('/l')
    }

    this.openSettings = async () => {
      const { history, user, setModalLogin } = this.props

      this.setState({ isMenuOpen: false }, () => {
        if (!isEmpty(user)) {
          history('/u')
        } else {
          setModalLogin(true)
        }
      })
    }

    this.handleCloseAlert = () => {
      const { setModalAlert } = this.props

      this.setState(
        {
          titleAlert: '',
          bodyAlert: '',
          shareMessage: null,
          isShareMessage: false,
          appShare: false
        },
        () => {
          GLOBAL_OBJ.onlinetur.state = {}
          setModalAlert(false)
        }
      )
    }

    this.ShareURL = async () => {
      const { t } = this.props.utils
      const { history, user, pathname, setModalAlert, setModalLogin } = this.props
      const cat = getSelectCategory()

      if (isEmpty(user)) {
        setTimeout(function () {
          setModalLogin(true)
        }, 100)
        return
      }

      const ref = '?c=' + user.referral.code
      const shareOptions = {
        title: t('common.application'),
        message: 'За каждого приглашенного пользователя вы получите 5000 рублей на бонусный счет, а приглашенный - 100 рублей.',
        url: getAppConfig().homepage + pathname + ref + '&cat=' + (cat.id ? cat.id : '1')
      }

      this.setState(
        {
          titleAlert: shareOptions.title,
          bodyAlert: shareOptions.message,
          shareMessage: shareOptions,
          isShareMessage: true,
          appShare: true
        },
        () => {
          GLOBAL_OBJ.onlinetur.state = this.state
          setModalAlert(true)
        }
      )
    }

    this.onCloseUserMessages = () => {
      const { filter, setFilter } = this.props

      let data = Object.assign({}, filter)
      data.searchFav = ''
      data.idUserFav = '0'
      data.nameUserFav = ''
      setFilter(data)
    }

    this.onCloseReplaysMessages = () => {
      const { filter, setFilter } = this.props

      let data = Object.assign({}, filter)
      data.searchFav = ''
      data.idUserFav = '0'
      data.nameUserFav = ''
      setFilter(data)
    }
  }

  renderMenuNews = (history, params) => {
    const { t, theme, CheckBox, Icon, Badge, Menu, MenuTrigger, MenuOptions, MenuOption } = this.props.utils
    const { user, filter } = this.props
    const { isMenuOpen } = this.state

    return (
      <Menu opened={isMenuOpen} onBackdropPress={this.handleCloseNewsMenu}>
        <MenuTrigger>
          <TouchableOpacity transparent onPress={() => this.handleOpenMenu()} text={''}>
            <Icon name={this.button[params.screen].icon} size={35} color={MAIN_COLOR} />
            {params.badge !== 0 && (
              <Badge style={Platform.OS === 'web' ? { top: -4, right: -4, position: 'absolute' } : { top: -8, right: -8, position: 'absolute' }}>
                <Text>{params.badge}</Text>
              </Badge>
            )}
          </TouchableOpacity>
        </MenuTrigger>
        <MenuOptions customStyles={optionsStyles}>
          {params.menuNews.map((el, i) => (
            <MenuOption key={i.toString()}>
              <CheckBox
                title={el.name}
                checked={el.is_check === 1}
                containerStyle={{
                  backgroundColor: 'transparent',
                  borderWidth: 0,
                  padding: 5
                }}
                onPress={() => {
                  let menuSelect = [...params.menuNews]
                  menuSelect[i].is_check = el.is_check === 1 ? 0 : 1
                  params.selectMenu(menuSelect, i)
                }}
              />
            </MenuOption>
          ))}
          {!isEmpty(user) && params.badge !== 1 ? (
            <View>
              <View style={{ marginVertical: 5, marginHorizontal: 2, borderBottomWidth: 1, borderColor: '#ccc' }} />
              <MenuOption value={10} onSelect={() => history('/chanel')}>
                <View style={{ flexDirection: 'row', padding: 10, paddingLeft: 15 }}>
                  <Icon type={'font-awesome'} name={'plus'} color={MAIN_COLOR} />
                  <Text style={{ fontSize: 15, paddingTop: 2, paddingLeft: 10, color: theme.text }}>{t('common.addChannel')}</Text>
                </View>
              </MenuOption>
            </View>
          ) : null}
          {params.badge === 1 ? (
            <View>
              <View style={{ marginVertical: 5, marginHorizontal: 2, borderBottomWidth: 1, borderColor: '#ccc' }} />
              <MenuOption value={11} onSelect={() => this.clearFilter()}>
                <View style={{ flexDirection: 'row' }}>
                  <Icon name={'close'} color={'red'} />
                  <Text style={{ marginTop: 3, color: theme.text }}>{filter.selectedHotelName}</Text>
                </View>
              </MenuOption>
            </View>
          ) : null}
          <View>
            <View style={{ marginVertical: 0, marginHorizontal: 0, borderBottomWidth: 1, borderColor: '#ccc' }} />
            <MenuOption value={12} onSelect={() => this.openSettings()}>
              <View style={{ flexDirection: 'row', padding: 10, paddingLeft: 15 }}>
                <Icon name={'settings'} color={MAIN_COLOR} />
                <Text style={{ fontSize: 15, paddingTop: 2, paddingLeft: 10, color: theme.text }}>{t('common.settings')}</Text>
              </View>
            </MenuOption>
          </View>
        </MenuOptions>
      </Menu>
    )
  }

  renderMenuShare = params => {
    const { t, theme, Icon, Menu, MenuTrigger, MenuOptions, MenuOption } = this.props.utils
    const { user } = this.props
    const { isMenuOpen } = this.state

    return (
      <Menu opened={isMenuOpen} onBackdropPress={this.handleCloseNewsMenu}>
        <MenuTrigger>
          <TouchableOpacity style={{ marginBottom: 3 }} transparent onPress={() => this.handleOpenMenu()} text={''}>
            <Icon name={this.button[params.screen].icon} size={35} color={MAIN_COLOR} />
          </TouchableOpacity>
        </MenuTrigger>
        <MenuOptions customStyles={optionsStyles}>
          <MenuOption
            onSelect={() =>
              this.setState({ isMenuOpen: false }, async () => {
                await params.onShare(params.item)
              })
            }
            style={{ borderBottomWidth: 1, borderBottomColor: '#ccc' }}>
            <View style={{ flexDirection: 'row', padding: 10, paddingLeft: 15 }}>
              <Icon type={'font-awesome'} name={'link'} color={MAIN_COLOR} />
              <Text style={{ fontSize: 15, paddingTop: 2, paddingLeft: 10, color: theme.text }}>{t('components.header.rightcomponent.shareLink')}</Text>
            </View>
          </MenuOption>
          <MenuOption onSelect={() => this.openSettings()}>
            <View style={{ flexDirection: 'row', padding: 10, paddingLeft: 15 }}>
              <Icon name={'settings'} color={MAIN_COLOR} />
              <Text style={{ fontSize: 15, paddingTop: 2, paddingLeft: 10, color: theme.text }}>{t('components.header.rightcomponent.settings')}</Text>
            </View>
          </MenuOption>
        </MenuOptions>
      </Menu>
    )
  }

  renderChatFilterMenu = (params, badge) => {
    const { t, theme, Icon, Menu, MenuTrigger, MenuOptions, MenuOption, Badge, ActionFilter, isMobile } = this.props.utils
    const { filter, history, user, countries, places, currentCategory, expoRouter, setModalRequest } = this.props
    const { isFilterMenuOpen } = this.state

    const MenuItem = ({ onPress, icon, color = MAIN_COLOR, text }) => (
      <MenuOption onSelect={onPress} style={{ padding: 5 }}>
        <View style={{ flexDirection: 'row', paddingVertical: 5, marginHorizontal: 10 }}>
          <Icon name={icon} color={color} />
          <Text style={{ fontSize: 15, paddingTop: 2, paddingLeft: 5, color: theme.text, width: WIDTH_MENU }} numberOfLines={1} ellipsizeMode={'tail'}>
            {text}
          </Text>
        </View>
      </MenuOption>
    )

    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
        <TouchableOpacity
          style={{ marginRight: isMobile ? 5 : 0 }}
          onPress={() => {
            this.setState({ visible: false }, () => {
              if (filter.chatAgent) {
                this.handleOpenFilter('country')
              } else {
                this.handleOpenFilter('hotel')
              }
            })
          }}>
          <Icon name={'filter-list'} size={isMobile ? 25 : 35} color={MAIN_COLOR} />
        </TouchableOpacity>
        <Menu opened={isFilterMenuOpen} onBackdropPress={this.handleCloseFilterMenu}>
          <MenuTrigger>
            <TouchableOpacity transparent onPress={() => this.setState({ isFilterMenuOpen: true })} text={''}>
              <Icon name={this.button[params.screen].icon} size={isMobile ? 25 : 35} color={MAIN_COLOR} style={{ top: 0 }} />
              {Number(badge) > 0 && (
                <Badge style={Platform.OS === 'web' ? { top: -4, right: -4, position: 'absolute' } : { top: -8, right: -8, position: 'absolute' }}>
                  <Text>{badge}</Text>
                </Badge>
              )}
            </TouchableOpacity>
          </MenuTrigger>
          <MenuOptions customStyles={optionsStyles}>
            {Number(filter.selectedHobby) !== -1 && Number(filter.selectedHotel) === -1 && Number(filter.selectedCountry) !== -1 ? (
              <MenuItem key={'onClearOnlyCountry'} onPress={() => ActionFilter.onClearOnlyCountry(this)} icon={'close'} color={'red'} text={filter.selectedCountryName} />
            ) : null}
            {filter.chatAgent && filter.selectedCountry !== '-1' ? (
              <MenuItem key={'onClearOnlyCountrychatAgent'} onPress={() => ActionFilter.onClearOnlyCountry(this)} icon={'close'} color={'red'} text={filter.selectedCountryName} />
            ) : null}
            {filter.searchFav !== '' ? <MenuItem key={'onClearOnlySearch'} onPress={() => ActionFilter.onClearOnlySearch(this)} icon={'close'} color={'red'} text={filter.searchFav} /> : null}
            {filter.selectedHotel !== '-1' ? (
              <MenuItem key={'onClearOnlyHotel'} onPress={() => ActionFilter.onClearOnlyHotel(this)} icon={'close'} color={'red'} text={filter.selectedHotelName} />
            ) : null}
            {filter.selectedPlace !== '-1' ? (
              <MenuItem key={'onClearOnlyPlace'} onPress={() => ActionFilter.onClearOnlyPlace(this)} icon={'close'} color={'red'} text={filter.selectedPlaceName} />
            ) : null}
            {filter.selectedHobby !== '-1' ? (
              <MenuItem key={'onClearOnlyHobby'} onPress={() => ActionFilter.onClearOnlyHobby(this)} icon={'close'} color={'red'} text={filter.selectedHobbyName} />
            ) : null}
            {filter.chatAgent && filter.selectedCountry !== '-1' ? (
              <>
                <MenuItem key={'hotel'} onPress={() => this.handleOpenFilter('hotel')} icon={'filter-list'} text={'Фильтр ' + filter.selectCategory.name_filter_tip1} />
                <MenuItem key={'theme'} onPress={() => this.handleOpenFilter('theme')} icon={'filter-list'} text={'Фильтр ' + filter.selectCategory.name_filter_tip2} />
              </>
            ) : filter.chatAgent && filter.selectedCountry === '-1' ? (
              <MenuItem key={'country'} onPress={() => this.handleOpenFilter('country')} icon={'filter-list'} text={'Фильтр ' + filter.selectCategory.name_filter_root} />
            ) : (
              <></>
            )}
            {!filter.chatAgent ? (
              <>
                <MenuItem key={'name_filter_tip1'} onPress={() => this.handleOpenFilter('hotel')} icon={'filter-list'} text={'Фильтр ' + filter.selectCategory.name_filter_tip1} />
                <MenuItem key={'name_filter_tip3'} onPress={() => this.handleOpenFilter('theme')} icon={'filter-list'} text={'Фильтр ' + filter.selectCategory.name_filter_tip3} />
              </>
            ) : (
              <></>
            )}
            <MenuItem
              key={'map'}
              onPress={() => {
                this.setState({ visible: false, isFilterMenuOpen: false }, () => {
                  expoRouter.push('/g')
                })
              }}
              icon={'map'}
              text={'На карте'}
            />
            {currentCategory.is_show_geo === 1 ? <MenuItem key={'place'} onPress={() => this.handleOpenFilter('hotel', 'geo')} icon={'place'} text={'Фильтр по гео'} /> : null}
            {params.messagesLength > 1 ? (
              <>
                <MenuItem
                  key={'notifyEnabled'}
                  onPress={() => params.setNotifyEnabled(!params.notifyEnabled)}
                  icon={params.notifyEnabled ? 'notifications' : 'notifications-off'}
                  text={params.notifyEnabled ? 'Выключить уведомления' : 'Включить уведомления'}
                />
                <Suspense>
                  <FabMenu
                    country={Number(filter.selectedCountry)}
                    hotel={Number(filter.selectedHotel)}
                    hotelName={filter.selectedHotelName}
                    hobby={Number(filter.selectedHobby)}
                    place={Number(filter.selectedPlace)}
                    chatRendered={params.chatRendered}
                    user={user}
                    filter={filter}
                    countries={countries}
                    places={places}
                    ratingCategories={params.ratingCategories}
                    setModalRequest={setModalRequest}
                    utils={this.props.utils}
                  />
                </Suspense>
              </>
            ) : null}
            {!isEmpty(user) ? (
              <MenuItem key={'lplace'} onPress={() => this.setState({ open: true, isFilterMenuOpen: false })} icon={'search'} text={t('components.header.rightcomponent.openSearch')} />
            ) : null}
            <MenuItem
              key={'lplace2'}
              onPress={() =>
                this.setState({ isFilterMenuOpen: false }, async () => {
                  await this.ShareURL()
                })
              }
              icon={'share'}
              text={t('components.header.rightcomponent.shareLink')}
            />
            {filter.selectedHotel !== '-1' ? (
              <>
                <MenuItem key={'home'} onPress={() => history('/y/' + filter.selectedCountry + '/h/' + filter.selectedHotel + '/view')} icon={'home'} text={'Лендинг отеля'} />
                <MenuItem
                  key={'edit'}
                  onPress={() => {
                    const url =
                      'https://zagrebon.com/add-review/prefill?transfer_to=1366&object_type=1&category_id=101' +
                      `&area=${filter.selectedCountryName}&object_id=${filter.selectedHotel}&tags[]=hotel_${filter.selectedHotel}&tags[]=${filter.selectedHotelName}&title=${filter.selectedHotelName}`
                    Linking.openURL(encodeURI(url), '_blank')
                  }}
                  icon={'edit'}
                  text={'Добавить обзор'}
                />
                <MenuItem key={'list'} onPress={() => history('/l/h/' + filter.selectedHotel)} icon={'list'} text={'Обзоры по отелю'} />
              </>
            ) : null}
            {filter.selectedPlace !== '-1' ? (
              <>
                <MenuItem key={'lhome'} onPress={() => history('/y/' + filter.selectedCountry + '/p/' + filter.selectedPlace + '/view')} icon={'home'} text={'Лендинг курорта'} />
                <MenuItem
                  key={'ledit'}
                  onPress={() => {
                    const url =
                      'https://zagrebon.com/add-review/prefill?transfer_to=1366&object_type=2&category_id=101' +
                      `&area=${filter.selectedCountryName}&object_id=${filter.selectedPlace}&tags[]=hotel_${filter.selectedPlace}&tags[]=${filter.selectedPlaceName}&title=${filter.selectedPlaceName}`
                    Linking.openURL(encodeURI(url), '_blank')
                  }}
                  icon={'edit'}
                  text={'Добавить обзор'}
                />
              </>
            ) : null}
            {user.is_admin && user.is_admin === 1 ? (
              <MenuItem key={'add-circle-outline'} onPress={() => this.setState({ isFilterMenuOpen: false, visible: true })} icon={'add-circle-outline'} text={'Добавить новый элемент'} />
            ) : (
              <></>
            )}
          </MenuOptions>
        </Menu>
      </View>
    )
  }

  renderChatFilter = (history, params) => {
    const { Icon } = this.props.utils
    const { filter, pathname, user } = this.props
    let badge = 0

    if (filter.chatAgent && (pathname.indexOf('/y/') > -1 || filter.selectedCountry !== '-1')) {
      badge += 1
    }

    if (filter.selectedHotel !== '-1' || filter.selectedPlace !== '-1') {
      badge += 1
    }

    if (filter.selectedHobby !== '-1') {
      badge += 1
    }

    if (filter.searchFav !== '') {
      badge += 1
    }

    if (params.openSearch) {
      return null
    }

    if (params.screen === 'chat' && filter.searchFav === '22') {
      return (
        <TouchableOpacity onPress={() => this.onCloseUserMessages()}>
          <Icon name={'close'} color={'red'} size={35} />
        </TouchableOpacity>
      )
    }

    if (params.screen === 'chat' && filter.searchFav === '4') {
      return (
        <TouchableOpacity onPress={() => this.onCloseReplaysMessages()}>
          <Icon name={'close'} color={'red'} size={35} />
        </TouchableOpacity>
      )
    }

    return this.renderChatFilterMenu(params, badge)
  }

  renderExit = history => {
    const { Icon, CircularProgress, isMobile } = this.props.utils
    const { loadingExit } = this.state

    if (loadingExit) {
      return (
        <View>
          <CircularProgress size={isMobile ? 25 : 35} />
        </View>
      )
    } else {
      return (
        <View>
          <TouchableOpacity transparent onPress={() => this.signOutUser(history)} text={''}>
            <Icon name={'logout'} size={isMobile ? 25 : 35} color={MAIN_COLOR} />
          </TouchableOpacity>
        </View>
      )
    }
  }

  renderMap = (history, params) => {
    return null
  }

  renderViewGeo = (history, params) => {
    const { Icon } = this.props.utils
    const { pathname } = this.props

    return (
      <View style={{ flexDirection: 'row' }}>
        <TouchableOpacity
          onPress={() => {
            this.ShareURL()
          }}
          style={{ paddingRight: 10, paddingTop: 3 }}>
          <Icon name={'share'} color={MAIN_COLOR} size={30} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() =>
            history(pathname.replace('/view', '/map'), {
              state: {
                latitude: params.latitude,
                longitude: params.longitude,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
                title: params.title,
                subtitle: params.subtitle,
                id_hotel: params.id_hotel,
                name_hotel: params.name_hotel,
                post_title: params.post_title
              }
            })
          }>
          <Icon name={'location-on'} size={35} color={MAIN_COLOR} />
        </TouchableOpacity>
      </View>
    )
  }

  renderChanel = (history, params) => {
    const { Icon } = this.props.utils

    return (
      <View>
        <TouchableOpacity transparent onPress={() => params.handleAddChanel()} text={''}>
          <Icon name={'add'} size={35} color={MAIN_COLOR} />
        </TouchableOpacity>
      </View>
    )
  }

  renderButton = (history, params, fav) => {
    const { chatServiceGet, isMobile, Icon, Badge, SvgIcon, Circle, Path } = this.props.utils
    const { pathname, user, setModalAlert, setStatusBar } = this.props
    const { radioView } = this.state
    const color = MAIN_COLOR
    const url = compact(split(pathname, '/'))

    if (url[0] === 'b') {
      return <View />
    }

    const buttonRef = createRef(null)

    const handlePress = () => {
      if (buttonRef.current) {
        buttonRef.current.measure((x, y, width, height, pageX, pageY) => {
          // Создаем объект с координатами для позиционирования
          const anchorLayout = {
            x: pageX,
            y: pageY,
            width: width,
            height: height,
            pageX: pageX,
            pageY: pageY
          }

          params.handleOpenMenu(anchorLayout)
        })
      }
    }

    if (params && params.screen) {
      if (params.screen === 'news') {
        return (
          <>
            <TouchableOpacity onPress={event => params.setVoice()} style={{ marginRight: 10 }}>
              <Icon name={params.voice ? 'volume-up' : 'volume-off'} active={params.voice} size={isMobile ? 25 : 35} color={color} />
            </TouchableOpacity>
            <TouchableOpacity
              ref={buttonRef}
              onPress={() => {
                if (params && params.handleOpenMenu) {
                  handlePress()
                } else {
                  this.handleHistoryPush(history, this.button[params.screen].url)
                }
              }}>
              <Icon name={this.button[params.screen].icon} size={isMobile ? 25 : 35} color={color} />
              {pathname.includes('/h/') && (
                <Badge style={Platform.OS === 'web' ? { top: -4, right: -4, position: 'absolute' } : { top: -8, right: -8, position: 'absolute' }}>
                  <Text>{pathname.includes('/h/') ? 1 : 0}</Text>
                </Badge>
              )}
            </TouchableOpacity>
          </>
        )
      } else if (params.screen === 'article') {
        return (
          <>
            <TouchableOpacity
              ref={buttonRef}
              onPress={() => {
                if (params && params.handleOpenMenu) {
                  handlePress()
                }
              }}
              style={{ justifyContent: 'center' }}>
              <Icon name={this.button[params.screen].icon} size={isMobile ? 26 : 35} color={color} />
            </TouchableOpacity>
          </>
        )
      } else if (params.screen === 'main') {
        return (
          <>
            <TouchableOpacity
              onPress={() => {
                this.setState({ radioView: !radioView }, () => {
                  !radioView ? setStatusBar({ type: 'radio' }) : setStatusBar({})
                })
              }}
              style={{ marginTop: 2, paddingRight: 10 }}>
              {/*<Icon name={'radio'} size={30} color={radioView ? 'red' : color} />*/}
              <SvgIcon width={isMobile ? 22 : 24} height={isMobile ? 22 : 24} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <Path
                  /* eslint-disable-next-line max-len */
                  d="M2 14C2 10.2288 2 8.34315 3.17157 7.17157C4.34315 6 6.22876 6 10 6H14C17.7712 6 19.6569 6 20.8284 7.17157C22 8.34315 22 10.2288 22 14C22 17.7712 22 19.6569 20.8284 20.8284C19.6569 22 17.7712 22 14 22H10C6.22876 22 4.34315 22 3.17157 20.8284C2 19.6569 2 17.7712 2 14Z"
                  stroke={radioView ? 'red' : color}
                  stroke-width="1.5"
                />
                <Circle cx="8" cy="14" r="3" stroke={radioView ? 'red' : color} stroke-width="1.5" />
                <Path d="M13.5 11H19" stroke={radioView ? 'red' : color} stroke-width="1.5" stroke-linecap="round" />
                <Path d="M13.5 14H19" stroke={radioView ? 'red' : color} stroke-width="1.5" stroke-linecap="round" />
                <Path d="M13.5 17H19" stroke={radioView ? 'red' : color} stroke-width="1.5" stroke-linecap="round" />
                <Path d="M6.5 6L15 2" stroke={radioView ? 'red' : color} stroke-width="1.5" stroke-linecap="round" />
              </SvgIcon>
            </TouchableOpacity>
            <TouchableOpacity onPress={event => this.handleHistoryPush(history, this.button[params.screen].url)} style={{ paddingRight: 5 }}>
              {/*<Icon name={this.button[params.screen].icon} size={35} color={color} />*/}
              <SvgIcon width={isMobile ? 28 : 32} height={isMobile ? 28 : 32} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                {}
                <Path
                  /* eslint-disable-next-line max-len */
                  d="M10.4 5.6C10.4 4.84575 10.4 4.46863 10.6343 4.23431C10.8686 4 11.2458 4 12 4C12.7542 4 13.1314 4 13.3657 4.23431C13.6 4.46863 13.6 4.84575 13.6 5.6V6.6319C13.9725 6.74275 14.3287 6.8913 14.6642 7.07314L15.3942 6.34315C15.9275 5.80982 16.1942 5.54315 16.5256 5.54315C16.8569 5.54315 17.1236 5.80982 17.6569 6.34315C18.1903 6.87649 18.4569 7.14315 18.4569 7.47452C18.4569 7.80589 18.1903 8.07256 17.6569 8.60589L16.9269 9.33591C17.1087 9.67142 17.2573 10.0276 17.3681 10.4H18.4C19.1542 10.4 19.5314 10.4 19.7657 10.6343C20 10.8686 20 11.2458 20 12C20 12.7542 20 13.1314 19.7657 13.3657C19.5314 13.6 19.1542 13.6 18.4 13.6H17.3681C17.2573 13.9724 17.1087 14.3286 16.9269 14.6641L17.6569 15.3941C18.1902 15.9275 18.4569 16.1941 18.4569 16.5255C18.4569 16.8569 18.1902 17.1235 17.6569 17.6569C17.1236 18.1902 16.8569 18.4569 16.5255 18.4569C16.1942 18.4569 15.9275 18.1902 15.3942 17.6569L14.6642 16.9269C14.3286 17.1087 13.9724 17.2573 13.6 17.3681V18.4C13.6 19.1542 13.6 19.5314 13.3657 19.7657C13.1314 20 12.7542 20 12 20C11.2458 20 10.8686 20 10.6343 19.7657C10.4 19.5314 10.4 19.1542 10.4 18.4V17.3681C10.0276 17.2573 9.67142 17.1087 9.33591 16.9269L8.60598 17.6569C8.07265 18.1902 7.80598 18.4569 7.47461 18.4569C7.14324 18.4569 6.87657 18.1902 6.34324 17.6569C5.80991 17.1235 5.54324 16.8569 5.54324 16.5255C5.54324 16.1941 5.80991 15.9275 6.34324 15.3941L7.07314 14.6642C6.8913 14.3287 6.74275 13.9725 6.6319 13.6H5.6C4.84575 13.6 4.46863 13.6 4.23431 13.3657C4 13.1314 4 12.7542 4 12C4 11.2458 4 10.8686 4.23431 10.6343C4.46863 10.4 4.84575 10.4 5.6 10.4H6.6319C6.74275 10.0276 6.8913 9.67135 7.07312 9.33581L6.3432 8.60589C5.80987 8.07256 5.5432 7.80589 5.5432 7.47452C5.5432 7.14315 5.80987 6.87648 6.3432 6.34315C6.87654 5.80982 7.1432 5.54315 7.47457 5.54315C7.80594 5.54315 8.07261 5.80982 8.60594 6.34315L9.33588 7.07308C9.6714 6.89128 10.0276 6.74274 10.4 6.6319V5.6Z"
                  stroke={color}
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <Path
                  d="M14.4 12C14.4 13.3255 13.3255 14.4 12 14.4C10.6745 14.4 9.6 13.3255 9.6 12C9.6 10.6745 10.6745 9.6 12 9.6C13.3255 9.6 14.4 10.6745 14.4 12Z"
                  stroke={color}
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </SvgIcon>
            </TouchableOpacity>
            <Suspense>
              <ShareRating params={params} setModalAlert={setModalAlert} utils={this.props.utils} />
            </Suspense>
          </>
        )
      } else if (params.screen === 'chat' && fav === '0') {
        return this.renderChatFilter(history, params)
      } else if (params.screen === 'chat' && fav === '1') {
        return null
      } else if (params.screen === 'profile') {
        return this.renderExit(history)
      } else if (params.screen === 'chanel') {
        return this.renderChanel(history, params)
      } else if (params.screen === 'map') {
        return this.renderMap(history, params)
      } else if (params.screen === 'view') {
        return this.renderViewGeo(history, params)
      } else if (params.screen === 'list_hotels') {
        return (
          <View style={{ flexDirection: 'row' }}>
            <Suspense>
              <ShareRating params={params} setModalAlert={setModalAlert} utils={this.props.utils} />
            </Suspense>
            <Suspense>
              <RatingsListCounties params={params} utils={this.props.utils} />
            </Suspense>
          </View>
        )
      } else if (params.screen === 'final_hotels') {
        return !params.editRating ? (
          <>
            <TouchableOpacity onPress={() => params.setEditPoints(true)} style={{ flexDirection: 'row', justifyContent: 'center', marginRight: 14, marginTop: 3 }}>
              <Icon name={'edit'} color={MAIN_COLOR} size={isMobile ? 24 : 26} />
            </TouchableOpacity>
            {/*<Suspense>*/}
            {/*  <RatingsListCounties params={params} utils={this.props.utils} />*/}
            {/*</Suspense>*/}
          </>
        ) : (
          <>
            <TouchableOpacity onPress={() => params.setEditPoints(false)} style={{ flexDirection: 'row', justifyContent: 'center', marginRight: 10 }}>
              <Icon name={'done'} color={MAIN_COLOR} size={isMobile ? 24 : 32} />
            </TouchableOpacity>
            {/*<Suspense>*/}
            {/*  <RatingsListCounties params={params} utils={this.props.utils} />*/}
            {/*</Suspense>*/}
          </>
        )
      } else if (params.screen === 'my-rating') {
        return (
          <Suspense>
            <MyRating params={params} utils={this.props.utils} />
          </Suspense>
        )
      } else if (params.screen === 'actions_hotels') {
        return (
          <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
            <Suspense>
              <ShowSearch params={params} utils={this.props.utils} />
            </Suspense>
            {!params.openSearch ? (
              <Suspense>
                <ActionsFilter params={params} utils={this.props.utils} />
              </Suspense>
            ) : null}
          </View>
        )
      } else if (params.screen === 'actions_hotel') {
        return (
          <View style={{ justifyContent: 'center' }}>
            <Suspense>
              <ActionsFilter params={params} utils={this.props.utils} />
            </Suspense>
          </View>
        )
      } else if (params.screen === 'my_bron') {
        return (
          <View style={{ justifyContent: 'center', flexDirection: 'row' }}>
            {params.close === 1 ? (
              <TouchableOpacity onPress={() => history('/mb')}>
                <Icon name={'close'} color={'red'} size={35} />
              </TouchableOpacity>
            ) : null}
            {user.hotels_user && user.hotels_user.length > 0 ? (
              <TouchableOpacity
                onPress={async () => {
                  let android_id_install = ''
                  let token = ''

                  if (!isEmpty(user)) {
                    android_id_install = user.android_id_install
                    token = user.device.token
                  }

                  const hotel = await chatServiceGet.getViewHotel(Number(user.hotels_user[0]) - 100000, android_id_install, token)
                  history('/y/' + hotel.chat_c + '/h/' + hotel.id + '/v/1')
                }}
                style={{ marginTop: 2, paddingRight: 5 }}>
                <Icon name={'note-add'} size={35} color={color} />
              </TouchableOpacity>
            ) : null}
            <Suspense>
              <ActionsFilter params={params} utils={this.props.utils} />
            </Suspense>
          </View>
        )
      }
    } else {
      return null
    }
  }

  renderSearch() {
    const { isMobile, Icon, SearchBar } = this.props.utils
    const { params } = this.props
    const { open, vertical, search, showLoading } = this.state

    if (params.openSearch) {
      return null
    }

    return (
      <Modal visible={open} transparent={true} onDismiss={() => this.handleCloseSearch()}>
        <View
          style={{
            height: 105,
            backgroundColor: '#fff',
            width: '100%',
            alignSelf: 'center',
            marginTop: getSafeAreaInsets().top + 42,
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 0
            },
            shadowOpacity: 0.25,
            shadowRadius: 7.84,
            elevation: 5
          }}>
          <SearchBar
            placeholder={params.placeholder}
            onChangeText={text => this.setState({ search: text })}
            value={search}
            lightTheme={true}
            inputStyle={{ backgroundColor: '#fff', padding: 0, color: '#000', outlineStyle: 'none', fontSize: 14 }}
            inputContainerStyle={{ backgroundColor: '#fff', padding: 0, borderRadius: 20, height: 30 }}
            autoCapitalize={'none'}
            autoCorrect={false}
            searchIcon={<Icon name="search" size={20} color={'#bdbdbd'} />}
            clearIcon={
              <Icon
                name="close"
                size={24}
                color={'red'}
                onPress={() => {
                  this.setState({ search: '' })
                  params.onClearSearch()
                }}
              />
            }
            showLoading={showLoading}
            onSubmitEditing={() => params.onSubmitEditingWeb(search)}
            keyboardType={'web-search'}
            onCancel={() => params.onOpenSearch(!params.openSearch)}
            onClear={() => params.onClearSearch()}
          />
          <View style={{ flexDirection: 'row', alignSelf: 'center', marginTop: 10 }}>
            <TouchableOpacity onPress={() => params.onSubmitEditingWeb(search)} style={{ backgroundColor: '#efefef', borderRadius: 10, alignItems: 'center', justifyContent: 'center', padding: 10 }}>
              <Text style={{ color: MAIN_COLOR }}>{'Искать'}</Text>
            </TouchableOpacity>
            <View style={{ width: 20 }} />
            <TouchableOpacity onPress={() => this.handleCloseSearch()} style={{ backgroundColor: '#efefef', borderRadius: 10, alignItems: 'center', justifyContent: 'center', padding: 10 }}>
              <Text style={{ color: MAIN_COLOR }}>{'Закрыть'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    )
  }

  render() {
    const { history, filter, user, params } = this.props
    const { open, visible } = this.state

    return (
      <>
        <View style={{ flexDirection: 'row' }}>
          {this.renderButton(history, params, filter.selectedFav)}
          {open && this.renderSearch()}
        </View>
        {visible && (
          <Suspense>
            <AddNewTheme visible={visible} setVisible={this.setVisibleCreateTheme} user={user} />
          </Suspense>
        )}
      </>
    )
  }
}

const optionsStyles = {
  optionsContainer: {
    marginTop: 40,
    width: WIDTH_MENU
  },
  optionsWrapper: {
    width: WIDTH_MENU
  },
  optionTouchable: {
    activeOpacity: 70
  },
  optionText: {
    padding: 10,
    fontSize: 16
  }
}

export default RightComponent
