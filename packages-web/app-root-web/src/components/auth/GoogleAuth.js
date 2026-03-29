/**
 * -----------------------------------------------------------------------
 *  Author      : Alexey Zolotarеv
 *  E-mail      : azesm@me.com
 * -----------------------------------------------------------------------
 */

import { useGoogleOneTapLogin } from '@react-oauth/google'
import { getCookie } from 'app-core-web/src/mobile'
import { getAppConstants, setToken } from 'app-core-web/src/storage.js'
import { fetchSetSotr, registerOnServer } from 'app-services/src/chat/get/fetch'
import { postDataAuth } from 'app-services/src/chat/post/fetch'
import { getRTKQueryDataPostsAgent } from 'app-services/src/chat/rtkQuery'
import isEmpty from 'lodash/isEmpty'
import React from 'react'
import { connect } from 'react-redux'

const GoogleAuth = props => {
  const regServer = async token => {
    const { setUser, currentCategory, setAgent, setAgentTowns, handleCloseLogin, filter, setFilter, androidIdInstall, history } = props
    const cookie = await getCookie()

    let referal = cookie.load('referal')

    if (!referal) {
      referal = cookie.load('referrer')
    }

    registerOnServer(token, androidIdInstall, referal, 'quick').then(async data => {
      if (data.code === 0) {
        if (!isEmpty(referal)) {
          cookie.remove('referal', { path: '/' })
          cookie.remove('referrer', { path: '/' })
        }

        if (!data.id_user) {
          setUser({})
          return null
        }

        data.android_id_install = androidIdInstall

        setToken(androidIdInstall)
        const code = cookie.load('sotrCode')

        if (!isEmpty(code)) {
          const sotr = await fetchSetSotr(code, data.device.token, data.android_id_install)

          if (sotr.code === 0) {
            data.is_sotr = 1
            cookie.remove('sotrCode', { path: '/' })
          }
        }

        if (data.is_sotr && data.is_sotr === 1) {
          const agent = await getRTKQueryDataPostsAgent(data.android_id_install, data.device.token, token, currentCategory.id)

          const agentData = agent.data.filter(function (item) {
            return item.tip === 1 && item.del === 0 && item.title !== ''
          })

          const agentTowns = agent.data.filter(function (item) {
            return item.tip === 0 && item.del === 0 && item.title !== ''
          })

          setAgent(agentData)
          setAgentTowns(agentTowns)

          data.hotels_user = agent.hotels_user
          data.hash_rt = agent.hash_rt ? agent.hash_rt : ''
          data.hash_ml = agent.hash_ml ? agent.hash_ml : ''
        }

        if (!data.img_path) {
          data.img_path = getAppConstants().url_main + '/images/user.png'
        } else if (data.img_path.indexOf('stuzon') > -1) {
          data.img_path = data.img_path.replace('https://stuzon.com/chat', getAppConstants().url_main)
        } else if (data.img_path.indexOf('/a/') > -1) {
          data.img_path = data.img_path.replace('/a/', '/').replace('www.', 'a.')
        }

        const newFilter = Object.assign({}, filter)
        newFilter.selectCategory = {}
        setFilter(newFilter)

        setUser(data)

        const body = new FormData()
        body.append('new_token', data.new_token)
        body.append('new_id_install', data.new_id_install)
        postDataAuth(body).then()

        handleCloseLogin()
        history('/')
      }
    })
  }

  useGoogleOneTapLogin({
    onSuccess: credentialResponse => {
      if (!props.user.id_user) {
        if (window.parent) {
          window.parent.postMessage({ type: 'message', message: 'success' }, '*')
        }
        regServer(credentialResponse.credential).then()
      }
    },
    onError: () => {
      if (window.parent) {
        window.parent.postMessage({ type: 'message', message: 'error' }, '*')
      }
      console.log('Login Failed')
    }
  })

  return <></>
}

const GoogleAuthHook = Component => {
  return async function WrappedComponent(props) {
    const { appSelector } = await import('app-store/src/app')
    const { chatAction } = await import('app-store/src/chat')
    const { filterAction, filterSelector } = await import('app-store/src/filter')
    const { userAction, userSelector } = await import('app-store/src/user')

    const mapStateToProps = state => ({
      user: userSelector.getUser(state),
      currentCategory: filterSelector.getSelectCategory(state),
      androidIdInstall: appSelector.getAndroidIdInstall(state),
      filter: filterSelector.getFilter(state)
    })

    const mapDispatchToProps = dispatch => ({
      setFilter: data => dispatch(filterAction.setFilter(data)),
      setUser: data => dispatch(userAction.setUser(data)),
      setAgent: data => dispatch(chatAction.setAgent(data)),
      setAgentTowns: data => dispatch(userAction.setAgentTowns(data))
    })

    Component = connect(mapStateToProps, mapDispatchToProps)(Component)

    return <Component {...props} />
  }
}

export default GoogleAuthHook(GoogleAuth)
