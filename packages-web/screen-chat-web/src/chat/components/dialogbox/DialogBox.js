import { useCallback, useEffect } from 'react'
import { Button, Platform, View } from 'react-native'

function DialogBox({ utils, children, title, isOpenDialog, handleCloseDialog }) {
  const { Portal, Modal, Icon } = utils

  // --- Закрытие по Escape (только web) ---

  const handleKeyDown = useCallback(
    event => {
      if (event.keyCode === 27) handleCloseDialog()
    },
    [handleCloseDialog]
  )

  useEffect(() => {
    if (Platform.OS !== 'web') return

    document.addEventListener('keydown', handleKeyDown, false)
    return () => document.removeEventListener('keydown', handleKeyDown, false)
  }, [handleKeyDown])

  return (
    <Portal>
      <Modal visible={isOpenDialog} onDismiss={handleCloseDialog} style={{ flex: 1 }}>
        <View style={{ flex: 1 }}>
          {children}
          <Button style={{ position: 'absolute', right: 10, top: 10 }} onClick={handleCloseDialog} title={title}>
            <Icon style={{ color: 'white', fontSize: 40 }} />
          </Button>
        </View>
      </Modal>
    </Portal>
  )
}

export default DialogBox
