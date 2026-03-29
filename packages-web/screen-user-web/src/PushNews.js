import { PureComponent } from 'react'
import { Appearance, View } from 'react-native'

class PushNews extends PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      notifyNews: false
    }

    this.onChangeNewsPush = notifyNews => {
      const { setNotifyNews } = this.props

      setNotifyNews(!notifyNews)
    }
  }

  render() {
    const { theme, t, Card, CheckBox } = this.props.utils
    const { notifyNews, history } = this.props

    let isDarkMode = Appearance.getColorScheme() === 'dark'
    let bg = isDarkMode ? theme.dark.colors.background : theme.light.colors.background
    let txt = isDarkMode ? theme.dark.colors.text : theme.light.colors.text

    return (
      <>
        <View style={{ backgroundColor: bg, flex: 1 }}>
          <Card containerStyle={{ backgroundColor: bg }}>
            <View style={{ borderColor: 'transparent', marginLeft: 5 }}>
              <CheckBox
                containerStyle={{ width: '100%', backgroundColor: 'transparent', borderWidth: 0, padding: 0 }}
                title={t('screens.profile.pushnews.text')}
                checked={notifyNews}
                onPress={() => this.onChangeNewsPush(notifyNews)}
                textStyle={{ color: txt }}
              />
            </View>
          </Card>
        </View>
      </>
    )
  }
}

export default PushNews
