import { Platform, StyleSheet } from 'react-native'

export const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    ...Platform.select({
      web: {
        boxShadow: '0 2px 8px rgba(0,0,0,0.5)'
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2
      }
    })
  },
  modalButtonText: {
    color: '#494949',
    fontSize: 16,
    fontWeight: '500'
  },
  keyboardView: {
    flex: 1
  },
  // Шапка как в iOS
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f8f8f8',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(60, 60, 67, 0.08)',
    borderRadius: 10
  },
  headerButton: {
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  headerButtonText: {
    fontSize: 17,
    color: '#007AFF',
    fontWeight: '400'
  },
  saveButton: {
    fontWeight: '600'
  },
  closeButton: {
    color: 'red'
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000'
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 10
  },
  scrollContent: {
    padding: 16
  },
  // Поле ввода названия отеля
  hotelNameContainer: {
    marginBottom: 24
  },
  hotelNameInput: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 17,
    color: '#000000',
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        fontWeight: '400'
      },
      web: {
        outlineStyle: 'none'
      }
    }),
    borderWidth: 0.5,
    borderRadius: 10,
    borderColor: 'rgba(60, 60, 67, 0.08)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 8
      },
      android: {
        elevation: 2
      },
      web: {
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
        transition: 'all 0.2s ease',
        ':hover': {
          borderColor: 'rgba(0, 122, 255, 0.3)',
          boxShadow: '0 4px 12px rgba(0,122,255,0.1)'
        }
      }
    })
  },
  // Контейнер для блоков
  blocksContainer: {
    marginBottom: 24
  },
  // Стиль блока (карточка)
  blockContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(60, 60, 67, 0.08)',
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 8
      },
      android: {
        elevation: 2
      },
      web: {
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
        transition: 'all 0.2s ease',
        ':hover': {
          borderColor: 'rgba(0, 122, 255, 0.3)',
          boxShadow: '0 4px 12px rgba(0,122,255,0.1)'
        }
      }
    })
  },
  // Текст заголовка
  headerText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
    letterSpacing: -0.3
  },
  // Текст абзаца
  textBlock: {
    fontSize: 17,
    lineHeight: 24,
    color: '#000000',
    fontWeight: '400',
    letterSpacing: -0.2
  },
  // Подсказка для редактирования
  blockHint: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 8,
    fontWeight: '400'
  },
  // Блок с изображением
  imageBlock: {
    width: 300,
    aspectRatio: 4 / 3,
    borderRadius: 12,
    backgroundColor: '#F2F2F6'
  },
  // Пустой блок с изображением
  emptyImage: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F6',
    borderWidth: 1,
    borderColor: 'rgba(60, 60, 67, 0.08)',
    borderStyle: 'dashed'
  },
  emptyImageText: {
    color: '#8E8E93',
    fontSize: 15,
    marginTop: 8
  },
  plusIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8
      },
      android: {
        elevation: 4
      }
    })
  },
  plusIcon: {
    fontSize: 24,
    color: '#007AFF',
    lineHeight: 28
  },
  // Кнопка удаления (крестик)
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(60, 60, 67, 0.1)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4
      },
      android: {
        elevation: 3
      },
      web: {
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        cursor: 'pointer'
      }
    })
  },
  removeButtonText: {
    color: 'red',
    fontSize: 14,
    fontWeight: '400'
  },
  // Панель добавления блоков
  addPanel: {
    backgroundColor: '#F2F2F6',
    borderRadius: 16,
    padding: 20
  },
  addPanelTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.8
  },
  addButtons: {
    flexDirection: 'row',
    gap: 12
  },
  addButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4
      },
      android: {
        elevation: 1
      }
    })
  },
  addButtonEmoji: {
    fontSize: 20,
    marginBottom: 6
  },
  addButtonText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '500'
  },
  addHeaderButton: {
    // специальные стили не нужны
  },
  addTextButton: {
    // специальные стили не нужны
  },
  addImageButton: {
    // специальные стили не нужны
  },
  bottomPadding: {
    height: 30
  },

  // === МОДАЛЬНОЕ ОКНО В СТИЛЕ APPLE ===
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 30
      },
      android: {
        elevation: 20
      },
      web: {
        boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
      }
    })
  },
  modalHandle: {
    width: 36,
    height: 5,
    backgroundColor: '#E5E5EA',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 20
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 20,
    textAlign: 'center'
  },
  modalInput: {
    backgroundColor: '#F2F2F6',
    borderRadius: 12,
    padding: 16,
    fontSize: 17,
    color: '#000000',
    minHeight: 120,
    textAlignVertical: 'top',
    borderWidth: 0,
    marginBottom: 20
  },
  modalImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: '#F2F2F6'
  },
  emptyModalImage: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F6'
  },
  emptyModalImageText: {
    color: '#8E8E93',
    fontSize: 16
  },
  imagePickerButton: {
    backgroundColor: '#F2F2F6',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 20
  },
  imagePickerButtonText: {
    color: '#007AFF',
    fontSize: 17,
    fontWeight: '500'
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  modalCancelButton: {
    backgroundColor: '#F2F2F6',
    padding: 10,
    borderRadius: 10
  },
  modalCancelButtonText: {
    color: '#007AFF',
    fontSize: 17,
    fontWeight: '500'
  },
  modalSaveButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 10
  },
  modalSaveButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600'
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B6B8B',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.8
  }
})
