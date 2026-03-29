import compact from 'lodash/compact'
import split from 'lodash/split'
import { Platform } from 'react-native'

const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
const { setCategoiesRatingServer, getAuthLink, setAuthLink } = GLOBAL_OBJ.onlinetur.storage

class RatingsController {
  constructor(component, props) {
    this.c = component
    this.rootprops = props
  }

  initDataRatings = async (user, id_category, changeCriteria, categories, pathname, history, expoRouter, setModalLogin) => {
    const { matchPath, rtkQuery } = this.rootprops

    if (!user.device && pathname.includes('/rr/')) {
      setTimeout(() => {
        setModalLogin(true)
      }, 200)
      return
    }

    const match = matchPath(pathname, {
      path: ['/rm/:rm'],
      exact: true,
      strict: false
    })

    if (!match) {
      const rating = await rtkQuery.getRTKQueryRatingCategory(id_category)

      if (rating) {
        setCategoiesRatingServer(rating)
        changeCriteria?.(rating)
      }
    } else {
      this.c.setState({ value: 2 })
    }
  }

  setSlideIndex = slideIndex => {
    this.c.setState({ slideIndex })
  }

  showSearchField = () => {
    this.c.setState(prevState => ({ showSearch: !prevState.showSearch }))
  }

  initListHotels = async (changeIndex = false, geo = false) => {
    const { Alert } = this.rootprops
    const { setSelectedCountries, ofs, setVisibleImages, listHotelsCache, setSaveRatingCache, slideIndex, ratingHotelView } = this.c.props
    const arrayHotels = ratingHotelView !== 0 ? compact(ratingHotelView.split('_').join(',').split(',')) : []
    const oneHotel = ratingHotelView !== 0 && arrayHotels.length === 1

    if (changeIndex) {
      setVisibleImages(true)
    }

    this.c.setState({ isLoading: true, offset: changeIndex ? 0 : ofs }, async () => {
      const cacheEntry = listHotelsCache?.[slideIndex]
      const diff = cacheEntry?.time ? Math.abs(Date.now() - cacheEntry.time) / 3600000 : 100
      let result = {}

      if ((diff > 2 && !geo) || geo) {
        result = await this.getListHotels(oneHotel)
      } else {
        result = {
          hotels: cacheEntry.listHotels,
          ofs: cacheEntry.offset,
          cuids: cacheEntry.selectedCountries?.length > 0 ? cacheEntry.selectedCountries : []
        }
      }

      if (result?.hotels?.length > 0 && !oneHotel) {
        this.c.setState(
          {
            hotelList: result.hotels,
            offset: result.ofs ?? ofs,
            isLoading: false,
            titleHotel: ''
          },
          async () => {
            GLOBAL_OBJ.onlinetur.ratingHotels = result.hotels
            setSelectedCountries?.(result.cuids ?? [])

            if (diff > 2) {
              setSaveRatingCache({ [slideIndex]: null })
            }
          }
        )
      } else if (result?.hotels && oneHotel) {
        const indx = result.hotels.length === 0 ? 0 : result.hotels.length > 1 ? Number(result.hotels[2].nb) : Number(result.hotels[0].nb)
        const resultAll = await this.getListHotels(oneHotel, indx + 20)

        if (resultAll?.hotels?.length > 0) {
          const scrollIndex = result.hotels.length > 1 ? indx - 2 : 0
          this.c.setState(
            {
              hotelList: resultAll.hotels,
              initialScrollIndex: scrollIndex,
              titleHotel: result.hotels.length === 0 ? '' : result.hotels.length > 1 ? result.hotels[2].name : result.hotels[0].name,
              isLoading: false
            },
            () => {
              setTimeout(() => {
                this.c.listRef?.scrollToIndex({
                  index: scrollIndex,
                  animated: false
                })
              }, 300)
            }
          )
        }
      } else if (result?.hotels?.length === 0) {
        this.c.setState({
          hotelList: [],
          isLoading: false
        })
      } else {
        this.c.setState({ isLoading: false }, () => {
          if (Platform.OS === 'web') {
            Alert.alert('Внимание!', 'Категория закрыта!')
          }
        })
      }
    })
  }

  searchListHotels = async () => {
    const { action, pattern, setSelectedCountries } = this.c.props
    const { chatServiceGet } = this.rootprops

    this.c.setState({ isLoading: true }, async () => {
      const url = `action=${action}&cuid=&puid=&lim=20&ofs=0&hclass=&pattern=${pattern}&add=1`
      const result = await chatServiceGet.getRatingHotels(url)

      if (result) {
        this.c.setState({ hotelList: result.hotels ?? [], offset: 0, isLoading: false }, () => {
          setSelectedCountries?.(result.cuids ?? [])
        })
      } else {
        this.c.setState({ isLoading: false })
      }
    })
  }

