import isEmpty from 'lodash/isEmpty'
import orderBy from 'lodash/orderBy'
import uniqBy from 'lodash/uniqBy'
import { Platform } from 'react-native'

const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
const { getAppConstants, getPlayerText } = GLOBAL_OBJ.onlinetur.storage

class NewsController {
  constructor(component, props) {
    this.c = component
    this.newsprops = props
  }

  initVoice = async () => {
    const { Tts } = this.newsprops

    this.Tts = Tts
    this.Tts.getInitStatus().then(
      async () => {
        await this.Tts.setDefaultLanguage('ru-RU')
      },
      err => {
        if (err.code === 'no_engine') {
          this.Tts.requestInstallEngine()
        }
      }
    )
    this.Tts.addEventListener('tts-pause', event => console.log('pause', event))
    this.Tts.addEventListener('tts-start', event => console.log('start', event))
    this.Tts.addEventListener('tts-finish', event => {
      this.Tts.pause()
      setTimeout(() => {
        this.Tts.resume()
        if (this.c.state.voice) {
          this.voiceNews(true)
        }
      }, 1000)
    })
  }

  voiceNews = async voice => {
    const { news } = this.c.props
    const { count } = this.c.state

    if (!voice) {
      this.c.setState(prevState => ({ ...prevState, count: 0, voice: false }))
      this.Tts.stop()

      return
    }

    const totalSpeak = news.filter(item => item.speak === true)

    if (count === totalSpeak.length) {
      this.c.setState(prevState => ({ ...prevState, count: 1, voice: true }))
      this.voiceOneNews(totalSpeak[0], voice)
    } else {
      this.c.setState(prevState => ({ ...prevState, count: count + 1, voice: true }))
      this.voiceOneNews(totalSpeak[count], voice)
    }
  }

  voiceOneNews = (news, voice) => {
    const { t, moment } = this.newsprops

    if (!voice || !news) {
      this.Tts.stop()
      return
    }

    const cleanText = text => text.replace(/[^0-9а-яА-Я.,: ]/g, '')

    const titleText = cleanText(`${t('screens.screennews.controller.flatlist.title')}${moment(news.published_at).format('DD MMMM YYYY')} ${news.title} `)

    this.Tts.speak(titleText)

    news.content
      .filter(item => item.type === 'text')
      .forEach(item => {
        const contentText = cleanText(item.string)
        this.Tts.speak(contentText)
      })

    this.Tts.speak(getPlayerText())
  }

  handleCloseNewsMenu = () => {
    this.c.setState(prevState => ({ ...prevState, isMenuOpen: null }))
  }

  handleOpenMenu = event => {
    const { x, y } = event
    this.c.setState(prevState => ({ ...prevState, isMenuOpen: { x, y } }))
  }

  selectMenu = async (menu, i) => {
    const { chatServiceGet } = this.newsprops
    const { user, setMenu, setNews } = this.c.props

    this.c.setState(prevState => ({ ...prevState, menu, isLoading: true, isMenuOpen: null }))

    if (!isEmpty(user) && menu[i].tip !== 999) {
      const result = await chatServiceGet.changeTypeNews(user.device.token, user.android_id_install, menu[i].id, menu[i].is_check)
      if (result.code === 0) {
        setMenu(menu)
        setNews([])
        await this.initDataNews(0, menu)
      }
    } else {
      setMenu(menu)
      setNews([])
      await this.initDataNews(0, menu)
    }
  }

  getHotelNews = async id => {
    this.c.setState(prevState => ({ ...prevState, isLoading: true }))

    const url = `${getAppConstants().url_news}/api/publications/filter/byTag?tag=hotel_${id}&lim=30`
    const news = await this.getJsonNews(url)

    if (news.result === 'fail') {
      this.c.setState(prevState => ({ ...prevState, hotelNews: [], isLoading: false }))
      return
    }

    const newsWithSpeak = news.map(item => ({ ...item, speak: true }))
    this.c.setState(prevState => ({ ...prevState, hotelNews: newsWithSpeak, isLoading: false }))
  }

