import { useCallback } from 'react'
import { Platform } from 'react-native'

export const usePermissions = (utils: any) => {
  const { requestMediaLibraryPermissionsAsync, requestCameraPermissionsAsync, Alert } = utils

  const requestGalleryPermissions = useCallback(async () => {
    if (Platform.OS !== 'web') {
      const { status } = await requestMediaLibraryPermissionsAsync()
      if (status !== 'granted') {
        Alert.alert('Нужны разрешения', 'Разрешите доступ к галерее для выбора фото')
        return false
      }
    }
    return true
  }, [requestMediaLibraryPermissionsAsync])

  const requestCameraPermissions = useCallback(async () => {
    if (Platform.OS !== 'web') {
      const { status } = await requestCameraPermissionsAsync()
      if (status !== 'granted') {
        Alert.alert('Нужны разрешения', 'Разрешите доступ к камере')
        return false
      }
    }
    return true
  }, [requestCameraPermissionsAsync])

  return { requestGalleryPermissions, requestCameraPermissions }
}

export const useImagePicker = (utils: any, onImageSelected: (uri: string, blockId?: string) => void) => {
  const { launchImageLibraryAsync, MediaTypeOptions, launchCameraAsync, Alert } = utils
  const { requestGalleryPermissions, requestCameraPermissions } = usePermissions(utils)

  const pickImageFromGallery = useCallback(
    async (blockId?: string) => {
      const hasPermission = await requestGalleryPermissions()
      if (!hasPermission) return

      try {
        const result = await launchImageLibraryAsync({
          mediaTypes: MediaTypeOptions.Images,
          allowsEditing: true,
          quality: 0.8,
          base64: false
        })

        if (!result.canceled && result.assets[0]) {
          onImageSelected(result.assets[0].uri, blockId)
        }
      } catch (error) {
        Alert.alert('Ошибка', 'Не удалось выбрать изображение')
        console.error(error)
      }
    },
    [requestGalleryPermissions, launchImageLibraryAsync, MediaTypeOptions, onImageSelected]
  )

  const takePhotoWithCamera = useCallback(
    async (blockId?: string) => {
      const hasPermission = await requestCameraPermissions()
      if (!hasPermission) return

      try {
        const result = await launchCameraAsync({
          allowsEditing: true,
          quality: 0.9,
          base64: false,
          presentationStyle: 0
        })

        if (!result.canceled && result.assets[0]) {
          onImageSelected(result.assets[0].uri, blockId)
        }
      } catch (error) {
        Alert.alert('Ошибка', 'Не удалось сделать фото')
        console.error(error)
      }
    },
    [requestCameraPermissions, launchCameraAsync, onImageSelected]
  )

  const showImagePickerOptions = useCallback(
    (blockId?: string) => {
      if (Platform.OS === 'web') {
        // For web, directly trigger file picker
        return // Will be handled in component
      }

      Alert.alert('Выберите источник', '', [
        { text: 'Отмена', style: 'destructive' },
        {
          text: 'Сделать фото',
          onPress: () => takePhotoWithCamera(blockId)
        },
        {
          text: 'Выбрать из галереи',
          onPress: () => pickImageFromGallery(blockId)
        }
      ])
    },
    [takePhotoWithCamera, pickImageFromGallery]
  )

  return { pickImageFromGallery, takePhotoWithCamera, showImagePickerOptions }
}
