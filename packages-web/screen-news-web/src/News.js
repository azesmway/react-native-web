import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ActivityIndicator, Dimensions, FlatList, ImageBackground, Platform, Text, View } from 'react-native'

import bg from '../images/bgnews.jpeg'
import NewsController from './controller/NewsController'
import NewsFooter from './NewsFooter'
import NewsItem from './NewsItem'
import NewsMenu from './NewsMenu'

const { height } = Dimensions.get('window')

// Constants extracted outside component
const OVERLAY_STYLE = {
  position: 'absolute',
  width: '100%',
  height: '100%',
  opacity: 0.5,
  backgroundColor: '#fff'
}

const LIST_STYLE = {
  width: '100%',
  height: height - 55
}

const LIST_CONTENT_STYLE = {
  alignItems: 'center'
}

const ITEM_CONTAINER_STYLE = {
  width: '100%',
  padding: 5,
  backgroundColor: 'transparent'
}

const LOADING_CONTAINER_STYLE = {
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center'
}

const EMPTY_CONTAINER_STYLE = {
  width: '100%',
  height: height - 55,
  alignItems: 'center',
  justifyContent: 'center'
}

const EMPTY_TEXT_STYLE = {
  fontSize: 18,
  color: '#000'
}

const ACTIVITY_INDICATOR_STYLE = {
  alignSelf: 'center',
  position: 'absolute',
  left: 0,
  right: 0,
  bottom: 20
}

const THRESHOLD_CONFIG = {
  MIN_NEWS_COUNT: 28,
  PAGINATION_SIZE: 30,
  END_REACHED_THRESHOLD: 0.9,
  MIN_FOR_PAGINATION: 29
}

