/**
 * -----------------------------------------------------------------------
 *  Author      : Alexey Zolotarеv
 *  E-mail      : azesm@me.com
 * -----------------------------------------------------------------------
 */

import isEmpty from 'lodash/isEmpty'
import React, { PureComponent } from 'react'
import { Image, Linking, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { isIphoneX } from 'react-native-iphone-x-helper'

import SvgIcons from './icons'

const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
const { COLOR_TOP } = GLOBAL_OBJ.onlinetur.constants
const { getAppConfig, getAppConstants, getSelectCategory, getSafeAreaInsets } = GLOBAL_OBJ.onlinetur.storage
const theme = GLOBAL_OBJ.onlinetur.theme

// Move static calculations outside class
const LOGO_DIMENSIONS = { width: 369, height: 94 }
const AVATAR_SIZE = 70
const ICON_WIDTH = 35
const PROTECTED_ROUTES = new Set(['/', '/l', '/r', '/voice', '/s'])

class LeftMenu extends PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      referral: ''
    }
  }

  componentDidMount = async () => {
    await this.initReferal()
  }

  initReferal = async () => {
    const { user } = this.props
    const { cookies, chatServiceGet } = this.props.utils

    let referral = ''

    if (isEmpty(user)) {
      if (Platform.OS === 'web') {
        referral = cookies.load('referal') || ''
      }
    } else {
      const referrer = await chatServiceGet.getStartAppReg(user.android_id_install)
      if (referrer.code === 0) {
        referral = referrer.ref?.code || ''
      }
    }

    this.setState({ referral: referral ? `?c=${referral}` : '' })
  }

  // Memoize platform-specific top offset calculation
  getTopOffset = () => {
    if (Platform.OS === 'web') return -10
    if (Platform.OS === 'android') return 20
    return isIphoneX() ? 10 : 0
  }

  closeDrawer = () => {
    const { openDrawer } = this.props

    openDrawer(false)
  }

  ShareURL = async () => {
    const { user, currentCategory, setModalAlert } = this.props
    const { t } = this.props.utils

    this.closeDrawer()

    const cat = currentCategory.id
    const referralCode = user.referral?.code || ''
    const catId = cat.id || '1'

    const shareOptions = {
      title: t('common.application'),
      message: 'За каждого приглашенного пользователя вы получите 50 рублей на бонусный счет, а приглашенный - 100 рублей.',
      url: `${getAppConfig().homepage}/?c=${referralCode}&cat=${catId}`
    }

    GLOBAL_OBJ.onlinetur.state = {
      openAlert: true,
      titleAlert: shareOptions.title,
      bodyAlert: shareOptions.message,
      shareMessage: shareOptions,
      isShareMessage: true,
      appShare: true
    }
    setModalAlert(true)
  }

  renderTopAuthorized = () => {
    const { user } = this.props
    let { img_path } = user
    const top = this.getTopOffset()
    const nullAvatar = img_path && img_path.indexOf('/avatars/') === -1

    if (nullAvatar) {
      img_path = `${getAppConstants().url_main}/images/user.png`
    }

    const imageTop = Platform.OS === 'web' ? 0 : isIphoneX() ? 30 : 15
    const imageHeight = nullAvatar ? 80 : AVATAR_SIZE

    return (
      <View style={[styles.topContainer, { height: 80 + getSafeAreaInsets().top, paddingTop: getSafeAreaInsets().top, paddingVertical: 10 }]}>
        <View style={styles.avatarWrapper}>
          <Image source={{ uri: img_path }} style={[styles.avatar, { height: imageHeight }]} />
        </View>
        <View style={[styles.userInfoContainer, {}]}>
          <Text numberOfLines={1} ellipsizeMode="tail" style={styles.userName}>
            {user.my_name}
          </Text>
          <View style={styles.spacer} />
          <Text style={styles.userLogin} numberOfLines={1} ellipsizeMode="tail">
            {user.login}
          </Text>
        </View>
      </View>
    )
  }

  renderTopUnauthorized = () => {
    const { currentCategory, setModalLogin } = this.props
    const { Icon, t } = this.props.utils

    if (!currentCategory.url_logo_name) {
      return null
    }

    const isOnlinetur = getAppConstants().url_main.includes('onlinetur.ru')
    const logoUrl = isOnlinetur ? getAppConstants().url_main + currentCategory.url_logo : getAppConstants().url_main + currentCategory.url_logo.replace('/a/', '/')

    const handlePress = () => {
      this.closeDrawer()
      setModalLogin(true)
    }

    return (
      <TouchableOpacity style={[styles.topContainer, { height: isIphoneX() ? 120 : 100 }]} onPress={handlePress}>
        <View style={styles.unauthorizedContent}>
          <View style={styles.logoContainer}>
            <Image source={{ uri: logoUrl }} resizeMode="contain" style={styles.logo} />
          </View>
          <View style={styles.loginPrompt}>
            <Icon name="login" size={20} color="blue" />
            <Text style={styles.loginText}>{t('components.common.leftmenu.noAuth')}</Text>
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  renderTop = () => {
    return isEmpty(this.props.user) ? this.renderTopUnauthorized() : this.renderTopAuthorized()
  }

  openScreen = (url, key = null, value = null, name = '') => {
    const { history, user, filter, setFilter, pathname, setLocationPath, setModalLogin } = this.props
    const { t } = this.props.utils

    // Check if route requires authentication
    const requiresAuth = isEmpty(user) && !PROTECTED_ROUTES.has(url) && !url.startsWith('/y/')

    if (requiresAuth) {
      url = '/auth'
    }

    this.closeDrawer()

    setTimeout(() => {
      if (key) {
        const filterUpdates = {
          selectedCountry: { selectedCountry: value, selectedCountryName: name, chatAgent: false },
          selectedAgent: { selectedAgent: value, selectedAgentName: name, chatAgent: true },
          selectedFav: { selectedFav: '1', selectedFavName: t('common.fav') }
        }

        if (filterUpdates[key]) {
          setFilter({ ...filter, ...filterUpdates[key] })
        }
      }

      if (url === '/auth') {
        setLocationPath(pathname)
        setModalLogin(true)
      } else {
        history(url)
      }
    }, 100)
  }

  renderAction = (is_show_promo, currentCategory) => {
    const { ListItem } = this.props.utils

    if (!getAppConfig().leftMenu.action || is_show_promo !== 1) {
      return null
    }

    return (
      <TouchableOpacity key="Bar" onPress={() => this.openScreen('/ah')} style={styles.itemContainer} activeOpacity={0.6} underlayColor="#f5f5f5">
        <View style={{ width: ICON_WIDTH }}>
          <SvgIcons.Bar utils={this.props.utils} />
        </View>
        <ListItem.Content>
          <ListItem.Title>{currentCategory.name_menu_action}</ListItem.Title>
        </ListItem.Content>
      </TouchableOpacity>
    )
  }

  renderBron = () => {
    const { t, ListItem } = this.props.utils

    if (!getAppConfig().leftMenu.bron) {
      return null
    }

    return (
      <TouchableOpacity key={'Bron'} onPress={() => this.openScreen('/mb')} style={styles.itemContainer} activeOpacity={0.6} underlayColor="#f5f5f5">
        <View style={{ width: ICON_WIDTH }}>
          <SvgIcons.Mybron utils={this.props.utils} />
        </View>
        <ListItem.Content>
          <ListItem.Title>{t('components.common.leftmenu.mybron')}</ListItem.Title>
        </ListItem.Content>
      </TouchableOpacity>
    )
  }

  renderMenuItem = (key, icon, onPress, title, style) => {
    const { ListItem } = this.props.utils

    return (
      <TouchableOpacity key={key} onPress={onPress} style={styles.itemContainer} activeOpacity={0.6} underlayColor="#f5f5f5">
        <View style={{ width: ICON_WIDTH }}>{icon}</View>
        <ListItem.Content>
          <ListItem.Title>{title}</ListItem.Title>
        </ListItem.Content>
      </TouchableOpacity>
    )
  }

  render() {
    const { user, currentCategory, filter, referral, setModalLogin } = this.props
    const { t, ListItem, Divider, isMobile } = this.props.utils
    const { referral: stateReferral } = this.state

    const categoryName = currentCategory?.name?.trim() || ''
    const { is_show_promo, is_show_rating } = currentCategory

    const selectedCountry = filter.selectedCountry === '-1' ? currentCategory.default_id_filter_root : filter.selectedCountry

    const selectedCountryName = filter.selectedCountry === '-1' ? currentCategory.default_title_filter_root : filter.selectedCountryName

    return (
      <View style={{ width: '100%' }}>
        {this.renderTop()}
        <ScrollView>
          {this.renderMenuItem('Main', <SvgIcons.Main utils={this.props.utils} />, () => this.openScreen('/s'), <Text style={styles.categoryName}>{categoryName}</Text>)}

          {this.renderMenuItem(
            'Chat',
            <SvgIcons.Chat utils={this.props.utils} />,
            () => this.openScreen(`/y/${selectedCountry}`, 'selectedCountry', selectedCountry, selectedCountryName),
            currentCategory.name_menu_chat
          )}

          {user?.is_sotr === 1 &&
            (() => {
              const selectedAgent = filter.selectedAgent === '-1' ? currentCategory.default_id_profi : filter.selectedAgent
              const selectedAgentName = filter.selectedAgent === '-1' ? currentCategory.default_title_profi : filter.selectedAgentName
              const url = `/a/${selectedAgent}${filter.selectedCountry !== '-1' ? `/y/${filter.selectedCountry}` : ''}`

              return this.renderMenuItem(
                'Profi',
                <SvgIcons.Profi utils={this.props.utils} />,
                () => this.openScreen(url, 'selectedAgent', selectedAgent, selectedAgentName),
                t('components.common.leftmenu.profi')
              )
            })()}

          {is_show_rating === 1 && this.renderMenuItem('Star', <SvgIcons.Star utils={this.props.utils} />, () => this.openScreen('/r'), currentCategory.name_menu_rating)}

          {this.renderAction(is_show_promo, currentCategory)}
          {this.renderBron()}

          {this.renderMenuItem('News', <SvgIcons.News utils={this.props.utils} />, () => this.openScreen('/l'), t('components.common.leftmenu.news'))}

          <Divider />

          {this.renderMenuItem('Money', <SvgIcons.Money utils={this.props.utils} />, () => this.openScreen('/bn'), t('components.common.leftmenu.bonus'), { left: -5 })}

          {this.renderMenuItem('Favorite', <SvgIcons.Favorite utils={this.props.utils} />, () => this.openScreen('/fav', 'selectedFav'), t('components.common.leftmenu.notes'))}

          {this.renderMenuItem('Share', <SvgIcons.Share utils={this.props.utils} />, this.ShareURL, t('components.common.leftmenu.share'), { left: -8 })}

          {this.renderMenuItem('Settings', <SvgIcons.Settings utils={this.props.utils} />, () => this.openScreen('/u'), t('components.common.leftmenu.settings'), { left: -8 })}

          {isEmpty(user) &&
            this.renderMenuItem(
              'SignIn',
              <SvgIcons.SignIn utils={this.props.utils} />,
              () => {
                this.closeDrawer()
                setModalLogin(true)
              },
              t('components.common.leftmenu.login')
            )}

          {this.renderMenuItem(
            'Help_1',
            <SvgIcons.Help utils={this.props.utils} />,
            () => {
              const url = user?.is_sotr === 1 ? 'https://stuzon.com/unlock/169?password=gserm324qn' : 'https://stuzon.com/pom_link1.php?idn=169&id=1412'
              Linking.openURL(url, '_bank')
            },
            t('components.common.leftmenu.help')
          )}

          {Platform.OS === 'web' &&
            isMobile &&
            (() => {
              const cat = getSelectCategory()
              const mobileUrl = `${getAppConstants().url_main}/?c=${stateReferral}&cat=${cat.id || '1'}`

              return (
                <TouchableOpacity key="Phone" onPress={() => Linking.openURL(mobileUrl, '_bank')} style={styles.itemContainer}>
                  <View style={{ width: ICON_WIDTH }}>
                    <SvgIcons.Phone utils={this.props.utils} />
                  </View>
                  <ListItem.Content>
                    <ListItem.Title style={styles.mobileLink}>{t('components.common.leftmenu.mobile')}</ListItem.Title>
                  </ListItem.Content>
                </TouchableOpacity>
              )
            })()}
        </ScrollView>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: 'row',
    padding: 10
  },
  topContainer: {
    backgroundColor: COLOR_TOP,
    flexDirection: 'row'
  },
  avatarWrapper: {
    width: 90
  },
  avatar: {
    left: 10,
    width: AVATAR_SIZE,
    borderRadius: 20
  },
  userInfoContainer: {
    flex: 5
  },
  userName: {
    fontWeight: 'bold',
    color: theme.text
  },
  spacer: {
    height: 5
  },
  userLogin: {
    fontSize: 15,
    color: theme.text
  },
  unauthorizedContent: {
    flex: 1,
    flexDirection: 'row',
    paddingLeft: 10
  },
  logoContainer: {
    paddingTop: Platform.OS === 'web' ? -10 : 20,
    paddingLeft: 20,
    justifyContent: 'center'
  },
  logo: {
    width: LOGO_DIMENSIONS.width / 1.8,
    height: LOGO_DIMENSIONS.height,
    alignSelf: 'center'
  },
  loginPrompt: {
    position: 'absolute',
    justifyContent: 'center',
    // paddingTop: Platform.OS === 'web' ? 0 : isIphoneX() ? 30 : 10,
    bottom: 10,
    width: 70
  },
  loginText: {
    alignSelf: 'center',
    fontSize: 14,
    fontWeight: 'bold',
    color: 'blue'
  },
  categoryName: {
    textTransform: 'capitalize',
    fontWeight: 'bold'
  },
  mobileLink: {
    color: 'blue'
  }
})

export default LeftMenu
