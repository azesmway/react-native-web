import { useEffect, useRef, useState } from 'react'

import MainHeader from './MainHeader'

export default function ViewPlaceComponent(props) {
  const [isLoading, setLoading] = useState(true)
  const module = useRef(undefined)

  const loadModules = async () => {
    const { connectActionSheet } = await import('@expo/react-native-action-sheet')
    module.current = {
      ...module.current,
      connectActionSheet: connectActionSheet
    }
  }

  useEffect(() => {
    loadModules().then(() => setLoading(false))
  }, [])

  if (isLoading) {
    return <></>
  }

  const { connectActionSheet } = module.current

  const MainHeaderWithProps = connectActionSheet(MainHeader)

  return <MainHeaderWithProps {...props} />
}
