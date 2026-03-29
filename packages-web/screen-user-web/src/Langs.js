import { PureComponent } from 'react'
import { Appearance, Platform, ScrollView } from 'react-native'

const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
const { setAppLang } = GLOBAL_OBJ.onlinetur.storage

class Langs extends PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      langs: ['ru', 'en', 'es', 'fr'],
      langsName: {
        ru: 'Russian',
        en: 'English',
        es: 'Spanish',
        fr: 'French',
        'ru-RU': 'Russian',
        'en-EN': 'English',
        'es-ES': 'Spanish',
        'fr-FR': 'French'
      },
      appLangName: ''
    }

    this.setSelectedLang = item => {
      const { changeSelectedLang, visibleModalLangInterface } = this.props

      changeSelectedLang(item, visibleModalLangInterface)
    }

    this.changeLang = lang => {
      const { setLocale } = this.props.utils

      const { setAppLangStore, setAppLangInterface } = this.props
      // const { visibleModalLangInterface } = this.props.route.params

      // if (visibleModalLangInterface) {
      setLocale(lang)
      setAppLangInterface(lang)
      setAppLang(lang)
      // } else {
      //   setAppLangStore(lang)
      //   setAppLang(lang)
      // }
    }
  }

  render() {
    const { theme, getLocale, ListItem, Icon } = this.props.utils

    const { history } = this.props
    const { appLangInterface } = this.props
    const { langsName, langs } = this.state

    let curLang = appLangInterface ? appLangInterface : getLocale()

    let isDarkMode = Appearance.getColorScheme() === 'dark'
    let bg = isDarkMode ? theme.dark.colors.background : theme.light.colors.background
    let txt = isDarkMode ? theme.dark.colors.text : theme.light.colors.text

    return (
      <ScrollView style={{ backgroundColor: bg }}>
        {langs.map((el, i) => (
          <ListItem key={i.toString()} bottomDivider onPress={() => this.changeLang(el)} containerStyle={{ backgroundColor: bg }}>
            <ListItem.Content>
              <ListItem.Title style={{ color: txt }}>{langsName[el]}</ListItem.Title>
            </ListItem.Content>
            {curLang.indexOf(el) > -1 ? <Icon name={'done'} color={txt} /> : null}
          </ListItem>
        ))}
      </ScrollView>
    )
  }
}

export default Langs
