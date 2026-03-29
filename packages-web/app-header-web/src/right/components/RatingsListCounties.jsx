import React, { PureComponent } from 'react'
import { Platform, Text, TouchableOpacity, View } from 'react-native'

const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
const { MAIN_COLOR } = GLOBAL_OBJ.onlinetur.constants

class RatingsListCounties extends PureComponent {
  constructor(props) {
    super(props)
  }

  render() {
    const { Icon, Badge, isMobile } = this.props.utils
    const { selectedCountries, openModalFilter, screen } = this.props.params
    const color = MAIN_COLOR

    const b = screen === 'actions_hotels' ? selectedCountries : selectedCountries ? selectedCountries.length : 0

    return (
      <TouchableOpacity onPress={() => openModalFilter()} style={{ marginTop: 0 }}>
        <Icon name={'filter-list'} size={isMobile ? 26 : 35} color={color} style={{ top: isMobile ? 10 : -1, left: 0 }} />
        {b !== 0 && (
          <Badge style={Platform.OS === 'web' ? { top: -4, right: -4, position: 'absolute' } : { top: -8, right: -8, position: 'absolute' }}>
            <Text>{b}</Text>
          </Badge>
        )}
      </TouchableOpacity>
    )
  }
}

export default RatingsListCounties
