/**
 * -----------------------------------------------------------------------
 *  Author      : Alexey Zolotarеv
 *  E-mail      : azesm@me.com
 * -----------------------------------------------------------------------
 */

import { useGlobalSearchParams, useLocalSearchParams, useNavigation, usePathname, useRouter, useSegments } from 'expo-router'
import pathToRegexp from 'path-to-regexp'
import React, { useMemo } from 'react'
import { Platform } from 'react-native'

const cache = {}
const cacheLimit = 10000
let cacheCount = 0

/// Render Date to string
export const getTimestamp = (date = new Date()) => {
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
}

export function useAppLocation() {
  const pathname = usePathname()
  const params = useLocalSearchParams()
  const segments = useSegments()

  return useMemo(() => {
    // Определяем hash в зависимости от платформы
    let hash = ''

    if (Platform.OS === 'web') {
      // На вебе берем из document.location
      hash = document.location.hash || ''
    } else {
      // В нативном Expo Router hash может храниться в разных местах
      // Обычно в параметрах как специальный ключ
      hash = params['#'] || params['hash'] || ''
    }

    // Очищаем hash от символа # для единообразия
    const cleanHash = hash.startsWith('#') ? hash.slice(1) : hash

    // Собираем search строку из параметров
    const searchString =
      Object.keys(params).length > 0
        ? '?' +
          new URLSearchParams(
            Object.entries(params)
              .filter(([key]) => !['#', 'hash'].includes(key)) // Исключаем hash ключи
              .map(([k, v]) => [k, String(v)])
          ).toString()
        : ''

    // Формируем полный href
    const href = pathname + searchString + (cleanHash ? `#${cleanHash}` : '')

    return {
      pathname,
      params,
      segments,
      // @ts-ignore
      hash: cleanHash,
      hashWithSymbol: cleanHash ? `#${cleanHash}` : '',
      search: searchString,
      href,
      // Для полной совместимости с веб-объектом Location
      // @ts-ignore
      get hash() {
        return this.hashWithSymbol
      }
    }
  }, [pathname, params, segments])
}

export const withRouter = Component => {
  return function ComponentWithRouterProp(props) {
    const router = useRouter()
    const navigate = useNavigation()
    const pathname = usePathname()
    const search = useGlobalSearchParams()
    const glob = useGlobalSearchParams()
    const local = useLocalSearchParams()
    const location = useAppLocation()

    return (
      <Component
        {...props}
        location={location}
        history={router.replace}
        router={{ location: location, navigate, params: {} }}
        pathname={pathname}
        search={search}
        expoRouter={router}
        globPath={glob}
        localPath={local}
        navigate={navigate}
      />
    )
  }
}

export function compilePath(path, options) {
  const cacheKey = `${options.end}${options.strict}${options.sensitive}`
  const pathCache = cache[cacheKey] || (cache[cacheKey] = {})

  if (pathCache[path]) {
    return pathCache[path]
  }

  const keys = []
  const regexp = pathToRegexp(path, keys, options)
  const result = { regexp, keys }

  if (cacheCount < cacheLimit) {
    pathCache[path] = result
    cacheCount++
  }

  return result
}

/**
 * Public API for matching a URL pathname to a path.
 */
export function matchPath(pathname, options = {}) {
  if (typeof options === 'string' || Array.isArray(options)) {
    options = { path: options }
  }

  const { path, exact = false, strict = false, sensitive = false } = options

  const paths = [].concat(path)

  return paths.reduce((matched, path) => {
    if (!path && path !== '') {
      return null
    }
    if (matched) {
      return matched
    }

    const { regexp, keys } = compilePath(path, {
      end: exact,
      strict,
      sensitive
    })
    const match = regexp.exec(pathname)

    if (!match) {
      return null
    }

    const [url, ...values] = match
    const isExact = pathname === url

    if (exact && !isExact) {
      return null
    }

    return {
      path,
      url: path === '/' && url === '' ? '/' : url,
      isExact,
      params: keys.reduce((memo, key, index) => {
        memo[key.name] = values[index]
        return memo
      }, {})
    }
  }, null)
}

// export const cleanStore = () => {
//   const dispatch = store.dispatch
//
//   dispatch(catAction.setCategories([]))
//   dispatch(countriesAction.setAllCountries([]))
//   dispatch(countriesAction.setAllAgent([]))
//   const filter = {
//     selectedCountry: '-1',
//     selectedHotel: '-1',
//     selectedHobby: '-1',
//     selectedPlace: '-1',
//
//     selectedCountryName: '',
//     selectedHotelName: '',
//     selectedHobbyName: '',
//     selectedPlaceName: '',
//
//     selectedCountryHide: 0,
//     selectedHotelHide: 0,
//     selectedHobbyHide: 0,
//     selectedPlaceHide: 0,
//
//     selectedFav: '0',
//     selectedFavName: '',
//
//     searchFav: '',
//     idUserFav: '0',
//     nameUserFav: '',
//
//     chatAgent: null,
//     selectedAgent: '-1',
//     selectedAgentName: '',
//
//     selectCategory: {},
//     selectSearch: {}
//   }
//   dispatch(filterAction.setFilter(filter))
//   dispatch(userAction.setUser({}))
//   dispatch(userAction.setAgentTowns([]))
// }

function findWithAttr(array, attr, value) {
  for (var i = 0; i < array.length; i += 1) {
    if (array[i][attr] === value) {
      return i
    }
  }
  return -1
}

// export const getRefreshToken = async (userVK, setVK) => {
//   return new Promise(resolve => {
//     let now = new Date()
//     let today = new Date(userVK.date)
//     today.setHours(today.getHours() + 1)
//
//     if (today > now) {
//       resolve(userVK.access_token)
//     } else {
//       const result = VKID.Auth.refreshToken(userVK.refresh_token, userVK.vk.device_id)
//
//       if (result.access_token) {
//         const newUserVK = JSON.parse(JSON.stringify(userVK))
//         newUserVK.access_token = result.access_token
//         newUserVK.refresh_token = result.refresh_token
//         newUserVK.date = new Date()
//         setVK(newUserVK)
//
//         resolve(newUserVK.access_token)
//       } else {
//         resolve(false)
//       }
//     }
//   })
// }

// export const renderLoader = () => (
//   <View style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
//     <ActivityIndicator />
//     <Text style={{ marginTop: 10 }}>{'Загрузка модуля...'}</Text>
//   </View>
// )

// export { cleanStore, findWithAttr, getRefreshToken, matchPath, renderLoader, Router, withRouter }
