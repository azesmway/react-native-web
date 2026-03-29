import { useCallback, useMemo } from 'react'

export const useFileOperations = () => {
  const getImageMetadata = useCallback(async blobUrl => {
    return new Promise(resolve => {
      const image = new Image()
      image.onload = () => {
        resolve({
          width: image.naturalWidth ?? image.width,
          height: image.naturalHeight ?? image.height
        })
      }
      image.onerror = () => resolve({ width: 0, height: 0 })
      image.src = blobUrl
    })
  }, []) // Нет зависимостей

  const readFileAsBase64 = useCallback(async file => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onerror = () => {
        reject(new Error('Failed to read the selected media because the operation failed.'))
      }
      reader.onload = event => {
        const result = event.target?.result
        if (typeof result !== 'string') {
          reject(new Error('Failed to read file as base64'))
          return
        }
        resolve(result.split(',')[1])
      }
      reader.readAsDataURL(file)
    })
  }, []) // Нет зависимостей

  const readFile = useCallback(
    async (targetFile, options) => {
      const mimeType = targetFile.type
      const baseUri = URL.createObjectURL(targetFile)

      if (!mimeType.startsWith('image/')) {
        throw new Error(`Unsupported file type: ${mimeType}. Only images are supported.`)
      }

      const metadata = await getImageMetadata(baseUri)
      const base64 = options.base64 ? await readFileAsBase64(targetFile) : null

      // Не создаем новый объект каждый раз, а возвращаем результат
      return {
        uri: baseUri,
        width: metadata.width,
        height: metadata.height,
        type: 'image',
        mimeType,
        fileName: targetFile.name,
        fileSize: targetFile.size,
        file: targetFile,
        ...(base64 && { base64 })
      }
    },
    [getImageMetadata, readFileAsBase64] // Зависимости стабильны
  )

  // Мемоизируем возвращаемый объект методов
  const operations = useMemo(
    () => ({
      readFile,
      getImageMetadata,
      readFileAsBase64
    }),
    [readFile, getImageMetadata, readFileAsBase64]
  )

  return operations
}
