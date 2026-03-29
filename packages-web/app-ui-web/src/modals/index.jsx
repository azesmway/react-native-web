import { lazy, Suspense, useCallback, useMemo } from 'react'
import { Dimensions, Platform, View } from 'react-native'

const AlertDialog = lazy(() => import('./alert'))
const SelectCategory = lazy(() => import('./categories'))
const LoginDialog = lazy(() => import('./login'))
const Request = lazy(() => import('./request'))

const { width, height } = Dimensions.get('window')

// Shared styles
const MODAL_CONTAINER_STYLE = {
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center'
}

const BASE_VIEW_STYLE = {
  borderRadius: 10,
  backgroundColor: '#ffffff',
  alignSelf: 'center'
}

const GLOBAL_OBJ = Platform.OS === 'web' ? window : global

export default function Index(props) {
  const { Portal, Modal, isMobile } = props.utils
  const { modalCategory, modalAlert, modalLogin, modalRequest, setModalCategory, setModalAlert, setModalLogin, setModalRequest } = props

  // Memoize common onDismiss handler
  const createDismissHandler = useCallback(
    setModalFn => () => {
      GLOBAL_OBJ.onlinetur.props = {}
      GLOBAL_OBJ.onlinetur.params = {}
      setModalFn(false)
    },
    []
  )

  // Memoize dismiss handlers
  const handleDismissCategory = useMemo(() => createDismissHandler(setModalCategory), [setModalCategory])
  const handleDismissAlert = useMemo(() => createDismissHandler(setModalAlert), [setModalAlert])
  const handleDismissLogin = useMemo(() => createDismissHandler(setModalLogin), [setModalLogin])
  const handleDismissRequest = useMemo(() => createDismissHandler(setModalRequest), [setModalRequest])

  // Memoize view styles
  const categoriesViewStyle = useMemo(
    () => ({
      ...BASE_VIEW_STYLE,
      width: isMobile ? width - 20 : width / 2,
      height,
      marginTop: 140
    }),
    [isMobile]
  )

  const alertViewStyle = useMemo(
    () => ({
      ...BASE_VIEW_STYLE,
      width: isMobile ? width - 20 : width / 3,
      height: 300
    }),
    [isMobile]
  )

  // Generic modal renderer
  const renderModal = useCallback(
    (visible, onDismiss, children, viewStyle) => (
      <Portal>
        <Modal visible={visible} onDismiss={onDismiss} style={MODAL_CONTAINER_STYLE}>
          {viewStyle ? (
            <View style={viewStyle}>
              <Suspense fallback={null}>{children}</Suspense>
            </View>
          ) : (
            <Suspense fallback={null}>{children}</Suspense>
          )}
        </Modal>
      </Portal>
    ),
    []
  )

  return (
    <>
      {modalCategory && renderModal(modalCategory, handleDismissCategory, <SelectCategory {...props} />, categoriesViewStyle)}
      {modalAlert && renderModal(modalAlert, handleDismissAlert, <AlertDialog {...props} />, alertViewStyle)}
      {modalLogin && renderModal(modalLogin, handleDismissLogin, <LoginDialog {...props} />)}
      {modalRequest && renderModal(modalRequest, handleDismissRequest, <Request {...props} />)}
    </>
  )
}
