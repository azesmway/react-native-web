/**
 * -----------------------------------------------------------------------
 *  Author      : Alexey Zolotarеv
 *  E-mail      : azesm@me.com
 * -----------------------------------------------------------------------
 */

import compact from 'lodash/compact'
import isArray from 'lodash/isArray'
import isEmpty from 'lodash/isEmpty'
import split from 'lodash/split'
import { Linking, Platform } from 'react-native'

import { dataHotelsList, dataHotelsListSearch, dataHotelsListWithPage, dataPlacesList, fetchAddPost, fetchBan, fetchCategoryNewsBG, fetchWarning, getJsonNews, getViewHotel } from '../get/fetch'
import { fetchFavorite, fetchLike } from '../post/fetch'
import { getRTKQueryCategoryList, getRTKQueryDataPosts, getRTKQueryDataPostsAgent, getRTKQueryRatingCategory } from '../rtkQuery'

const GLOBAL_OBJ = Platform.OS === 'web' ? window : global

/**
 * Загружаем категории чатов
 * @returns {Promise<void>}
 * @param initData
 * @param setCategories
 * @param currentCategory
 * @param idCategory
 * @param changeCriteria
 */
export const setAppCategories = async (initData, setCategories, currentCategory, idCategory = 0, changeCriteria = undefined) => {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    getRTKQueryCategoryList(initData.android_id_install, initData.token).then(result => {
      if (result.code === 0) {
        setCategories(result.data)

        getRTKQueryRatingCategory(!currentCategory || !currentCategory.id ? result.data[idCategory] : currentCategory.id).then(async rating => {
          if (rating) {
            const { setCategoiesRatingServer } = GLOBAL_OBJ.onlinetur.storage

            setCategoiesRatingServer(rating)

            if (changeCriteria) {
              changeCriteria(rating)
            }
          }
        })

        // if (!currentCategory) {
        //   resolve(result.data[idCategory])
        // } else
        if (currentCategory && !currentCategory.id) {
          resolve(result.data[idCategory])
        } else {
          const cat = result.data.filter(function (c) {
            return c.id === currentCategory.id
          })
          resolve(cat[0])
        }
      } else {
        resolve({})
      }
    })
  })
}

/**
 * Загружаем категории чатов
 * @returns {Promise<void>}
 * @param initData
 * @param changeCriteria
 */
export const getAppCategories = async (initData, changeCriteria = undefined) => {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    getRTKQueryCategoryList(initData.android_id_install, initData.token).then(result => {
      if (result.code === 0) {
        getRTKQueryRatingCategory(initData.currentCategory.id).then(async rating => {
          if (rating) {
            const { setCategoiesRatingServer } = GLOBAL_OBJ.onlinetur.storage

            setCategoiesRatingServer(rating)

            if (changeCriteria) {
              changeCriteria(rating)
            }
          }
        })
        resolve(result.data)
      } else {
        resolve({})
      }
    })
  })
}

/**
 * Устанавливаем страны и хобби
 * @returns {Promise<void>}
 * @param initData
 * @param currentCategory
 * @param allCountries
 */
export const setAppCountries = async (initData, currentCategory, allCountries = null) => {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    getRTKQueryDataPosts(initData.android_id_install, initData.token, initData.fcmToken, currentCategory.id, initData.expoToken, initData.device.url).then(async result => {
      if (result.code === 0) {
        initData.chat.countries = result.data.filter(function (item) {
          return item.tip === 0 && item.del === 0 && item.title !== ''
        })

        if (isEmpty(initData.chat.countries)) {
          initData.chat.countries = []
        }

        initData.chat.hobby = result.data.filter(function (item) {
          return item.tip === 1 && item.del === 0 && item.id_country === null
        })

        if (isEmpty(initData.chat.hobby)) {
          initData.chat.hobby = []
        }

        if (initData.is_sotr === 1) {
          const agent = await getRTKQueryDataPostsAgent(initData.android_id_install, initData.token, initData.fcmToken, currentCategory.id, initData.expoToken, initData.device.url)

          initData.chat.agent = agent.data.filter(function (item) {
            return item.tip === 1 && item.del === 0 && item.title !== ''
          })

          initData.chat.agentTowns = agent.data.filter(function (item) {
            return item.tip === 0 && item.del === 0 && item.title !== ''
          })
        }

        if (!initData.user) {
          initData.user = {}
        }

        result.is_add_post ? (initData.user.is_add_post = result.is_add_post) : null
        result.is_admin ? (initData.user.is_admin = result.is_admin) : null
        result.is_moderator ? (initData.user.is_moderator = result.is_moderator) : null
        result.is_show_rost ? (initData.user.is_show_rost = result.is_show_rost) : null
        result.is_show_ves ? (initData.user.is_show_ves = result.is_show_ves) : null
        result.is_sotr ? (initData.user.is_sotr = result.is_sotr) : null
        result.my_city ? (initData.user.my_city = result.my_city) : null
        result.my_name ? (initData.user.my_name = result.my_name) : null
        result.note_for_user ? (initData.user.note_for_user = result.note_for_user) : null
        result.notour ? (initData.user.notour = result.notour) : null
        result.phone ? (initData.user.phone = result.phone) : null
        result.referral ? (initData.user.referral = result.referral) : null
        result.show_phone ? (initData.user.show_phone = result.show_phone) : null
        result.hotels_user ? (initData.user.hotels_user = result.hotels_user) : null
        result.hash_rt ? (initData.user.hash_rt = result.hash_rt) : null
        result.hash_ml ? (initData.user.hash_ml = result.hash_ml) : null
        result.landing ? (initData.user.landing = result.landing) : null

        let bookLimit = {}
        bookLimit.balance_summ = result.balance_summ
        bookLimit.book_limit = result.book_limit
        bookLimit.book_limit_info = result.book_limit_info

        const { setBookLimit } = GLOBAL_OBJ.onlinetur.storage
        setBookLimit(bookLimit)

        resolve(initData)
      } else {
        reject(initData)
      }
    })
  })
}

