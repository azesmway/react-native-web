// import { Core } from 'app-core'
// import { chatServiceGet, rtkQuery } from 'app-services'
// import { t } from 'app-utils'
import isEmpty from 'lodash/isEmpty'
import { Alert, Platform } from 'react-native'

class modelAgent {
  constructor(component, props) {
    this.c = component
    this.rootprops = props
  }

  onSetAccessAgent = agent => {
    const { t } = this.rootprops

    let txt = t('screens.profile.agent.model.modelagent.agent') + (agent === 1 ? t('screens.profile.agent.model.modelagent.set') : t('screens.profile.agent.model.modelagent.unset'))
    this.c.setState({ visible: true, snackbarText: txt })
  }

  initData = () => {
    const { functions } = this.rootprops
    const { user, agentTowns, passwordSotr } = this.c.props

    if (!isEmpty(user)) {
      this.c.setState({
        passwordVerify: user.is_sotr === 1,
        password: user.is_sotr === 1 ? '340955' : user.is_sotr !== 1 && passwordSotr !== '' ? passwordSotr : '',
        towns: functions.convertTowns(agentTowns),
        townAgent: user.my_city,
        switchDisabled: user.is_sotr === 1
      })
    } else {
      this.c.setState({
        phone: '',
        note: '',
        passwordVerify: false,
        switchDisabled: user.is_sotr === 1
      })
    }
  }

  onDismissSnackBar = () => {
    this.c.setState({ visible: false })
  }

  handlePasswordVerify = async passwordVerify => {
    const { chatServiceGet, rtkQuery, functions, t } = this.rootprops

    const { user, setUser, filter, currentCategory, setFilter, setAgentTowns, setAgent, setPasswordSotr, fcmToken, expoToken, device } = this.c.props
    const { password } = this.c.state

    const result = await chatServiceGet.setAgentPassword(user.android_id_install, user.device.token, passwordVerify ? password : 'del')

    if (result.code === 0) {
      let agentTowns = null
      let agentData = null

      if (passwordVerify) {
        const agent = await rtkQuery.getRTKQueryDataPostsAgent(user.android_id_install, user.device.token, fcmToken, currentCategory.id, expoToken, device.url)

        if (agent.code === 0) {
          agentTowns = agent.data.filter(function (item) {
            return item.tip === 0 && item.del === 0 && item.title !== ''
          })
          setAgentTowns(functions.convertTowns(agentTowns))

          agentData = agent.data.filter(function (item) {
            return item.tip === 1 && item.del === 0 && item.title !== ''
          })

          if (agentData) {
            setAgent(agentData)
          }

          setPasswordSotr(password)

          let userNew = Object.assign({}, user)
          userNew.is_sotr = passwordVerify ? 1 : 0
          setUser(userNew)

          let filterNew = Object.assign({}, filter)
          filterNew.selectedAgent = currentCategory.default_id_profi
          filterNew.selectedAgentName = currentCategory.default_title_profi
          setFilter(filterNew)
        }

        if (Platform.OS !== 'web' && passwordVerify) {
          Alert.alert(t('common.attention'), t('screens.profile.agent.model.modelagent.agentTown'))
        }
      } else {
        this.c.setState({ passwordVerify: passwordVerify, switchDisabled: false }, () => {
          let userNew = Object.assign({}, user)
          userNew.is_sotr = passwordVerify ? 1 : 0
          setUser(userNew)
        })
      }
    }
  }

  handleChangeMobile = town => {
    const { user, setUser } = this.c.props

    this.c.setState({ townAgent: town }, () => {
      let obj = Object.assign({}, user)
      obj.my_city = town
      setUser(obj)
    })
  }
}

export default modelAgent
