import isEmpty from 'lodash/isEmpty'
import { PureComponent } from 'react'
import { Appearance, Platform, Text, View } from 'react-native'

const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
const { getAppConstants } = GLOBAL_OBJ.onlinetur.storage

class Business extends PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      phoneViewLoading: false,
      noTourLoading: false,
      phoneView: false,
      noTour: false,
      passwordVerify: false,
      note: '',
      noteVerify: '',
      landing: '',
      landingVerify: ''
    }

    this.initData = () => {
      const { user } = this.props

      if (!isEmpty(user)) {
        this.setState({
          passwordVerify: user.is_sotr === 1,
          note: user.note_for_user,
          phoneView: !!user.show_phone,
          noTour: !!user.notour,
          noteVerify: !!user.note_for_user,
          landing: user && user.landing && user.landing !== '' ? user.landing : '',
          landingVerify: user && user.landing && user.landing !== ''
        })
      } else {
        this.setState({
          phone: '',
          note: '',
          passwordVerify: false,
          landing: '',
          landingVerify: ''
        })
      }
    }

    this.onPhoneView = event => {
      const { chatServicePost } = this.props.utils

      const { user, setUser } = this.props
      const { noTour, phoneView, note, landing } = this.state

      this.setState({ phoneViewLoading: true }, async () => {
        let body = new FormData()
        body.append('token', !isEmpty(user.device) ? user.device.token : '')
        body.append('android_id_install', user.android_id_install)
        body.append('show_phone', !phoneView ? 1 : 0)
        body.append('notour', noTour ? 1 : 0)
        body.append('note_for_user', note)
        body.append('landing', landing)
        const result = await chatServicePost.fetchPhoneData(body)

        if (result.code === 0) {
          this.setState({ phoneView: !phoneView, phoneViewLoading: false }, () => {
            let obj = Object.assign({}, user)
            obj.show_phone = !phoneView ? 1 : 0
            setUser(obj)
          })
        }
      })
    }

    this.onNoTour = event => {
      const { chatServicePost } = this.props.utils

      const { user, setUser } = this.props
      const { noTour, phoneView, note } = this.state

      this.setState({ noTourLoading: true }, async () => {
        let body = new FormData()
        body.append('token', !isEmpty(user.device) ? user.device.token : '')
        body.append('android_id_install', user.android_id_install)
        body.append('notour', !noTour ? 1 : 0)
        body.append('show_phone', phoneView ? 1 : 0)
        body.append('note_for_user', note)
        const result = await chatServicePost.fetchPhoneData(body)

        if (result.code === 0) {
          this.setState({ noTour: !noTour, noTourLoading: false }, () => {
            let obj = Object.assign({}, user)
            obj.notour = !noTour ? 1 : 0
            setUser(obj)
          })
        }
      })
    }

    this.handlePhoneVerify = async (request, result) => {
      const { chatServiceGet } = this.props.utils

      const { user, setUser } = this.props
      const { note, landing } = this.state

      let url
      let mobile = 0
      let newUser

      if (request === 'note' && result) {
        // eslint-disable-next-line max-len
        url = `${getAppConstants().url_main}/a/api/chat_v3/edit_phone.php?token=${user.device.token}&android_id_install=${user.android_id_install}&mobile=${mobile}&note_for_user=${encodeURI(note)}`
      } else if (request === 'note' && !result) {
        url = `${getAppConstants().url_main}/a/api/chat_v3/edit_phone.php?token=${user.device.token}&android_id_install=${user.android_id_install}&mobile=${mobile}&note_for_user=`
      } else if (request === 'landing' && result) {
        url = `${getAppConstants().url_main}/a/api/chat_v3/edit_phone.php?token=${user.device.token}&android_id_install=${user.android_id_install}&mobile=${mobile}&note_for_user=${encodeURI(
          note
        )}&landing=${landing}`
      } else if (request === 'landing' && !result) {
        url = `${getAppConstants().url_main}/a/api/chat_v3/edit_phone.php?token=${user.device.token}&android_id_install=${user.android_id_install}&mobile=${mobile}&note_for_user=${encodeURI(
          note
        )}&landing=`
      }

      if (request === 'note' && result) {
        await chatServiceGet.fetch(url)
        newUser = Object.assign({}, user)
        newUser.note_for_user = note
        setUser(newUser)
        this.setState({ noteVerify: true })
      } else if (request === 'note' && !result) {
        await chatServiceGet.fetch(url)
        newUser = Object.assign({}, user)
        newUser.note_for_user = ''
        setUser(newUser)
        this.setState({ noteVerify: false, note: '' })
      } else if (request === 'landing' && result) {
        await chatServiceGet.fetch(url)
        newUser = Object.assign({}, user)
        newUser.landing = landing
        setUser(newUser)
        this.setState({ landingVerify: true })
      } else if (request === 'landing' && !result) {
        await chatServiceGet.fetch(url)
        newUser = Object.assign({}, user)
        newUser.landing = ''
        setUser(newUser)
        this.setState({ landingVerify: false })
      }
    }
  }

  componentDidMount() {
    this.initData()
  }

  render() {
    const { theme, t, Card, CheckBox, ListItem, Switch, Input } = this.props.utils

    const { history } = this.props
    const { phoneViewLoading, noTourLoading, phoneView, noTour, passwordVerify, note, noteVerify, landing, landingVerify } = this.state

    let isDarkMode = Appearance.getColorScheme() === 'dark'
    let bg = isDarkMode ? theme.dark.colors.background : theme.light.colors.background
    let txt = isDarkMode ? theme.dark.colors.text : theme.light.colors.text
    let plc = isDarkMode ? theme.dark.colors.textInactive : theme.light.colors.textInactive

    return (
      <View style={{ flex: 1, backgroundColor: bg }}>
        <Card containerStyle={{ backgroundColor: bg }}>
          <View style={{ borderColor: 'transparent', marginLeft: 5 }}>
            <CheckBox
              containerStyle={{ width: '100%', backgroundColor: 'transparent', borderWidth: 0, padding: 0 }}
              title={t('screens.profile.other.view')}
              checked={phoneView}
              onPress={() => this.onPhoneView()}
              textStyle={{ color: txt }}
            />
          </View>
          <Text />
          <View style={{ borderColor: 'transparent', marginLeft: 5 }}>
            <CheckBox
              containerStyle={{ width: '100%', backgroundColor: 'transparent', borderWidth: 0, padding: 0 }}
              title={t('screens.profile.other.order')}
              checked={noTour}
              onPress={() => this.onNoTour()}
              textStyle={{ color: txt }}
            />
          </View>
        </Card>
        <View style={{ paddingTop: 20, paddingLeft: 10 }}>
          <Text numberOfLines={2} style={{ fontSize: 16, paddingLeft: 10, paddingTop: 2, color: txt }}>
            {t('screens.profile.other.text')}
          </Text>
        </View>
        <Card containerStyle={{ backgroundColor: bg }}>
          <ListItem key={'1'} containerStyle={{ backgroundColor: bg, margin: 0, padding: 0 }}>
            <ListItem.Content style={{ margin: 0, padding: 0 }}>
              <Input
                placeholder={t('screens.profile.other.mess')}
                placeholderTextColor={plc}
                value={note}
                onChangeText={text => {
                  this.setState({ note: text })
                }}
                style={{ fontSize: 17, height: 40, padding: 0, backgroundColor: 'transparent', color: txt }}
                inputContainerStyle={{
                  height: 40,
                  padding: 0,
                  backgroundColor: 'transparent',
                  borderBottomWidth: 1,
                  borderBottomColor: '#999999'
                }}
                containerStyle={{ height: 40, padding: 0, backgroundColor: 'transparent' }}
                inputStyle={{ height: 40, padding: 0, backgroundColor: 'transparent' }}
              />
            </ListItem.Content>
            <Switch
              value={noteVerify}
              onValueChange={() => {
                this.handlePhoneVerify('note', !noteVerify).then()
              }}
            />
          </ListItem>
        </Card>
        <View style={{ paddingTop: 20, paddingLeft: 10 }}>
          <Text numberOfLines={2} style={{ fontSize: 16, paddingLeft: 10, paddingTop: 2, color: txt }}>
            {t('screens.profilescreen.landing')}
          </Text>
        </View>
        <Card containerStyle={{ backgroundColor: bg }}>
          <ListItem key={'2'} containerStyle={{ backgroundColor: bg, margin: 0, padding: 0 }}>
            <ListItem.Content style={{ margin: 0, padding: 0 }}>
              <Input
                placeholder={'https://my-landing.ru'}
                placeholderTextColor={plc}
                value={landing}
                onChangeText={text => {
                  this.setState({ landing: text })
                }}
                style={{ fontSize: 17, height: 40, padding: 0, backgroundColor: 'transparent', color: txt }}
                inputContainerStyle={{
                  height: 40,
                  padding: 0,
                  backgroundColor: 'transparent',
                  borderBottomWidth: 1,
                  borderBottomColor: '#999999'
                }}
                containerStyle={{ height: 40, padding: 0, backgroundColor: 'transparent' }}
                inputStyle={{ height: 40, padding: 0, backgroundColor: 'transparent' }}
              />
            </ListItem.Content>
            <Switch
              value={landingVerify}
              onValueChange={() => {
                this.handlePhoneVerify('landing', !landingVerify).then()
              }}
            />
          </ListItem>
        </Card>
      </View>
    )
  }
}

export default Business