/**
 * Устанавливаем страны и хобби
 * @returns {Promise<void>}
 * @param initData
 * @param currentCategory
 */
export const setAppCountriesBackground = async (initData, currentCategory) => {
  const result = await getRTKQueryDataPosts(initData.android_id_install, initData.token, initData.fcmToken, currentCategory.id, initData.expoToken, initData.device.url)

  if (result.code === 0) {
    initData.chat.countries = result.data.filter(function (item) {
      return item.tip === 0 && item.del === 0 && item.title !== ''
    })

    if (isEmpty(initData.chat.countries)) {
      initData.chat.countries = []
    }

    initData.chat.hobby = result.data.filter(function (item) {
      return item.tip === 1 && item.del === 0 && item.id_country === null
    })

    if (isEmpty(initData.chat.hobby)) {
      initData.chat.hobby = []
    }
  }

  return initData
}

/**
 * Устанавливаем отели
 * @returns {Promise<void>}
 * @param initData
 * @param id_country
 */
export const setAppHotels = async (initData, id_country) => {
  let country = initData.chat.countries.filter(function (item) {
    return item.id === Number(id_country)
  })

  const result = await dataHotelsList(initData.android_id_install, country[0].id_country, '', 1)

  if (!isEmpty(result.h)) {
    initData.chat.hotels = result.h
  }

  return initData
}

export const setSelectedTheme = (data, history, setHotels, setFilter, countries, user, setPlaces, chatTheme, setChatTheme, currentCategory, theme, sotr, type) => {
  return new Promise(resolve => {
    if (history) {
      const android_id_install = user.device ? user.android_id_install : ''

      if (type !== 2) {
        setAppHotelsWithPage(countries, android_id_install, theme.id, 0, 100, currentCategory.id).then(hotels => {
          // @ts-ignore
          if (hotels) {
            setHotels(hotels)
          }
        })

        setAppPlacesBackground(countries, theme.id, android_id_install, currentCategory.id).then(places => {
          // @ts-ignore
          if (places) {
            setPlaces(places)
          }
        })
      }

      let url

      if (sotr) {
        if (type === 1) {
          data.selectedCountry = theme.id
          data.selectedCountryName = theme.title
          data.chatAgent = false
          data.selectedAgent = '-1'
          data.selectedAgentName = ''
          url = '/y/' + theme.id
        } else {
          data.chatAgent = true
          data.selectedAgent = theme.id
          data.selectedAgentName = theme.title
          url = '/a/' + theme.id
        }
      } else {
        data.selectedCountry = theme.id
        data.selectedCountryName = theme.title
        data.chatAgent = false
        data.selectedAgent = '-1'
        data.selectedAgentName = ''
        url = '/y/' + theme.id
      }

      setFilter(data)

      if (chatTheme === undefined || chatTheme === 0) {
        setChatTheme(1)
      }

      history(url)
    }

    resolve(true)
  })
}

/**
 * Устанавливаем отели
 * @returns {Promise<void>}
 * @param countries
 * @param android_id_install
 * @param id_country
 * @param page
 * @param size
 * @param category_id
 */
export const setAppHotelsWithPage = async (countries, android_id_install, id_country, page, size, category_id) => {
  if (id_country === '-1' || id_country === -1 || !id_country) {
    return []
  }

  let country = countries.filter(function (item) {
    return item.id === Number(id_country)
  })

  if (country && country.length > 0) {
    const result = await dataHotelsListWithPage(android_id_install, country[0].id_country, '', page, size, category_id)
    if (!isEmpty(result.h)) {
      return result.h
    }
  }

  return []
}

/**
 * Поиск отелей
 * @returns {Promise<void>}
 * @param countries
 * @param android_id_install
 * @param id_country
 * @param page
 * @param size
 * @param pattern
 */
