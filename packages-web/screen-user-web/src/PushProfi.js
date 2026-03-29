// import { Loading } from 'app-common'
// import { AppHeaderWithBack } from 'app-header'
// import { chatServiceGet } from 'app-services'
// import { chatAction, countriesSelector, userSelector } from 'app-store'
// import { t, theme } from 'app-utils'
import { PureComponent } from 'react'
import { ActivityIndicator, Appearance, ScrollView, Text, View } from 'react-native'
import uniqBy from 'lodash/uniqBy'
// import { ListItem, Switch } from 'react-native-elements'
// import { Snackbar } from 'react-native-paper'
// import { connect } from 'react-redux'

class PushProfi extends PureComponent {
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

      const { user, agent, setAgent, expoToken, fcmToken } = this.props
      const { pushData } = this.state

      let newAgent = Object.assign([], pushData)
      let status = val ? 1 : 0
      let id_post = -1
      let id_hotel = -1
      let id_hobby = newAgent[index].id

      if (item.tip_chat === 1) {
        newAgent[index].enabled = status

        id_post = item.id_post ? item.id_post : -1
        id_hotel = item.id_otel ? item.id_otel : -1
        id_hobby = item.id_interes ? item.id_interes : -1
      } else {
        newAgent[index].enabled = status
      }

      chatServiceGet.fetchSetStatusPush(fcmToken, expoToken, user.device.token, user.android_id_install, id_post, id_hotel, id_hobby, status, 1).then(result => {
        if (result.code === 0) {
          this.setState({ pushData: newAgent }, () => {
            setAgent(newAgent)

            toast.show(status === 1 ? t('screens.profile.pushprofi.pushOn') : t('screens.profile.pushprofi.pushOff'), {
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

      const { agent, user } = this.props
      let agentNew = []

      if (agent.length > 0) {
        let aCn = JSON.parse(JSON.stringify(agent))
        const result = await chatServiceGet.getListNotify(user.device.token, user.android_id_install)

        if (result.length > 0) {
          for (let i = 0; i < result.length; i++) {
            if (result[i].tip_chat === 1 && result[i].id_interes && result[i].id_post) {
              let item = result[i]
              item.title = result[i].title_country + ' -> ' + result[i].title_hobby
              agentNew.splice(i, 0, item)
            } else if (result[i].tip_chat === 1 && result[i].id_interes) {
              const cn = aCn.filter(c => Number(c.id) === Number(result[i].id_interes))[0]
              const newCn = Object.assign({}, cn)

              if (cn) {
                newCn.enabled = 1

                agentNew.push(newCn)
              }
            }
          }
        }
        this.setState({ pushData: uniqBy(agentNew.concat(aCn), 'id'), isLoading: false })
      } else {
        this.setState({ isLoading: false })
      }
    }

    this.onDismissSnackBar = () => {
      this.setState({ visible: false })
    }
  }

  async componentDidMount() {
    await this.initData()
  }

  render() {
    const { theme, ListItem, Switch } = this.props.utils

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
        <View style={{ flex: 1, backgroundColor: bg }}>
          <ScrollView style={{ backgroundColor: bg }}>
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
        </View>
      </>
    )
  }
}

export default PushProfi
