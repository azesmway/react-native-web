import { usePathname, useRouter } from 'expo-router'
import { useMemo } from 'react'
import { Platform, Text, TouchableOpacity } from 'react-native'

const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
const { MAIN_COLOR } = GLOBAL_OBJ.onlinetur.constants

// Screens that should not display title
const EXCLUDED_SCREENS = new Set(['bonus', 'news', 'article', 'profile', 'list_hotels', 'final_hotels', 'my-rating', 'map', 'actions_hotels', 'actions_hotel', 'my_bron', 'view', 'contacts', 'geomap'])

const titleStyle = {
  color: MAIN_COLOR,
  fontSize: 16,
  fontWeight: 'bold'
}

const subtitleStyle = {
  color: 'rgb(87,120,147)'
}

const CenterHeader = () => {
  const pathname = usePathname()
  const router = useRouter()
  const params = GLOBAL_OBJ.onlinetur.params

  const handleHistoryPush = url => {
    if (url.includes('/h') || url.includes('/n')) {
      router.replace(url.includes('/n') ? '/l' : url)
    }
  }

  const handlePress = () => {
    if (params.screen !== 'article') {
      handleHistoryPush(pathname.replace('/view', ''))
    }
  }

  const titleContent = useMemo(() => {
    // Early return if screen should be excluded or no title
    if (EXCLUDED_SCREENS.has(params?.screen) || !params?.title) {
      return null
    }

    return (
      <TouchableOpacity onPress={handlePress}>
        <Text numberOfLines={1} ellipsizeMode="tail" style={titleStyle}>
          {params.title.toUpperCase()}
        </Text>
        {params.subtitle && <Text style={subtitleStyle}>{params.subtitle}</Text>}
      </TouchableOpacity>
    )
  }, [params?.screen, params?.title, params?.subtitle, pathname])

  return titleContent
}

export default CenterHeader
