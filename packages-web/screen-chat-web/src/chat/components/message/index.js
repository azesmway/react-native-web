import { useEffect, useRef, useState } from 'react'

import Message from './Message'

export default function MessageComponent(props) {
  const [isLoading, setLoading] = useState(true)
  const module = useRef(undefined)

  const loadModules = async () => {
    const [store, { withRouter, theme }, { Icon, ListItem }, { Avatar, Day, SystemMessage }] = await Promise.all([
      import('app-store-web'),
      import('app-utils-web'),
      import('react-native-elements'),
      import('react-native-gifted-chat')
    ])

    module.current = {
      store,
      withRouter,
      theme,
      Icon,
      ListItem,
      Avatar,
      Day,
      SystemMessage
    }
  }

  useEffect(() => {
    loadModules().then(() => setLoading(false))
  }, [])

  if (isLoading) {
    return null
  }

  return <Message {...props} utils={module.current} />
}
