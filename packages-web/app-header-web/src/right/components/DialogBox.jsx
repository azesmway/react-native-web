import React, { PureComponent } from 'react'
import { Button, Dimensions, Platform, View } from 'react-native'

const { width, height } = Dimensions.get('window')

const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
const { WIDTH_MAX } = GLOBAL_OBJ.onlinetur.constants

class DialogBox extends PureComponent {
  constructor(props) {
    super(props)

    this.state = {}

    this.escFunction = event => {
      const { handleCloseDialog } = this.props

      if (event.keyCode === 27) {
        handleCloseDialog()
      }
    }
  }

  componentDidMount = async () => {
    if (Platform.OS === 'web') {
      document.addEventListener('keydown', this.escFunction, false)
    }
  }

  componentWillUnmount() {
    if (Platform.OS === 'web') {
      document.removeEventListener('keydown', this.escFunction, false)
    }
  }

  render() {
    const { Icon, Modal, Portal } = this.props.utils
    const { children, title, isOpenDialog, handleCloseDialog } = this.props

    return (
      <Portal>
        <Modal visible={isOpenDialog} onDismiss={() => handleCloseDialog()} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <View
            style={{
              width: width < WIDTH_MAX ? '100%' : '90%',
              borderRadius: 10,
              backgroundColor: '#ffffff',
              alignSelf: 'center',
              height: (height / 100) * 80
            }}>
            {children}
            <Button
              aria-label="close"
              style={{
                position: 'absolute',
                right: -20,
                top: -50
              }}
              title={title}
              onClick={handleCloseDialog}>
              <Icon style={{ color: 'white', fontSize: 40 }} />
            </Button>
          </View>
        </Modal>
      </Portal>
    )
  }
}

export default DialogBox
