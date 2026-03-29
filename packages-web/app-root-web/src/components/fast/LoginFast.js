// import AlertWeb from 'app-core-web/src/alert/AlertWeb'
import { getAppConstants, getAuthLink, setAuthLink } from 'app-core-web/src/storage.js'
import { registerOnServer } from 'app-services/src/chat/get/fetch'
import t from 'app-utils/src/i18n'
import queryString from 'query-string'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, Text, View } from 'react-native'
import Button from 'react-native-paper/lib/module/components/Button/Button'
import Dialog from 'react-native-paper/lib/module/components/Dialog/Dialog'

const LoginFast = ({ setUser }) => {
  const [isOpenLogin, setOpenLogin] = useState(true)
  const [isReg, setReg] = useState(false)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [token, setToken] = useState('')

  const createRegistration = () => {
    if (email === '') {
      Alert.alert(t('common.attention'), 'Заполните email')

      return
    }

    if (name === '') {
      Alert.alert(t('common.attention'), 'Заполните имя')

      return
    }

    setReg(true)

    registerOnServer(token, email, name, 'fast').then(async data => {
      if (data) {
        registerOnServer(data.token, data.android_id_install, '', 'web').then(async reg => {
          if (reg.code === 0) {
            if (!reg.img_path) {
              reg.img_path = getAppConstants().url_main + '/images/user.png'
            } else if (reg.img_path.indexOf('stuzon') > -1) {
              reg.img_path = reg.img_path.replace('https://stuzon.com/chat', getAppConstants().url_main)
            } else if (reg.img_path.indexOf('/a/') > -1) {
              reg.img_path = reg.img_path.replace('/a/', '/').replace('www.', 'a.')
            }

            setUser(reg)
            setOpenLogin(false)
            setAuthLink('')
          }
        })
      }
    })
  }

  useEffect(() => {
    const fastLogin = queryString.parse(getAuthLink().replace('?fast', ''))

    if (fastLogin.email && fastLogin.email !== '') {
      setEmail(fastLogin.email)
    }

    if (fastLogin.name && fastLogin.name !== '') {
      setName(fastLogin.name)
    }

    if (fastLogin.hash && fastLogin.hash !== '') {
      setToken(fastLogin.hash)
    }
  }, [])

  return (
    <Dialog
      visible={isOpenLogin}
      onDismiss={() => {
        setAuthLink('')
        setOpenLogin(false)
      }}
      style={{ width: 500, alignSelf: 'center', backgroundColor: '#fff' }}>
      <Dialog.Title style={{ color: '#000' }}>{'Быстрая регистрация'}</Dialog.Title>
      <Dialog.Content>
        {isReg ? (
          <View style={{ marginTop: 20, marginBottom: 40, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator />
            <Text>{'Регистрация...'}</Text>
          </View>
        ) : (
          <View style={{ marginTop: 20, marginBottom: 40 }}>
            <Input
              placeholder={'Введите свой email'}
              type={'text'}
              value={email}
              style={{ width: '100%' }}
              startAdornment={
                <InputAdornment position="start">
                  <IconButton aria-label="toggle password visibility">
                    <MailIcon />
                  </IconButton>
                </InputAdornment>
              }
              onChange={event => setEmail(event.target.value)}
            />
            <View style={{ height: 20 }} />
            <Input
              placeholder={'Введите свое имя'}
              type={'text'}
              value={name}
              style={{ width: '100%' }}
              startAdornment={
                <InputAdornment position="start">
                  <IconButton aria-label="toggle password visibility">
                    <AccountCircleIcon />
                  </IconButton>
                </InputAdornment>
              }
              onChange={event => setName(event.target.value)}
            />
          </View>
        )}
      </Dialog.Content>
      {!isReg && (
        <Dialog.Actions>
          <Button onPress={() => createRegistration()} mode="outlined" style={{ marginRight: 20 }}>
            {'Зарегистрироваться'}
          </Button>
          <Button
            onPress={() => {
              setAuthLink('')
              setOpenLogin(false)
            }}
            mode="contained"
            style={{ backgroundColor: 'red' }}>
            {'Отменить'}
          </Button>
        </Dialog.Actions>
      )}
    </Dialog>
  )
}

export default LoginFast
