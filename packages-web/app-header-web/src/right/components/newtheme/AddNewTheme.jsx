/**
 * -----------------------------------------------------------------------
 *  Header      : AddNewTheme.tsx
 *  Created     : 10.04.2025
 *  Modified    : 10.04.2025
 *  Author      : Alexey Zolotarеv
 *  E-mail      : azesm@me.com
 *  Description :
 * -----------------------------------------------------------------------
 */

import React, { useState } from 'react'
import { Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native'

const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
const { getAppConstants } = GLOBAL_OBJ.onlinetur.storage

const AddNewTheme = props => {
  const { Portal, Dialog, TextInput, RadioButton, Button, ColorPicker, Panel1, HueSlider, Checkbox } = props.utils
  const { visible, setVisible, user, item = null } = props
  const [text, setText] = React.useState({
    id: item && item.id ? String(item.id) : '',
    theme: item && item.title ? item.title : '',
    subject: item && item.msg ? item.msg : '',
    number: item && item.sort ? String(item.sort) : '',
    code: item && item.id_country ? String(item.id_country) : '',
    lang: item && item.lg ? item.lg : 'ru',
    password: item && item.pass ? item.pass : '',
    passchild: item && item.pass_child ? item.pass_child : ''
  })
  const [value, setValue] = React.useState('')
  const [checked, setChecked] = React.useState(false)
  const [showModal, setShowModal] = useState({
    fon: false,
    text: false
  })
  const [colorFon, setColorFon] = React.useState(item && item.color_background ? item.color_background : '')
  const [colorText, setColorText] = React.useState(item && item.color_text_info ? item.color_text_info : '')

  const onSelectColorFon = ({ hex }) => {
    'worklet'
    setColorFon(hex)
  }

  const onSelectColorText = ({ hex }) => {
    'worklet'
    setColorText(hex)
  }

  const hideDialog = () => setVisible(false)

  const saveNewTheme = () => {
    const { Alert, chatServicePost } = props.utils
    let path = getAppConstants().url_main + getAppConstants().url_api3_path
    let postUrl = path + (item ? '/edit_post.php' : '/add_post.php')
    let body = new FormData()

    if (item) {
      body.append('id', Number(text.id))
    }

    body.append('android_id_install', user.android_id_install)
    body.append('token', user.device.token)
    body.append('title', text.theme)
    body.append('msg', text.subject)
    body.append('tip', value === 'countries' ? '0' : '1')
    body.append('tip_price', checked ? '1' : '0')
    body.append('tip_chat', '0')
    body.append('pornom', text.number)
    body.append('id_country', text.code)
    body.append('pass', text.password)
    body.append('pass_child', text.passchild)
    body.append('color_background', colorFon)
    body.append('color_text_info', colorText)
    body.append('lg', text.lang !== '' ? text.lang : 'ru')
    body.append('app', Platform.OS === 'ios' ? '11' : Platform.OS === 'web' ? '12' : '10')

    setVisible(false)
    chatServicePost.onAddTheme(body, postUrl).then(result => {
      if (result.code === 0) {
        Alert.alert(item ? 'Редактирование!' : 'Добавление!', item ? 'Тема удачно отредактирована!' : 'Тема удачно добавлена!')
      } else {
        Alert.alert('Ошибка!', result?.message)
      }
    })
  }

  const deleteTheme = id_post => {
    const { Alert, chatServicePost } = props.utils
    let path = getAppConstants().url_main + getAppConstants().url_api3_path
    let postUrl = path + '/del_post.php'
    let body = new FormData()

    body.append('android_id_install', user.android_id_install)
    body.append('token', user.device.token)
    body.append('id_post', id_post)

    setVisible(false)
    chatServicePost.onAddTheme(body, postUrl).then(result => {
      if (result.code === 0) {
        Alert.alert('Удаление!', 'Тема удачно удалена!')
      } else {
        Alert.alert('Ошибка!', result?.message)
      }
    })
  }

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={hideDialog} style={{ width: '50%', height: '80%', backgroundColor: '#fff', borderRadius: 10, alignSelf: 'center' }}>
        <Dialog.Title style={{ fontSize: 20, margin: 0, padding: 10, backgroundColor: '#ececec', borderTopLeftRadius: 10, borderTopRightRadius: 10, paddingLeft: 20 }}>
          {item ? 'Редактирование темы чата' : 'Создание новой темы чата'}
        </Dialog.Title>
        <Dialog.ScrollArea>
          <ScrollView contentContainerStyle={{ paddingHorizontal: 24 }}>
            <TextInput
              placeholder={'Введите тему'}
              placeholderTextColor={'#ccc'}
              value={text.theme}
              onChangeText={txt => setText({ ...text, theme: txt })}
              contentStyle={{ backgroundColor: '#fff' }}
            />
            <TextInput
              placeholder={'Введите текст примечания'}
              placeholderTextColor={'#ccc'}
              value={text.subject}
              onChangeText={txt => setText({ ...text, subject: txt })}
              contentStyle={{ backgroundColor: '#fff' }}
            />
            <View style={{ marginTop: 10 }}>
              <RadioButton.Group onValueChange={newValue => setValue(newValue)} value={value}>
                <View style={{ flexDirection: 'row' }}>
                  <RadioButton value="countries" />
                  <Text style={{ marginTop: 10 }}>СТРАНЫ, отели</Text>
                </View>
                <View style={{ flexDirection: 'row' }}>
                  <RadioButton value="themes" />
                  <Text style={{ marginTop: 10 }}>Темы</Text>
                </View>
                <View style={{ flexDirection: 'row', paddingLeft: 30 }}>
                  <Checkbox
                    status={checked ? 'checked' : 'unchecked'}
                    onPress={() => {
                      setChecked(!checked)
                    }}
                  />
                  <Text style={{ marginTop: 10 }}>Ценовой чат (только для хобби)</Text>
                </View>
              </RadioButton.Group>
            </View>
            <TextInput placeholder={'Введите цвет фона (#000000)'} placeholderTextColor={'#ccc'} value={colorFon} onChangeText={txt => setColorFon(txt)} contentStyle={{ backgroundColor: '#fff' }} />
            <TextInput
              placeholder={'Введите цвет текста описания (#FFFFFF)'}
              placeholderTextColor={'#ccc'}
              value={colorText}
              onChangeText={txt => setColorText(txt)}
              contentStyle={{ backgroundColor: '#fff' }}
            />
            <TextInput
              placeholder={'Введите порядковый номер'}
              placeholderTextColor={'#ccc'}
              value={text.number}
              onChangeText={txt => setText({ ...text, number: txt })}
              contentStyle={{ backgroundColor: '#fff' }}
            />
            <TextInput
              placeholder={'Введите код страны (обязательно для стран)'}
              placeholderTextColor={'#ccc'}
              value={text.code}
              onChangeText={txt => setText({ ...text, code: txt })}
              contentStyle={{ backgroundColor: '#fff' }}
            />
            <TextInput
              placeholder={'Введите код языка (ru, en, ...)'}
              placeholderTextColor={'#ccc'}
              value={text.lang}
              onChangeText={txt => setText({ ...text, lang: txt })}
              contentStyle={{ backgroundColor: '#fff' }}
            />
            <TextInput
              placeholder={'Введите пароль чата'}
              placeholderTextColor={'#ccc'}
              value={text.password}
              onChangeText={txt => setText({ ...text, password: txt })}
              contentStyle={{ backgroundColor: '#fff' }}
            />
            <TextInput
              placeholder={'Введите пароль child'}
              placeholderTextColor={'#ccc'}
              value={text.passchild}
              onChangeText={txt => setText({ ...text, passchild: txt })}
              contentStyle={{ backgroundColor: '#fff' }}
            />
            <View style={{ height: 30 }} />
          </ScrollView>
        </Dialog.ScrollArea>
        <Dialog.Actions style={{ paddingRight: 20, height: 30 }}>
          <Button onPress={hideDialog}>
            <Text style={{}}>{'Закрыть'}</Text>
          </Button>
          <Button
            onPress={() => {
              item && deleteTheme(item.id)
            }}>
            <Text style={{ color: 'red', fontWeight: 'bold' }}>{'УДАЛИТЬ'}</Text>
          </Button>
          <Button mode={'outlined'} onPress={() => saveNewTheme()}>
            <Text>{'Сохранить'}</Text>
          </Button>
        </Dialog.Actions>
      </Dialog>
      {showModal.fon || showModal.text ? (
        <Dialog visible={showModal.fon || showModal.text} animationType="slide" transparent={true} style={{ width: '30%', alignItems: 'center', alignSelf: 'center' }}>
          <Dialog.Actions style={{ marginTop: 20 }}>
            <Button
              onPress={() => {
                setColorFon('')
                setColorText('')
                setShowModal({ fon: false, text: false })
              }}>
              <Text style={{}}>{'Закрыть'}</Text>
            </Button>
            <Button
              onPress={() => {
                item && deleteTheme(item.id)
              }}>
              <Text style={{ color: 'red', fontWeight: 'bold' }}>{'УДАЛИТЬ'}</Text>
            </Button>
            <Button mode={'outlined'} onPress={() => setShowModal({ fon: false, text: false })}>
              <Text>{'Выбрать'}</Text>
            </Button>
          </Dialog.Actions>
        </Dialog>
      ) : (
        <></>
      )}
    </Portal>
  )
}

export default AddNewTheme
