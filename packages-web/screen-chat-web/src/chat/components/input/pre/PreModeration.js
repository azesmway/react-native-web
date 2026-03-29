import { useState } from 'react'
import { ActivityIndicator, Dimensions, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'

const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
const { width, height } = Dimensions.get('window')
const { MAIN_COLOR } = GLOBAL_OBJ.onlinetur.constants

const PreModeration = props => {
  const { sendMessageAI, setSendMessageAI, utils, onPressSend } = props
  const { Portal, Dialog, isMobile } = utils
  const [text, setText] = useState('Здесь будет исправленный текст от сервера')

  return (
    <View style={{ padding: sendMessageAI > 1 ? 0 : 5, justifyContent: 'center' }}>
      {sendMessageAI === 0 && <Text style={{ color: '#ff0000' }}>{'ВНИМАНИЕ! Включена премодерация сообщений.'}</Text>}
      {sendMessageAI === 1 && (
        <View style={{ flexDirection: 'row' }}>
          <ActivityIndicator />
          <Text style={{ color: '#4059e7', top: 2, left: 5 }}>{'Сообщение отправлено, ждем ответ сервера...'}</Text>
        </View>
      )}
      {sendMessageAI === 2 && (
        <Portal>
          <Dialog visible={sendMessageAI === 2} onDismiss={() => setSendMessageAI(0)} style={{ backgroundColor: '#fff', width: isMobile ? width : width / 2, alignSelf: 'center', borderRadius: 10 }}>
            <Dialog.Title style={{ margin: 0, padding: 0, fontSize: 18, paddingLeft: 10, paddingVertical: 6, color: '#8f7806' }}>{'Корректировка сообщения'}</Dialog.Title>
            <Dialog.Content style={{ height: isMobile ? height / 1.2 : height / 3 }}>
              <Text style={{ color: 'blue', alignSelf: 'center' }}>{'Ваше сообщение было скорректировано!'}</Text>
              <TextInput multiline={true} style={{ flex: 1 }} autoFocus={true} value={text} onChangeText={txt => setText(txt)} />
            </Dialog.Content>
            <Dialog.Actions style={{ margin: 0, padding: 5, bottom: 12 }}>
              <TouchableOpacity onPress={() => setSendMessageAI(0)} style={{ marginRight: 20 }}>
                <Text style={{ color: 'red' }}>{'Отменить'}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => onPressSend({ text, send: true })} style={{ marginRight: 20 }}>
                <Text style={{ color: MAIN_COLOR }}>{'Отправить'}</Text>
              </TouchableOpacity>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      )}
      {sendMessageAI === 3 && (
        <Portal>
          <Dialog visible={sendMessageAI === 3} onDismiss={() => setSendMessageAI(0)} style={{ backgroundColor: '#fff', width: isMobile ? width : width / 2, alignSelf: 'center', borderRadius: 10 }}>
            <Dialog.Title style={{ margin: 0, padding: 0, fontSize: 18, paddingLeft: 10, paddingVertical: 6, color: 'red' }}>{'ВНИМАНИЕ! Ошибка!'}</Dialog.Title>
            <Dialog.Content style={{ height: isMobile ? height / 1.2 : height / 3 }}>
              <Text style={{ color: 'red', alignSelf: 'center' }}>{'Тексты содержащие нецензурные выражения не публикуются!!!'}</Text>
              <TextInput multiline={true} style={{ flex: 1 }} autoFocus={true} value={text} onChangeText={txt => setText(txt)} />
            </Dialog.Content>
            <Dialog.Actions style={{ margin: 0, padding: 5, bottom: 12 }}>
              <TouchableOpacity onPress={() => setSendMessageAI(0)} style={{ marginRight: 20 }}>
                <Text style={{ color: 'red' }}>{'Отменить'}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => onPressSend({ text, send: true })} style={{ marginRight: 20 }}>
                <Text style={{ color: MAIN_COLOR }}>{'Отправить'}</Text>
              </TouchableOpacity>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      )}
    </View>
  )
}

export default PreModeration
