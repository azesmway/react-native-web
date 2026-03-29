/**
 * -----------------------------------------------------------------------
 *  Author      : Alexey Zolotarеv
 *  E-mail      : azesm@me.com
 * -----------------------------------------------------------------------
 */

import isEmpty from 'lodash/isEmpty'
import { Platform } from 'react-native'

import { getRTKQueryDataPosts, getRTKQueryDataPostsAgent, getRTKQueryRatingCategory } from './rtkQuery'
import { getAppCategories, setAppCategories, setAppCountries, setAppCountriesBackground, setAppFilter, setAppHotelsBackground, setAppHotelsWithPage, setAppPlacesBackground } from './set/AppData'

const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
const { getAppConfig, setAppConfig, setCategoiesRatingServer } = GLOBAL_OBJ.onlinetur.storage

export const getInitData = cmp => {
  const { user, countries, fcmToken, expoToken, device } = cmp.props

  let initData = {}
  initData.chat = {}
  initData.filter = {}
  initData.user = {}
  initData.currentCategory = {}

  if (user && user.device) {
    initData.token = !isEmpty(user.device) ? user.device.token : ''
    initData.android_id_install = user.android_id_install
    initData.fcmToken = fcmToken ? fcmToken : ''
    initData.expoToken = expoToken ? expoToken : ''
    initData.device = device
    initData.is_sotr = user.is_sotr
  } else {
    initData.token = ''
    initData.android_id_install = ''
    initData.fcmToken = fcmToken ? fcmToken : ''
    initData.expoToken = expoToken ? expoToken : ''
    initData.device = device
    initData.is_sotr = 0
  }

  if (countries && countries.length > 0) {
    initData.chat.countries = countries
  }

  return initData
}

export const initRatings = async (initData, changeCriteria, setAllCountries, user, setUser, setAllHobby) => {
  const rating = await getRTKQueryRatingCategory(initData.currentCategory.id)

  if (rating) {
    setCategoiesRatingServer(rating)

    if (changeCriteria) {
      changeCriteria(rating)
    }
  }

  if (!initData.chat.countries || initData.chat.countries.length === 0 || (user.id_user && !user.hash_rt)) {
    const data = await getRTKQueryDataPosts(initData.android_id_install, initData.token, initData.fcmToken, initData.currentCategory.id, initData.expoToken, initData.device.url)

    initData.chat.countries = data.data.filter(function (item) {
      return item.tip === 0 && item.del === 0 && item.title !== ''
    })

    setAllCountries(initData.chat.countries)

    initData.chat.hobby = data.data.filter(function (item) {
      return item.tip === 1 && item.del === 0 && item.id_country === null
    })

    setAllHobby(initData.chat.hobby)

    if (user.id_user) {
      const newUser = Object.assign({}, user)
      newUser.hotels_user = data.hotels_user
      newUser.hash_rt = data.hash_rt ? data.hash_rt : '2'
      newUser.hash_ml = data.hash_ml ? data.hash_ml : '2'

      setUser && setUser(newUser)
    }
  }

  return true
}

export const initActions = async (initData, setCountries) => {
  if (!initData.chat.countries || initData.chat.countries.length === 0) {
    const data = await getRTKQueryDataPosts(initData.android_id_install, initData.token, initData.fcmToken, initData.currentCategory.id, initData.expoToken, initData.device.url)

    initData.chat.countries = data.data.filter(function (item) {
      return item.tip === 0 && item.del === 0 && item.title !== ''
    })

    setCountries(initData.chat.countries || [])
  }

  return true
}

export const initNews = async (initData, setCountries) => {
  if (!initData.chat.countries || initData.chat.countries.length === 0) {
    const data = await getRTKQueryDataPosts(initData.android_id_install, initData.token, initData.fcmToken, initData.currentCategory.id, initData.expoToken, initData.device.url)

    initData.chat.countries = data.data.filter(function (item) {
      return item.tip === 0 && item.del === 0 && item.title !== ''
    })

    setCountries(initData.chat.countries || [])
  }

  return true
}

export const initChatData = async (initData, user, setInitData, setAllCountries, setAllAgent, setHotels, setPlaces, filter, setUser, params, cmp, setAllHobby) => {
  const data = await getRTKQueryDataPosts(initData.android_id_install, initData.token, initData.fcmToken, initData.currentCategory.id, initData.expoToken, initData.device.url)

  initData.chat.countries = data.data.filter(function (item) {
    return item.tip === 0 && item.del === 0 && item.title !== ''
  })

  setAllCountries(initData.chat.countries)

  initData.chat.hobby = data.data.filter(function (item) {
    return item.tip === 1 && item.del === 0 && item.id_country === null
  })

  setAllHobby(initData.chat.hobby)

  if (user.is_sotr && user.is_sotr === 1) {
    const agent = await getRTKQueryDataPostsAgent(initData.android_id_install, initData.token, initData.fcmToken, initData.currentCategory.id, initData.expoToken, initData.device.url)

    initData.chat.agent = agent.data.filter(function (item) {
      return item.tip === 1 && item.del === 0 && item.title !== ''
    })

    initData.chat.agentTowns = agent.data.filter(function (item) {
      return item.tip === 0 && item.del === 0 && item.title !== ''
    })

    setAllAgent(initData.chat.agent)
  }

  if (user.id_user) {
    const newUser = Object.assign({}, user)
    newUser.hotels_user = data.hotels_user
    newUser.hash_rt = data.hash_rt ? data.hash_rt : ''
    newUser.hash_ml = data.hash_ml ? data.hash_ml : ''

    setUser && setUser(newUser)
  }

  return true
}

