import 'firebaseui/dist/firebaseui.css'

import isEmpty from 'lodash/isEmpty'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Button, Dimensions, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native'

const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
const { getAppConfig, getAppConstants, setToken } = GLOBAL_OBJ.onlinetur.storage
const { width, height } = Dimensions.get('window')

const LoginDialog = props => {
  const [state, setState] = useState({
    isSignedIn: false,
    isEmptyUser: false,
    sendEmailVerification: false,
    visible: true,
    email: '',
    name: '',
    visibleEmail: false
  })

  const getTokenAndDataFlagRef = useRef(false)
  const unregisterAuthObserverRef = useRef(null)
  const {
    firebase,
    GoogleSignin,
    GoogleSigninButton,
    isSuccessResponse,
    statusCodes,
    AuthGoogle,
    AuthApple,
    AuthEmail,
    auth,
    signInAsync,
    AppleAuthenticationScope,
    getCredentialStateAsync,
    AppleAuthenticationCredentialState,
    AppleAuthenticationButton,
    AppleAuthenticationButtonType,
    AppleAuthenticationButtonStyle
  } = props.fb

  const type = getAppConfig().electornApp
    ? [firebase.auth.EmailAuthProvider.PROVIDER_ID]
    : [
        'apple.com',
        firebase.auth.EmailAuthProvider.PROVIDER_ID,
        {
          provider: firebase.auth.GoogleAuthProvider.PROVIDER_ID,
          scopes: ['profile', 'email']
        }
      ]

  const fastLogin = useCallback(() => {
    const { chatServiceGet } = props.utils
    const { email, name } = state

    chatServiceGet.registerOnServer('', email, name, 'fast').then(async data => {})
  }, [props.utils, state.email, state.name])

  const onCloseEmailAuth = () => {
    setState(prev => ({ ...prev, visibleEmail: false }))
  }

  const regOnServerChat = (idToken, method) => {
    const { setUser, currentCategory, setAgent, setAgentTowns, filter, setFilter, androidIdInstall, authOpenOAuth, setModalLogin } = props
    const { cookies, chatServiceGet, rtkQuery, chatServicePost } = props.utils

    let referal = cookies.load('referal')

    if (!referal) {
      referal = cookies.load('referrer')
    }

    chatServiceGet.registerOnServer(idToken, androidIdInstall, referal, 'web').then(async data => {
      if (data.code === 0) {
        if (!data.device) {
          setModalLogin(false)
          authOpenOAuth && authOpenOAuth()
          return
        }

        if (!isEmpty(referal)) {
          cookies.remove('referal', { path: '/' })
          cookies.remove('referrer', { path: '/' })
        }

        if (!data.id_user) {
          setState(prev => ({ ...prev, isEmptyUser: true }))
          setUser({})
          return null
        }

        setToken(data.android_id_install)
        const code = cookies.load('sotrCode')

        if (!isEmpty(code)) {
          const sotr = await chatServiceGet.fetchSetSotr(code, data.device.token, data.android_id_install)

          if (sotr.code === 0) {
            data.is_sotr = 1
            cookies.remove('sotrCode', { path: '/' })
          }
        }

        if (data.is_sotr && data.is_sotr === 1) {
          const agent = await rtkQuery.getRTKQueryDataPostsAgent(data.android_id_install, data.device.token, idToken, currentCategory.id)

          const agentData = agent.data.filter(item => item.tip === 1 && item.del === 0 && item.title !== '')
          const agentTowns = agent.data.filter(item => item.tip === 0 && item.del === 0 && item.title !== '')

          setAgent(agentData)
          setAgentTowns(agentTowns)

          data.hotels_user = agent.hotels_user
          data.hash_rt = agent.hash_rt || ''
          data.hash_ml = agent.hash_ml || ''
        }

        if (!data.img_path) {
          data.img_path = getAppConstants().url_main + '/images/user.png'
        } else if (data.img_path.indexOf('stuzon') > -1) {
          data.img_path = data.img_path.replace('https://stuzon.com/chat', getAppConstants().url_main)
        } else if (data.img_path.indexOf('/a/') > -1) {
          data.img_path = data.img_path.replace('/a/', '/').replace('www.', 'a.')
        }

        data.method = method
        setUser(data)

        if (data.new_token && data.new_id_install) {
          const body = new FormData()
          body.append('new_token', data.new_token)
          body.append('new_id_install', data.new_id_install)
          chatServicePost.postDataAuth(body).then()
        }

        if (Platform.OS === 'web') {
          if (window.parent) {
            window.parent.postMessage({ type: 'message', message: 'success' }, '*')
          }
        }

        getTokenAndDataFlagRef.current = false
        setModalLogin(false)
      }
    })
  }

  const getTokenAndData = useCallback(
    async user => {
      if (getTokenAndDataFlagRef.current) {
        return
      }

      user.getIdToken(false).then(function (idToken) {
        regOnServerChat(idToken, 'web')
      })
    },
    [props]
  )

  const escFunction = useCallback(
    event => {
      const { setModalLogin } = props

      if (event.keyCode === 27) {
        setModalLogin && setModalLogin()
      }
    },
    [props]
  )

  const renderUI = useCallback(async () => {
    const firebaseui = await import('firebaseui')

    const uiConfig = {
      callbacks: {
        signInSuccessWithAuthResult: () => false
      },
      credentialHelper: firebaseui.auth.CredentialHelper.NONE,
      signInFlow: 'popup',
      signInOptions: [
        'apple.com',
        firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        {
          provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
          requireDisplayName: true
        }
      ],
      immediateFederatedRedirect: false,
      tosUrl: '<your-tos-url>',
      privacyPolicyUrl: function () {
        window.location.assign('<your-privacy-policy-url>')
      }
    }

    const ui = firebaseui.auth.AuthUI.getInstance() || new firebaseui.auth.AuthUI(firebase.auth())
    ui.start('#firebaseui-auth-container', uiConfig)
  }, [firebase])

  useEffect(() => {
    const { user } = props

    if (Platform.OS === 'web') {
      if (user && user.id_user) {
        if (window.parent) {
          window.parent.postMessage({ type: 'message', message: 'success' }, '*')
        }
        return
      }

      document.addEventListener('keydown', escFunction, false)

      unregisterAuthObserverRef.current = firebase.auth().onAuthStateChanged(async fbuser => {
        if (fbuser && fbuser.providerData[0] && fbuser.providerData[0].providerId === 'password' && !fbuser.emailVerified) {
          setState(prev => ({ ...prev, sendEmailVerification: true }))
          const actionCodeSettings = {
            url: getAppConfig().homepage,
            handleCodeInApp: false
          }
          await fbuser
            .sendEmailVerification(actionCodeSettings)
            .then(() => {})
            .catch(error => {
              console.error('sendEmailVerification', error)
            })
          return
        }

        if (fbuser && isEmpty(props.user)) {
          setState(prev => ({ ...prev, isSignedIn: !!fbuser }))
          await getTokenAndData(fbuser)
        }
      })

      renderUI()
    }

    return () => {
      if (Platform.OS === 'web') {
        document.removeEventListener('keydown', escFunction, false)
        unregisterAuthObserverRef.current && unregisterAuthObserverRef.current()
      }
    }
  }, [props.user, firebase, escFunction, getTokenAndData, renderUI])

  const renderNotAuth = useCallback(() => {
    const { isSignedIn, sendEmailVerification, isEmptyUser } = state
    const { user, history, setModalLogin } = props
    const { theme, t } = props.utils

    if (user && user.id_user) {
      return (
        <View style={{ marginHorizontal: 40, alignItems: 'center' }}>
          <Text>{'Вы авторизованы как ' + user.login}</Text>
          <View style={{ height: 20 }} />
          <Button
            title={'ВОЙТИ'}
            onPress={() => {
              history('/')
              setModalLogin()
            }}
          />
        </View>
      )
    }

    return (
      <>
        {isSignedIn && !sendEmailVerification && !isEmptyUser ? (
          <View style={{ alignItems: 'center', paddingTop: 20 }}>
            <Text style={{ fontSize: 16, textAlign: 'center', color: theme.text }}>{t('containers.logindialog.authSuccess')}</Text>
            <View style={{ height: 40 }} />
            <ActivityIndicator size={'large'} />
          </View>
        ) : Platform.OS === 'web' ? (
          <div id="firebaseui-auth-container" />
        ) : (
          <View style={{ width: '100%', justifyContent: 'center', alignItems: 'center', marginVertical: 20 }}>
            <AuthGoogle
              // onCloseAuth={onCloseAuth}
              GoogleSignin={GoogleSignin}
              GoogleSigninButton={GoogleSigninButton}
              isSuccessResponse={isSuccessResponse}
              statusCodes={statusCodes}
              regOnServerChat={regOnServerChat}
            />
            <View style={{ height: 20 }} />
            <AuthApple
              // onCloseAuth={onCloseAuth}
              regOnServerChat={regOnServerChat}
              auth={auth}
              signInAsync={signInAsync}
              AppleAuthenticationScope={AppleAuthenticationScope}
              getCredentialStateAsync={getCredentialStateAsync}
              AppleAuthenticationCredentialState={AppleAuthenticationCredentialState}
              AppleAuthenticationButton={AppleAuthenticationButton}
              AppleAuthenticationButtonType={AppleAuthenticationButtonType}
              AppleAuthenticationButtonStyle={AppleAuthenticationButtonStyle}
            />
            <View style={{ height: 20 }} />
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                width: 226,
                height: 40,
                borderRadius: 5,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#d13617',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 5
              }}
              onPress={() => setState(prev => ({ ...prev, visibleEmail: true }))}>
              <Icon name={'email'} color={'#fff'} style={{ marginRight: 10 }} />
              <Text style={{ color: '#fff', fontSize: 16 }}>{'Вход по email'}</Text>
            </TouchableOpacity>
          </View>
        )}
        <View style={{ alignItems: 'center' }}>
          <Text />
          <Text style={{ fontSize: 14, textAlign: 'center', color: theme.text }}>{t('containers.logindialog.text')}</Text>
        </View>
      </>
    )
  }, [state, props])

  const { setModalLogin } = props
  const { t, Header, isMobile, Icon } = props.utils
  const { email, name, visibleEmail } = state

  return (
    <>
      <View
        style={{
          width: isMobile ? width - 20 : width / 3,
          height: 500,
          alignSelf: 'center',
          backgroundColor: '#fff',
          shadowColor: '#676767',
          shadowOffset: {
            width: 0,
            height: 0
          },
          shadowOpacity: 0.58,
          shadowRadius: 16.0,
          elevation: 24,
          borderRadius: 10
        }}>
        <Header
          onlineTurHeader
          containerStyle={{ borderTopLeftRadius: 10, borderTopRightRadius: 10 }}
          centerComponent={{ text: t('containers.logindialog.auth'), style: { color: '#000', fontSize: 16, fontWeight: 'bold', paddingTop: 2, borderRadius: 10 } }}
          backgroundColor={'#ececec'}
        />
        <TouchableOpacity
          onPress={() => setModalLogin(false)}
          style={{
            position: 'absolute',
            right: 10,
            top: 10,
            color: 'red'
          }}>
          <Icon name={'close'} color={'red'} />
        </TouchableOpacity>
        <View style={{ marginTop: 20, paddingHorizontal: isMobile ? 20 : 140, alignItems: 'center' }}>
          <TextInput
            placeholder={'Введите свой email'}
            placeholderTextColor={'#ccc'}
            type={'text'}
            value={email}
            style={{ width: 300, borderBottomWidth: 1, borderColor: '#ccc', padding: 10, outlineStyle: 'none' }}
            onChangeText={text => setState(prev => ({ ...prev, email: text }))}
          />
          <View style={{ height: 10 }} />
          <TextInput
            placeholder={'Введите свое имя'}
            placeholderTextColor={'#ccc'}
            type={'text'}
            value={name}
            style={{ width: 300, borderBottomWidth: 1, borderColor: '#ccc', padding: 10, outlineStyle: 'none' }}
            onChangeText={text => setState(prev => ({ ...prev, name: text }))}
          />
          <TouchableOpacity
            onPress={fastLogin}
            style={{
              marginTop: 20,
              width: 220,
              height: 40,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#fff221',
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: 2
              },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5
            }}>
            <Text style={{ fontSize: 16, color: 'red' }}>{'Авторизация'}</Text>
          </TouchableOpacity>
        </View>
        {renderNotAuth()}
      </View>
      {visibleEmail && <AuthEmail onCloseEmailAuth={onCloseEmailAuth} />}
    </>
  )
}

export default LoginDialog
