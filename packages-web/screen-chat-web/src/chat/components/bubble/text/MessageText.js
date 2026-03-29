import { Component } from 'react'
import { Appearance, Linking, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

const MAX_LENGTH_STRING = 500
const SUB_LENGTH_STRING = 300

const WWW_URL_PATTERN = /^www\./i

const textStyle = {
  fontSize: 14,
  lineHeight: 15
}

const styles = {
  left: StyleSheet.create({
    container: {
      paddingLeft: 10,
      marginTop: 5,
      marginBottom: 10,
      marginRight: 10,
      flexWrap: 'nowrap'
    },
    containerRequest: {
      alignItems: 'center',
      paddingTop: 10,
      flexWrap: 'nowrap'
    },
    text: {
      color: '#000',
      flexShrink: 1,
      ...textStyle
    },
    link: {
      color: 'blue',
      textDecorationLine: 'underline'
    }
  }),
  right: StyleSheet.create({
    container: {
      paddingLeft: 10,
      marginTop: 5,
      marginBottom: 10,
      marginRight: 10,
      flexWrap: 'nowrap'
    },
    containerRequest: {
      alignItems: 'center',
      paddingTop: 10,
      flexWrap: 'nowrap'
    },
    text: {
      color: '#000',
      flexShrink: 1,
      ...textStyle
    },
    link: {
      color: 'blue',
      textDecorationLine: 'underline'
    }
  })
}

const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
const DEFAULT_OPTION_TITLES = ['Call', 'Text', 'Cancel']
const { getAppConstants } = GLOBAL_OBJ.onlinetur.storage
const { MAIN_COLOR } = GLOBAL_OBJ.onlinetur.constants

class MessageText extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isMore: false
    }
    this.onUrlPress = url => {
      const { appUser } = this.props
      let urlFull = getAppConstants().url_main + '/redirect.php?token='

      if (appUser && appUser.device && appUser.device.token) {
        urlFull += appUser.device.token + '&url=' + encodeURIComponent(url)
      } else {
        urlFull += '&url=' + encodeURIComponent(url)
      }

      Linking.canOpenURL(urlFull).then(supported => {
        if (!supported) {
          console.error('No handler for URL:', urlFull)
        } else {
          Linking.openURL(urlFull, '_blank')
        }
      })
    }
    this.onPhonePress = phone => {
      const { Communications } = this.props.utils

      const { optionTitles } = this.props
      const options = optionTitles && optionTitles.length > 0 ? optionTitles.slice(0, 3) : DEFAULT_OPTION_TITLES
      const cancelButtonIndex = options.length - 1
      Communications.phonecall(phone, true)
    }

    this.onEmailPress = email => {
      const { Communications } = this.props.utils

      return Communications.email([email], null, null, null, null)
    }
  }
  shouldComponentUpdate(nextProps, nextState) {
    return (!!this.props.currentMessage && !!nextProps.currentMessage && this.props.currentMessage.text !== nextProps.currentMessage.text) || this.state.isMore !== nextState.isMore
  }
  renderMore() {
    const { t } = this.props.utils

    return (
      <TouchableOpacity onPress={() => this.setState({ isMore: !this.state.isMore })}>
        <Text style={{ cursor: 'hand', color: MAIN_COLOR, fontSize: 16 }}>{!this.state.isMore ? t('containers.messagetext.more') : t('containers.messagetext.hide')}</Text>
      </TouchableOpacity>
    )
  }
  renderParsedText(text) {
    const { theme, ParsedText, Markdown, Clipboard } = this.props.utils

    const { currentMessage } = this.props
    const { is_admin, is_moderator } = currentMessage
    const d1 = new Date(currentMessage.createdAt)
    const d2 = new Date()
    const d3 = is_admin === 1 || is_moderator === 1 || Math.round((d2 - d1) / 60 / 1000) > 15
    const linkStyle = [styles[this.props.position].link, this.props.linkStyle && this.props.linkStyle[this.props.position]]

    let isDarkMode = Appearance.getColorScheme() === 'dark'
    let bg = isDarkMode ? theme.dark.colors.background : theme.light.colors.background
    let txt = isDarkMode ? theme.dark.colors.text : theme.light.colors.text

    // return <Text>{text}</Text>

    return (
      <Markdown
        markdown={text}
        onCodeCopy={code => Clipboard.setString(code)}
        onLinkPress={url => Linking.openURL(url)}
        customStyles={{
          inlineCode: {
            fontSize: 14
          },
          text: {
            fontSize: 14
          },
          paragraph: {
            fontSize: 14,
            lineHeight: 16
          }
        }}
      />
    )

    // return (
    //   <ParsedText
    //     selectable={true}
    //     style={[styles[this.props.position].text, this.props.textStyle && this.props.textStyle[this.props.position], this.props.customTextStyle]}
    //     // textStyle={{ color: txt, fontSize: s(18) }}
    //     parse={[
    //       ...this.props.parsePatterns(linkStyle),
    //       { type: 'url', style: linkStyle, onPress: this.onUrlPress },
    //       { type: 'phone', style: linkStyle, onPress: this.onPhonePress },
    //       { type: 'email', style: linkStyle, onPress: this.onEmailPress }
    //     ]}
    //     childrenProps={{ ...this.props.textProps }}
    //     viewUrl={d3}>
    //     {text}
    //   </ParsedText>
    // )
  }
  render() {
    const { t } = this.props.utils

    const { currentMessage, appUser } = this.props
    let { text, msg } = currentMessage
    const viewAction = currentMessage.tip === 5
    const viewRequest = currentMessage.tip === 6
    const isOwner = currentMessage.id_user_parent === appUser && appUser.id_user

    if (!msg && text === '' && viewAction) {
      text = t('screens.actions.action')
    }

    if (viewRequest && isOwner) {
      text = t('screens.actions.myRequest')
    }

    return (
      <View style={[viewRequest ? styles[this.props.position].containerRequest : styles[this.props.position].container, this.props.containerStyle && this.props.containerStyle[this.props.position]]}>
        {!this.state.isMore && text.length > MAX_LENGTH_STRING ? (
          <View>
            {this.renderParsedText(text.substring(0, SUB_LENGTH_STRING) + '...')}
            {this.renderMore()}
          </View>
        ) : (
          this.renderParsedText(text)
        )}
      </View>
    )
  }
}

export default MessageText
