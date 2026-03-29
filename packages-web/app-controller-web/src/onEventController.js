/**
 * -----------------------------------------------------------------------
 *  Author      : Alexey Zolotarеv
 *  E-mail      : azesm@me.com
 * -----------------------------------------------------------------------
 */

import isEmpty from 'lodash/isEmpty'
import { Platform } from 'react-native'

const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
const { getAppConstants, setToken, getAppConfig } = GLOBAL_OBJ.onlinetur.storage

class onEventController {
  constructor(component, props) {
    this.c = component
    this.rootprops = props
  }

  openChatWithLink = (match = null) => {
    const { Alert, init } = this.rootprops
    const { history, user, location, setUser } = this.c.props

    init.initMainAppMatch(this.c, match).then(async result => {
      if (result) {
        this.c.setState({ isLoading: false })

        if (!user.device) {
          await this.c.isEmptyUser(location, history, match)
        } else {
          await this.c.isNotEmptyUser(location, history, user, setUser)
        }
      } else {
        Alert.alert('Ошибка!', 'Ошибка доступа к серверу.')
      }
    })
  }

  openChatWithFilter = match => {
    const { Alert, init } = this.rootprops
    const { history, user, location, setUser, pathname } = this.c.props

    this.c.setState({ isOpenLogin: false, isLoading: false, isLoadingEarlier: true }, async () => {
      let link = this.c.startLink !== '' ? this.c.startLink : pathname
      init.initMainApp(this.c, link, false, match).then(async result => {
        if (result) {
          if (result.error) {
            history(result.url)

            return
          }

          this.c.setState({ isLoading: false })

          if (isEmpty(user)) {
            await this.c.isEmptyUser(location, history)
          } else {
            await this.c.isNotEmptyUser(location, history, user, setUser)
          }
        } else {
          Alert.alert('Ошибка!', 'Ошибка доступа к серверу.')
        }
      })
    })
  }

  autoLogin = async (idToken = null) => {
    const { Alert, cookies, chatServiceGet, rtkQuery, appcore } = this.rootprops
    const { history, setUser, currentCategory } = this.c.props
    let uniqueId = 'mac_' + appcore.createUUID()
    const referal = cookies.load('referal')

    chatServiceGet.registerOnServer(idToken, uniqueId, referal, 'web').then(async data => {
      if (data.code === 0) {
        if (!idToken) {
          data.android_id_install = uniqueId
        }

        const dataList = await rtkQuery.getRTKQueryDataPosts(data.android_id_install, data && data.device && data.device.token ? data.device.token : '', '', currentCategory.id)

        if (dataList.code === 0) {
          if (data.id_user && dataList.hotels_user && dataList.hotels_user.length > 0) {
            data.hotels_user = dataList.hotels_user
          }
        }

        if (!data.img_path) {
          data.img_path = getAppConstants().url_main + '/images/user.png'
        } else if (data.img_path.indexOf('stuzon') > -1) {
          data.img_path = data.img_path.replace('https://stuzon.com/chat', getAppConstants().url_main)
        } else if (data.img_path.indexOf('/a/') > -1) {
          data.img_path = data.img_path.replace('/a/', '/').replace('www.', 'a.')
        }

        data.hash_rt = dataList.hash_rt ? dataList.hash_rt : '1'
        data.hash_ml = dataList.hash_ml ? dataList.hash_ml : '1'

        setToken(data.android_id_install)
        setUser(data)
      } else {
        this.c.setState({ isOpenLogin: false, isLoading: false }, () => {
          Alert.alert('Ошибка!', 'Невозможно авторизоваться, возможно неверный токен!')

          history(this.c.startLink)
          this.c.startLink = ''
        })
      }
    })
  }

  closeLogin = () => {
    const { history } = this.c.props

    this.c.setState({ isOpenLogin: false, isOpenLoginOAuth: false, isLoading: false }, () => {
      history(getAppConfig().startPage)
    })
  }

  handleOpenLogin = () => {
    this.c.setState({ isOpenLogin: true })
  }

  handleOpenLoginOAuth = () => {
    this.c.setState({ isOpenLoginOAuth: true })
  }

  handleCloseAlert = () => {
    this.c.setState({
      openAlert: false,
      currentMessage: null,
      isDeleteMessage: false,
      deleteMessage: null,
      shareMessage: null,
      isShareMessage: false,
      warningMessage: null,
      isWarningMessage: false,
      isEditMessage: false,
      editMessage: null,
      menuComponent: null,
      bubble: null
    })
  }