  addNullNews = () => {
    const { menu } = this.c.props
    this.c.setState(prevState => ({ ...prevState, curNews: [], isLoading: false, menu }))
  }

  onPressNews = item => {
    const { history } = this.c.props
    history(`/n/${item.id}`)
  }

  getJsonNews = async url => {
    const { chatServiceGet } = this.newsprops

    return chatServiceGet
      .fetch(url, { method: 'get' })
      .then(response => response)
      .catch(error => error.message)
  }

  onCancelThemes = () => {
    this.c.setState(prevState => ({ ...prevState, visibleTheme: false }))
  }

  onSelectThemes = theme => {
    const { history } = this.c.props

    this.c.setState(prevState => ({ ...prevState, visibleTheme: false }))
    history(theme === 'null' ? '/l' : `/l/${theme.id}`)
  }

  openThemeDialog = () => {
    this.c.setState(prevState => ({ ...prevState, isMenuOpen: null, visibleTheme: true }))
  }

  initDataNews = async (offset = 0, userMenu = []) => {
    const { AppData, chatServiceGet, rtkQuery } = this.newsprops
    const { user, currentCategory, setMenu, setNewsAdd, setNewsNew, isConnect, pathname, setNewsHotel, offline, setUser, fcmToken, expoToken, device } = this.c.props
    const internetOnline = Platform.OS === 'web' ? !offline : isConnect
    let hotelView = {}

    if (internetOnline) {
      const { setAppNewsBackground } = AppData

      try {
        const result = await setAppNewsBackground(user, currentCategory, userMenu, offset, false, pathname, fcmToken, expoToken, device)

        setMenu(result.menu)

        if (result.news?.length > 0) {
          const sortedNews = orderBy(result.news, ['id'], ['desc'])
          offset === 0 ? setNewsNew(sortedNews) : setNewsAdd(sortedNews)
        }

        if (pathname.indexOf('/h/') > -1) {
          hotelView = await chatServiceGet.getViewHotel(Number(pathname.replace('/l/h/', '')))
          setNewsHotel(orderBy(result.newsHotel, ['id'], ['desc']))
        }

        this.c.setState(prevState => ({ ...prevState, isLoading: false, refreshing: false, isLoadingEarlier: false, hotelView }))
      } catch (e) {
        console.log('AppData.setAppNewsBackground', e)
      }
    } else {
      this.c.setState(prevState => ({ ...prevState, isLoading: false, refreshing: false, isLoadingEarlier: false, hotelView }))
    }

    if (user?.id_user) {
      const result = await rtkQuery.getRTKQueryDataPosts(user.android_id_install, user.device.token, fcmToken, currentCategory.id, expoToken, device.url)

      const newUser = {
        ...user,
        hotels_user: result.hotels_user,
        hash_rt: result.hash_rt || '2',
        hash_ml: result.hash_ml || '2'
      }

      setUser?.(newUser)
    }
  }

  GetFilename = url => {
    if (!url) return ''

    const match = url.toString().match(/.*\/(.+?)\./)
    return match?.[1] || ''
  }

  addCurNews = (news, toEnd = true) => {
    const { menu, userMenu } = this.c.props

    news = isEmpty(news) ? this.c.props.news : news

    const newMenu = menu.concat(userMenu)
    const menuUser = newMenu.filter(item => item.is_check === 1).map(item => this.GetFilename(item.url))

    const newNews = news.length > 0 ? news.filter(n => menuUser.includes(n.channel) && n.deleted === 0) : []

    this.c.setState(previousState => ({
      curNews: toEnd ? uniqBy([...previousState.curNews, ...newNews], 'id') : uniqBy([...newNews, ...previousState.curNews], 'id'),
      isLoading: false
    }))
  }

  setCurNews = curMenu => {
    const { news } = this.c.props

    const menuUser = curMenu.filter(item => item.is_check === 1).map(item => this.GetFilename(item.url))

    const newNews = news.length > 0 ? news.filter(n => menuUser.includes(n.channel) && n.deleted === 0) : []

    this.c.setState(prevState => ({ ...prevState, curNews: newNews, isLoading: false }))
  }
}

export default NewsController
