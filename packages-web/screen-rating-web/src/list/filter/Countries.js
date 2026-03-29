import React, { PureComponent } from 'react'
import { Appearance, Dimensions, Platform, ScrollView, TouchableOpacity, View } from 'react-native'

const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
const { MAIN_COLOR } = GLOBAL_OBJ.onlinetur.constants
const { width } = Dimensions.get('window')

class Countries extends PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      selectedCountries: [],
      selectAll: false
    }

    this.setSelectedCountries = (item, checked) => {
      const { selectedCountries } = this.state
      let newSelectedCountries = Object.assign([], selectedCountries)

      if (checked) {
        newSelectedCountries.push(String(item.id_country))
      } else {
        for (var i = 0; i < newSelectedCountries.length; i++) {
          if (newSelectedCountries[i] === String(item.id_country)) {
            newSelectedCountries.splice(i, 1)
          }
        }
      }

      this.setState({ selectedCountries: newSelectedCountries })
    }

    this.initComponent = () => {
      const { selectedCountries } = this.props

      this.setState({ selectedCountries: Object.assign([], selectedCountries) })
    }

    this.setFilterSuccess = () => {
      const { changeSelectedCountries, changeVisibleModal } = this.props
      const { selectedCountries } = this.state
      const newSelectedCountries = Object.assign([], selectedCountries)

      changeSelectedCountries(newSelectedCountries)
      changeVisibleModal()
    }

    this.selectAll = () => {
      const { countries } = this.props
      let newSelectedCountries = []

      for (var i = 0; i < countries.length; i++) {
        if (countries[i].id_country) {
          newSelectedCountries.push(countries[i].id_country.toString())
        }
      }

      this.setState({ selectedCountries: newSelectedCountries, selectAll: true })
    }

    this.deselectAll = () => {
      this.setState({ selectedCountries: [], selectAll: false })
    }
  }

  componentDidMount() {
    this.initComponent()
  }

  renderRightsButtons = () => {
    const { Icon } = this.props.utils
    const { selectedCountries, selectAll } = this.state

    return (
      <View style={{ flexDirection: 'row', flex: 1 }}>
        <TouchableOpacity onPress={() => (selectAll || selectedCountries.length > 0 ? this.deselectAll() : this.selectAll())}>
          <Icon name={selectAll || selectedCountries.length > 0 ? 'remove-done' : 'done-all'} color={MAIN_COLOR} style={{ paddingRight: 20 }} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => this.setFilterSuccess()}>
          <Icon name={'done'} color={'green'} />
        </TouchableOpacity>
      </View>
    )
  }

  renderLeftIcon = () => {
    const { Icon } = this.props.utils
    const { changeVisibleModal } = this.props

    return (
      <TouchableOpacity onPress={() => changeVisibleModal()}>
        <Icon name={'close'} color={'red'} />
      </TouchableOpacity>
    )
  }

  render() {
    const { Portal, Modal, theme, Header, ListItem, t, isMobile } = this.props.utils
    const { countries, visibleModal, changeVisibleModal } = this.props
    const { selectedCountries } = this.state

    let isDarkMode = Appearance.getColorScheme() === 'dark'
    let bg = isDarkMode ? theme.dark.colors.background : theme.light.colors.background
    let txt = isDarkMode ? theme.dark.colors.text : theme.light.colors.text

    return (
      <Portal>
        <Modal visible={visibleModal} onDismiss={() => changeVisibleModal()} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
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
              centerComponent={{ text: t('screens.ratings.components.countries.countries'), style: { color: txt, fontSize: 16, fontWeight: 'bold' } }}
              backgroundColor={isDarkMode ? bg : '#ececec'}
            />
            <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 10 }} scrollEnabled>
              {countries.length > 0
                ? countries.map((item, index) => {
                    let checked = false

                    if (item.id_country && selectedCountries.indexOf(item.id_country.toString()) > -1) {
                      checked = true
                    }

                    if (!item.id_country) {
                      return null
                    }

                    return (
                      <ListItem key={index.toString()} bottomDivider onPress={() => this.setSelectedCountries(item, !checked)} containerStyle={{ padding: 8, backgroundColor: bg }}>
                        <ListItem.Content>
                          <ListItem.Title style={{ color: txt }}>{item.title}</ListItem.Title>
                        </ListItem.Content>
                        <ListItem.CheckBox checked={checked} onPress={() => this.setSelectedCountries(item, !checked)} />
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

export default Countries
