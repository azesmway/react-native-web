import React from 'react'

const AuthApple = ({
  onCloseAuth,
  regOnServerChat,
  auth,
  signInAsync,
  AppleAuthenticationScope,
  getCredentialStateAsync,
  AppleAuthenticationCredentialState,
  AppleAuthenticationButton,
  AppleAuthenticationButtonType,
  AppleAuthenticationButtonStyle
}) => {
  const signIn = async () => {
    try {
      const credential = await signInAsync({
        requestedScopes: [AppleAuthenticationScope.FULL_NAME, AppleAuthenticationScope.EMAIL]
      })

      const { user, identityToken } = credential

      if (credential) {
        const credentialState = await getCredentialStateAsync(user)

        if (identityToken && credentialState === AppleAuthenticationCredentialState.AUTHORIZED) {
          const appleCredential = auth.AppleAuthProvider.credential(identityToken)

          auth()
            .signInWithCredential(appleCredential)
            .then(userCredential => {
              // @ts-ignore
              auth()
                .currentUser.getIdToken(true)
                .then(async function (idToken) {
                  if (regOnServerChat) {
                    regOnServerChat(idToken, 'apple')
                  }
                })
                .catch(function (error) {
                  console.log(error)
                  if (onCloseAuth) {
                    onCloseAuth()
                  }
                })
            })
        }
      }
    } catch (e) {
      if (e.code === 'ERR_REQUEST_CANCELED') {
        // handle that the user canceled the sign-in flow
      } else {
        // handle other errors
      }
    }
  }

  return (
    <AppleAuthenticationButton
      buttonType={AppleAuthenticationButtonType.SIGN_IN}
      buttonStyle={AppleAuthenticationButtonStyle.BLACK}
      cornerRadius={5}
      style={{ width: 224, height: 40 }}
      onPress={signIn}
    />
  )
}

export default AuthApple
