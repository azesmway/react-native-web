import { useEffect } from 'react'
import { Alert, Platform } from 'react-native'

const AuthGoogle = ({ onPressButtomAuth, onCloseAuth, regOnServerChat, GoogleSignin, GoogleSigninButton, isSuccessResponse, statusCodes }) => {
  const signIn = async () => {
    if (onPressButtomAuth) {
      onPressButtomAuth()
    }

    let error = {
      name: '',
      message: ''
    }

    try {
      await GoogleSignin.hasPlayServices()
      const response = await GoogleSignin.signIn()

      if (isSuccessResponse(response)) {
        const userInfo = response.data

        if (userInfo.idToken && userInfo.idToken !== '') {
          if (regOnServerChat) {
            regOnServerChat(userInfo.idToken, 'android')
          }
        } else {
          error = {
            name: 'AuthGoogle',
            message: 'Token not found'
          }

          if (onCloseAuth) {
            onCloseAuth()
          }
          Alert.alert('ОШИБКА!', 'Authorization failed, did not receive a token.')
        }
      } else {
        error = {
          name: 'AuthGoogle',
          message: 'SIGN_IN_CANCELLED'
        }

        if (onCloseAuth) {
          onCloseAuth()
        }
      }
    } catch (errorCode) {
      if (errorCode.code === statusCodes.SIGN_IN_CANCELLED) {
        error = {
          name: 'AuthGoogle',
          message: 'SIGN_IN_CANCELLED'
        }

        if (onCloseAuth) {
          onCloseAuth()
        }
      } else if (errorCode.code === statusCodes.IN_PROGRESS) {
        error = {
          name: 'AuthGoogle',
          message: 'IN_PROGRESS'
        }

        if (onCloseAuth) {
          onCloseAuth()
        }
      } else if (errorCode.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        error = {
          name: 'AuthGoogle',
          message: 'PLAY_SERVICES_NOT_AVAILABLE'
        }

        if (onCloseAuth) {
          onCloseAuth()
        }
      } else {
        if (onCloseAuth) {
          onCloseAuth()
        }
      }
    }
  }

  useEffect(() => {
    return GoogleSignin.configure({
      // @ts-ignore
      clientId: '7723349202322-nom0sc2bvlbbi8rim1qc4174g9mf8c9k.apps.googleusercontent.com',
      webClientId: '723349202322-eeuefbtgalv8cnobpqg25sb8bm11e130.apps.googleusercontent.com'
    })
  }, [])

  return <GoogleSigninButton style={{ width: 230, height: Platform.OS === 'ios' ? 48 : 60 }} size={GoogleSigninButton.Size.Wide} color={GoogleSigninButton.Color.Dark} onPress={() => signIn()} />
}

export default AuthGoogle
