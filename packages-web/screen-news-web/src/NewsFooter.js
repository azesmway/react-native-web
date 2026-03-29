import isEmpty from 'lodash/isEmpty'
import { useCallback, useMemo } from 'react'
import { Linking, Platform, Text, TouchableOpacity, View } from 'react-native'

const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
const { MAIN_COLOR } = GLOBAL_OBJ.onlinetur.constants

// Extracted constants
const FORM_CONFIG = {
  URL: 'https://zagrebon.com/add-news/prefill?transfer_to=43',
  CATEGORY_ID: '184',
  TAG_HOTEL_NEWS: 'новости_отелей'
}

const FAB_BASE_STYLE = {
  position: 'absolute',
  width: 140,
  bottom: Platform.OS === 'web' ? 20 : 70,
  opacity: 0.8,
  padding: 10,
  alignItems: 'center',
  borderRadius: 20,
  backgroundColor: MAIN_COLOR,
  shadowColor: '#000',
  shadowOffset: {
    width: 2,
    height: 3
  },
  shadowOpacity: 0.25,
  shadowRadius: 3.84,
  elevation: 5
}

// Helper function to create form fields - moved outside component
const createHiddenField = (name, value) => {
  if (Platform.OS === 'web') {
    const field = document.createElement('input')
    field.setAttribute('type', 'hidden')
    field.setAttribute('name', name)
    field.setAttribute('value', value)
    return field
  } else {
    return null
  }
}

function NewsFooter({ hotel, user, currentCategory, utils }) {
  const { t, AnimatedFAB, FAB } = utils

  // Optimized with helper method and better structure
  const createNews = useCallback(() => {
    if (Platform.OS === 'web') {
      const form = document.createElement('form')
      form.setAttribute('method', 'post')
      form.setAttribute('action', FORM_CONFIG.URL)
      form.setAttribute('target', 'view')

      // Use array of field configs for cleaner code
      const fields = [
        { name: 'category_id', value: FORM_CONFIG.CATEGORY_ID },
        { name: 'country_code', value: hotel && hotel.cc ? hotel.cc : '' },
        { name: 'area', value: '' },
        { name: 'tags[]', value: FORM_CONFIG.TAG_HOTEL_NEWS },
        { name: 'tags[]', value: hotel && hotel.tagname ? hotel.tagname : '' },
        { name: 'tags[]', value: hotel && hotel.id ? `hotel_${hotel.id}` : '' },
        { name: 'email', value: user.login },
        { name: 'hash_rt', value: user.hash_rt || '' }
      ]

      // Append all fields
      fields.forEach(({ name, value }) => {
        form.appendChild(createHiddenField(name, value))
      })

      document.body.appendChild(form)
      window.open('', 'view')
      form.submit()
    }
  }, [hotel, user])

  const openLink = useCallback(
    url => {
      let addUrl
      if (user?.id_user) {
        const email = btoa(user.login)
        const name = btoa(encodeURI(user.my_name))
        addUrl = `${url}&ue=${email}&uk=${user.hash_ml}&un=${name}`
      } else {
        addUrl = `${url}&ue=&uk=&un=`
      }

      Linking.openURL(addUrl, '_blank')
    },
    [user]
  )

  // Memoize to avoid recreating on each render
  const handleNewsClick = useCallback(() => {
    !isEmpty(hotel) ? createNews() : openLink(currentCategory.url_add_news)
  }, [hotel, currentCategory, createNews, openLink])

  const handleReviewsClick = useCallback(() => {
    !isEmpty(hotel) ? createNews() : openLink(currentCategory.url_add_obzor)
  }, [hotel, currentCategory, createNews, openLink])

  // Memoize labels to avoid recalculation
  const newsLabel = useMemo(() => t('screens.screennews.newsfooter.news'), [t])
  const reviewsLabel = useMemo(() => t('screens.screennews.newsfooter.reviews'), [t])

  return (
    <View style={{ position: 'absolute', height: 80, width: '100%', bottom: 0, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20 }}>
      <TouchableOpacity style={{ ...FAB_BASE_STYLE, left: 20 }} onPress={handleNewsClick}>
        <Text style={{ color: '#fff', fontSize: 18 }}>{newsLabel}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={{ ...FAB_BASE_STYLE, right: 20 }} onPress={handleReviewsClick}>
        <Text style={{ color: '#fff', fontSize: 18 }}>{reviewsLabel}</Text>
      </TouchableOpacity>
    </View>
  )
}

export default NewsFooter
