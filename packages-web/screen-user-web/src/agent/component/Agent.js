import { PureComponent } from 'react'
import { Appearance, Text, View } from 'react-native'

import modelAgent from '../model/modelAgent'

class Agent extends PureComponent {
  constructor(props) {
    super(props)

    Object.assign(this, new modelAgent(this, this.props.utils))

    this.state = {
      townAgent: null,
      password: '',
      passwordVerify: false,
      visible: false,
      switchDisabled: false
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const { user } = this.props

    if (prevProps.user.is_sotr !== user.is_sotr) {
      this.onSetAccessAgent(user.is_sotr)
    }
  }

  componentDidMount() {
    this.initData()
  }

  render() {
    const { theme, Card, ListItem, Input, Switch, t, MaskedTextInput, Icon, Dropdown } = this.props.utils

    const { user, history, agentTowns } = this.props
    const { password, passwordVerify, townAgent, towns, switchDisabled } = this.state

    let isDarkMode = Appearance.getColorScheme() === 'dark'
    let bg = isDarkMode ? theme.dark.colors.background : theme.light.colors.background
    let txt = isDarkMode ? theme.dark.colors.text : theme.light.colors.text
    let plc = isDarkMode ? theme.dark.colors.textInactive : theme.light.colors.textInactive

    return (
      <>
        <View style={{ flex: 1, backgroundColor: bg }}>
          <Card containerStyle={{ backgroundColor: bg }}>
            <ListItem key={'1'} disabled={switchDisabled} containerStyle={{ height: 60, backgroundColor: bg, margin: 0, padding: 0 }}>
              <ListItem.Content>
                <Input
                  value={password}
                  placeholder={t('common.pass')}
                  placeholderTextColor={plc}
                  disabled={passwordVerify}
                  disabledInputStyle={{ color: 'black' }}
                  leftIconContainerStyle={{ marginLeft: 0, paddingRight: 5 }}
                  leftIcon={<Icon name={'vpn-key'} color={'#999999'} />}
                  onChangeText={txt => {
                    this.setState({ password: txt })
                  }}
                  secureTextEntry
                  containerStyle={{ marginTop: 20 }}
                  style={{ color: txt }}
                />
              </ListItem.Content>
              <Switch
                value={passwordVerify}
                onValueChange={() => {
                  this.setState({ passwordVerify: !passwordVerify })
                  this.handlePasswordVerify(!passwordVerify)
                }}
              />
            </ListItem>
            <View style={{ padding: 10 }}>
              <View style={{ height: 20 }} />
              <Dropdown
                style={{ backgroundColor: '#f1f1f1', height: 40, borderRadius: 10 }}
                placeholderStyle={{ paddingLeft: 5 }}
                selectedTextStyle={{ paddingLeft: 5 }}
                data={towns}
                labelField="label"
                valueField="value"
                placeholder={'Выберите страну'}
                value={townAgent}
                onChange={item => {
                  this.handleChangeMobile(item)
                }}
              />
            </View>
          </Card>
          <Card containerStyle={{ backgroundColor: bg }}>
            <View style={{ marginBottom: 10 }}>
              <Text numberOfLines={2} style={{ fontSize: 16, color: txt }}>
                {t('screens.profilescreen.telegramPhone')}
              </Text>
            </View>
            <ListItem key={'1'} containerStyle={{ backgroundColor: bg, margin: 0, padding: 0 }}>
              <ListItem.Content>
                <MaskedTextInput
                  editable={false}
                  placeholder={t('screens.profile.bonus.telText')}
                  placeholderTextColor={plc}
                  refInput={ref => {
                    this.input = ref
                  }}
                  value={''}
                  keyboardType={'phone-pad'}
                  onChangeText={(formatted, extracted) => {
                    this.setState({ phone: formatted, phoneExtracted: extracted })
                  }}
                  mask={'+7 ([000]) [000]-[00]-[00]'}
                  style={{ paddingTop: 10, paddingBottom: 10, fontSize: 17, backgroundColor: 'transparent', color: txt }}
                />
              </ListItem.Content>
              <Switch value={false} disabled={true} onValueChange={() => {}} />
            </ListItem>
          </Card>
        </View>
      </>
    )
  }
}

export default Agent
// 340955