export const setAppHotelsSearch = async (countries, android_id_install, id_country, page, size, pattern) => {
  let country = countries.filter(function (item) {
    return item.id === Number(id_country)
  })

  if (!android_id_install) {
    android_id_install = ''
  }

  const result = await dataHotelsListSearch(android_id_install, country[0].id_country, '', page, size, pattern)

  if (!isEmpty(result.h)) {
    return result.h
  }

  return []
}

/**
 * Устанавливаем отели в бэкграунде
 * @returns {Promise<void>}
 * @param countries
 * @param id_country
 * @param android_id_install
 * @param category_id
 */
export const setAppHotelsBackground = async (countries, id_country, android_id_install, category_id) => {
  if (!isEmpty(countries)) {
    let country = countries.filter(function (item) {
      return item.id === Number(id_country)
    })

    if (country[0] && country[0].id_country) {
      const result = await dataHotelsList(android_id_install, country[0].id_country, '', category_id)

      if (!isEmpty(result.h)) {
        return result.h
      }
    }
  }

  return []
}

/**
 * Устанавливаем курорты
 * @returns {Promise<void>}
 * @param initData
 * @param id_country
 */
export const setAppPlaces = async (initData, id_country, category_id) => {
  let country = initData.chat.countries.filter(function (item) {
    return item.id === Number(id_country)
  })
  const result = await dataPlacesList(initData.android_id_install, country[0].id_country, '', category_id)

  if (!isEmpty(result)) {
    initData.chat.places = result
  }

  return initData
}

/**
 * Устанавливаем курорты в бэкграунде
 * @returns {Promise<void>}
 * @param countries
 * @param id_country
 * @param android_id_install
 * @param category_id
 * @param latitude
 * @param longitude
 */
export const setAppPlacesBackground = async (countries, id_country, android_id_install, category_id, latitude = '', longitude = '') => {
  if (!isEmpty(countries)) {
    let country = countries.filter(function (item) {
      return item.id === Number(id_country)
    })

    if (country[0] && country[0].id_country) {
      const result = await dataPlacesList(android_id_install, country[0].id_country, '', category_id, latitude, longitude)

      if (!isEmpty(result)) {
        return result
      }
    }
  }

  return []
}

/**
 * Устанавливаем новости по текущей категории
 * @returns {Promise<void>}
 * @param user
 * @param currentCategory
 * @param userMenu
 * @param offset
 * @param voiceNews
 * @param pathname
 */
export const setAppNewsBackground = (user, currentCategory, userMenu, offset = 0, voiceNews = false, pathname = '', fcmToken = '', expoToken = '', device) => {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    let initData = {}
    let json = []
    let news = []
    let notifyNews = []
    initData.news = []
    initData.newsHotel = []
    initData.menu = []
    let period = ''

    if (!isEmpty(user)) {
      initData.token = !isEmpty(user.device) ? user.device.token : ''
      initData.android_id_install = user.android_id_install
      initData.fcmToken = fcmToken
      initData.expoToken = expoToken
      initData.device = device
      initData.is_sotr = user.is_sotr
    } else {
      initData.token = ''
      initData.android_id_install = ''
      initData.fcmToken = fcmToken
      initData.expoToken = expoToken
      initData.device = device
      initData.is_sotr = 0
    }

    try {
      const result = await fetchCategoryNewsBG(initData.token, initData.android_id_install, currentCategory ? currentCategory.id : 1)

      if (result.code !== 0) {
        return
      }

      if (userMenu.length === 0) {
        initData.menu = result.data
      } else {
        const { getObjectAssign } = await import('app-utils-web')

        initData.menu = getObjectAssign([], userMenu)
      }

      let allUrl = '/multiple.full.json'

      if (initData.menu && initData.menu.length > 0) {
        for (let i = 0; i < initData.menu.length; i++) {
          if (initData.menu[i] && initData.menu[i].is_check === 1 && initData.menu[i].url) {
            allUrl += (allUrl === '/multiple.full.json' ? '?' : '&') + 'url[]=' + encodeURIComponent(initData.menu[i].url)
          }
        }

        period = '&ofs=' + offset + '&lim=' + (voiceNews ? '50' : '30')
        let url = 'https://zagrebon.com' + allUrl + period

        if (pathname.indexOf('/h/') !== -1) {
          const id = pathname.split('/')[3]
          url += '&hotel=' + id

          json = await getJsonNews(url)

          if (!isArray(json)) {
            json = [json]
          }

          for (let j = 0; j < json.length; j++) {
            json[j].speak = true
            json[j].vkontakte = false
            json[j].vkontakteGroup = false
          }

          initData.newsHotel = json
          initData.notifyNews = []
        } else {
          json = await getJsonNews(url)

          if (!isArray(json)) {
            json = [json]
          }

          for (let j = 0; j < json.length; j++) {
            json[j].speak = true
            json[j].vkontakte = false
            json[j].vkontakteGroup = false
          }

          let arr = []
          for (let j = 0; j < json.length; j++) {
            if (Number(json[j].deleted) !== 1 && json[j].title !== '') {
              arr.push(json[j])
            }
          }

          news = news.concat(arr)
          initData.news = news
          initData.notifyNews = notifyNews
        }
      } else {
        initData.news = []
        initData.notifyNews = []
      }

      resolve(initData)
    } catch (e) {
      console.log('ERROR NEWS', e)
      initData.menu = []
      initData.news = []
      initData.newsHotel = []
      initData.notifyNews = []

      resolve(initData)
    }
  })
}

