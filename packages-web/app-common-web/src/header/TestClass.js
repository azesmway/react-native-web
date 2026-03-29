import { memo, useEffect, useMemo, useState } from 'react'
import { Text, View } from 'react-native'

const TestClass = () => {
  const [isLoadingIFrame, setIsLoadingIFrame] = useState(true)
  const [isRender, setIsRender] = useState(false)

  useEffect(() => {
    setIsRender(true)
  }, [])

  return useMemo(() => {
    if (!isLoadingIFrame) return null

    return <View>{isRender ? <Text>lkjfglkdfjglkfd</Text> : <Text>8236483246827346</Text>}</View>
  }, [isLoadingIFrame, isRender])
}

export default memo(TestClass)
