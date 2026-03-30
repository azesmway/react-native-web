import { useCallback, useEffect, useMemo, useState, Suspense } from 'react'
import { Appearance, Dimensions, Platform, View } from 'react-native'

import SelectTheme from './SelectTheme'
import AddNewTheme from 'app-header-web/src/right/components/newtheme'

const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
const { setStartAppChat } = GLOBAL_OBJ.onlinetur.storage
const { width, height } = Dimensions.get('window')

const Themes = props => {
  const { utils, user, filter, currentCategory, setModalTheme, modalTheme, setChatTheme, chatTheme } = props
  const { Modal, Portal, theme, isMobile } = utils
  const [open, setOpen] = useState(false);
  const [item, setItem] = useState(null);

  const setVisible = (o, itm) => {
    setItem(itm)
    setOpen(o)
  }

  const escFunction = event => {
    if (event.keyCode === 27) {
      closeModal()
    }
  }

  const closeModal = useCallback(() => {
    console.log('closeModal')
    setStartAppChat(true)

    if (chatTheme === undefined || chatTheme === 0) {
      setChatTheme(1)
    }

    setModalTheme(false, {})
  }, [chatTheme, setChatTheme, setModalTheme])

  useEffect(() => {
    if (Platform.OS === 'web') {
      document.addEventListener('keydown', escFunction, false)
    }

    return () => {
      if (Platform.OS === 'web') {
        document.removeEventListener('keydown', escFunction, false)
      }
    }
  }, [])

  const onSelectThemes = useCallback(
    (selectedTheme, sotr = false, type = 0, data) => {
      const { AppData } = utils
      const { history, setHotels, setFilter, countries, setPlaces } = props

      setModalTheme(false)
      AppData.setSelectedTheme(data, history, setHotels, setFilter, countries, user, setPlaces, chatTheme, setChatTheme, currentCategory, selectedTheme, sotr, type)
    },
    [utils, props, user, chatTheme, setChatTheme, currentCategory, setModalTheme]
  )

  const { bg, isSotr } = useMemo(() => {
    const isDarkMode = Appearance.getColorScheme() === 'dark'
    return {
      bg: isDarkMode ? theme.dark.colors.background : theme.light.colors.background,
      isSotr: user?.id_user && user.is_sotr === 1
    }
  }, [theme, user])

  const modalStyle = useMemo(
    () => ({
      width: isMobile ? width : width / 2,
      borderRadius: 10,
      backgroundColor: bg,
      alignSelf: 'center',
      height,
      marginTop: Platform.OS === 'ios' ? 70 : 20
    }),
    [isMobile, bg]
  )

  const contentContainerStyle = useMemo(() => ({ flex: 1, alignItems: 'center', justifyContent: 'center' }), [])

  if (!modalTheme) {
    return null
  }

  return (
    <>
    <Portal>
      <Modal visible={modalTheme} onDismiss={() => closeModal()} contentContainerStyle={contentContainerStyle}>
        <View style={modalStyle}>
          <SelectTheme
            {...props}
            sotr={isSotr}
            onCancel={closeModal}
            onSelect={onSelectThemes}
            chatAgent={filter.chatAgent}
            android={true}
            currentCategory={currentCategory}
            user={user}
            filter={filter}
            setVisible={setVisible}
          />
        </View>
      </Modal>
    </Portal>
      {open && (
        <Suspense fallback={null}>
          <AddNewTheme visible={open} setVisible={setOpen} user={user} item={item} />
        </Suspense>
      )}
      </>
  )
}

export default Themes