/**
 * Устанавливаем фильтр
 * @returns {Promise<void>}
 * @param initData
 * @param filter
 * @param currentCategory
 * @param deepLink
 * @param changeLang
 */
export const setAppFilter = async (initData, filter, currentCategory, deepLink, changeLang = false) => {
  const { getObjectAssign, t } = await import('app-utils-web')

  const { default_id_filter_root, default_title_filter_root, default_id_profi, default_title_profi } = currentCategory
  initData.filter = getObjectAssign({}, filter)
  initData.filter.selectCategory = currentCategory
  let result = {}

  if (!isEmpty(deepLink) && (deepLink.indexOf('/y/') > -1 || deepLink.indexOf('/a/') > -1 || deepLink.indexOf('/b/') > -1)) {
    const url = compact(split(deepLink, '/'))
    let agent = 0

    if (deepLink.indexOf('/h/') === -1) {
      initData.filter.selectedHotel = '-1'
      initData.filter.selectedHotelName = ''
    }

    if (deepLink.indexOf('/p/') === -1) {
      initData.filter.selectedPlace = '-1'
      initData.filter.selectedPlaceName = ''
    }

    if (deepLink.indexOf('/b/') === -1) {
      initData.filter.selectedHobby = '-1'
      initData.filter.selectedHobbyName = ''
    }

    if (url[0] === 'y') {
      let curCountry = {}

      if (!isEmpty(initData.chat.countries)) {
        let country = []
        country = initData.chat.countries.filter(function (item) {
          return item.id === Number(url[1])
        })
        if (country.length > 0) {
          curCountry = country[0]
        } else {
          country = initData.chat.countries.filter(function (item) {
            return item.id_country === Number(url[1])
          })
          curCountry = country[0]
        }
      } else {
        curCountry.id = url[1]

        if (Number(currentCategory.default_id_filter_root) === Number(url[1])) {
          curCountry.title = currentCategory.default_title_filter_root
        }
      }

      initData.filter.chatAgent = false
      initData.filter.selectedCountry = curCountry && curCountry.id ? curCountry.id : url[1]
      initData.filter.selectedCountryName = curCountry && curCountry.title ? curCountry.title : ''
      initData.filter.selectedFav = '0'
      initData.filter.selectedFavName = ''
    }

    if (url[0] === 'a') {
      agent += 2
      let curAgent = {}

      if (!isEmpty(initData.chat.agent)) {
        let ag = initData.chat.agent.filter(function (item) {
          return item.id === Number(url[1])
        })
        curAgent = ag[0]
      } else {
        curAgent.id = url[1]
        curAgent.title = ''
      }

      initData.filter.chatAgent = true
      initData.filter.selectedAgent = curAgent && curAgent.id ? curAgent.id : currentCategory.default_id_profi
      initData.filter.selectedAgentName = curAgent && curAgent.title ? curAgent.title : currentCategory.default_title_profi
      initData.filter.selectedFav = '0'
      initData.filter.selectedFavName = ''

      if (initData.is_sotr !== 1) {
        initData.filter.chatAgent = false
      }
    }

    if (url[0] === 'b') {
      let curHobby = {}

      if (!isEmpty(initData.chat.hobby)) {
        let hobby = initData.chat.hobby.filter(function (item) {
          return item.id === Number(url[1])
        })
        curHobby = hobby[0]
      } else {
        curHobby.id = url[1]
        curHobby.title = t('common.loading')
      }

      initData.filter.chatAgent = false
      initData.filter.selectedCountry = '-1'
      initData.filter.selectedCountryName = ''
      initData.filter.selectedFav = '0'
      initData.filter.selectedFavName = ''
      initData.filter.selectedHobby = url[1]
      initData.filter.selectedHobbyName = curHobby.title
    }

    if (url[0] === 'a' && !isEmpty(url[2]) && url[2] === 'y') {
      let curCountry = {}

      if (!isEmpty(initData.chat.countries)) {
        let country = []
        country = initData.chat.countries.filter(function (item) {
          return item.id === Number(url[3])
        })
        if (country.length > 0) {
          curCountry = country[0]
        } else {
          country = initData.chat.countries.filter(function (item) {
            return item.id_country === Number(url[1])
          })
          curCountry = country[0]
        }
      }

      if (!isEmpty(curCountry)) {
        initData.filter.selectedCountry = curCountry.id
        initData.filter.selectedCountryName = curCountry.title
        initData.filter.selectedFav = '0'
        initData.filter.selectedFavName = ''
      }
    } else if (url[0] === 'a' && isEmpty(url[2])) {
      initData.filter.selectedCountry = '-1'
      initData.filter.selectedCountryName = ''
      initData.filter.selectedFav = '0'
      initData.filter.selectedFavName = ''
    }

    if (!isEmpty(url[2 + agent]) && url[2 + agent] === 'h') {
      let curHotel = {}

      if (!isEmpty(initData.chat.hotels)) {
        let hotel = initData.chat.hotels.filter(function (item) {
          return item.id === Number(url[3 + agent])
        })
        curHotel = hotel[0]
      }

      let hotel = {}
      if (isEmpty(curHotel)) {
        hotel = await getViewHotel(Number(url[3 + agent]), initData.android_id_install, initData.token)

        if (!isEmpty(hotel)) {
          if (Number(initData.filter.selectedCountry) !== Number(hotel.chat_c)) {
            let url = deepLink.replace(initData.filter.selectedCountry, hotel.chat_c)
            result.error = 'Код страны не существует!'
            result.url = url
            return result
          }
        } else {
          hotel = {}
          hotel.title = t('components.header.appheader.nothotel')
        }
      }

      initData.filter.selectedHotel = Number(url[3 + agent])
      initData.filter.selectedHotelName = !isEmpty(curHotel) ? curHotel.name : !isEmpty(hotel.title) ? hotel.title : ''
      initData.filter.selectedPlace = '-1'
      initData.filter.selectedPlaceName = ''

      if (initData.token && hotel && hotel.c) {
        await fetchAddPost(initData.token, initData.android_id_install, initData.filter.selectedHotelName, initData.filter.selectedHotel * 1 + 100000, hotel.c, currentCategory.id)
      }
    }

    if (!isEmpty(url[2 + agent]) && url[2 + agent] === 'p') {
      let curPlace = {}

      if (!isEmpty(initData.chat.places)) {
        let place = initData.chat.places.filter(function (item) {
          return Number(item.uid) === Number(url[3 + agent])
        })
        curPlace = place[0]
      } else {
        await setAppPlaces(initData, initData.filter.selectedCountry, currentCategory.id)
        let place = initData.chat.places.filter(function (item) {
          return Number(item.uid) === Number(url[3 + agent])
        })
        curPlace = place[0]
      }

      initData.filter.selectedHotel = '-1'
      initData.filter.selectedHotelName = ''
      initData.filter.selectedPlace = Number(url[3 + agent])
      initData.filter.selectedPlaceName = curPlace.name
    }

    if (!isEmpty(url[2 + agent]) && url[2 + agent] === 'b') {
      let curHobby = {}

      if (!isEmpty(initData.chat.hobby)) {
        let hobby = initData.chat.hobby.filter(function (item) {
          return Number(item.id) === Number(url[3 + agent])
        })
        curHobby = hobby[0]
      }

      initData.filter.selectedHobby = Number(url[3 + agent])
      initData.filter.selectedHobbyName = curHobby.title
    }

    if (isEmpty(url[2 + agent])) {
      initData.filter.selectedHotel = '-1'
      initData.filter.selectedHotelName = ''
      initData.filter.selectedPlace = '-1'
      initData.filter.selectedPlaceName = ''
      initData.filter.selectedHobby = '-1'
      initData.filter.selectedHobbyName = ''
    }

    if (!isEmpty(url[4 + agent]) && url[4 + agent] === 'b') {
      let curHobby = {}

      if (!isEmpty(initData.chat.hobby)) {
        let hobby = initData.chat.hobby.filter(function (item) {
          return Number(item.id) === Number(url[5 + agent])
        })
        curHobby = hobby[0]
      }

      initData.filter.selectedHobby = Number(url[5 + agent])
      initData.filter.selectedHobbyName = curHobby.title
    }

    if (url[0] === 'b') {
      let hobby = initData.chat.hobby.filter(function (item) {
        return item.id === Number(url[1])
      })
      initData.filter.selectedHobby = hobby && hobby[0] && hobby[0].id ? hobby[0].id : Number(url[1])
      initData.filter.selectedHobbyName = hobby && hobby[0] && hobby[0].title ? hobby[0].title : t('common.loading')
    }
  } else if (!isEmpty(deepLink) && deepLink.indexOf('/fav') > -1) {
    initData.filter.selectedHotel = '-1'
    initData.filter.selectedHotelName = ''
    initData.filter.selectedPlace = '-1'
    initData.filter.selectedPlaceName = ''
    initData.filter.selectedHobby = '-1'
    initData.filter.selectedHobbyName = ''
    initData.filter.selectedFav = '1'
    initData.filter.selectedFavName = t('common.fav')
  } else if (changeLang) {
    initData.filter.selectedCountry = default_id_filter_root ? default_id_filter_root : '-1'
    initData.filter.selectedCountryName = default_title_filter_root ? default_title_filter_root : ''
    initData.filter.selectedAgent = default_id_profi ? default_id_profi : '-1'
    initData.filter.selectedAgentName = default_title_profi ? default_title_profi : ''
    initData.filter.chatAgent = false
    initData.filter.selectedHotel = '-1'
    initData.filter.selectedHotelName = ''
    initData.filter.selectedPlace = '-1'
    initData.filter.selectedPlaceName = ''
    initData.filter.selectedHobby = '-1'
    initData.filter.selectedHobbyName = ''
    initData.filter.selectedFav = '1'
    initData.filter.selectedFavName = t('common.fav')
  } else {
    initData.filter.selectedCountry = filter.selectedCountry !== '-1' ? filter.selectedCountry : default_id_filter_root
    initData.filter.selectedCountryName = filter.selectedCountry !== '-1' ? filter.selectedCountryName : default_title_filter_root
    initData.filter.selectedAgent = filter.selectedAgent !== '-1' ? filter.selectedAgent : default_id_profi
    initData.filter.selectedAgentName = filter.selectedAgent !== '-1' ? filter.selectedAgentName : default_title_profi
    initData.filter.chatAgent = filter.chatAgent ? filter.chatAgent : false
  }

  return initData
}

