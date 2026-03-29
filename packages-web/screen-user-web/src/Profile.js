/**
 * -----------------------------------------------------------------------
 *  Author      : Alexey Zolotarеv
 *  E-mail      : azesm@me.com
 * -----------------------------------------------------------------------
 */

import isEmpty from 'lodash/isEmpty'
import { PureComponent } from 'react'
import { Appearance, Dimensions, ImageBackground, ScrollView, Text, View } from 'react-native'

import user_mb from '../images/user_bg.jpg'
import Agent from './agent'
import Business from './Business'
import Langs from './Langs'
import PushChat from './PushChat'
import PushNews from './PushNews'
import PushProfi from './PushProfi'
import Remove from './Remove'

const { width, height } = Dimensions.get('window')

class Profile extends PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      isLoading: true,
      code: '',
      phone: '',
      note: '',
      phoneView: true,
      text: '',
      passwordVerify: false,
      passwordIsLoading: false,
      passwordError: false,
      agentDone: false,
      modalVisibleWeb: false,
      url: '',
      title: '',
      phoneVerify: false,
      noteVerify: false,
      noTour: true,
      phoneViewLoading: false,
      noTourLoading: false,
      password: '',
      isLoadingIFrame: false,
      isOpenDialog: false,
      townAgent: null,
      towns: [],
      pushData: [],
      radioValue: '2',
      auth: null,
      isLoggedIn: false,
      isPost: false,
      openAlert: false,
      profileScreen: true
    }

    this.initData = async () => {
      const { functions } = this.props.utils
      const { user, agentTowns, urlPost, userVK, isPostVK } = this.props

      if (!isEmpty(user)) {
        this.setState({
          phone: !isEmpty(user.phone) ? user.phone.replace('+7', '') : '',
          note: user.note_for_user,
          passwordVerify: user.is_sotr === 1,
          phoneVerify: !!user.phone,
          noteVerify: !!user.note_for_user,
          password: user.is_sotr === 1 ? '340955' : '',
          towns: functions.convertTowns(agentTowns),
          radioValue: urlPost,
          isLoggedIn: !isEmpty(userVK),
          isPost: isPostVK,
          noTour: !!user.notour,
          phoneView: !!user.show_phone,
          townAgent: user.my_city
        })
      } else {
        this.setState({
          phone: '',
          note: '',
          passwordVerify: false
        })
      }
    }

    this.setThemes = () => {
      const { countries } = this.props
      this.setState({ pushData: countries })
    }

    this.getParams = () => {
      const { t } = this.props.utils
      const { setHeaderParams, screen } = this.props

      let params = {}

      if (screen === 'main') {
        params.screen = 'profile'
        params.title = t('screens.profilescreen.title')
        params.subtitle = t('screens.profilescreen.subtitle')
      } else if (screen === 'pushchat') {
        params.screen = 'pushchat'
        params.title = t('screens.profilescreen.push')
        params.subtitle = t('screens.profilescreen.pushchat')
      } else if (screen === 'agent') {
        params.screen = 'agent'
        params.title = t('screens.profilescreen.agent')
        params.subtitle = t('screens.profilescreen.agentText')
      } else if (screen === 'business') {
        params.screen = 'business'
        params.title = t('screens.profilescreen.fun')
        params.subtitle = t('screens.profilescreen.funText')
      } else if (screen === 'pushnews') {
        params.screen = 'pushnews'
        params.title = t('screens.profilescreen.push')
        params.subtitle = t('screens.profilescreen.pushnews')
      } else if (screen === 'pushagent') {
        params.screen = 'pushagent'
        params.title = t('screens.profilescreen.push')
        params.subtitle = t('screens.profilescreen.pushprofi')
      } else if (screen === 'langs') {
        params.screen = 'langs'
        params.title = t('screens.profilescreen.lang')
        params.subtitle = t('screens.profilescreen.langText')
      } else if (screen === 'remove') {
        params.screen = 'remove'
        params.title = t('screens.profilescreen.remove')
        params.subtitle = t('screens.profilescreen.removeText')
      }

      setHeaderParams(params)
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    this.getParams()
  }

  async componentDidMount() {
    this.getParams()
    await this.initData()
    this.setThemes()
  }

  renderListItem = (history, navigation, params) => {
    const { ListItem, theme, t, MainHeader, ActionSheetProvider } = this.props.utils
    const { user, expoRouter } = this.props

    let isDarkMode = Appearance.getColorScheme() === 'dark'
    let bg = isDarkMode ? theme.dark.colors.background : theme.light.colors.background
    let txt = isDarkMode ? theme.dark.colors.text : theme.light.colors.text
    const title = !isEmpty(user) && user.is_sotr === 1 ? 'Отключить ' : 'Включить '

    return (
      <ActionSheetProvider>
        <ScrollView style={{}}>
          <View style={{ width: '100%' }}>
            {/*<View style={{ flexDirection: 'row', paddingTop: 10, paddingLeft: 10 }}>*/}
            {/*  <Text style={{ fontWeight: 'bold', fontSize: 16, paddingLeft: 10, paddingTop: 2, color: txt }}>{t('screens.profilescreen.user')}</Text>*/}
            {/*</View>*/}
            <MainHeader {...this.props} screen={'profile'} profile={true} />
          </View>
          <View style={{ width: '100%' }}>
            <View style={{ height: 45, flexDirection: 'row', paddingTop: 10, paddingLeft: 10 }}>
              <Text style={{ fontWeight: 'bold', fontSize: 16, paddingLeft: 10, paddingTop: 2, color: txt }}>{t('screens.profilescreen.other')}</Text>
            </View>
          </View>
          <View>
            <ListItem
              key={'100'}
              onPress={() => {
                expoRouter.push('/u/a')
              }}
              activeOpacity={0.6}
              underlayColor={'#f5f5f5'}
              containerStyle={{ backgroundColor: 'transparent' }}>
              <ListItem.Content>
                <ListItem.Title style={{ color: txt }}>{title + t('screens.profilescreen.agent')}</ListItem.Title>
              </ListItem.Content>
              <ListItem.Chevron color={txt} />
            </ListItem>
            {/*<ListItem*/}
            {/*  key={'101'}*/}
            {/*  onPress={() => {*/}
            {/*    navigation.navigate('Bonus')*/}
            {/*  }}*/}
            {/*  activeOpacity={0.6}*/}
            {/*  underlayColor={'#f5f5f5'}*/}
            {/*  containerStyle={{  }}>*/}
            {/*  <ListItem.Content>*/}
            {/*    <ListItem.Title style={{ color: txt }}>{t('screens.profilescreen.tg')}</ListItem.Title>*/}
            {/*  </ListItem.Content>*/}
            {/*  <ListItem.Chevron color={txt} />*/}
            {/*</ListItem>*/}
            {user.is_sotr === 1 ? (
              <ListItem
                key={'102'}
                onPress={() => {
                  expoRouter.push('/u/b')
                }}
                activeOpacity={0.6}
                underlayColor={'#f5f5f5'}
                containerStyle={{ backgroundColor: 'transparent' }}>
                <ListItem.Content>
                  <ListItem.Title style={{ color: txt }}>{t('screens.profilescreen.fun')}</ListItem.Title>
                </ListItem.Content>
                <ListItem.Chevron color={txt} />
              </ListItem>
            ) : null}
            <ListItem
              key={'103'}
              onPress={() => {
                expoRouter.push('/u/pn')
              }}
              activeOpacity={0.6}
              underlayColor={'#f5f5f5'}
              containerStyle={{ backgroundColor: 'transparent' }}>
              <ListItem.Content>
                <ListItem.Title style={{ color: txt }}>{t('screens.profilescreen.pushnews')}</ListItem.Title>
              </ListItem.Content>
              <ListItem.Chevron color={txt} />
            </ListItem>
            <ListItem
              key={'104'}
              onPress={() => {
                expoRouter.push('/u/pc')
              }}
              activeOpacity={0.6}
              underlayColor={'#f5f5f5'}
              containerStyle={{ backgroundColor: 'transparent' }}>
              <ListItem.Content>
                <ListItem.Title style={{ color: txt }}>{t('screens.profilescreen.pushchat')}</ListItem.Title>
              </ListItem.Content>
              <ListItem.Chevron color={txt} />
            </ListItem>
            {!isEmpty(user) && user.is_sotr === 1 ? (
              <ListItem
                key={'105'}
                onPress={() => {
                  expoRouter.push('/u/pa')
                }}
                activeOpacity={0.6}
                underlayColor={'#f5f5f5'}
                containerStyle={{ backgroundColor: 'transparent' }}>
                <ListItem.Content>
                  <ListItem.Title style={{ color: txt }}>{t('screens.profilescreen.pushprofi')}</ListItem.Title>
                </ListItem.Content>
                <ListItem.Chevron color={txt} />
              </ListItem>
            ) : null}
            {/*{user.is_sotr === 1 ? (*/}
            {/*  <ListItem*/}
            {/*    key={'106'}*/}
            {/*    onPress={() => {*/}
            {/*      expoRouter.push('/u/vk')*/}
            {/*    }}*/}
            {/*    containerStyle={{  }}>*/}
            {/*    <ListItem.Content>*/}
            {/*      <ListItem.Title style={{ color: txt }}>{t('screens.profilescreen.social')}</ListItem.Title>*/}
            {/*    </ListItem.Content>*/}
            {/*    <ListItem.Chevron color={txt} />*/}
            {/*  </ListItem>*/}
            {/*) : (*/}
            {/*  <></>*/}
            {/*)}*/}
            {/*<ListItem*/}
            {/*  key={'107'}*/}
            {/*  onPress={() => {*/}
            {/*    expoRouter.push('/u/l', { visibleModalLangInterface: true })*/}
            {/*  }}*/}
            {/*  activeOpacity={0.6}*/}
            {/*  underlayColor={'#f5f5f5'}*/}
            {/*  containerStyle={{ backgroundColor: 'transparent' }}>*/}
            {/*  <ListItem.Content>*/}
            {/*    <ListItem.Title>{t('screens.profilescreen.langItem')}</ListItem.Title>*/}
            {/*  </ListItem.Content>*/}
            {/*  <ListItem.Chevron color={txt} />*/}
            {/*</ListItem>*/}
            <ListItem
              key={'109'}
              onPress={() => {
                expoRouter.push('/u/l')
              }}
              activeOpacity={0.6}
              underlayColor={'#f5f5f5'}
              containerStyle={{ backgroundColor: 'transparent' }}>
              <ListItem.Content>
                <ListItem.Title style={{ color: txt }}>{t('screens.profilescreen.langInt')}</ListItem.Title>
              </ListItem.Content>
              <ListItem.Chevron color={txt} />
            </ListItem>
            <ListItem
              key={'108'}
              onPress={() => {
                expoRouter.push('/u/r')
              }}
              activeOpacity={0.6}
              underlayColor={'#f5f5f5'}
              containerStyle={{ backgroundColor: 'transparent' }}>
              <ListItem.Content>
                <ListItem.Title style={{ color: 'red' }}>{t('screens.profilescreen.remove')}</ListItem.Title>
              </ListItem.Content>
              <ListItem.Chevron color={txt} />
            </ListItem>
          </View>
          <View style={{ height: 100 }} />
        </ScrollView>
      </ActionSheetProvider>
    )
  }

  render() {
    const { t, theme, isMobile } = this.props.utils
    const { history, navigation, screen } = this.props

    let isDarkMode = Appearance.getColorScheme() === 'dark'
    let bg = isDarkMode ? theme.dark.colors.background : theme.light.colors.background
    let txt = isDarkMode ? theme.dark.colors.text : theme.light.colors.text

    return (
      <ImageBackground source={user_mb} resizeMode={'cover'} style={{ width: '100%', height: '100%' }}>
        <View style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0.6, backgroundColor: '#fff' }} />
        <View style={{ width: isMobile ? width : width / 2, height: '100%', alignSelf: 'center', backgroundColor: 'rgba(255,255,255,0.6)' }}>
          {screen === 'main' && <View style={{ flex: 1 }}>{this.renderListItem(history, navigation)}</View>}
          {screen === 'pushchat' && (
            <View style={{ flex: 1 }}>
              <PushChat {...this.props} />
            </View>
          )}
          {screen === 'agent' && (
            <View style={{ flex: 1 }}>
              <Agent {...this.props} />
            </View>
          )}
          {screen === 'business' && (
            <View style={{ flex: 1 }}>
              <Business {...this.props} />
            </View>
          )}
          {screen === 'pushnews' && (
            <View style={{ flex: 1 }}>
              <PushNews {...this.props} />
            </View>
          )}
          {screen === 'pushagent' && (
            <View style={{ flex: 1 }}>
              <PushProfi {...this.props} />
            </View>
          )}
          {screen === 'langs' && (
            <View style={{ flex: 1 }}>
              <Langs {...this.props} />
            </View>
          )}
          {screen === 'remove' && (
            <View style={{ flex: 1 }}>
              <Remove {...this.props} />
            </View>
          )}
        </View>
      </ImageBackground>
    )
  }
}

export default Profile
