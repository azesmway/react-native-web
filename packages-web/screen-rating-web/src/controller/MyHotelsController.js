import orderBy from 'lodash/orderBy'
import { Platform } from 'react-native'

const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
const { getCategoiesRatingServer } = GLOBAL_OBJ.onlinetur.storage

class MyHotelsController {
  constructor(component, props) {
    this.c = component
    this.rootprops = props
  }

  setSlideIndex = slideIndex => {
    this.c.setState({ slideIndex: slideIndex, slideId: Number(this.c.props.criteria[slideIndex].id) }, () => {
      this.c.props.setSelectedRatingCategory(slideIndex)
      this.c.setNewData(this.c.props.myRatingServer)
    })
  }

  setSlideIndexWeb = (event, slideIndex) => {
    this.c.setState({ slideIndex: Number(slideIndex) })
  }

  setFilterURL = (cuid, puid, hclass) => {
    this.c.setState({ cuid: cuid, puid: puid, hclass: hclass })
  }

  setMyHotels = async () => {
    const { chatServiceGet } = this.rootprops
    const { user, changeMyRatingServer, criteria, changeMyRatingLocal, myRatingLocal } = this.c.props
    const { slideIndex } = this.c.state
    let myRatingServer = []

    if (user && user.device && user.device.token) {
      const path = 'action=get_my_comps&user_id=' + user.id_user + '&hash=' + (user.hash_rt ? user.hash_rt : '')
      myRatingServer = await chatServiceGet.getMyRating(path)

      changeMyRatingServer(myRatingServer)

      if (myRatingLocal && myRatingLocal.length === 0) {
        const myRatingArray = []

        for (let a = 0; a < criteria.length; a++) {
          myRatingArray.push({
            id: Number(criteria[a].id),
            name: criteria[a].name,
            list: []
          })
        }

        changeMyRatingLocal(orderBy(myRatingArray, 'id'))
      }

      this.c.setState({ isLoading: false, slideId: criteria[slideIndex].id }, () => {
        this.c.setNewData(myRatingServer)
      })
    }
  }

  setMyHotelsSelected = async (hotels = null, add = false) => {
    const { getObjectAssign } = this.rootprops
    if (!hotels) {
      hotels = this.c.props.hotels
    }

    const categories = getCategoiesRatingServer()
    let myRatingArray = []

    for (let a = 0; a < categories.length; a++) {
      let myHotels = []
      for (let i = 0; i < hotels.length; i++) {
        let find = false
        for (let j = 0; j < myHotels.length; j++) {
          if (hotels[i].huid === myHotels[j].huid) {
            find = true
          }
        }

        if (!find) {
          myHotels.push(hotels[i])
        }
      }

      let newMyHotel = getObjectAssign([], myHotels)

      myRatingArray.push({
        id: Number(categories[a].id),
        name: categories[a].name,
        list: newMyHotel
      })
    }

    this.c.setState({ myRatingJSON: JSON.stringify(myRatingArray), visibleWinner: [], save: add }, () => {})
  }

  removeFromMyRating = item => {
    const { getObjectAssign, chatServiceGet } = this.rootprops
    const { user, myRatingServer, changeMyRatingLocal, changeMyRatingServer, myRatingLocal } = this.c.props
    const chMyRatingServer = myRatingServer
    const chMyRatingLocal = getObjectAssign([], myRatingLocal)

    for (let i = 0; i < chMyRatingLocal.length; i++) {
      chMyRatingLocal[i].list = chMyRatingLocal[i].list.filter(h => Number(h.huid) !== Number(item.huid))
    }

    changeMyRatingLocal(chMyRatingLocal)

    for (let i = 0; i < chMyRatingServer.length; i++) {
      chMyRatingServer[i].list = chMyRatingServer[i].list ? chMyRatingServer[i].list.filter(h => Number(h.huid) !== Number(item.huid)) : []
    }

    changeMyRatingServer(chMyRatingServer)

    for (let i = 0; i < chMyRatingServer.length; i++) {
      let ids = []
      let url = 'action=create_hotels_comp_criteria&criteria_id=' + chMyRatingServer[i].id + '&hash=' + (user.hash_rt ? user.hash_rt : '') + '&user_id=' + user.id_user

      for (let j = 0; j < chMyRatingServer[i].list.length; j++) {
        if (chMyRatingServer[i].list && chMyRatingServer[i].list.length > 0) {
          ids.push(Number(chMyRatingServer[i].list[j].huid))
        }
      }

      url += '&hotels=' + ids.join(',')
      chatServiceGet.setMyRating(url).then()
    }

    this.c.setNewData(chMyRatingServer)
  }

