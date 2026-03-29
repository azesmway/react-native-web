import React, { PureComponent } from 'react'
import { Platform, ScrollView, Text, TextInput as RNTextInput, TouchableOpacity, View } from 'react-native'

class FieldSelect extends PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      visible: false
    }
  }

  render() {
    const { TextInput, Icon, Portal, Modal, theme, Header, ListItem } = this.props.utils
    const { categName, id_categ, items, onSelectItem, idCategName } = this.props
    const { visible } = this.state

    return (
      <>
        <TextInput
          label={categName}
          editable={false}
          value={items[id_categ]}
          style={{ backgroundColor: 'transparent', color: theme.text }}
          render={props => {
            return (
              <TouchableOpacity style={{ position: 'absolute', bottom: 10, right: 0, flexDirection: 'row', width: '100%', paddingLeft: 12 }} onPress={() => this.setState({ visible: true })}>
                <RNTextInput editable={false} value={props.value} style={{ underlineColorAndroid: 'transparent', fontSize: 16, width: '100%' }} />
                <Icon name={'keyboard-arrow-down'} />
              </TouchableOpacity>
            )
          }}
        />
        <Portal>
          <Modal visible={visible} onDismiss={() => this.setState({ visible: false })} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <View
              style={{
                width: 400,
                borderRadius: 10,
                backgroundColor: '#ffffff',
                alignSelf: 'center',
                height: 600
              }}>
              <Header
                onlineTurHeader
                statusBarProps={{ translucent: true }}
                containerStyle={{ height: 56, borderTopLeftRadius: 10, borderTopRightRadius: 10 }}
                rightComponent={
                  <TouchableOpacity onPress={() => this.setState({ visible: false })} style={{ alignSelf: 'flex-end' }}>
                    <Icon name={'close'} />
                  </TouchableOpacity>
                }
                centerComponent={<Text style={{ fontSize: 16, fontWeight: 'bold', paddingTop: 3, color: theme.text }}>{categName}</Text>}
                backgroundColor={Platform.select({
                  android: 'rgb(63,81,181)',
                  web: '#ececec',
                  ios: '#ececec'
                })}
                centerContainerStyle={{ justifyContent: 'center' }}
              />
              <ScrollView>
                {items.length > 0
                  ? items.map((item, index) => {
                      if (item.indexOf('-') > -1) {
                        return null
                      }

                      return (
                        <ListItem
                          containerStyle={{
                            borderBottomWidth: 1,
                            borderBottomColor: '#eee'
                          }}
                          key={index.toString()}
                          onPress={() => {
                            this.setState({ visible: false })
                            onSelectItem(idCategName, index)
                          }}>
                          <ListItem.Content>
                            <Text style={{ fontSize: 16, color: theme.text }}>{item}</Text>
                          </ListItem.Content>
                        </ListItem>
                      )
                    })
                  : null}
              </ScrollView>
            </View>
          </Modal>
        </Portal>
      </>
    )
  }
}

export default FieldSelect
