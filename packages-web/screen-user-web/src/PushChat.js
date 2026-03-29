import uniqBy from 'lodash/uniqBy'
import { PureComponent } from 'react'
import { ActivityIndicator, Appearance, ScrollView, View } from 'react-native'

class PushChat extends PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      pushData: [],
      visible: false,
      snackbarText: '',
      isLoading: true
    }

    this.onChangePush = async (item, index, val) => {
      const { chatServiceGet, t } = this.props.utils

      const { user, setCountries, expoToken, fcmToken } = this.props
      const { pushData } = this.state
      let status = val ? 1 : 0
      let id_post = item.id
      let id_hotel = -1
      let id_hobby = -1
      let newCountries = JSON.parse(JSON.stringify(pushData))

      if (item.tip_chat === 0) {
        newCountries[index].enabled = status
        id_post = item.id_post
        id_hotel = item.id_otel ? item.id_otel : -1
        id_hobby = item.id_interes ? item.id_interes : -1
      } else {
        newCountries[index].enabled = status
      }

      chatServiceGet.fetchSetStatusPush(fcmToken, expoToken, user.device.token, user.android_id_install, id_post, id_hotel, id_hobby, status, 0).then(result => {
        if (result.code === 0) {
          this.setState({ pushData: newCountries }, () => {
            setCountries(newCountries)

            toast.show(status === 1 ? t('screens.profile.pushchat.pushOn') : t('screens.profile.pushchat.pushOff'), {
              type: 'warning',
              placement: 'top',
              animationType: 'zoom-in',
              onPress: id => {
                toast.hide(id)
              }
            })
          })
        }
      })
    }

    this.initData = async () => {
      const { chatServiceGet } = this.props.utils

      const { countries, user } = this.props
      let countriesNew = []

      if (countries.length > 0) {
        const vCn = JSON.parse(JSON.stringify(countries))
        const result = await chatServiceGet.getListNotify(user.device.token, user.android_id_install)

        if (result.length > 0) {
          for (let i = 0; i < result.length; i++) {
            if (result[i].tip_chat === 0 && result[i].id_interes && result[i].id_post && result[i].title_hobby) {
              let item = result[i]
              item.title = result[i].title_country + ' -> ' + result[i].title_hobby
              countriesNew.push(item)
            } else if (result[i].tip_chat === 0 && result[i].id_otel && result[i].id_post && result[i].title_otel) {
              let item = result[i]
              item.title = result[i].title_country + ' -> ' + result[i].title_otel
              countriesNew.push(item)
            } else if (result[i].tip_chat === 0 && result[i].id_post) {
              const cn = vCn.filter(c => Number(c.id) === Number(result[i].id_post))[0]
              const newCn = Object.assign({}, cn)

              if (cn) {
                newCn.enabled = 1

                countriesNew.push(newCn)
              }
            }
          }
        }

        this.setState({ pushData: uniqBy(countriesNew.concat(vCn), 'id'), isLoading: false })
      } else {
        this.setState({ isLoading: false })
      }
    }

    this.onDismissSnackBar = () => {
      this.setState({ visible: false })
    }
  }

  componentDidMount() {
    this.initData()
  }

  render() {
    const { theme, t, ListItem, Switch, Snackbar } = this.props.utils

    const { history } = this.props
    const { pushData, visible, snackbarText, isLoading } = this.state

    let isDarkMode = Appearance.getColorScheme() === 'dark'
    let bg = isDarkMode ? theme.dark.colors.background : theme.light.colors.background
    let txt = isDarkMode ? theme.dark.colors.text : theme.light.colors.text

    if (isLoading) {
      return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size={'large'} />
        </View>
      )
    }

    return (
      <>
        <ScrollView style={{ flex: 1, backgroundColor: bg }}>
          {pushData.map((el, i) => (
            <ListItem key={el.id.toString()} bottomDivider containerStyle={{ backgroundColor: bg }}>
              <ListItem.Content>
                <ListItem.Title style={{ color: txt }}>{el.title}</ListItem.Title>
              </ListItem.Content>
              <Switch
                value={el.enabled === 1}
                onValueChange={val => {
                  this.onChangePush(el, i, val)
                }}
              />
            </ListItem>
          ))}
          <View style={{ height: 100 }} />
        </ScrollView>
      </>
    )
  }
}

export default PushChat