  removeFromMyCategory = item => {
    const { getObjectAssign, chatServiceGet } = this.rootprops
    const { user, myRatingServer, changeMyRatingLocal, changeMyRatingServer, myRatingLocal } = this.c.props
    const { slideId } = this.c.state
    const chMyRatingServer = getObjectAssign([], myRatingServer)

    if (item.notSave) {
      const chMyRatingLocal = getObjectAssign([], myRatingLocal)
      const hList = chMyRatingLocal.filter(r => Number(r.id) === Number(slideId))[0]
      hList.list = hList.list.filter(h => Number(h.huid) !== Number(item.huid))

      changeMyRatingLocal(chMyRatingLocal)
    } else {
      const hList = chMyRatingServer.filter(r => Number(r.id) === Number(slideId))[0]
      hList.list = hList.list.filter(h => Number(h.huid) !== Number(item.huid))

      changeMyRatingServer(chMyRatingServer)

      let ids = []
      let url = 'action=create_hotels_comp_criteria&criteria_id=' + slideId + '&hash=' + (user.hash_rt ? user.hash_rt : '') + '&user_id=' + user.id_user

      for (let j = 0; j < hList.list.length; j++) {
        ids.push(Number(hList.list[j].huid))
      }

      url += '&hotels=' + ids.join(',')
      chatServiceGet.setMyRating(url).then()
    }

    this.c.setNewData(chMyRatingServer)
  }

  changeRatingHotel = (item, rating) => {
    const { getObjectAssign } = this.rootprops
    const { myRatingServer, changeMyRatingLocal, changeMyRatingServer, myRatingLocal } = this.c.props
    const { slideId } = this.c.state
    const chMyRatingLocal = getObjectAssign([], myRatingLocal)
    const hotelL = chMyRatingLocal.filter(r => Number(r.id) === Number(slideId))[0].list.filter(h => Number(h.huid) === Number(item.huid))[0]

    if (hotelL) {
      hotelL.my_rating = rating
      hotelL.notSave = true

      changeMyRatingLocal(chMyRatingLocal)
    }

    const chMyRatingServer = getObjectAssign([], myRatingServer)
    const list = chMyRatingServer.filter(r => Number(r.id) === Number(slideId))[0]

    if (list && list.list && list.list.length > 0) {
      const hotelS = chMyRatingServer.filter(r => Number(r.id) === Number(slideId))[0].list.filter(h => Number(h.huid) === Number(item.huid))[0]

      if (hotelS) {
        hotelS.my_rating = rating
        hotelS.notSave = true

        changeMyRatingServer(chMyRatingServer)
      }
    }
  }

  saveRating = async () => {
    const { getObjectAssign, chatServiceGet } = this.rootprops
    const { user, changeMyRatingServer, changeMyRatingLocal, myRatingServer, myRatingLocal } = this.c.props
    const { data, slideId } = this.c.state

    this.c.setState({ data: [], isLoading: true })

    let url = 'action=create_hotels_comp_criteria&criteria_id=' + slideId + '&hash=' + (user.hash_rt ? user.hash_rt : '') + '&user_id=' + user.id_user
    let ids = []
    let my_rating = []
    const rating = orderBy(data, 'my_rating', 'desc')

    for (let i = 0; i < rating.length; i++) {
      if (Number(rating[i].my_rating) !== 0) {
        ids.push(rating[i].huid)
        my_rating.push(rating[i].my_rating)
      }
    }

    url += '&hotels=' + ids.join(',') + '&my_rating=' + my_rating.join(',') + '&user_id=' + user.id_user

    await chatServiceGet.setMyRating(url)

    setTimeout(async () => {
      const path = 'action=get_my_comps&user_id=' + user.id_user + '&hash=' + (user.hash_rt ? user.hash_rt : '')
      const ratingServer = await chatServiceGet.getMyRating(path)
      const listServer = ratingServer.filter(r => Number(r.id) === Number(slideId))[0]
      const listLocal = getObjectAssign([], myRatingServer)
      const current = listLocal.filter(r => Number(r.id) === Number(slideId))[0]
      // current.list = listServer.list ? listServer.list : []

      changeMyRatingServer(listLocal)

      const myRatingArray = getObjectAssign([], myRatingLocal)

      for (let a = 0; a < myRatingArray.length; a++) {
        if (Number(myRatingArray[a].id) === Number(slideId)) {
          myRatingArray[a].list = []
        }
      }

      changeMyRatingLocal(orderBy(myRatingArray, 'id'))

      this.c.setNewData(listLocal)
    }, 1000)
  }

