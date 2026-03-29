import React, { memo } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

import { styles } from '../styles'

// Мемоизируем компонент, чтобы он не рендерился при изменении пропсов, которые его не касаются
export const ErrorToolbar = memo(({ errorText1, errorText2, auth, setModalLogin }) => (
  <View style={styles.errorContainer}>
    <View style={styles.errorCenter}>
      <TouchableOpacity onPress={() => auth && setModalLogin(true)}>
        <Text style={styles.errorText}>{errorText1}</Text>
        {errorText2 && <Text style={styles.errorText}>{errorText2}</Text>}
      </TouchableOpacity>
    </View>
  </View>
))

// Добавляем displayName для отладки
ErrorToolbar.displayName = 'ErrorToolbar'