/**
 * Обработка URL
 * @param filter
 * @returns {string}
 */
export const initUrl = async filter => {
  let url = ''
  let search = false
  let data = checkData(filter)

  // if (location.search !== '') {
  //   search = true
  // }

  // if (!isEmpty(params)) {
  //   if (params.agent) {
  //     url += search ? '?a=' + filter.selectedAgent : '/a/' + filter.selectedAgent
  //   }
  // } else {
  //   if (filter.chatAgent) {
  //     url += search ? '?a=' + filter.selectedAgent : '/a/' + filter.selectedAgent
  //   }
  // }

  if (data.themeId !== '-1') {
    if (search && url === '') {
      url += '?'
    } else if (search && url !== '') {
      url += '&'
    }
    url += search ? 'chat=' + data.themeId : '/y/' + data.themeId
  }

  if (data.idHotel !== '-1') {
    url += search ? '&hotel=' + data.idHotel : '/h/' + data.idHotel
  }

  if (data.idPlace !== '-1') {
    url += search ? '&place=' + data.idPlace : '/p/' + data.idPlace
  }

  if (data.idHobby !== '-1') {
    if (search && url === '') {
      url += '?'
    } else if (search && url !== '') {
      url += '&'
    }
    url += search ? 'hobby=' + data.idHobby : '/b/' + data.idHobby
  }

  if (data.fav === '1') {
    url = search ? '?favorite' : '/favorite'
  }

  return url
}

