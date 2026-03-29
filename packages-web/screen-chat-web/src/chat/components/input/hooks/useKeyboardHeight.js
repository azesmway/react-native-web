import { useEffect, useMemo, useState } from 'react'
import { Keyboard } from 'react-native'

export const useKeyboardHeight = () => {
  const [keyboardHeight, setKeyboardHeight] = useState(0)
  const [position, setPosition] = useState('absolute')

  useEffect(() => {
    const showListener = Keyboard.addListener('keyboardDidShow', event => {
      setKeyboardHeight(event.endCoordinates.height)
      setPosition('absolute')
    })

    const hideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0)
      setPosition('absolute')
    })

    return () => {
      showListener?.remove()
      hideListener?.remove()
    }
  }, [])

  // Мемоизируем возвращаемый объект
  const result = useMemo(() => ({ keyboardHeight, position }), [keyboardHeight, position])

  return result
}