export const initMainAppMatch = (cmp, match = null) => {
  const { setCategories, currentCategory, setSelectCategory, changeCriteria, setInitData, setAllCountries, setAllAgent, user, setHotels, setPlaces, filter, setUser, setAllHobby } = cmp.props

  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    const { mobile } = await import('app-mobile-web')
    let initData = getInitData(cmp)

    try {
      if (getAppConfig().categoryChat && getAppConfig().categoryChat !== -1) {
        const categories = await getAppCategories(initData, changeCriteria)
        setCategories(categories)
        const category = categories.filter(c => c.id === getAppConfig().categoryChat)

        if (!currentCategory.id) {
          setSelectCategory(category.length > 0 ? category[0] : categories[0])
        } else {
          setSelectCategory(category.length > 0 ? category[0] : categories[0])
          initData.currentCategory = category.length > 0 ? category[0] : categories[0]
        }

        let a = getAppConfig()
        a.categoryChat = -1
        setAppConfig(a)
      } else {
        if (!currentCategory || !currentCategory.id) {
          initData.currentCategory = await setAppCategories(initData, setCategories, currentCategory, 0, changeCriteria)
          setSelectCategory(initData.currentCategory)
        } else {
          initData.currentCategory = currentCategory
        }
      }

      setSelectCategory(initData.currentCategory)
      let a = getAppConfig()
      a.categoryChat = initData.currentCategory.id
      setAppConfig(a)

      if (match && (match.url === '/' || match.url === '/l' || match.params.n || match.url === '/s')) {
        await initChatData(initData, user, setInitData, setAllCountries, setAllAgent, setHotels, setPlaces, filter, setUser, match.params, cmp, setAllHobby)

        resolve(true)
        return
      }

      if (match && (match.url === '/r' || match.params.r || match.url.indexOf('/rt/') > -1 || match.params.rt || match.url.indexOf('/rm/') > -1)) {
        await initRatings(initData, changeCriteria, setAllCountries, user, setUser, setAllHobby)

        resolve(true)
        return
      }

      if (match && (match.url === '/ah' || match.params.ah || match.url.indexOf('/ah/') > -1)) {
        await initActions(initData, setAllCountries, setAllHobby)

        resolve(true)
        return
      }

      if (match && (match.params.y || match.params.a || match.params.b)) {
        await initChatData(initData, user, setInitData, setAllCountries, setAllAgent, setHotels, setPlaces, filter, setUser, match.params, cmp, setAllHobby)

        resolve(true)
        return
      }

      resolve(true)
    } catch (error) {
      console.log('error', error)
      const crashlytics = mobile.initCrashlytics()

      if (crashlytics) {
        crashlytics().recordError(error)
      }
      reject(false)
    }
  })
}

/**
 * Функция начальной инициализации
 * @param cmp
 * @param deepLink
 * @param changeLang
 * @param match
 * @param auth
 * @returns {Promise<void>}
 */