export const checkData = async state => {
  const { t } = await import('app-utils-web')
  let data = {}

  data.themeName = state.selectedCountryName
  data.themeId = String(state.selectedCountry)
  data.idHotel = state.selectedHotel
  data.nameHotel = state.selectedHotelName
  data.idHobby = state.selectedHobby
  data.nameHobby = state.selectedHobbyName
  data.idPlace = state.selectedPlace
  data.namePlace = state.selectedPlaceName
  data.isFilter = 0
  data.firstId = '-1'

  if (state.selectedPlace !== '-1') {
    data.idPlace = state.selectedPlace
    data.namePlace = state.selectedHobbyName
    data.isFilter += 1
  }

  if (state.selectedHotel !== '-1') {
    data.idHotel = state.selectedHotel
    data.nameHotel = state.selectedHotelName
    data.isFilter += 1
  }

  if (state.selectedHobby !== '-1') {
    data.idHobby = state.selectedHobby
    data.nameHobby = state.selectedHobbyName
    data.isFilter += 1
  }

  if (state.selectedFav !== '0') {
    data.fav = '1'
    data.favName = t('common.fav')
    data.themeName = ''
    data.themeId = '-1'
  } else {
    data.fav = '0'
  }

  return data
}

export const onPressRowSetLike = async (chat, bubble, currentMessage) => {
  const { getState } = await import('app-store-web')
  const Alert = await import('@blazejkustra/react-native-alert')

  const req = await sendLike(chat.props.user, currentMessage._id, currentMessage.id_user, currentMessage.is_like)
  const messages = getState().chat.messages

  if (req.code === 0) {
    chat.setState(
      state => {
        let selected = new Map(state.selected)
        let ind = messages.findIndex(x => x.id === currentMessage._id)
        let isLike = messages[ind].is_like

        if (currentMessage.is_owner) {
          return selected
        } else {
          selected.set(currentMessage._id, !isLike)

          if (isLike) {
            messages[ind].cnt_like -= 1
          } else {
            messages[ind].cnt_like += 1
          }
          messages[ind].is_like = !isLike
        }

        return { selected }
      },
      () => {
        bubble.setState({})
      }
    )
  } else {
    Alert.alert('Внимание!', req.error)
  }
}

