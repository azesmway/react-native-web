import { useEffect, useRef, useState } from 'react'

import LoginDialog from './login'

export default function LoginDialogComponent(props) {
  const [isLoading, setLoading] = useState(true)
  const module = useRef(undefined)

  const loadModules = async () => {
    const firebase = await import('firebase/compat/app')
    const messaging = await import('firebase/compat/messaging')
    const authFirebase = await import('firebase/compat/auth')
    const { GoogleSignin, GoogleSigninButton, isSuccessResponse, statusCodes } = await import('@react-native-google-signin/google-signin')
    const AuthGoogle = await import('./buttons/AuthGoogle')
    const AuthApple = await import('./buttons/AuthApple')
    const AuthEmail = await import('./buttons/authEmail')
    const auth = await import('@react-native-firebase/auth')
    const AppleAuthentication = await import('expo-apple-authentication')

    const firebaseConfig = {
      apiKey: '',
      projectId: 'distant-office',
      appId: '1:723349202322:web:5c6e7442a9464ad69dcd4b',
      authDomain: 'distant-office.firebaseapp.com',
      databaseURL: 'https://distant-office.firebaseio.com',
      messagingSenderId: '723349202322',
      storageBucket: 'distant-office.appspot.com'
    }

    firebase.default.initializeApp(firebaseConfig)

    module.current = {
      firebase: firebase.default,
      GoogleSignin,
      GoogleSigninButton,
      isSuccessResponse,
      statusCodes,
      AuthGoogle: AuthGoogle.default,
      AuthApple: AuthApple.default,
      AuthEmail: AuthEmail.default,
      auth: auth.default,
      signInAsync: AppleAuthentication.signInAsync,
      AppleAuthenticationScope: AppleAuthentication.AppleAuthenticationScope,
      AppleAuthenticationCredentialState: AppleAuthentication.AppleAuthenticationCredentialState,
      getCredentialStateAsync: AppleAuthentication.getCredentialStateAsync,
      AppleAuthenticationButton: AppleAuthentication.AppleAuthenticationButton,
      AppleAuthenticationButtonType: AppleAuthentication.AppleAuthenticationButtonType,
      AppleAuthenticationButtonStyle: AppleAuthentication.AppleAuthenticationButtonStyle
    }
  }

  useEffect(() => {
    loadModules().then(() => setLoading(false))
  }, [])

  if (isLoading) {
    return <></>
  }

  return <LoginDialog {...props} fb={module.current} />
}