const News = props => {
  const { history, currentCategory, pathname, user, news, menu, newsHotel, setNewsHotel, setHeaderParams, setFooterBar, utils, setNews } = props

  const [state, setState] = useState({
    isLoading: true,
    isMenuOpen: null,
    refreshing: false,
    voice: false,
    count: 0,
    isLoadingEarlier: false,
    hotelView: {}
  })

  const offsetRef = useRef(0)
  const msgVoiceRef = useRef(null)
  const speechEndHandlerRef = useRef(null)
  const controllerRef = useRef(null)

  // Initialize controller only once
  if (!controllerRef.current) {
    controllerRef.current = new NewsController({ setState, state, props }, utils)
  }

  // Helper functions
  const cleanText = useCallback(text => text.replace(/[^0-9а-яА-Я.,: ]/g, ''), [])

  const buildSpeechText = useCallback(
    newsSpeak => {
      let text = cleanText(newsSpeak.title) + ' '

      for (let j = 0; j < newsSpeak.content.length; j++) {
        if (newsSpeak.content[j].type === 'text') {
          text += cleanText(newsSpeak.content[j].string)
        }
      }

      return text
    },
    [cleanText]
  )

  const voiceHandle = useCallback(
    voice => {
      if (voice) {
        const totalSpeak = news.filter(item => item.speak === true)

        if (totalSpeak.length === 0) {
          return
        }

        const newsSpeak = totalSpeak[state.count ? state.count : 0]
        const text = buildSpeechText(newsSpeak)

        // Remove previous event listener to prevent memory leaks
        if (speechEndHandlerRef.current) {
          msgVoiceRef.current.removeEventListener('end', speechEndHandlerRef.current)
        }

        speechEndHandlerRef.current = () => {
          setState(prevState => ({
            ...prevState,
            count: prevState.count + 1 === totalSpeak.length ? 0 : prevState.count + 1
          }))
        }

        msgVoiceRef.current.addEventListener('end', speechEndHandlerRef.current)

        msgVoiceRef.current.text = text
        msgVoiceRef.current.volume = 1
        msgVoiceRef.current.lang = 'ru-RU'
        msgVoiceRef.current.pitch = 1
        msgVoiceRef.current.rate = 1

        window.speechSynthesis.speak(msgVoiceRef.current)
      } else {
        window.speechSynthesis.cancel()
      }
    },
    [news, state.count, buildSpeechText]
  )

  const getParams = useCallback(() => {
    const { t } = utils
    const { isMenuOpen, voice } = state

    const params = {
      title: t('screens.screennews.news.title'),
      subtitle: t('screens.screennews.news.subtitle'),
      screen: 'news',
      handleOpenMenu: controllerRef.current.handleOpenMenu,
      isMenuOpen,
      menuNews: menu,
      selectMenu: controllerRef.current.selectMenu,
      badge: 0,
      voice,
      setVoice: () => {
        setState(prevState => {
          const newVoice = !prevState.voice
          return { ...prevState, voice: newVoice }
        })
      }
    }

    setHeaderParams(params)
  }, [menu, setHeaderParams, utils, state.isMenuOpen, state.voice])

  // Initialize speech synthesis
  useEffect(() => {
    if (Platform.OS === 'web') {
      // eslint-disable-next-line no-undef
      msgVoiceRef.current = new SpeechSynthesisUtterance()
    } else {
      controllerRef.current.initVoice()
    }
  }, [])

  // Component mount
  useEffect(() => {
    getParams()
    setFooterBar({})
    controllerRef.current.initDataNews(0, menu)
  }, [])

  // Update getParams when voice changes
  useEffect(() => {
    getParams()

    if (Platform.OS === 'web') {
      voiceHandle(state.voice)
    } else {
      controllerRef.current.voiceNews(state.voice)
    }
  }, [state.voice])

  const onPressNews = useCallback(
    item => {
      history('/n/' + item.id)
    },
    [history]
  )

  const onEndReached = useCallback(() => {
    if (news.length < THRESHOLD_CONFIG.MIN_NEWS_COUNT || state.isLoadingEarlier) {
      return
    }

    setState(prevState => ({ ...prevState, isLoadingEarlier: true }))
    offsetRef.current += THRESHOLD_CONFIG.PAGINATION_SIZE
    controllerRef.current.initDataNews(offsetRef.current)
  }, [news.length, state.isLoadingEarlier])

  const clearViewHotel = useCallback(() => {
    setState(prevState => ({ ...prevState, hotelView: {} }))
  }, [])

  const changeSpeak = item => {
    const curNewsArray = news.map(newsItem => (newsItem.id === item.id ? { ...newsItem, speak: !newsItem.speak } : newsItem))

    setNews(curNewsArray)
  }

  const renderItem = useCallback(
    ({ item, index }) => (
      <View style={ITEM_CONTAINER_STYLE}>
        <NewsItem item={item} index={index} changeSpeak={changeSpeak} onPressNews={onPressNews} id_user={user.id_user} utils={utils} />
      </View>
    ),
    [onPressNews, user.id_user, utils, news]
  )

  const keyExtractor = useCallback((item, index) => index.toString(), [])

  const renderEmpty = useCallback(
    () => (
      <View style={EMPTY_CONTAINER_STYLE}>
        <Text style={EMPTY_TEXT_STYLE}>В данной категории новостей еще нет.</Text>
      </View>
    ),
    []
  )

  // Component unmount
  useEffect(() => {
    return () => {
      if (Platform.OS === 'web') {
        window.speechSynthesis.cancel()
        if (speechEndHandlerRef.current && msgVoiceRef.current) {
          msgVoiceRef.current.removeEventListener('end', speechEndHandlerRef.current)
        }
      }
      setHeaderParams({})
      setFooterBar({})
    }
  }, [setFooterBar, setHeaderParams])

  const data = useMemo(() => (pathname.includes('/h/') ? newsHotel : news), [pathname, newsHotel, news])

  const flatProps = useMemo(
    () =>
      data.length >= THRESHOLD_CONFIG.MIN_FOR_PAGINATION
        ? {
            onEndReached,
            onEndReachedThreshold: THRESHOLD_CONFIG.END_REACHED_THRESHOLD
          }
        : {},
    [data.length, onEndReached]
  )

  return (
    <ImageBackground source={bg} resizeMode="cover" style={LIST_STYLE}>
      <View style={OVERLAY_STYLE} />
      {state.isLoading && news.length === 0 ? (
        <View style={LOADING_CONTAINER_STYLE}>
          <Text>Загрузка данных...</Text>
        </View>
      ) : (
        <FlatList style={LIST_STYLE} contentContainerStyle={LIST_CONTENT_STYLE} data={data} renderItem={renderItem} keyExtractor={keyExtractor} ListEmptyComponent={renderEmpty} {...flatProps} />
      )}
      <NewsMenu
        selectMenu={controllerRef.current.selectMenu}
        isNews={true}
        handleCloseNewsMenu={controllerRef.current.handleCloseNewsMenu}
        isMenuOpen={state.isMenuOpen}
        menuNews={menu}
        hotelView={state.hotelView}
        history={history}
        user={user}
        setNewsHotel={setNewsHotel}
        clearViewHotel={clearViewHotel}
        utils={utils}
      />
      <NewsFooter history={history} currentCategory={currentCategory} voiceNews={controllerRef.current.voiceNews} voice={state.voice} hotel={state.hotelView} user={user} utils={utils} />
      {state.isLoadingEarlier && <ActivityIndicator size="large" style={ACTIVITY_INDICATOR_STYLE} />}
    </ImageBackground>
  )
}

export default News
