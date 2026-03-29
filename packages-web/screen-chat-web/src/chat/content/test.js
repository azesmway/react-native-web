import { useState } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

const TestView = () => {
  const [h, setH] = useState(30)

  return (
    <View style={{ height: h }}>
      <Text>{'kjsdfklsdjflkslkdfjsd'}</Text>
      <TouchableOpacity onPress={() => setH(h + 10)}>
        <Text>+</Text>
      </TouchableOpacity>
    </View>
  )
}

export default TestView
