import { memo } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

import { styles } from './styles'

interface AddPanelProps {
  onAddBlock: (type: 'header' | 'text' | 'image') => void
  onAddImage: () => void
}

const AddPanel = memo<AddPanelProps>(({ onAddBlock, onAddImage }) => {
  return (
    <View style={styles.addPanel}>
      <Text style={styles.addPanelTitle}>Добавить блок</Text>
      <View style={styles.addButtons}>
        <TouchableOpacity style={[styles.addButton, styles.addHeaderButton]} onPress={() => onAddBlock('header')}>
          <Text style={styles.addButtonText}>Заголовок</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.addButton, styles.addTextButton]} onPress={() => onAddBlock('text')}>
          <Text style={styles.addButtonText}>Текст</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.addButton, styles.addImageButton]} onPress={onAddImage}>
          <Text style={styles.addButtonText}>Фото</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
})

export default AddPanel
