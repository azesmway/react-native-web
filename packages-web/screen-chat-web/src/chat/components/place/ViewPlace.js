import compact from 'lodash/compact'
import isEmpty from 'lodash/isEmpty'
import split from 'lodash/split'
import { useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, Appearance, Dimensions, ScrollView, View } from 'react-native'

const parseIdPlace = pathname => {
  const url = compact(split(pathname, '/'))
  return url[2] === 'p' ? url[3] : ''
}

function ViewPlace({ utils, user, pathname }) {
  const { chatServiceGet, theme, RenderHTML } = utils

  const isDarkMode = Appearance.getColorScheme() === 'dark'
  const colors = isDarkMode ? theme.dark.colors : theme.light.colors
  const { background: bg, text: txt } = colors

  const { width } = Dimensions.get('window')

  const tagsStyles = useMemo(() => ({ body: { color: txt } }), [txt])

  const [place, setPlace] = useState({})
  const [isLoading, setLoading] = useState(true)

  useEffect(() => {
    const initData = async () => {
      const idPlace = parseIdPlace(pathname)
      const android_id_install = user?.android_id_install ?? ''
      const token = user?.device?.token ?? ''

      const result = await chatServiceGet.getViewPlace(idPlace, android_id_install, token)

      if (!isEmpty(result)) setPlace(result)
      setLoading(false)
    }

    initData().then()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const subject = useMemo(() => place?.content?.find(item => item.type === 'text'), [place])

  if (isLoading) return <ActivityIndicator />

  return (
    <ScrollView style={{ flex: 1 }}>
      {subject?.string && (
        <View style={{ padding: 10, width: '100%' }}>
          <RenderHTML contentWidth={width} source={{ html: subject.string }} tagsStyles={tagsStyles} />
        </View>
      )}
      <View style={{ height: 200 }} />
    </ScrollView>
  )
}

export default ViewPlace