  authOpen = () => {
    const { dispatch, appApi, cookies, chatServiceGet, rtkQuery } = this.rootprops
    const { filter, setUser, setAgent, setAgentTowns, setFilter, currentCategory } = this.c.props

    dispatch(appApi.endpoints.getUserCross.initiate(false)).then(async userCross => {
      const result = userCross.data

      if (result.id_user === '') {
        this.c.setState({ isLoading: false })
        this.handleOpenLogin()
      } else {
        let referal = cookies.load('referal')

        if (!referal) {
          referal = cookies.load('referrer')
        }

        setToken(result.android_id_install)
        const code = cookies.load('sotrCode')

        if (!isEmpty(code)) {
          const sotr = await chatServiceGet.fetchSetSotr(code, result.device.token, result.android_id_install)

          if (sotr.code === 0) {
            result.is_sotr = 1
            cookies.remove('sotrCode', { path: '/' })
          }
        }

        if (result.is_sotr && result.is_sotr === 1) {
          const agent = await rtkQuery.getRTKQueryDataPostsAgent(result.android_id_install, result.device.token, '', currentCategory.id)

          const agentData = agent.data.filter(function (item) {
            return item.tip === 1 && item.del === 0 && item.title !== ''
          })

          const agentTowns = agent.data.filter(function (item) {
            return item.tip === 0 && item.del === 0 && item.title !== ''
          })

          setAgent(agentData)
          setAgentTowns(agentTowns)

          result.hotels_user = agent.hotels_user
          result.hash_rt = agent.hash_rt ? agent.hash_rt : ''
          result.hash_ml = agent.hash_ml ? agent.hash_ml : ''
        }

        if (!result.img_path) {
          result.img_path = getAppConstants().url_main + '/images/user.png'
        } else if (result.img_path.indexOf('stuzon') > -1) {
          result.img_path = result.img_path.replace('https://stuzon.com/chat', getAppConstants().url_main)
        } else if (result.img_path.indexOf('/a/') > -1) {
          result.img_path = result.img_path.replace('/a/', '/').replace('www.', 'a.')
        }

        const newFilter = Object.assign({}, filter)
        newFilter.selectCategory = {}
        setFilter(newFilter)

        setUser(result)
      }
    })
  }

  closeLoginWindow = () => {
    this.c.setState({ isOpenLogin: false })
  }

  authOpenOAuth = () => {
    const { dispatch, appApi, cookies, chatServiceGet, rtkQuery } = this.rootprops
    const { filter, setUser, setAgent, setAgentTowns, setFilter, currentCategory } = this.c.props

    dispatch(appApi.endpoints.getUserCross.initiate(false)).then(async userCross => {
      const result = userCross.data

      if (Number(result.id_user) === 0) {
        this.c.setState({ isLoading: false })
        this.handleOpenLoginOAuth()
      } else {
        let referal = cookies.load('referal')

        if (!referal) {
          referal = cookies.load('referrer')
        }

        setToken(result.android_id_install)
        const code = cookies.load('sotrCode')

        if (!isEmpty(code)) {
          const sotr = await chatServiceGet.fetchSetSotr(code, result.device.token, result.android_id_install)

          if (sotr.code === 0) {
            result.is_sotr = 1
            cookies.remove('sotrCode', { path: '/' })
          }
        }

        if (result.is_sotr && result.is_sotr === 1) {
          const agent = await rtkQuery.getRTKQueryDataPostsAgent(result.android_id_install, result.device.token, '', currentCategory.id)

          const agentData = agent.data.filter(function (item) {
            return item.tip === 1 && item.del === 0 && item.title !== ''
          })

          const agentTowns = agent.data.filter(function (item) {
            return item.tip === 0 && item.del === 0 && item.title !== ''
          })

          setAgent(agentData)
          setAgentTowns(agentTowns)

          result.hotels_user = agent.hotels_user
          result.hash_rt = agent.hash_rt ? agent.hash_rt : ''
          result.hash_ml = agent.hash_ml ? agent.hash_ml : ''
        }

        if (!result.img_path) {
          result.img_path = getAppConstants().url_main + '/images/user.png'
        } else if (result.img_path.indexOf('stuzon') > -1) {
          result.img_path = result.img_path.replace('https://stuzon.com/chat', getAppConstants().url_main)
        } else if (result.img_path.indexOf('/a/') > -1) {
          result.img_path = result.img_path.replace('/a/', '/').replace('www.', 'a.')
        }

        const newFilter = Object.assign({}, filter)
        newFilter.selectCategory = {}
        setFilter(newFilter)

        setUser(result)
      }
    })
  }

  closeLoginWindowOAuth = () => {
    this.c.setState({ isOpenLoginOAuth: false })
  }
}

export default onEventController
