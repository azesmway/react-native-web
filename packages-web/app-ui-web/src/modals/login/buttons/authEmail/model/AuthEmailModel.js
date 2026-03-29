import { Platform } from 'react-native'

const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
const { setToken, setUniqueId, getAppConstants } = GLOBAL_OBJ.onlinetur.storage

class AuthEmailModel {
  constructor(component, props) {
    this.c = component
    this.comprops = props
  }

  onHandlerModal = visible => {
    const { onCloseEmailAuth } = this.c.props
    const { t } = this.comprops

    this.c.setState(
      {
        auth: true,
        visible: visible,
        action: t('screens.auth.authemail.model.authemailmodel.login'),
        title: t('screens.auth.authemail.model.authemailmodel.auth'),
        email: '',
        name: '',
        password: '',
        errorEmail: '',
        errorName: '',
        errorPassword: ''
      },
      () => {
        onCloseEmailAuth && onCloseEmailAuth()
      }
    )
  }

  onLoginAction = () => {
    const { t } = this.comprops
    const { auth, password, password1, email, name } = this.c.state

    if (!auth && password !== password1) {
      this.c.setState({ isLoading: false, errorPassword1: t('screens.auth.authemail.model.authemailmodel.passError') })
      return
    }

    if (!this.validateEmail(email)) {
      this.c.setState({ isLoading: false, errorEmail: t('screens.auth.authemail.model.authemailmodel.emailValid') })
      return
    }

    if (password === '') {
      this.c.setState({ isLoading: false, errorPassword: t('screens.auth.authemail.model.authemailmodel.passNull') })
      return
    }

    if (!auth && password.length < 6) {
      this.c.setState({ isLoading: false, errorPassword: t('screens.auth.authemail.model.authemailmodel.pass6') })
      return
    }

    if (!auth && name === '') {
      this.c.setState({ isLoading: false, errorName: t('screens.auth.authemail.model.authemailmodel.nameNull') })
      return
    }

    if (auth) {
      this.loginUser()
    } else {
      this.createUser()
    }
  }
  // Error: [auth/user-not-found] There is no user record corresponding to this identifier. The user may have been deleted.
  loginUser = () => {
    const { t, firebase, Alert } = this.comprops
    const { password, email } = this.c.state

    try {
      firebase
        .auth()
        .signInWithEmailAndPassword(email, password)
        .then(async userCredential => {
          var user = userCredential.user

          user.getIdToken(true).then(async idToken => {
            await this.regUser(idToken)
          })
        })
        .catch(error => {
          if (error.toString().indexOf('user-not-found') > -1) {
            Alert.alert(t('common.errorTitle'), t('screens.auth.authemail.model.authemailmodel.notUser'))
          } else if (error.toString().indexOf('wrong-password') > -1) {
            Alert.alert(t('common.errorTitle'), t('screens.auth.authemail.model.authemailmodel.wrong'))
          }
          console.log('catch signInWithEmailAndPassword', error)
          this.c.setState({ isLoading: false })
        })
    } catch (error) {
      console.log('signInWithEmailAndPassword', error)
      this.c.setState({ isLoading: false })
    }
  }

  createUser = () => {
    const { t, firebase, Alert } = this.comprops
    const { setUserName } = this.c.props
    const { password, email, name } = this.c.state
    const cmp = this

    firebase
      .auth()
      .createUserWithEmailAndPassword(email, password)
      .then(userCredential => {
        var user = userCredential.user

        if (userCredential.additionalUserInfo.isNewUser) {
          setUserName(name)
          user
            .sendEmailVerification()
            .then(function () {
              cmp.c.setState({
                isLoading: false,
                auth: true,
                action: t('screens.auth.authemail.model.authemailmodel.login'),
                title: t('screens.auth.authemail.model.authemailmodel.auth')
              })
              Alert.alert(t('common.attention'), t('screens.auth.authemail.model.authemailmodel.email'))
            })
            .catch(function (error) {
              cmp.c.setState({ isLoading: false })
              console.log('sendEmailVerification', error)
            })
        }
      })
      .catch(error => {
        if (error.message.indexOf('email-already-in-use') > -1) {
          this.c.setState({ isLoading: false, errorEmail: t('screens.auth.authemail.model.authemailmodel.emailUse') })
        } else {
          this.c.setState({ isLoading: false })
          Alert.alert(t('common.errorTitle'), error.message)
        }
      })
  }

  regUser = async idToken => {
    const { chatServiceGet } = this.comprops
    const { setUser, userName, setUserName, androidIdInstall, history, filter, setFilter, fcmToken, referral, locationPath, expoToken, device } = this.c.props
    let self = this

    chatServiceGet.registerOnServer(idToken, androidIdInstall, referral ? referral : '', 'email', fcmToken, expoToken, device.url).then(async result => {
      if (result.code === 0) {
        result.fcmToken = fcmToken ? fcmToken : ''
        result.expoToken = expoToken ? expoToken : ''
        setToken(result.device.token)
        setUniqueId(result.android_id_install)

        if (!result.img_path) {
          result.img_path = getAppConstants().url_main + '/images/user.png'
        } else if (result.img_path.indexOf('stuzon') > -1) {
          result.img_path = result.img_path.replace('https://stuzon.com/chat', getAppConstants().url_main)
        } else if (result.img_path.indexOf('/a/') > -1) {
          result.img_path = result.img_path.replace('/a/', '/').replace('www.', 'a.')
        }

        const newFilter = Object.assign({}, filter)
        newFilter.selectCategory = {}
        setFilter(newFilter)

        self.onHandlerModal(false)

        result.method = 'email'

        if (!result.my_name) {
          result.my_name = userName
        }

        setUser(result)
        history(locationPath && locationPath !== '' ? locationPath : '/')
      } else {
        console.log('Ошибка регистрации', result)
      }
    })
  }

  validateEmail = email => {
    const re = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i
    return re.test(String(email).toLowerCase())
  }
}

export default AuthEmailModel
