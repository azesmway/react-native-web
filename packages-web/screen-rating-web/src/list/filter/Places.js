import { PureComponent } from 'react'
import { Appearance, Dimensions, Platform, ScrollView, TouchableOpacity, View } from 'react-native'

const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
const { MAIN_COLOR } = GLOBAL_OBJ.onlinetur.constants
const { width } = Dimensions.get('window')

class Places extends PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      selectedPlaces: [],
      selectAll: false
    }

    this.setSelectedPlaces = (item, checked) => {
      const { selectedPlaces } = this.state
      let newSelectedPlaces = Object.assign([], selectedPlaces)

      if (checked) {
        newSelectedPlaces.push(item.uid.toString())
      } else {
        for (var i = 0; i < newSelectedPlaces.length; i++) {
          if (newSelectedPlaces[i] === item.uid.toString()) {
            newSelectedPlaces.splice(i, 1)
          }
        }
      }

      this.setState({ selectedPlaces: newSelectedPlaces })
    }

    this.initComponent = () => {
      const { selectedPlaces } = this.props

      this.setState({ selectedPlaces: Object.assign([], selectedPlaces) })
    }

    this.setFilterSuccess = () => {
      const { changeSelectedPlaces, changeVisibleModalPlaces } = this.props
      const { selectedPlaces } = this.state
      const newSelectedPlaces = Object.assign([], selectedPlaces)

      changeSelectedPlaces(newSelectedPlaces)
      changeVisibleModalPlaces()
    }

    this.selectAll = () => {
      const { places } = this.props
      let newSelectedPlaces = []

      for (var i = 0; i < places.length; i++) {
        if (places[i].uid) {
          newSelectedPlaces.push(places[i].uid.toString())
        }
      }

      this.setState({ selectedPlaces: newSelectedPlaces, selectAll: true })
    }

    this.deselectAll = () => {
      this.setState({ selectedPlaces: [], selectAll: false })
    }
  }

  componentDidMount() {
    this.initComponent()
  }

  renderRightsButtons = () => {
    const { Icon } = this.props.utils
    const { selectedPlaces, selectAll } = this.state

    return (
      <View style={{ flexDirection: 'row', flex: 1 }}>
        <TouchableOpacity onPress={() => (selectAll || selectedPlaces.length > 0 ? this.deselectAll() : this.selectAll())}>
          <Icon name={selectAll || selectedPlaces.length > 0 ? 'remove-done' : 'done-all'} color={MAIN_COLOR} style={{ paddingRight: 20 }} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => this.setFilterSuccess()}>
          <Icon name={'done'} color={'green'} />
        </TouchableOpacity>
      </View>
    )
  }

  renderLeftIcon = () => {
    const { Icon } = this.props.utils
    const { changeVisibleModalPlaces } = this.props

    return (
      <TouchableOpacity onPress={() => changeVisibleModalPlaces()}>
        <Icon name={'close'} color={'red'} />
      </TouchableOpacity>
    )
  }

  render() {
    const { Portal, Modal, theme, Header, ListItem, t, isMobile } = this.props.utils
    const { places, visibleModalPlaces, changeVisibleModalPlaces } = this.props
    const { selectedPlaces, selectAll } = this.state

    let isDarkMode = Appearance.getColorScheme() === 'dark'
    let bg = isDarkMode ? theme.dark.colors.background : theme.light.colors.background
    let txt = isDarkMode ? theme.dark.colors.text : theme.light.colors.text

    return (
      <Portal>
        <Modal visible={visibleModalPlaces} onDismiss={() => changeVisibleModalPlaces()} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <View
            style={{
              width: isMobile ? width : width / 2,
              borderRadius: 10,
              backgroundColor: bg,
              alignSelf: 'center',
              height: Dimensions.get('window').height,
              marginTop: 160
            }}>
            <Header
              onlineTurHeader
              statusBarProps={{ translucent: true }}
              containerStyle={{ borderTopLeftRadius: 10, borderTopRightRadius: 10 }}
              leftComponent={this.renderLeftIcon()}
              rightComponent={this.renderRightsButtons()}
              centerComponent={{ text: t('screens.ratings.components.places.resorts'), style: { color: txt, fontSize: 16, fontWeight: 'bold', paddingTop: 2 } }}
              backgroundColor={isDarkMode ? bg : '#ececec'}
              centerContainerStyle={{ justifyContent: 'center' }}
            />
            <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 10 }} scrollEnabled>
              {places.length > 0
                ? places.map((item, index) => {
                    let checked = false

                    if (item.uid && selectedPlaces.indexOf(item.uid.toString()) > -1) {
                      checked = true
                    }

                    return (
                      <ListItem key={index.toString()} bottomDivider onPress={() => this.setSelectedPlaces(item, !checked)} containerStyle={{ padding: 8, backgroundColor: bg }}>
                        <ListItem.Content>
                          <ListItem.Title style={{ color: txt }}>{item.name}</ListItem.Title>
                        </ListItem.Content>
                        <ListItem.CheckBox checked={checked} onPress={() => this.setSelectedPlaces(item, !checked)} />
                      </ListItem>
                    )
                  })
                : null}
            </ScrollView>
            <View style={{ height: 100 }} />
          </View>
        </Modal>
      </Portal>
    )
  }
}

export default Places
