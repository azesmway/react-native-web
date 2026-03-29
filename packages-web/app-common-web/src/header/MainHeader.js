import isEmpty from 'lodash/isEmpty'
import md5 from 'md5'
import React, { useCallback, useMemo, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Appearance,
  Dimensions,
  Image,
  ImageBackground,
  Keyboard,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native'

import phone from '../../images/phone.png'
import telegram from '../../images/telegram.png'
import user_mb from '../../images/user_bg.jpg'
import whatsapp from '../../images/whatsapp.png'

const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
const { getAppConstants, getAppConfig, getSafeAreaInsets } = GLOBAL_OBJ.onlinetur.storage
const { MAIN_COLOR } = GLOBAL_OBJ.onlinetur.constants

// Extracted helper functions
const buildAvatarPath = img_path => {
  const constants = getAppConstants()
  const avatarNull =
    img_path &&
    img_path.toLowerCase().indexOf(constants.url_main) === -1 &&
    img_path.toLowerCase().indexOf(constants.url_pics) === -1 &&
    img_path.toLowerCase().indexOf(constants.url_api_main) === -1 &&
    img_path.toLowerCase().indexOf(constants.url_avatar) === -1 &&
    img_path.toLowerCase().indexOf('/avatars/') === -1

  if (avatarNull || (img_path && img_path.indexOf('/avatars/') === -1)) {
    return { path: constants.url_main + '/images/user.png', isNull: true }
  }

  return { path: img_path, isNull: false }
}

const getThemeColors = theme => {
  const isDarkMode = Appearance.getColorScheme() === 'dark'
  return {
    bg: isDarkMode ? theme.dark.colors.background : theme.light.colors.background,
    bgWhite: isDarkMode ? theme.dark.colors.background : theme.light.colors.white,
    txt: isDarkMode ? theme.dark.colors.text : theme.light.colors.text,
    txtSub: isDarkMode ? theme.dark.colors.textSecondary : theme.light.colors.textSecondary,
    border: isDarkMode ? theme.dark.colors.main : theme.light.colors.main
  }
}

const MainHeader = props => {
  const { utils, user, setUser, showActionSheetWithOptions, currentCategory, profile, screen, setLocationPath, pathname, setModalLogin } = props

  const [state, setState] = useState({
    isLoadingAvatar: false,
    visible: false,
    errorName: '',
    name: '',
    isLoading: false,
    viewCamera: false
  })

  const cameraRef = useRef(null)

  // Memoized theme colors
  const colors = useMemo(() => getThemeColors(utils.theme), [utils.theme])

  // Image handling callbacks
  const imageResize = useCallback(
    async img => {
      const { mobile, chatServicePost } = utils
      let newWidth, newHeight

      if (img.width > img.height) {
        newWidth = 1028
        newHeight = Math.floor(img.height / (img.width / newWidth))
      } else {
        newHeight = 1028
        newWidth = Math.floor(img.width / (img.height / newHeight))
      }

      const image = await mobile.resizeFile(img, newWidth, newHeight, 'JPEG', 60, 0, 'JPEG')
      const [block0, block1] = image.split(';')
      const contentType = block0.split(':')[1]
      const realData = block1.split(',')[1]
      const blob = mobile.b64toBlob(realData, contentType)

      const body = new FormData()
      body.append('token', user.device?.token || '')
      body.append('android_id_install', user.android_id_install)
      body.append('tip', 1)
      body.append('file', blob)

      const result = await chatServicePost.fetchImgUpload(body)

      if (result.code === 0) {
        setUser({
          ...user,
          img_path: getAppConstants().url_main + result.path
        })
      }

      setState(prev => ({ ...prev, isLoadingAvatar: false }))
    },
    [utils, user, setUser]
  )

  const getImagesVideo = useCallback(async () => {
    const { requestMediaLibraryPermissionsAsync, launchImageLibraryAsync } = utils
    const permissionResult = await requestMediaLibraryPermissionsAsync()

    if (!permissionResult.granted) {
      // eslint-disable-next-line no-undef
      toast.show('Доступ к галереи закрыт. Для выбора фото/видео требуется разрешение.', {
        type: 'danger',
        placement: 'top',
        animationType: 'zoom-in',
        // eslint-disable-next-line no-undef
        onPress: id => toast.hide(id)
      })
      return
    }

    setState(prev => ({ ...prev, isLoadingAvatar: true }))

    const imagesSelect = await launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 1,
      selectionLimit: 1,
      exif: true
    })

    if (!imagesSelect.canceled) {
      await imageResize(imagesSelect.assets[0])
    }
  }, [utils, imageResize])

  const getImagesCamera = useCallback(() => {
    setState(prev => ({ ...prev, viewCamera: true }))
  }, [])

  const setAvatar = useCallback(() => {
    const { t } = utils
    const options = [t('components.common.mainheader.gallery'), t('components.common.mainheader.camera'), t('common.cancel')]

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex: options.length - 1,
        showSeparators: true,
        containerStyle: { bottom: getSafeAreaInsets().bottom },
        cancelButtonTintColor: 'red'
      },
      async buttonIndex => {
        if (buttonIndex === 0) await getImagesVideo()
        else if (buttonIndex === 1) await getImagesCamera()
      }
    )
  }, [utils, showActionSheetWithOptions, getImagesVideo, getImagesCamera])

  // Communication callbacks
  const shareWhatsapp = useCallback(
    async phoneNumber => {
      const { t } = utils
      const cleanPhone = phoneNumber.replace('+7', '')

      await Share.share({
        title: getAppConfig().domainMain,
        message: `${t('common.application')} ${getAppConfig().domainMain}`,
        url: '',
        social: Share.Social.WHATSAPP,
        whatsAppNumber: cleanPhone
      })
    },
    [utils]
  )

  const openTelegram = useCallback(phoneNumber => {
    const cleanPhone = phoneNumber.replace('+', '')
    Linking.openURL(`https://t.me/${cleanPhone}`)
  }, [])

  const shareURL = useCallback(
    code => {
      const { t } = utils

      Share.share({
        title: getAppConfig().domainMain,
        message: `${t('common.application')} ${getAppConfig().domainMain}`,
        url: `${getAppConstants().url_main}/?c=${code}`
      })
    },
    [utils]
  )

  // User name change
  const onChangeUserName = useCallback(async () => {
    const { chatServicePost, t } = utils
    const { name } = state

    if (!name) {
      setState(prev => ({ ...prev, errorName: t('common.errorName') }))
      return
    }

    setState(prev => ({ ...prev, isLoading: true }))

    const body = new FormData()
    body.append('token', user.device?.token || '')
    body.append('android_id_install', user.android_id_install)
    body.append('name', name)

    const result = await chatServicePost.fetchUserName(body)

    if (result.code === 0) {
      setUser({ ...user, my_name: name })
      setState(prev => ({ ...prev, isLoading: false, visible: false }))
    }
  }, [utils, user, setUser, state.name])

  const openExpert = useCallback(() => {
    let urlOrder = `${getAppConstants().url_main_link}/myorder.php`

    if (!isEmpty(user)) {
      const txtMd5 = md5(user.login + 'sdlkgfls').substring(0, 4)
      const urlLogin = encodeURI(user.login)
      const urlEmail = encodeURI(user.my_name)

      urlOrder += `?un=${urlEmail}&ue=${urlLogin}&uk=${txtMd5}&dg=15&fo=1&nsh=1`
      if (user.phone) urlOrder += `&ut=${user.phone}`
    } else {
      urlOrder += '?un=&ue=&uk=&dg=15&fo=1&nsh=1'
    }

    const refCode = user?.referral?.code || ''
    Linking.openURL(`${urlOrder}&ref=${refCode}`, '_blank')
  }, [user])

  const takePicture = useCallback(async () => {
    const { chatServicePost, mobile } = utils

    if (!cameraRef.current) return

    try {
      const image = await cameraRef.current.takePictureAsync({
        exif: true,
        base64: true,
        imageType: 'jpg'
      })

      const [block0, block1] = image.base64.split(';')
      const contentType = block0.split(':')[1]
      const realData = block1.split(',')[1]
      const blob = mobile.b64toBlob(realData, contentType)

      const body = new FormData()
      body.append('token', user.device?.token || '')
      body.append('android_id_install', user.android_id_install)
      body.append('tip', 1)
      body.append('file', blob)

      const result = await chatServicePost.fetchImgUpload(body)

      if (result.code === 0) {
        setUser({
          ...user,
          img_path: getAppConstants().url_main + result.path
        })
      }

      setState(prev => ({ ...prev, isLoadingAvatar: false, viewCamera: false }))
    } catch (error) {
      console.error(error)
    }
  }, [utils, user, setUser])

  // Render functions
  const renderNotUser = useCallback(
    () => (
      <View style={styles.centerContainer}>
        <Text style={[styles.boldText, { color: colors.txt, fontSize: 16 }]}>{'Нужен личный трэвел-эксперт?'}</Text>
        {user.id_user ? (
          <TouchableOpacity onPress={openExpert} style={[styles.button, { borderColor: colors.border }]}>
            <Text style={[styles.buttonText, { color: colors.txtSub }]}>{'ОТПРАВИТЬ ЗАПРОС'}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() => {
              setLocationPath(pathname)
              setModalLogin(true)
            }}
            style={[styles.buttonSmall, { borderColor: colors.border }]}>
            <Text style={[styles.buttonTextSmall, { color: colors.border }]}>{'авторизоваться'}</Text>
          </TouchableOpacity>
        )}
      </View>
    ),
    [colors, user, openExpert, setLocationPath, pathname, setModalLogin]
  )

  const renderUserWithOutAgent = useCallback(
    () => <ImageBackground source={{ uri: `${getAppConstants().url_main}${currentCategory.url_logo}?_dc=${Date.now()}` }} resizeMode="contain" style={styles.logoImage} />,
    [currentCategory]
  )

  const renderReferal = useCallback(() => {
    const { Communications, t, Button, Icon } = utils
    const { referral } = user
    const { ref_user } = referral

    if (!ref_user.phone) return renderUserWithOutAgent()

    return (
      <>
        <View style={styles.row}>
          <TouchableOpacity onPress={setAvatar}>
            <Image source={{ uri: ref_user.img_path }} resizeMode="contain" style={styles.avatar} />
          </TouchableOpacity>
          <View style={styles.centerFlex}>
            {!profile && <Text style={[styles.contactText, { color: colors.txt }]}>{'СВЯЗАТЬСЯ'}</Text>}
            <Text style={[styles.nameText, { color: colors.txtSub }]}>{ref_user.name}</Text>
            {!profile && (
              <View style={styles.iconRow}>
                <TouchableOpacity onPress={() => Communications.phonecall(ref_user.phone, true)} style={[styles.iconButton, { backgroundColor: colors.bg }]}>
                  <Image source={phone} style={styles.icon} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => openTelegram(ref_user.phone)} style={[styles.iconButton, { backgroundColor: colors.bg }]}>
                  <Image source={telegram} style={styles.icon} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => shareWhatsapp(ref_user.phone)} style={[styles.iconButton, { backgroundColor: colors.bg }]}>
                  <Image source={whatsapp} style={styles.icon} />
                </TouchableOpacity>
              </View>
            )}
            {!profile && (
              <View style={styles.shareButton}>
                <Button type="clear" icon={<Icon name="share" color="rgb(70,140,215)" />} title={t('common.invite')} onPress={() => shareURL(referral.code)} />
              </View>
            )}
          </View>
        </View>
        {!profile && ref_user.note_for_user && (
          <View style={styles.noteContainer}>
            <Text style={{ fontSize: 14, color: colors.txt }}>{ref_user.note_for_user}</Text>
          </View>
        )}
      </>
    )
  }, [utils, user, profile, colors, setAvatar, openTelegram, shareWhatsapp, shareURL, renderUserWithOutAgent])

  const renderAgent = useCallback(() => {
    const { Communications, Icon, Button, t } = utils
    const { img_path, my_name, phone: userPhone, referral, note_for_user, show_phone, is_sotr, landing } = user
    const { path: avatarPath, isNull: avatarNull } = buildAvatarPath(img_path)
    const ag_status = is_sotr === 1 ? 'Бизнес-аккаунт' : ''

    return (
      <>
        <View style={styles.row}>
          <TouchableOpacity onPress={setAvatar}>
            <Image source={{ uri: avatarPath }} resizeMode="contain" style={styles.avatar} />
            {avatarNull && (
              <View style={styles.avatarOverlay}>
                <Text style={styles.avatarText}>{t('common.avatar')}</Text>
              </View>
            )}
          </TouchableOpacity>
          <View style={styles.centerFlex}>
            {profile && is_sotr === 1 && <Text style={{ paddingBottom: 5, fontSize: 18, color: colors.txt }}>{ag_status}</Text>}
            {!profile && is_sotr === 1 && <Text style={[styles.contactText, { color: colors.txt }]}>{'СВЯЗАТЬСЯ'}</Text>}
            <Text style={[styles.nameText, { color: colors.txtSub }]}>{my_name}</Text>
            {profile && show_phone === 1 && <Text style={[styles.phoneText, { color: MAIN_COLOR }]}>{userPhone}</Text>}
            {!profile && show_phone === 1 && (
              <View style={styles.iconRow}>
                <TouchableOpacity onPress={() => Communications.phonecall(userPhone, true)} style={[styles.iconButton, { backgroundColor: colors.bgWhite }]}>
                  <Image source={phone} style={styles.icon} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => openTelegram(userPhone)} style={[styles.iconButton, { backgroundColor: colors.bgWhite }]}>
                  <Image source={telegram} style={styles.icon} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => shareWhatsapp(userPhone)} style={[styles.iconButton, { backgroundColor: colors.bgWhite }]}>
                  <Image source={whatsapp} style={styles.icon} />
                </TouchableOpacity>
              </View>
            )}
            {!!landing && (
              <TouchableOpacity onPress={() => Linking.openURL(user.landing, '_blank')}>
                <Text style={styles.linkText}>{user.landing}</Text>
              </TouchableOpacity>
            )}
            {!profile && (
              <View style={styles.shareButton}>
                <Button type="clear" icon={<Icon name="share" color="rgb(70,140,215)" />} title={t('common.invite')} onPress={() => shareURL(referral.code)} />
              </View>
            )}
          </View>
        </View>
        {!profile && note_for_user && (
          <View style={styles.noteContainer}>
            <Text style={{ fontSize: 14, color: colors.txt }}>{note_for_user}</Text>
          </View>
        )}
      </>
    )
  }, [utils, user, profile, colors, setAvatar, openTelegram, shareWhatsapp, shareURL])

  const renderUser = useCallback(() => {
    const { t } = utils
    const { img_path, my_name } = user
    const { path: avatarPath, isNull: avatarNull } = buildAvatarPath(img_path)

    return (
      <View style={styles.row}>
        <TouchableOpacity onPress={setAvatar}>
          <Image source={{ uri: avatarPath }} resizeMode="contain" style={styles.avatar} />
          {avatarNull && (
            <View style={styles.avatarOverlay}>
              <Text style={styles.avatarText}>{t('common.avatar')}</Text>
            </View>
          )}
        </TouchableOpacity>
        <View style={styles.userNameContainer}>
          <Text style={[styles.userNameText, { color: colors.txt }]}>{my_name}</Text>
        </View>
      </View>
    )
  }, [utils, user, colors, setAvatar])

  const renderMainUser = useCallback(() => {
    const { id_user } = user

    return (
      <View style={styles.centerContainer}>
        <Text style={[styles.mainHeaderText, { color: colors.txt }]}>{'Нужен личный трэвел-эксперт?'}</Text>
        {id_user ? (
          <TouchableOpacity onPress={openExpert} style={[styles.button, { borderColor: colors.border }]}>
            <Text style={[styles.buttonText, { color: colors.txtSub }]}>{'ОТПРАВИТЬ ЗАПРОС'}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() => {
              setLocationPath(pathname)
              setModalLogin(true)
            }}
            style={[styles.button, { borderColor: colors.border }]}>
            <Text style={[styles.buttonTextAuth, { color: colors.border }]}>{'авторизоваться'}</Text>
          </TouchableOpacity>
        )}
      </View>
    )
  }, [user, colors, openExpert, setLocationPath, pathname, setModalLogin])

  const renderModal = useCallback(() => {
    const { Portal, Modal, Header, Button, Input, Icon, t } = utils
    const { visible, name, errorName, isLoading } = state

    return (
      <Portal>
        <Modal visible={visible} onDismiss={() => setState(prev => ({ ...prev, visible: false }))} style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: colors.bg }]}>
            <Header
              containerStyle={styles.modalHeader}
              leftComponent={<Button transparent title={t('common.cancel')} onPress={() => setState(prev => ({ ...prev, visible: false }))} />}
              rightComponent={isLoading ? <ActivityIndicator size="small" color={MAIN_COLOR} /> : <Button transparent title={t('common.done')} onPress={onChangeUserName} />}
              centerComponent={<Text style={styles.modalTitle}>{t('common.changeName')}</Text>}
              leftContainerStyle={styles.headerContainer}
              centerContainerStyle={styles.headerContainer}
              rightContainerStyle={styles.headerContainer}
              backgroundColor={Platform.select({
                android: 'rgb(63,81,181)',
                default: '#ececec'
              })}
            />
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={100} style={styles.flex}>
              <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.inputContainer}>
                  <Input
                    label={t('common.name')}
                    placeholder={t('common.enterName')}
                    leftIcon={<Icon name="person" size={24} color="#ccc" />}
                    errorStyle={styles.errorText}
                    errorMessage={errorName}
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={name}
                    onChangeText={text => setState(prev => ({ ...prev, name: text }))}
                  />
                </View>
              </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
          </View>
        </Modal>
      </Portal>
    )
  }, [utils, state, colors, onChangeUserName])

  const renderCamera = useCallback(() => {
    const { Portal, Modal, CameraView, isMobile } = utils
    const { viewCamera } = state

    return (
      <Portal>
        <Modal visible={viewCamera} style={styles.modalContainer} onDismiss={() => setState(prev => ({ ...prev, viewCamera: false }))}>
          <View style={isMobile ? styles.flex : styles.cameraContainer}>
            <CameraView ref={cameraRef} style={styles.camera} facing="front" />
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cameraButton} onPress={takePicture}>
              <Text style={styles.cameraButtonText}>Сделать фото</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      </Portal>
    )
  }, [utils, state, takePicture])

  const renderContent = useCallback(() => {
    const { referral, login, is_sotr } = user

    if (isEmpty(login)) return renderNotUser()

    if (is_sotr === 0) {
      if (referral && isEmpty(referral.ref_user)) {
        return screen === 'profile' ? renderUser() : renderMainUser()
      }
      return screen === 'profile' ? renderUser() : renderReferal()
    }

    if (is_sotr === 1) return renderAgent()
  }, [user, screen, renderNotUser, renderUser, renderMainUser, renderReferal, renderAgent])

  return (
    <ImageBackground source={user_mb} resizeMode="cover" style={styles.fullSize}>
      <View style={styles.overlay} />
      <View style={styles.content}>{renderContent()}</View>
      {state.visible && renderModal()}
      {state.viewCamera && renderCamera()}
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  fullSize: { width: '100%', height: '100%' },
  overlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0.5,
    backgroundColor: '#fff'
  },
  content: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc'
  },
  centerContainer: {
    width: '100%',
    height: 100,
    alignItems: 'center',
    justifyContent: 'center'
  },
  boldText: { fontWeight: 'bold' },
  button: {
    marginTop: 20,
    width: 200,
    height: 45,
    borderWidth: 1,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonSmall: {
    marginTop: 20,
    width: 160,
    height: 35,
    borderWidth: 1,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 16,
    textTransform: 'uppercase'
  },
  buttonTextSmall: {
    fontWeight: 'bold',
    fontSize: 14,
    textTransform: 'uppercase'
  },
  buttonTextAuth: {
    fontWeight: 'bold',
    fontSize: 16,
    textTransform: 'uppercase'
  },
  logoImage: {
    width: 200,
    height: 130,
    marginTop: 0,
    alignSelf: 'center'
  },
  row: { width: '100%', flexDirection: 'row' },
  avatar: { width: 130, height: 130, borderRadius: 65 },
  centerFlex: { flex: 1, alignItems: 'center' },
  contactText: { fontSize: 20, fontWeight: 'bold' },
  nameText: { marginTop: 14, marginBottom: 6, fontSize: 16 },
  phoneText: {
    fontSize: 14,
    textDecorationLine: 'underline',
    marginBottom: 6
  },
  iconRow: {
    width: '70%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center'
  },
  iconButton: { borderRadius: 30, width: 40 },
  icon: { width: 40, height: 40 },
  shareButton: { marginTop: 20 },
  noteContainer: { textAlign: 'justify' },
  avatarOverlay: {
    position: 'absolute',
    top: 70,
    alignItems: 'center',
    width: 130,
    height: 130
  },
  avatarText: {
    textAlign: 'center',
    color: 'blue',
    fontWeight: 'bold'
  },
  linkText: {
    textDecorationLine: 'underline',
    color: 'blue'
  },
  userNameContainer: {
    width: Dimensions.get('window').width - 180,
    alignItems: 'center',
    justifyContent: 'center'
  },
  userNameText: { fontWeight: 'bold', paddingBottom: 5, fontSize: 18 },
  mainHeaderText: { fontWeight: 'bold', fontSize: 20 },
  modalContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  modalContent: { borderRadius: 10, flex: 1 },
  modalHeader: {
    height: 56,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    paddingTop: 3
  },
  headerContainer: { justifyContent: 'center' },
  flex: { flex: 1 },
  inputContainer: { paddingTop: 30 },
  errorText: { color: 'red' },
  cameraContainer: { width: 600, height: 400 },
  camera: { flex: 1 },
  buttonContainer: {
    position: 'absolute',
    bottom: 64,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    width: '100%',
    paddingHorizontal: 64
  },
  cameraButton: { flex: 1, alignItems: 'center' },
  cameraButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white'
  }
})

export default React.memo(MainHeader)
