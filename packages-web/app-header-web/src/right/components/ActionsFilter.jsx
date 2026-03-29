import React from 'react'
import { Platform, Text, TouchableOpacity } from 'react-native'

const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
const { MAIN_COLOR } = GLOBAL_OBJ.onlinetur.constants

const ActionsFilter = ({ params, utils }) => {
  const { Icon, MBadge } = utils

  return (
    <TouchableOpacity onPress={() => params.openModalFilter()}>
      <Icon name={'filter-list'} size={35} color={MAIN_COLOR} />
      {params.badge > 0 && (
        <MBadge style={Platform.OS === 'web' ? { top: -4, right: -4, position: 'absolute' } : { top: -8, right: -8, position: 'absolute' }}>
          <Text>{params.badge}</Text>
        </MBadge>
      )}
    </TouchableOpacity>
  )
}

export default ActionsFilter