export const onPressRowSetFavorite = async (chat, bubble, currentMessage) => {
  const { getState } = await import('app-store-web')

  const req = await sendFavorite(chat.props.user, currentMessage._id, currentMessage.id_user, currentMessage.is_favorite)
  const messages = getState().chat.messages

  if (req.code === 0) {
    chat.setState(
      state => {
        let favorite = new Map(state.favorite)
        let ind = messages.findIndex(x => x.id === currentMessage._id)
        let isFavorite = messages[ind].is_favorite

        favorite.set(currentMessage._id, !isFavorite)

        if (isFavorite) {
          messages[ind].cnt_favorite -= 1
        } else {
          messages[ind].cnt_favorite += 1
        }
        messages[ind].is_favorite = !isFavorite

        return { favorite }
      },
      () => {
        bubble.setState({})
      }
    )
  } else {
    chat.setState({ openAlert: true, titleAlert: 'Внимание!', bodyAlert: req.error })
  }
}

export const onPressRowSetGeo = async (chat, bubble, currentMessage) => {
  const { getState } = await import('app-store-web')

  const req = await sendFavorite(chat.props.user, currentMessage._id, currentMessage.id_user, currentMessage.is_favorite)
  const messages = getState().chat.messages

  if (req.code === 0) {
    chat.setState(
      state => {
        let favorite = new Map(state.favorite)
        let ind = messages.findIndex(x => x.id === currentMessage._id)
        let isFavorite = messages[ind].is_favorite

        favorite.set(currentMessage._id, !isFavorite)

        if (isFavorite) {
          messages[ind].cnt_favorite -= 1
        } else {
          messages[ind].cnt_favorite += 1
        }
        messages[ind].is_favorite = !isFavorite

        return { favorite }
      },
      () => {
        bubble.setState({})
      }
    )
  } else {
    chat.setState({ openAlert: true, titleAlert: 'Внимание!', bodyAlert: req.error })
  }
}

export const sendLike = async (user, id, id_user, is_like) => {
  const { device, android_id_install } = user
  const like = new FormData()

  like.append('token', !isEmpty(device) ? device.token : '')
  like.append('android_id_install', android_id_install)
  like.append('id_chat', id)
  like.append('id_user_owner', id_user)

  if (is_like) {
    like.append('tip', 0)
  } else {
    like.append('tip', 1)
  }

  return fetchLike(like)
}

export const sendFavorite = async (user, id, id_user, is_favorite) => {
  const { device, android_id_install } = user
  const fav = new FormData()

  fav.append('token', !isEmpty(device) ? device.token : '')
  fav.append('android_id_install', android_id_install)
  fav.append('id_chat', id)
  fav.append('id_user_owner', id_user)

  if (is_favorite) {
    fav.append('tip', 0)
  } else {
    fav.append('tip', 1)
  }

  return fetchFavorite(fav)
}

