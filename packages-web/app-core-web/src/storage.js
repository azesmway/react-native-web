let isAdmin = false
let isModerator = false
let isSotr = 0
let hashPassword = ''
let openLink = {}
let online = false
let UniqueId = ''
let user = ''
let login = ''
let user_id = 0
let avatar = ''
let show_phone = 0
let noTour = 1
let phone = ''
let note_for_user = ''
let TOKEN = ''
let TOKEN_FireBase = ''
const app = {}
let appRef = {}
const errorYellow = [
  'Warning: componentWillMount is deprecated',
  'Warning: componentWillReceiveProps is deprecated',
  'Warning: componentWillUpdate is deprecated',
  'Remote debugger',
  'Sending `tts-progress` with no listeners registered',
  'Sending `tts-start` with no listeners registered',
  'Sending `tts-finish` with no listeners registered',
  'Sending `tts-cancel` with no listeners registered',
  'The Internet connection appears to be offline.'
]
let themes = []
let themesTur = []
let townTur = []
let selectionTur = []
let userUrlNews = {}

let currentPlaces = []
let currentHotels = []

let radio = []

let arraySendingMessagesId = []

let region = {}
let currentMessage = {}

let currentChatMessagesId = []
let currentAgentChatMessagesId = []
let currentFavChatMessagesId = []

let currentComponent = null

let bookLimit = {}

let openCurrentMessageId = -1

let backgroundNotify = {}

let myRatingServer = []
let categoiesRatingServer = []
let countries = []

let ref = null

let appLang = 'ru'
let appLangInterface = 'ru'

let backgroundNotifyApp = {}

let idsNotifyApp = []

let startAppChat = false

let selectCategory = {}

let chatComponent = null

let _dispatch = null

let _auth_link = ''

let safeAreaInsets = {}

let appConfig = {}

let toast = null

export const ID_APP_VK = 7845298

export const typeNews = {
  sel_action: '\uD83D\uDD25 Акция от ОнлайнТур.рф \uD83D\uDD25',
  sel_news: '\uD83C\uDF0D Новость от ОнлайнТур.рф \uD83C\uDF0D',
  sel_price: '\uD83C\uDF0D Новость от ОнлайнТур.рф \uD83C\uDF0D',
  sel_reviews: '\uD83C\uDF34 Обзор от ОнлайнТур.рф \uD83C\uDF34'
}

export const newsMenu = ['sel_price', 'sel_action', 'sel_news', 'sel_reviews']

const hotels = []

let playerText = 'Онлайн Тур выбирай! И отлично отдыхай!'

export function getPlayerText() {
  return playerText
}

export function setPlayerText(data) {
  playerText = data
}

export function setToastFn(data) {
  toast = data
}

export function getToastFn() {
  return toast
}

export function setSafeAreaInsets(data) {
  safeAreaInsets = data
}

export function getSafeAreaInsets() {
  return safeAreaInsets
}

export function getChatComponent() {
  return chatComponent
}

export function setChatComponent(data) {
  chatComponent = data
}

export function setSelectCategory(data) {
  selectCategory = data
}

export function getSelectCategory() {
  return selectCategory
}

export function setStartAppChat(data) {
  startAppChat = data
}

export function getStartAppChat() {
  return startAppChat
}

export function setAppLang(data) {
  appLang = data
}

export function setAppLangInterface(data) {
  appLangInterface = data
}

export function getAppLang() {
  return appLang
}

export function getAppLangInterface() {
  return appLangInterface
}

export function setCountries(data) {
  countries = data
}

export function getCountries() {
  return countries
}

export function setCategoiesRatingServer(data) {
  categoiesRatingServer = data
}

export function getCategoiesRatingServer() {
  return categoiesRatingServer
}

export function setMyRating(data) {
  myRatingServer = data
}

export function getMyRating() {
  return myRatingServer
}

export function setBackgroundNotify(data) {
  backgroundNotify = data
}

export function getBackgroundNotify(data) {
  return backgroundNotify
}

export function setBackgroundNotifyApp(data) {
  backgroundNotifyApp = data
}

export function getBackgroundNotifyApp(data) {
  return backgroundNotifyApp
}

export function setIdsNotifyApp(data) {
  idsNotifyApp = data
}

export function getIdsNotifyApp(data) {
  return idsNotifyApp
}

export function getHotels(num) {
  return hotels[num]
}

export function getErrorYellow() {
  return errorYellow
}

export function getUniqueId() {
  return UniqueId
}

export function setUniqueId(data) {
  UniqueId = data
}

export function getRef() {
  return ref
}

export function setRef(data) {
  ref = data
}

export function getUser() {
  return user
}

export function setUser(data) {
  user = data
}

export function getRegion() {
  return region
}

export function setRegion(data) {
  region = data
}

export function getCurrentMessage() {
  return currentMessage
}

export function setCurrentMessage(data) {
  currentMessage = data
}

export function getLogin() {
  return login
}

export function setLogin(data) {
  login = data
}

export function getUserID() {
  return user_id
}

export function setUserID(data) {
  user_id = data
}

export function getUserAvatar() {
  return avatar
}

export function setUserAvatar(data) {
  avatar = data
}

export function getToken() {
  return TOKEN
}

export const setToken = data => {
  TOKEN = data
}

export function getTokenFirebase() {
  return TOKEN_FireBase
}

export function setTokenFirebase(data) {
  TOKEN_FireBase = data
}

export function setReloadApp(data) {
  app.func = data
}

export function getReloadApp(data) {
  return app.func
}

export function getThemes() {
  return themes
}

export function getThemesById(id) {
  return themes.filter(function (t) {
    return t.id === id
  })
}