export const initMainApp = async (cmp, deepLink, changeLang = false, match = null, auth = false) => {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    const { mobile } = await import('app-mobile-web')
    const {
      user,
      setUser,
      filter,
      currentCategory,
      setHotels,
      setPlaces,
      setAllCountries,
      setAllAgent,
      setFilter,
      setHobby,
      setCategories,
      setAgent,
      setAgentTowns,
      allCountries,
      countries,
      idCategory,
      setSelectCategory,
      changeCriteria,
      setCountries
    } = cmp.props

    let initData = getInitData(cmp)

    try {
      setAppCategories(initData, setCategories, currentCategory, idCategory ? idCategory : 0, changeCriteria).then(async curCategory => {
        initData.currentCategory = curCategory

        setSelectCategory(curCategory)

        // if (match && (match.path === '/l' || match.params.n)) {
        //   resolve(initData)
        //
        //   return
        // }
        //
        // if (deepLink && deepLink === '/' && countries.length > 0 && !auth) {
        //   resolve(initData)
        //
        //   return
        // }

        if (!isEmpty(curCategory)) {
          setAppCountries(initData, curCategory, allCountries).then(async country => {
            setCountries(country.chat.countries)
            setAllCountries(country.chat.countries)
            setAllAgent(country.chat.agent)
            setHobby(country.chat.hobby)
            setAgent(country.chat.agent)
            setAgentTowns(country.chat.agentTowns)

            country.token = initData.token
            country.android_id_install = initData.android_id_install

            const filters = await setAppFilter(country, filter, curCategory, deepLink, changeLang)

            if (filters.error) {
              resolve(filters)
            } else {
              setFilter(filters.filter)
              let id_country = Number(country.filter.selectedCountry)

              setAppHotelsWithPage(country.chat.countries, initData.android_id_install, id_country, 0, 300, curCategory.id).then(hotels => {
                if (hotels) {
                  setHotels(hotels)
                }
              })

              setAppPlacesBackground(country.chat.countries, country.filter.selectedCountry, country.android_id_install, curCategory.id).then(places => {
                if (places) {
                  setPlaces(places)
                }
              })
            }

            if (!isEmpty(user)) {
              let data = Object.assign({}, user)
              initData.user.img_path ? (data.img_path = initData.user.img_path) : null
              initData.user.is_add_post ? (data.is_add_post = initData.user.is_add_post) : null
              initData.user.is_admin ? (data.is_admin = initData.user.is_admin) : null
              initData.user.is_moderator ? (data.is_moderator = initData.user.is_moderator) : null
              initData.user.is_show_rost ? (data.is_show_rost = initData.user.is_show_rost) : null
              initData.user.is_show_ves ? (data.is_show_ves = initData.user.is_show_ves) : null
              initData.user.is_sotr ? (data.is_sotr = initData.user.is_sotr) : null
              initData.user.my_name ? (data.my_name = initData.user.my_name) : null
              initData.user.note_for_user ? (data.note_for_user = initData.user.note_for_user) : null
              initData.user.landing ? (data.landing = initData.user.landing) : null
              initData.user.notour ? (data.notour = initData.user.notour) : null
              initData.user.phone ? (data.phone = initData.user.phone) : null
              initData.user.referral ? (data.referral = initData.user.referral) : null
              initData.user.show_phone ? (data.show_phone = initData.user.show_phone) : null
              initData.user.hotels_user ? (data.hotels_user = initData.user.hotels_user) : null
              initData.user.hash_rt ? (data.hash_rt = initData.user.hash_rt) : null
              initData.user.hash_ml ? (data.hash_ml = initData.user.hash_ml) : null

              setUser && setUser(data)
            }
          })
        }

        resolve(initData)
      })
    } catch (error) {
      const crashlytics = mobile.initCrashlytics()

      if (crashlytics) {
        crashlytics().recordError(error)
      }

      reject(false)
    }
  })
}

/**
 * Функция обновления фильтра
 * @param cmp
 * @param deepLink
 * @returns {Promise<void>}
 */
export const filterApp = async (cmp, deepLink) => {
  const { user, filter, currentCategory, setInitData, setHotels, setPlaces, countries, agent, hobby, hotels, places, categories, setHobby, fcmToken, expoToken, device } = cmp.props
  let initData = {}
  initData.chat = {}
  initData.filter = {}
  const country = filter.selectedCountry

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

  initData.currentCategory = currentCategory && currentCategory.id ? currentCategory : categories[0]

  if (!isEmpty(initData.currentCategory)) {
    initData.chat.countries = countries
    initData.chat.agent = agent
    initData.chat.hobby = hobby
    initData.chat.hotels = hotels
    initData.chat.places = places

    initData = await setAppFilter(initData, filter, currentCategory, deepLink)

    if (initData.error) {
      return initData
    }

    setAppCountriesBackground(initData, currentCategory).then(async data => {
      setHobby(data.chat.hobby)
    })

    if (country !== initData.filter.selectedCountry) {
      if (Platform.OS === 'web') {
        setAppHotelsWithPage(initData.chat.countries, initData.android_id_install, initData.filter.selectedCountry, 0, 150, currentCategory.id).then(hotels => {
          setHotels(hotels)
        })
      } else {
        setAppHotelsBackground(countries, initData.filter.selectedCountry, initData.android_id_install, currentCategory.id).then(h => {
          setHotels(h)
        })
      }

      setAppPlacesBackground(countries, initData.filter.selectedCountry, initData.android_id_install, currentCategory.id).then(result => {
        setPlaces(result)
      })
    } else {
      if (isEmpty(initData.chat.hotels)) {
        setAppHotelsBackground(countries, initData.filter.selectedCountry, initData.android_id_install, currentCategory.id).then(h => {
          setHotels(h)
        })
      }

      setAppPlacesBackground(countries, initData.filter.selectedCountry, initData.android_id_install, currentCategory.id).then(result => {
        setPlaces(result)
      })
    }

    setInitData(initData)

    return initData
  } else {
    return false
  }
}