  saveRatingCurrent = async item => {
    const { getObjectAssign, chatServiceGet } = this.rootprops
    const { user, changeMyRatingServer, changeMyRatingLocal, myRatingServer, myRatingLocal } = this.c.props
    const { slideId } = this.c.state

    const cur = myRatingServer.filter(r => Number(r.id) === Number(slideId))[0]

    let url = 'action=create_hotels_comp_criteria&criteria_id=' + slideId + '&hash=' + (user.hash_rt ? user.hash_rt : '') + '&user_id=' + user.id_user
    let ids = []
    let my_rating = []
    const rating = orderBy(cur.list, 'my_rating', 'desc')

    for (let i = 0; i < rating.length; i++) {
      if (Number(rating[i].my_rating) !== 0) {
        ids.push(rating[i].huid)
        my_rating.push(rating[i].my_rating)
      }
    }

    const loc = myRatingLocal.filter(r => Number(r.id) === Number(slideId))[0]
    const ratingLoc = orderBy(loc.list, 'my_rating', 'desc')

    for (let i = 0; i < ratingLoc.length; i++) {
      if (Number(ratingLoc[i].my_rating) !== 0) {
        ids.push(ratingLoc[i].huid)
        my_rating.push(ratingLoc[i].my_rating)
      }
    }

    url += '&hotels=' + ids.join(',') + '&my_rating=' + my_rating.join(',') + '&user_id=' + user.id_user

    return await chatServiceGet.setMyRating(url)
  }

  onDismissSnackBar = () => {
    this.c.setState({ visibleSnackbar: false })
  }

  setWinners = () => {
    const { myRatingJSON, slideIndex, visibleWinner } = this.c.state

    if (visibleWinner[slideIndex] === 1) {
      let rating = []

      try {
        rating = JSON.parse(myRatingJSON)
      } catch (e) {
        console.log('PARSE ERROR:', e)
      }

      if (rating[slideIndex].list.length > 0) {
        rating[slideIndex].list.sort((prev, next) => prev.my_rating - next.my_rating)
      }

      let hotels = []

      for (let j = rating[slideIndex].list.length; j > 0; j--) {
        hotels.push(rating[slideIndex].list[j - 1])
      }

      rating[slideIndex].list = hotels
      visibleWinner[slideIndex] = 2
      this.c.setState({ myRatingJSON: JSON.stringify(rating), save: true, visibleWinner: visibleWinner, curTime: new Date() })
    }
  }

  setSelectedCountries = selectedCountries => {
    this.c.setState({ selectedCountries: selectedCountries })
  }

  setFilterURLWeb = (cuid, puid, hclass) => {
    this.c.setState({ visibleModal: false, cuid: cuid, puid: puid, hclass: hclass })
  }

  openModalFilter = () => {
    this.c.setState({ visibleModal: true })
  }

  closeModalFilter = () => {
    this.c.setState({ visibleModal: false })
  }

  setNewData = myRatingServer => {
    const { getObjectAssign } = this.rootprops
    const { myRatingLocal } = this.c.props
    const { slideId } = this.c.state

    this.c.setState({ data: [], isLoading: true }, () => {
      const currentList = myRatingServer.filter(c => Number(c.id) === Number(slideId))[0]
      const currentListLocal = myRatingLocal.filter(c => Number(c.id) === Number(slideId))[0]
      let data = currentList && currentList.list && currentList.list.length > 0 ? currentList.list : []

      if (currentListLocal && currentListLocal.list.length > 0) {
        data = data.concat(currentListLocal.list)
      }

      this.c.setState({ data: getObjectAssign([], data), isLoading: false })
    })
  }

  getNotSaveHotels = () => {
    const { myRatingServer, setChangeMyRating, myRatingLocal } = this.c.props
    const { slideId } = this.c.state

    let notSaveHotels = false
    let nullHotels = 0

    if (myRatingLocal) {
      for (let i = 0; i < myRatingLocal.length; i++) {
        if (myRatingLocal[i] && myRatingLocal[i].list) {
          if (Number(myRatingLocal[i].id) === Number(slideId) && myRatingLocal[i].list.length > 0) {
            notSaveHotels = true
            const hs = myRatingLocal[i].list.filter(r => Number(r.my_rating) === 0)
            nullHotels += hs.length

            break
          }
        }
      }
    }

    if (!notSaveHotels && myRatingServer) {
      for (let i = 0; i < myRatingServer.length; i++) {
        if (myRatingServer[i] && myRatingServer[i].list) {
          if (myRatingServer[i] && myRatingServer[i].list && Number(myRatingServer[i].id) === Number(slideId) && myRatingServer[i].list.length > 0) {
            const hotel = myRatingServer[i].list.filter(h => h.notSave)

            if (hotel.length > 0) {
              notSaveHotels = true

              const hs = myRatingServer[i].list.filter(r => Number(r.my_rating) === 0)
              nullHotels += hs.length

              break
            }
          }
        }
      }
    }

    setChangeMyRating(notSaveHotels)

    return { notSaveHotels, nullHotels }
  }
}

export default MyHotelsController