  buildHotelQueryParams = (oneHotel, limAll, myrate, user) => {
    const { action, cuid: propsCuid, puid: propsPuid, lim: propsLim, hclass, pattern, slideIndex, pathname, categories, coords } = this.c.props
    const { ratingHotelView, filter } = this.c.props
    const { selectedCountries } = filter
    const { offset } = this.c.state
    const link = getAuthLink()

    let cuid = propsCuid || []
    let puid = propsPuid || []
    let lim = propsLim

    const h = oneHotel ? compact(ratingHotelView.split('_').join(',').split(','))[0] : null
    const urlArray = compact(split(pathname, '/'))

    if (selectedCountries.length > 0) {
      cuid = compact(split(selectedCountries, ','))
    }

    if (link?.includes('?rc=')) {
      cuid = compact(split(link.replace('?rc=', ''), ','))
      setAuthLink('')
    }

    if (urlArray.length > 1 && urlArray[2]) {
      lim = urlArray[2]
    }

    const l = limAll ?? (h ? 3 : lim)
    const huids = limAll ? '' : (h ?? (ratingHotelView !== 0 ? ratingHotelView.split('_').join(',') : ''))

    let catId = 1
    if (categories?.length > 0) {
      catId = Number(slideIndex) === 0 ? categories[0].id : categories[Number(slideIndex)].id
    }

    const params = {
      action,
      cuid: !oneHotel ? cuid.join(',') : '',
      puid: !oneHotel ? puid.join(',') : '',
      lim: l,
      ofs: limAll ? 0 : offset,
      hclass: !hclass || hclass === 0 || hclass === '0' ? '' : hclass,
      huids,
      pattern,
      add: 1
    }

    if (myrate === '') {
      params.criteria_id = catId
    } else {
      params.myrate = 1
      if (user?.id_user) {
        params.user_id = user.id_user
        params.hash = user.hash_rt ?? ''
      }
    }

    if (coords) {
      params.lat = coords.latitude
      params.lon = coords.longitude
    }

    return new URLSearchParams(params).toString()
  }

  getListHotels = async (oneHotel = false, limAll = null, myrate = '') => {
    const { chatServiceGet } = this.rootprops
    const { user } = this.c.props
    const url = this.buildHotelQueryParams(oneHotel, limAll, myrate, user)
    return await chatServiceGet.getRatingHotels(url)
  }

  onListHotelsMyRating = async (oneHotel = false, limAll = null, save = false) => {
    const { chatServiceGet } = this.rootprops
    const { pathname, categories, coords, user, ratingHotelView } = this.c.props
    let { action, cuid, puid, lim, hclass, pattern, ofs, scores } = this.c.state

    const h = oneHotel ? compact(ratingHotelView.split('_').join(',').split(','))[0] : null
    cuid = cuid || []
    puid = puid || []

    const urlArray = compact(split(pathname, '/'))

    if (urlArray.length > 1 && urlArray[1]) {
      cuid = compact(split(urlArray[1], ','))
    }

    if (urlArray.length > 2 && urlArray[2]) {
      lim = urlArray[2]
    }

    const l = limAll ?? (h ? 3 : lim)
    const huids = limAll ? '' : (h ?? (ratingHotelView !== 0 ? ratingHotelView.split('_').join(',') : ''))

    let savePoints = ''
    if (save && categories) {
      const c = categories.map(cat => cat.id)
      const p = scores.map((score, i) => score ?? 0)
      savePoints = `&rlist=${c.join(',')}&points=${p.join(',')}`
    }

    const params = {
      action,
      cuid: !oneHotel ? cuid.join(',') : '',
      puid: !oneHotel ? puid.join(',') : '',
      lim: l,
      ofs: limAll ? 0 : ofs,
      hclass: !hclass || hclass === 0 || hclass === '0' ? '' : hclass,
      huids,
      pattern,
      add: 1,
      myrate: 1
    }

    if (user?.id_user) {
      params.user_id = user.id_user
      params.hash = user.hash_rt ?? ''
    }

    if (coords) {
      params.lat = coords.latitude
      params.lon = coords.longitude
    }

    const url = new URLSearchParams(params).toString() + savePoints
    return await chatServiceGet.getRatingHotels(url)
  }

  setFilterURL = (cuid, puid, hclass) => {
    this.c.setState({ isLoading: true, cuid, puid, hclass })
  }

  setFilterURLWeb = (cuid, puid, hclass) => {
    this.c.setState({ showFilter: false, isLoading: true, cuid, puid, hclass })
  }

  openModalFilter = () => {
    this.c.setState({ visibleModal: true })
  }

  closeModalFilter = () => {
    this.c.setState({ visibleModal: false })
  }

  openModalFilterWeb = () => {
    this.c.setState({ showFilter: true })
  }

  onEndReached = async () => {
    const { offset, hotelList } = this.c.state

    if (hotelList.length > 19) {
      this.c.setState({ offset: offset + 20 }, async () => {
        const result = await this.getListHotels()
        if (result?.hotels) {
          this.c.setState({ hotelList: hotelList.concat(result.hotels) })
        }
      })
    }
  }

  onEndReachedWeb = async () => {
    const { offset, hotelList } = this.c.state
    const { ratingHotelView } = this.c.props

    if (ratingHotelView !== 0 || hotelList.length <= 19) {
      return
    }

    this.c.setState({ offset: offset + 20, isLoadingEarlier: true, ratingHotelView: null }, async () => {
      const result = await this.getListHotels()

      if (result) {
        const updatedList = hotelList.concat(result.hotels)
        this.c.setState({ hotelList: updatedList, isLoadingEarlier: false }, () => {
          GLOBAL_OBJ.onlinetur.ratingHotels = updatedList
        })
      }
    })
  }
}

export default RatingsController
