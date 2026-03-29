import { useEffect } from 'react'

import ChatScreen from './chat/chat'
import ImageView from './chat/components/image'
import ChatModal from './chat/components/modal'
import ScrollBottom from './chat/components/scroll'
import Themes from './chat/components/themes'
import ViewMessage from './chat/components/user'

const Chat = ({ mini = false, text = '', bot = false, utils, setHeaderParams, setFooterBar }) => {
  const { ActionSheetProvider } = utils

  useEffect(() => {
    return () => {
      setHeaderParams({})
      setFooterBar({})
    }
  }, [])

  return (
    <>
      <ActionSheetProvider>
        <ChatScreen text={text} bot={bot} />
      </ActionSheetProvider>
      <Themes />
      <ChatModal />
      <ViewMessage />
      <ImageView />
      <ScrollBottom mini={mini} />
    </>
  )
}

export default Chat
