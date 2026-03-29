import { PureComponent } from 'react'
import { Dimensions, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native'

const { width } = Dimensions.get('window')

class Hotels extends PureComponent {
  constructor(props) {
    super(props)

    this.state = {}

    this.setSelectedHotels = item => {
      const { changeSelectedHotels } = this.props

      changeSelectedHotels(item)
    }
  }

  componentDidMount() {}

  render() {
    const { Portal, Modal, Icon, Header, ListItem, t, isMobile } = this.props.utils
    const { hotels, visibleModalHotels, changeVisibleModalHotels } = this.props

    return (
      <Portal>
        <Modal visible={visibleModalHotels} onDismiss={() => changeVisibleModalHotels()} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <View
            style={{
              width: isMobile ? width : width / 2,
              borderRadius: 10,
              backgroundColor: '#ffffff',
              alignSelf: 'center',
              height: Dimensions.get('window').height - 100
            }}>
            <Header
              onlineTurHeader
              statusBarProps={{ translucent: true }}
              containerStyle={{ height: 56, borderTopLeftRadius: 10, borderTopRightRadius: 10 }}
              leftComponent={
                <TouchableOpacity transparent onPress={() => changeVisibleModalHotels()} style={{ alignSelf: 'flex-start' }}>
                  <Icon name={'close'} color={'red'} size={30} />
                </TouchableOpacity>
              }
              centerComponent={<Text style={{ fontSize: 16, fontWeight: 'bold', color: '#000' }}>{t('screens.ratings.components.hotels.cat')}</Text>}
              backgroundColor={Platform.select({
                android: 'rgb(63,81,181)',
                web: '#ececec',
                ios: '#ececec'
              })}
              centerContainerStyle={{ justifyContent: 'center' }}
            />
            <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 10 }} scrollEnabled>
              {hotels.length > 0
                ? hotels.map((item, index) => {
                    return (
                      <ListItem key={index.toString()} bottomDivider onPress={() => this.setSelectedHotels(item)} containerStyle={{ padding: 8 }}>
                        <ListItem.Content>
                          <ListItem.Title>{item}</ListItem.Title>
                        </ListItem.Content>
                      </ListItem>
                    )
                  })
                : null}
            </ScrollView>
          </View>
        </Modal>
      </Portal>
    )
  }
}

export default Hotels
