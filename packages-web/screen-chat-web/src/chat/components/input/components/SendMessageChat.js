import isEmpty from 'lodash/isEmpty'
import React from 'react'
import { TouchableOpacity } from 'react-native'

class SendMessageChat extends React.PureComponent {
  constructor(props) {
    super(props)

    this.state = {}
  }

  render() {
    const { textMessage, onSend, children, images, images360, setChatTextMessage, style } = this.props

    return (
      <TouchableOpacity
        style={style}
        onPress={() => {
          if ((textMessage !== '' || images > 0 || !isEmpty(images360)) && onSend) {
            this.setState({ disabled: true }, () => {
              onSend({ text: textMessage.trim() }, true)
              setChatTextMessage('')
            })
          }
        }}>
        <>{children}</>
      </TouchableOpacity>
    )
  }
}

export default SendMessageChat
