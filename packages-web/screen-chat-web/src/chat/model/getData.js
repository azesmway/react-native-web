import isEmpty from 'lodash/isEmpty'
import { Platform } from 'react-native'

import { getLastMessages, getNewMessages, getOldMessages } from '../load'

const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
const { messagesIds, addToMessagesIds, setMessagesIds } = GLOBAL_OBJ.onlinetur.storage

class GetData {
  constructor(component, props) {
    this.c = component
    this.rootprops = props
  }

  setOldMessages = async (lastGet = false, nullMessageView = true, isScrollToBottom = true) => {
    return new Promise(resolve => {
      const { oldMessageId, newMessageId } = this.c.state
      const { filter, user, pathname, hobby, agent, setChatMessagesOld, setChatScrollToBottom, openIdMessage } = this.c.props

      getOldMessages(oldMessageId, newMessageId, filter, user, pathname, hobby, nullMessageView, agent, this.rootprops).then(result => {
        if (result.isErrorServer) {
          this.c.setState({ isErrorServer: result.isErrorServer, isErrorServerText: result.isErrorServerText }, () => {
            resolve(false)
          })
        } else {
          this.c.setState({ oldMessageId: result.oldMessageId }, () => {
            setChatScrollToBottom(isScrollToBottom)
            setChatMessagesOld(result.data)

            resolve(result.data.length)
          })
        }
      })
    })
  }

  setLastMessages = (id_message = null) => {
    return new Promise((resolve, reject) => {
      if (!id_message) {
        id_message = this.c.state.first_id
      }

      const { filter, user, pathname, setChatMessages, openIdMessage } = this.c.props

      getLastMessages(id_message, filter, user, pathname, this.rootprops).then(result => {
        if (result.isErrorServer) {
          this.c.setState({ isLoading: false, isErrorServer: result.isErrorServer, isErrorServerText: result.isErrorServerText }, () => {
            resolve(false)
          })
        } else {
          this.c.setState(
            {
              lastMessage: !isEmpty(result.data) && result.data.length > 0 ? result.data : [],
              oldMessageId: result.oldMessageId,
              newMessageId: result.newMessageId
            },
            () => {
              if (openIdMessage) {
                if (result.data.length > 0) {
                  setChatMessages(result.data)
                }
              } else {
                setChatMessages(result.data)
              }

              resolve(true)
            }
          )
        }
      })
    })
  }

  setNewMessages = async (id_message = null, start = 0, myMessage = false) => {
    return new Promise((resolve, reject) => {
      const { mobile } = this.rootprops

      const { filter, user, pathname, setChatMessagesNew, setChatScrollToBottom } = this.c.props
      const { openReplayMessage } = this.c.state

      if (!id_message) {
        id_message = this.c.state.newMessageId
      }

      if (!this.c.loadWhileNewMessage) {
        resolve(0)

        return
      }

      getNewMessages(id_message, filter, user, pathname, false, this.rootprops).then(async result => {
        if (result.isErrorServer) {
          this.c.setState({ isLoading: false, isErrorServer: result.isErrorServer, isErrorServerText: result.isErrorServerText }, () => {
            resolve(false)
          })
        } else if (isEmpty(result.data)) {
          this.c.setState({ isLoading: false }, () => {
            resolve(result.data.length)
          })
        } else {
          if (result.data.length > 0) {
            let lastUniq = result.data.filter(function (item) {
              return messagesIds().indexOf(item.id) === -1
            })

            await addToMessagesIds(lastUniq)

            this.c.setState(
              {
                newMessageId: result.newMessageId,
                newMessages: !openReplayMessage ? lastUniq : []
              },
              () => {
                setChatMessagesNew(lastUniq)

                setTimeout(() => {
                  if (myMessage) {
                    setChatScrollToBottom(true)

                    setTimeout(() => {
                      setChatScrollToBottom(false)
                    }, 300)
                  }
                }, 300)
              }
            )

            if (Platform.OS === 'web') {
              const cookie = await mobile.getCookie()
              cookie.remove('message', { path: '/' })
            }

            resolve(lastUniq.length)
          }
        }
      })
    })
  }

  loadNewMessages = async () => {
    this.c.setState({ newMessages: [] })
  }

  loadEndMessages = async () => {
    this.c.loadWhileNewMessage = false
    setMessagesIds()
    return await this.c.loadingMessages(null, 0, -10)
  }
}

export default GetData