export function setThemes(data) {
  themes = data
}

export function setCurrentPlaces(data) {
  currentPlaces = data
}

export function getCurrentPlaces() {
  return currentPlaces
}

export function getCurrentPlacesById(id) {
  return currentPlaces.filter(function (item) {
    return item.uid * 1 === id
  })
}

export function setCurrentHotels(data) {
  currentHotels = data
}

export function getCurrentHotels() {
  return currentHotels
}

export async function getCurrentHotelsById(id) {
  return currentHotels.filter(function (item) {
    return item.id === id
  })
}

export function getThemesCountry() {
  return themes.filter(function (item) {
    return item.tip === 0
  })
}

export async function getThemesCountryById(id) {
  return themes.filter(function (item) {
    return item.tip === 0 && item.id === id
  })
}

export function getThemesHobby() {
  return themes.filter(function (item) {
    return item.tip === 1
  })
}

export function getThemesHobbyById(id) {
  return themes.filter(function (item) {
    return item.tip === 1 && item.id === id
  })
}

export async function getThemesHotel(id) {
  return themes.filter(function (item) {
    return item.tip === 2 && item.id_country === id
  })
}

export function getThemesTur() {
  return themesTur
}

export function getThemesTurById(id) {
  return themesTur.filter(function (item) {
    return item.id === id
  })
}

export function setThemesTur(data) {
  themesTur = data
}

export function getTownTur() {
  return townTur
}

export async function setTownTur(data) {
  townTur = data
}

export function getSectionTur() {
  return [...selectionTur]
}

export async function setSectionTur(data) {
  selectionTur = data
}

export function getUserUrlNews() {
  return userUrlNews
}

export function setUserUrlNews(data) {
  userUrlNews = data
}

export function getRadio() {
  return radio
}

export async function setRadio(data) {
  radio = data
}

export async function addToMessagesIds(messages) {
  for (let i = 0; i < messages.length; i++) {
    currentChatMessagesId.push(messages[i].id)
  }
}

export function messagesIds() {
  return currentChatMessagesId
}

export function setMessagesIds() {
  currentChatMessagesId = []
}

export async function addToAgentMessagesIds(messages) {
  for (let i = 0; i < messages.length; i++) {
    currentAgentChatMessagesId.push(messages[i].id)
  }
}

export function messagesAgentIds() {
  return currentAgentChatMessagesId
}

export function setMessagesAgentIds() {
  currentAgentChatMessagesId = []
}

export async function addToFavMessagesIds(messages) {
  for (let i = 0; i < messages.length; i++) {
    currentFavChatMessagesId.push(messages[i].id)
  }
}

export function messagesFavIds() {
  return currentFavChatMessagesId
}

export function setMessagesFavIds() {
  currentFavChatMessagesId = []
}

export function setOnline(data) {
  online = data
}

export function getOnline() {
  return online
}

export function setArraySendingMessagesId(id) {
  arraySendingMessagesId.push(id)
}

export function getArraySendingMessagesId() {
  return arraySendingMessagesId
}

export function removeFromArraySendingMessagesId(id) {
  arraySendingMessagesId = arraySendingMessagesId.filter(function (item) {
    return item !== id
  })
}

export async function setCurrentComponent(data) {
  currentComponent = data
}

export async function getCurrentComponent() {
  return currentComponent
}

// export function getProject() {
//   if (project === appConfig.displayName) {
//     return appConfig.domainMain
//   } else if (project === 'skidkionline') {
//     return 'Skidki-Online.ru'
//   }
// }
//
// export function getProjectExp() {
//   if (project === 'onlinetur') {
//     return 'OnlineTur'
//   } else if (project === 'skidkionline') {
//     return 'SkidkiOnline'
//   }
// }
//
// export function getProjectName() {
//   if (project === 'onlinetur') {
//     return 'Онлайн Тур'
//   } else if (project === 'skidkionline') {
//     return 'Скидки Онлайн'
//   }
// }
//
// export function getProjectConfig() {
//   return project
// }

export function setAppRef(data) {
  appRef = data
}

export function getAppRef() {
  return appRef
}

export function setAdmin(data) {
  isAdmin = data
}

export function getAdmin() {
  return isAdmin === 1
}

export function setModerator(data) {
  isModerator = data
}

export function getModerator() {
  return isModerator === 1
}

export function setSotr(data) {
  isSotr = data
}

export function getSotr() {
  return isSotr === 1
}

export function setHashPassword(data) {
  hashPassword = data
}

export function getHashPassword() {
  return hashPassword
}

export function setOpenLink(data) {
  openLink = data
}

export function getOpenLink() {
  return openLink
}

export function setShowPhone(data) {
  show_phone = data
}

export function getShowPhone() {
  return show_phone
}

export function setUserPhone(data) {
  phone = data
}

export function getUserPhone() {
  return phone
}

export function setNoteForUser(data) {
  note_for_user = data
}

export function getNoteForUser() {
  return note_for_user
}

export function setNoTour(data) {
  noTour = data
}

export function getNoTour() {
  return noTour
}

export function setBookLimit(data) {
  bookLimit = data
}

export function getBookLimit() {
  return bookLimit
}

export function setOpenCurrentMessageId(data) {
  openCurrentMessageId = data
}

export function getOpenCurrentMessageId() {
  return openCurrentMessageId
}

export function setAppConfig(data) {
  appConfig = data
}

export function getAppConfig() {
  return appConfig
}

export function getAppConstants() {
  return appConfig.constants
}

export function setAuthLink(data) {
  _auth_link = data
}

export function getAuthLink() {
  return _auth_link
}
