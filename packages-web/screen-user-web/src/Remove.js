// import { Mobile } from 'app-core'
// import { AppHeaderWithBack } from 'app-header'
// import { chatServiceGet } from 'app-services'
// import { filterAction, filterSelector, userAction, userSelector } from 'app-store'
// import { withRouter } from 'app-utils'
// import { t, theme } from 'app-utils'
import isEmpty from 'lodash/isEmpty'
import { PureComponent } from 'react'
import { Appearance, Platform, Text, View } from 'react-native'
// import { Button, Card, Input, ListItem } from 'react-native-elements'
// import { connect } from 'react-redux'

class Remove extends PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      sendCode: false,
      code: ''
    }

    this.sendCodeRequest = (code = '') => {
      const { chatServiceGet } = this.props.utils
      const { user } = this.props

      chatServiceGet.sendCodeRemove(user.device.token, user.android_id_install, code).then(result => {
        if (code === '') {
          this.setState({ sendCode: true })
        } else {
          this.signOutUser()
        }
      })
    }

    this.alertRemove = () => {
      const { t, Alert } = this.props.utils

      Alert.alert(t('common.attention'), t('screens.profilescreen.removeQuestion'), [
        { text: t('common.cancel'), style: 'destructive' },
        {
          text: t('common.yes'),
          onPress: async () => {
            this.sendCodeRequest()
          }
        }
      ])
    }

    this.signOutUser = async history => {
      const { firebase, appApi, dispatch } = this.props.utils
      const { logOut, currentCategory, user, setCategories, setAllCountries, setAllAgent, setUser, setAgentTowns, changeOfflineMode, changeMyRatingLocal, changeMyRatingServer } = this.props
      let data = {}

      dispatch(appApi.endpoints.getUserCross.initiate(true)).then(() => {
        this.setState({ loadingExit: true })

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

        this.setState({ isOpenDialog: false }, () => {
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
      })
    }

    this.signOutUser = async () => {
      const { mobile } = this.props.utils

      const { logOut, currentCategory, user, history } = this.props
      let data = {}

      this.setState({ loadingExit: true })

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

      if (Platform.OS !== 'web' && !isEmpty(user.method)) {
        if (user.method === 'android') {
          let GoogleSignin = mobile.initGoogleAuth()

          try {
            GoogleSignin.signOut().then(() => {
              logOut(data)
              history('/')
            })
          } catch (error) {
            console.error('GoogleSignin', error)
          }
        } else if (user.method === 'apple') {
          const appleAuth = mobile.initAppleAuth()

          appleAuth.performRequest({ requestedOperation: 3 }).then(() => {
            logOut(data)
            history('/')
          })
        } else if (user.method === 'email') {
          logOut(data)
          history('/')
        }
      } else {
        this.signOutUser(history)
      }
    }
  }

  renderCode = () => {
    const { theme, t, Input, Button } = this.props.utils
    const { user, code } = this.props

    let isDarkMode = Appearance.getColorScheme() === 'dark'
    let bg = isDarkMode ? theme.dark.colors.background : theme.light.colors.background
    let txt = isDarkMode ? theme.dark.colors.text : theme.light.colors.text

    return (
      <View style={{ padding: 10, backgroundColor: bg }}>
        <Text style={{ color: '#000' }}>{t('screens.profilescreen.removeTitle') + user.login.substring(user.login.indexOf('@'))}</Text>
        <Input
          placeholder={t('screens.profilescreen.removePlaceholder')}
          leftIcon={{ name: 'lock', color: txt }}
          onChangeText={value => this.setState({ code: value })}
          containerStyle={{ paddingTop: 20, color: txt }}
        />
        <Text />
        <Text />
        <Button title={t('common.remove')} type="outline" titleStyle={{ color: 'red' }} onPress={() => this.sendCodeRequest(code)} />
      </View>
    )
  }

  render() {
    const { theme, ListItem, Card, t } = this.props.utils

    const { history } = this.props
    const { sendCode } = this.state

    let isDarkMode = Appearance.getColorScheme() === 'dark'
    let bg = isDarkMode ? theme.dark.colors.background : theme.light.colors.background
    let txt = isDarkMode ? theme.dark.colors.text : theme.light.colors.text

    return (
      <View style={{ flex: 1, backgroundColor: bg }}>
        <Card containerStyle={{ backgroundColor: bg }}>
          {!sendCode && (
            <ListItem key={'1'} onPress={() => this.alertRemove()} containerStyle={{ backgroundColor: bg }}>
              <ListItem.Content>
                <ListItem.Title style={{ color: 'red' }}>{t('screens.profilescreen.removeNow')}</ListItem.Title>
              </ListItem.Content>
            </ListItem>
          )}
          {sendCode && this.renderCode()}
        </Card>
      </View>
    )
  }
}

export default Remove
