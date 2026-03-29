import { ChangeEvent, FC, useCallback, useReducer, useRef, useState } from 'react'
import { Dimensions, KeyboardAvoidingView, Modal, Platform, SafeAreaView, ScrollView, StatusBar, Text, TextInput, TouchableOpacity, View } from 'react-native'

import AddPanel from './AddPanel'
import BlockRenderer from './BlockRenderer'
import EditModal from './EditModal'
import { useImagePicker } from './hooks/reviewEditorHooks'
import { styles } from './styles'

const { width } = Dimensions.get('window')

// Типы блоков контента
export type ContentBlock = {
  id: string
  type: 'header' | 'text' | 'image'
  content: string
  imageUri?: string
}

export type HotelReview = {
  id?: string
  hotelName: string
  blocks: ContentBlock[]
}

interface HotelReviewEditorProps {
  initialReview?: HotelReview
  onSave: (review: HotelReview) => void
  onCancel?: () => void
  visible?: boolean
  utils: any
}

type ReviewAction =
  | { type: 'SET_HOTEL_NAME'; payload: string }
  | { type: 'ADD_BLOCK'; payload: ContentBlock }
  | { type: 'REMOVE_BLOCK'; payload: string }
  | { type: 'UPDATE_BLOCK'; payload: ContentBlock }

const reviewReducer = (state: HotelReview, action: ReviewAction): HotelReview => {
  switch (action.type) {
    case 'SET_HOTEL_NAME':
      return { ...state, hotelName: action.payload }
    case 'ADD_BLOCK':
      return { ...state, blocks: [...state.blocks, action.payload] }
    case 'REMOVE_BLOCK':
      return { ...state, blocks: state.blocks.filter(b => b.id !== action.payload) }
    case 'UPDATE_BLOCK':
      return { ...state, blocks: state.blocks.map(b => (b.id === action.payload.id ? action.payload : b)) }
    default:
      return state
  }
}

const generateId = () => Date.now().toString() + Math.random().toString()

const HotelReviewEditor: FC<HotelReviewEditorProps> = ({ initialReview, onSave, onCancel, visible = true, utils }) => {
  const { Alert } = utils

  // Reducer for review state
  const [review, dispatch] = useReducer(
    reviewReducer,
    initialReview || {
      hotelName: '',
      blocks: [{ id: generateId(), type: 'text', content: '' }]
    }
  )

  // Modal state
  const [editingBlock, setEditingBlock] = useState<ContentBlock | null>(null)
  const [editModalVisible, setEditModalVisible] = useState(false)

  // Web file input
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [webInputCallback, setWebInputCallback] = useState<((uri: string) => void) | null>(null)

  const handleFileChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (file && webInputCallback) {
        const reader = new FileReader()
        reader.onload = e => {
          webInputCallback(e.target?.result as string)
          setWebInputCallback(null)
        }
        reader.readAsDataURL(file)
      }
    },
    [webInputCallback]
  )

  // Image picker hook
  const handleImageSelected = useCallback(
    (uri: string, blockId?: string) => {
      if (blockId) {
        dispatch({ type: 'UPDATE_BLOCK', payload: { id: blockId, type: 'image', content: uri, imageUri: uri } })
        if (editingBlock?.id === blockId) {
          setEditingBlock(prev => (prev ? { ...prev, imageUri: uri, content: uri } : null))
        }
      } else {
        const newBlock: ContentBlock = {
          id: generateId(),
          type: 'image',
          content: uri,
          imageUri: uri
        }
        dispatch({ type: 'ADD_BLOCK', payload: newBlock })
      }
    },
    [editingBlock]
  )

  const { showImagePickerOptions } = useImagePicker(utils, handleImageSelected)

  const pickImageOnWeb = useCallback(
    (blockId?: string) => {
      setWebInputCallback(() => (uri: string) => handleImageSelected(uri, blockId))
      fileInputRef.current?.click()
    },
    [handleImageSelected]
  )

  // Override showImagePickerOptions for web
  const showImagePickerOptionsOverride = useCallback(
    (blockId?: string) => {
      if (Platform.OS === 'web') {
        pickImageOnWeb(blockId)
      } else {
        showImagePickerOptions(blockId)
      }
    },
    [pickImageOnWeb, showImagePickerOptions]
  )

  // Block actions
  const onEdit = useCallback((block: ContentBlock) => {
    setEditingBlock({ ...block })
    setEditModalVisible(true)
  }, [])

  const onRemove = useCallback(
    (id: string) => {
      Alert.alert('Удалить блок', 'Вы уверены?', [
        { text: 'Отмена', style: 'destructive' },
        {
          text: 'Удалить',
          onPress: () => dispatch({ type: 'REMOVE_BLOCK', payload: id })
        }
      ])
    },
    [Alert]
  )

  const onSaveBlock = useCallback((block: ContentBlock) => {
    dispatch({ type: 'UPDATE_BLOCK', payload: block })
    setEditModalVisible(false)
    setEditingBlock(null)
  }, [])

  const addBlock = useCallback((type: 'header' | 'text' | 'image') => {
    const newBlock: ContentBlock = {
      id: generateId(),
      type,
      content: ''
    }
    dispatch({ type: 'ADD_BLOCK', payload: newBlock })
  }, [])

  // Save review
  const handleSave = useCallback(() => {
    if (!review.hotelName.trim()) {
      Alert.alert('Ошибка', 'Введите название отеля')
      return
    }
    // @ts-ignore
    onSave(review)
  }, [review, Alert, onSave])

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onCancel}>
      <SafeAreaView style={[styles.container, { width: utils.isMobile ? width : width / 2, alignSelf: 'center', height: '84%', marginTop: utils.isMobile ? 0 : 60, borderRadius: 10 }]}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboardView}>
          {/* Web file input */}
          {Platform.OS === 'web' && <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />}

          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onCancel} style={styles.headerButton}>
              <Text style={[styles.headerButtonText, styles.closeButton]}>Отмена</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Редактор обзора</Text>
            <TouchableOpacity onPress={handleSave} style={styles.headerButton}>
              <Text style={[styles.headerButtonText, styles.saveButton]}>Сохранить</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Hotel name */}
            <View style={styles.hotelNameContainer}>
              <Text style={styles.label}>Название отеля</Text>
              <TextInput
                // @ts-ignore
                style={styles.hotelNameInput}
                value={review.hotelName}
                onChangeText={text => dispatch({ type: 'SET_HOTEL_NAME', payload: text })}
                placeholder="Введите название отеля"
                placeholderTextColor="#999"
              />
            </View>

            {/* Blocks */}
            <View style={styles.blocksContainer}>
              <Text style={styles.label}>Содержание обзора</Text>
              {review.blocks.map(block => (
                <BlockRenderer key={block.id} block={block} onEdit={onEdit} onRemove={onRemove} onImagePress={() => showImagePickerOptionsOverride(block.id)} />
              ))}
            </View>

            {/* Add panel */}
            <AddPanel onAddBlock={addBlock} onAddImage={() => showImagePickerOptionsOverride()} />

            {/* Bottom padding */}
            <View style={styles.bottomPadding} />
          </ScrollView>

          {/* Edit modal */}
          <EditModal
            // @ts-ignore
            visible={editModalVisible}
            editingBlock={editingBlock}
            onClose={() => setEditModalVisible(false)}
            onSave={onSaveBlock}
            onImagePicker={showImagePickerOptionsOverride}
          />
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  )
}

export default HotelReviewEditor
