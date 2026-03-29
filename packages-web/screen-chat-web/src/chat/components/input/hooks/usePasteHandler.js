import { useEffect } from 'react'
import { Platform } from 'react-native'

const GLOBAL_OBJ = Platform.OS === 'web' ? window : global

export const usePasteHandler = (readFile, mobile) => {
  useEffect(() => {
    if (Platform.OS !== 'web') return

    const handlePaste = async event => {
      if (event.clipboardData.files.length === 0) return

      event.preventDefault()
      const validTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/gif', 'application/pdf']
      const items = Array.from(event.clipboardData.files).filter(f => validTypes.includes(f.type))

      if (items.length === 0) return

      try {
        const files = await Promise.all(items.map(f => readFile(f, { base64: true })))
        const processed = await mobile.setExifImages(files)
        const chat = GLOBAL_OBJ.onlinetur.currentComponent
        mobile.addImagesToChat(chat, processed)
      } catch (err) {
        console.error('Error processing pasted files:', err)
      }
    }

    window.addEventListener('paste', handlePaste)
    return () => window.removeEventListener('paste', handlePaste)
  }, [readFile, mobile]) // Зависимости стабильны
}
