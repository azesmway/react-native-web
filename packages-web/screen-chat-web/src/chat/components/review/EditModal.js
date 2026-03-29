import { BlurView } from 'expo-blur'
import { memo, useEffect, useState } from 'react'
import { Image, Modal, Text, TextInput, TouchableOpacity, View } from 'react-native'

import { styles } from './styles'

const EditModal = memo(({ visible, editingBlock, onClose, onSave, onImagePicker }) => {
  const [tempBlock, setTempBlock] = useState(editingBlock)

  useEffect(() => {
    setTempBlock(editingBlock)
  }, [editingBlock])

  const handleSave = () => {
    if (tempBlock) {
      onSave(tempBlock)
    }
    onClose()
  }

  if (!tempBlock) return null

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <BlurView intensity={80} tint="dark" style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Редактировать {tempBlock.type === 'header' ? 'заголовок' : tempBlock.type === 'image' ? 'изображение' : 'текст'}</Text>

          {tempBlock.type === 'image' ? (
            <>
              {tempBlock.imageUri ? (
                <Image source={{ uri: tempBlock.imageUri }} style={styles.modalImage} resizeMode="contain" />
              ) : (
                <View style={[styles.modalImage, styles.emptyModalImage]}>
                  <Text style={styles.emptyModalImageText}>Нет изображения</Text>
                </View>
              )}

              <TouchableOpacity style={styles.imagePickerButton} onPress={() => onImagePicker(tempBlock.id)}>
                <Text style={styles.imagePickerButtonText}>Выбрать другое фото</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TextInput
              style={styles.modalInput}
              value={tempBlock.content || ''}
              onChangeText={text => setTempBlock({ ...tempBlock, content: text })}
              multiline
              numberOfLines={4}
              placeholder={tempBlock.type === 'header' ? 'Введите заголовок' : 'Введите текст'}
              placeholderTextColor="#C6C6C8"
              autoFocus
            />
          )}

          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.modalCancelButton} onPress={onClose}>
              <Text style={styles.modalCancelButtonText}>Отмена</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalSaveButton} onPress={handleSave}>
              <Text style={styles.modalSaveButtonText}>Сохранить</Text>
            </TouchableOpacity>
          </View>
        </View>
      </BlurView>
    </Modal>
  )
})

export default EditModal
