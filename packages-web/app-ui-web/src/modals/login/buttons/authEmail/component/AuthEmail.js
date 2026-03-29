import { PureComponent } from 'react'
import { ActivityIndicator, Appearance, Dimensions, Keyboard, KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native'

import AuthEmailModel from '../model/AuthEmailModel'

const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
const { MAIN_COLOR } = GLOBAL_OBJ.onlinetur.constants

class AuthEmail extends PureComponent {
  constructor(props) {
    super(props)

    /**
     * Инициализируем модели
     * @type {GetData}
     */
    Object.assign(this, new AuthEmailModel(this, props.utils))

    const { t } = props.utils

    this.state = {
      auth: true,
      visible: true,
      action: t('screens.auth.authemail.component.authemail.login'),
      title: t('screens.auth.authemail.component.authemail.auth'),
      name: '',
      email: '',
      password: '',
      errorName: '',
      errorEmail: '',
      errorPassword: '',
      errorPassword1: '',
      isLoading: false
    }
  }

  render() {
    const { t, theme, Portal, Modal, Header, Input, Icon } = this.props.utils
    const { action, title, visible, email, password, password1, errorEmail, errorName, auth, name, errorPassword, errorPassword1, isLoading } = this.state

    let isDarkMode = Appearance.getColorScheme() === 'dark'
    let bg = isDarkMode ? theme.dark.colors.background : theme.light.colors.background
    let txt = isDarkMode ? theme.dark.colors.text : theme.light.colors.text

    return (
      <Portal>
        <Modal visible={visible} onDismiss={() => this.onHandlerModal(false)} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-start' }}>
          <View
            style={{
              marginTop: 30,
              borderRadius: 10,
              width: Dimensions.get('window').width - 20,
              height: Dimensions.get('window').height / 1.7,
              backgroundColor: bg
            }}>
            <Header
              onlineTurHeader
              containerStyle={{ height: 56, borderRadius: 10 }}
              statusBarProps={{ translucent: true }}
              rightComponent={
                <TouchableOpacity onPress={() => this.onHandlerModal(false)} style={{ height: 20 }}>
                  <Icon name={'close'} color={'red'} />
                </TouchableOpacity>
              }
              centerComponent={<Text style={{ fontSize: 18, fontWeight: 'bold', color: txt }}>{title}</Text>}
              centerContainerStyle={{ justifyContent: 'center' }}
              rightContainerStyle={{ justifyContent: 'center' }}
              backgroundColor={isDarkMode ? bg : '#ececec'}
            />
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={100} style={{ flex: 1 }}>
              <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <ScrollView style={{ flex: 1, paddingTop: 50 }} contentContainerStyle={{ alignItems: 'center' }}>
                  <View style={{ width: '100%', padding: 20 }}>
                    {!auth ? (
                      <Input
                        label={t('screens.auth.authemail.component.authemail.name')}
                        placeholder={t('screens.auth.authemail.component.authemail.nameText')}
                        leftIcon={<Icon name="person" size={24} color="#ccc" />}
                        errorStyle={{ color: 'red' }}
                        errorMessage={errorName}
                        autoCapitalize={'none'}
                        autoCorrect={false}
                        value={name}
                        onChangeText={text => this.setState({ name: text })}
                        onBlur={() => {
                          if (name === '') {
                            this.setState({ errorName: t('screens.auth.authemail.component.authemail.nameError') })
                          } else {
                            this.setState({ errorName: '' })
                          }
                        }}
                      />
                    ) : null}
                    <Input
                      label={t('screens.auth.authemail.component.authemail.email')}
                      placeholder={t('screens.auth.authemail.component.authemail.emailText')}
                      leftIcon={<Icon name="email" size={24} color="#ccc" />}
                      errorStyle={{ color: 'red' }}
                      errorMessage={errorEmail}
                      keyboardType={'email-address'}
                      autoCapitalize={'none'}
                      autoCompleteType={'password'}
                      autoCorrect={false}
                      value={email}
                      onChangeText={text => this.setState({ email: text })}
                      onBlur={() => {
                        if (!this.validateEmail(email)) {
                          this.setState({ errorEmail: t('screens.auth.authemail.component.authemail.emailError') })
                        } else {
                          this.setState({ errorEmail: '' })
                        }
                      }}
                    />
                    <Input
                      label={t('screens.auth.authemail.component.authemail.pass')}
                      placeholder={t('screens.auth.authemail.component.authemail.passText')}
                      leftIcon={<Icon name="vpn-key" size={24} color="#ccc" />}
                      autoCapitalize={'none'}
                      autoCompleteType={'password'}
                      autoCorrect={false}
                      secureTextEntry
                      onChangeText={text => this.setState({ password: text })}
                      value={password}
                      errorStyle={{ color: 'red' }}
                      errorMessage={errorPassword}
                    />
                    {!auth ? (
                      <Input
                        label={t('screens.auth.authemail.component.authemail.passAgain')}
                        placeholder={t('screens.auth.authemail.component.authemail.passAgainText')}
                        leftIcon={<Icon name="vpn-key" size={24} color="#ccc" />}
                        autoCapitalize={'none'}
                        autoCompleteType={'password'}
                        autoCorrect={false}
                        secureTextEntry
                        onChangeText={text => this.setState({ password1: text })}
                        value={password1}
                        errorStyle={{ color: 'red' }}
                        errorMessage={errorPassword1}
                        onBlur={() => {
                          if (password !== password1) {
                            this.setState({ errorPassword1: t('screens.auth.authemail.component.authemail.passError') })
                          } else {
                            this.setState({ errorPassword1: '' })
                          }
                        }}
                      />
                    ) : null}
                    {auth ? (
                      <>
                        <View style={{ width: '100%', alignItems: 'center', justifyContent: 'center' }}>
                          {isLoading ? (
                            <View style={{ width: '100%', height: 40, alignItems: 'center', justifyContent: 'center' }}>
                              <ActivityIndicator animating size="small" color={MAIN_COLOR} />
                            </View>
                          ) : (
                            <TouchableOpacity
                              style={{
                                borderWidth: 0.5,
                                borderColor: '#ccc',
                                backgroundColor: '#e4ecf6',
                                height: 40,
                                width: '100%',
                                borderRadius: 10,
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                              onPress={() =>
                                this.setState({ isLoading: true }, () => {
                                  this.onLoginAction()
                                })
                              }>
                              <Text style={{ fontSize: 18, color: MAIN_COLOR }}>{action}</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                        <View style={{ height: 30 }} />
                        <TouchableOpacity
                          style={{
                            borderWidth: 0.5,
                            borderColor: '#ccc',
                            backgroundColor: '#e4ecf6',
                            height: 40,
                            width: '100%',
                            borderRadius: 10,
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          onPress={() =>
                            this.setState({
                              auth: false,
                              action: t('screens.auth.authemail.component.authemail.done'),
                              title: t('screens.auth.authemail.component.authemail.regs')
                            })
                          }>
                          <Text style={{ fontSize: 18, color: MAIN_COLOR }}>{t('screens.auth.authemail.component.authemail.reg')}</Text>
                        </TouchableOpacity>
                      </>
                    ) : (
                      // <Button
                      //   title={t('screens.auth.authemail.component.authemail.auths')}
                      //   onPress={() =>
                      //     this.setState({
                      //       auth: true,
                      //       action: t('screens.auth.authemail.component.authemail.login'),
                      //       title: t('screens.auth.authemail.component.authemail.auth')
                      //     })
                      //   }
                      //   titleStyle={{ fontSize: 14, fontWeight: 'bold' }}
                      //   buttonStyle={{ width: 180 }}
                      // />
                      <></>
                    )}
                  </View>
                </ScrollView>
              </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
          </View>
        </Modal>
      </Portal>
    )
  }
}

export default AuthEmail