export const handleSelectMenu = (chat, menu) => {
  const { chatAgent } = chat.props.filter
  const { _id, user, text, id_hotel, id_hobbi, id_post, is_owner, is_warning, is_ban, image_min } = chat.state.menuMessage

  chat.setState({ openMenu: false }, () => {
    if (menu === 'reply') {
      chat.setState(
        {
          id_hotel: id_hotel ? id_hotel : -1,
          id_hobbi: id_hobbi ? id_hobbi : -1,
          id_post: chatAgent ? id_hobbi : id_post,
          image_min: image_min,
          menuMessage: null
        },
        () => {
          chat.props.setChatReplyMessage({
            replyId: _id,
            id_parent: user._id,
            name_parent: user.name,
            msg_parent: text,
            id_post: chatAgent ? id_hobbi : id_post,
            data: chat.state.menuMessage
          })
        }
      )
    } else if (menu === 'copy') {
      chat.onClipboardSetString(text)
    } else if (menu === 'edit') {
      chat.onEditMyMessage(chat.state.menuMessage)
    } else if (menu === 'del') {
      chat.onDelMyMessage(chat.state.menuMessage)
    } else if (menu === 'warn') {
      const txt = is_warning === 0 ? 'установить предупреждение на данное сообщение?' : 'снять предупреждение c данного сообщения?'
      chat.setState(
        {
          // openAlert: true,
          // titleAlert: 'Внимание!',
          // bodyAlert: 'Вы хотите ' + txt,
          warningMessage: chat.state.menuMessage,
          isWarningMessage: true
        },
        async () => {
          const Alert = await import('@blazejkustra/react-native-alert')
          const { t } = await import('app-utils-web')

          Alert.default.alert('Внимание!', 'Вы хотите ' + txt, [
            {
              text: t('common.cancel'),
              style: 'cancel',
              onPress: () =>
                chat.setState({
                  warningMessage: null,
                  isWarningMessage: false
                })
            },
            {
              text: t('common.yes'),
              onPress: () => setWarningMessage(chat, chat.state.menuMessage)
            }
          ])
        }
      )
    } else if (menu === 'ban') {
      const txt = is_ban === 0 ? 'забанить пользователя?' : 'снять бан с пользователя?'

      chat.setState(
        {
          banMessage: chat.state.menuMessage,
          isBanMessage: true
        },
        async () => {
          const Alert = await import('@blazejkustra/react-native-alert')
          const { t } = await import('app-utils-web')

          Alert.default.alert(t('common.attention'), 'Вы действительно хотите ' + txt, [
            {
              text: t('common.cancel'),
              style: 'cancel',
              onPress: () =>
                chat.setState({
                  banMessage: null,
                  isBanMessage: false
                })
            },
            {
              text: t('common.yes'),
              onPress: () => setBanMessage(chat, chat.state.menuMessage)
            }
          ])
        }
      )
    } else if (menu === 'share') {
      chat.setState({
        openAlert: true,
        titleAlert: 'Поделиться',
        bodyAlert: 'Ссылка на сообщение, скопируйте и можете отправить ее друзьям.',
        shareMessage: chat.state.menuMessage,
        isShareMessage: true
      })
    } else if (menu === 'complain') {
      chat.setState(
        {
          complainMessage: chat.state.menuMessage,
          isComplainMessage: true
        },
        async () => {
          const Alert = await import('@blazejkustra/react-native-alert')
          const { t } = await import('app-utils-web')

          Alert.default.alert(t('common.attention'), t('common.complain'), [
            {
              text: t('common.cancel'),
              style: 'cancel',
              onPress: () =>
                chat.setState({
                  deleteMessage: null,
                  isDeleteMessage: false
                })
            },
            {
              text: t('common.yes'),
              onPress: () => chat.sendComplainMessage()
            }
          ])
        }
      )
    } else if (menu === 'foto') {
      chat.setState({
        isOpenDialog: true
      })
    } else if (menu === 'pdf') {
      chat.setState({
        isOpenDialog: true,
        imgPDFupload: true
      })
    } else if (menu === 'foto360') {
      chat.setState({
        isOpenDialog: true,
        img360upload: true
      })
    } else if (menu === 'action') {
      chat.setState({
        isActionOpen: true,
        visibleModal: true
      })
    } else if (menu === 'zagrebon') {
      Linking.openURL('https://zagrebon.com/api/add/' + _id, '_blank')
    } else if (menu === 'fav') {
      chat.onMoveToFav(chat.props.user, chat.state.menuMessage)
    } else if (menu === 'user') {
      chat.onChatUser(chat.state.menuMessage)
    } else if (menu === 'replay') {
      chat.onPressResponse(chat.state.menuMessage)
    } else if (menu === 'video') {
      chat.setState({
        openYoutube: true,
        visibleModal: true,
        openYoutubeLink: 'https://stuzon.com/pom_link1.php?idn=169&id=2144'
      })
    }
  })
}

export const setWarningMessage = async (componentChat, warningMessage) => {
  const { getState } = await import('app-store-web')
  const Alert = await import('@blazejkustra/react-native-alert')

  const messages = getState().chat.messages
  const { user, setChatMessages } = componentChat.props

  fetchWarning(user.device.token, user.android_id_install, warningMessage.id, warningMessage.is_warning).then(result => {
    if (result.code === 0) {
      let newMessages = messages.map(msg => {
        if (msg.id === warningMessage.id) {
          return {
            ...msg,
            is_warning: warningMessage.is_warning === 1 ? 0 : 1
          }
        }
        return msg
      })
      setChatMessages(newMessages)

      let txt = warningMessage.is_warning === 0 ? 'установлено!' : 'снято!'

      if (Platform.OS === 'web') {
        componentChat.setState(
          {
            warningMessage: null,
            isWarningMessage: false,
            menuComponent: null
          },
          async () => {
            Alert.default.alert('Внимание!', 'Предупреждение успешно ' + txt + '.')
          }
        )
      } else {
        Alert.default.alert('Внимание!', 'Предупреждение успешно ' + txt + '.')
      }
    }
  })
}

export const setBanMessage = async (componentChat, banMessage) => {
  const { getState } = await import('app-store-web')
  const Alert = await import('@blazejkustra/react-native-alert')

  const messages = getState().chat.messages
  const { user, setChatMessages } = componentChat.props

  fetchBan(user.device.token, user.android_id_install, banMessage.id_user, banMessage.is_ban).then(result => {
    if (result.code === 0) {
      let newMessages = messages.map(msg => {
        if (msg.id === banMessage.id) {
          return {
            ...msg,
            is_ban: banMessage.is_ban === 1 ? 0 : 1
          }
        }
        return msg
      })
      setChatMessages(newMessages)
      let txt = banMessage.is_ban === 0 ? 'установлен!' : 'снят!'

      if (Platform.OS === 'web') {
        componentChat.setState(
          {
            banMessage: null,
            isBanMessage: false,
            menuComponent: null
          },
          async () => {
            Alert.default.alert('Внимание!', 'Бан успешно ' + txt + '.')
          }
        )
      } else {
        Alert.default.alert('Внимание!', 'Бан успешно ' + txt + '.')
      }
    }
  })
}
