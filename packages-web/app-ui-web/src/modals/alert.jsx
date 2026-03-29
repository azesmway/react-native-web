import isEmpty from 'lodash/isEmpty'
import React, { useCallback, useEffect, useMemo } from 'react'
import { Linking, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native'

const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
const { MAIN_COLOR } = GLOBAL_OBJ.onlinetur.constants
const { getAppConfig, getAppConstants, getSelectCategory } = GLOBAL_OBJ.onlinetur.storage
const WWW_URL_PATTERN = /^www\./i

// Shared styles
const PADDING_20 = { padding: 20 }
const BUTTON_STYLE = { width: 100 }
const TEXT_STYLE = { fontSize: 18 }

const AlertDialog = props => {
  const { user, t, Clipboard, Alert, ParsedText } = props.utils
  const { urlPost, onSend, componentChat } = GLOBAL_OBJ.onlinetur.props
  const {
    isShareMessage,
    bodyAlert,
    currentMessage,
    deleteMessage,
    warningMessage,
    banMessage,
    shareMessage,
    shareCode,
    styleAlert,
    isShareReferal,
    bubble,
    complainMessage,
    articleShare,
    articleShareImg,
    appShare,
    actionMessage,
    menuMessage
  } = GLOBAL_OBJ.onlinetur.state

  const onUrlPress = useCallback(url => {
    const targetUrl = WWW_URL_PATTERN.test(url) ? `https://${url}` : url

    Linking.canOpenURL(targetUrl).then(supported => {
      if (!supported) {
        console.error('No handler for URL:', targetUrl)
      } else {
        Linking.openURL(targetUrl)
      }
    })
  }, [])

  const handleClose = useCallback(() => {
    GLOBAL_OBJ.onlinetur.state = {}
    GLOBAL_OBJ.onlinetur.props = {}
    props.setModalAlert(false)
  }, [props])

  const escFunction = useCallback(
    event => {
      if (event.keyCode === 27) {
        handleClose()
      }
    },
    [handleClose]
  )

  useEffect(() => {
    if (Platform.OS === 'web') {
      document.addEventListener('keydown', escFunction, false)
    }

    return () => {
      if (Platform.OS === 'web') {
        document.removeEventListener('keydown', escFunction, false)
      }
    }
  }, [escFunction])

  const url = useMemo(() => {
    const ref = !isEmpty(user) ? `?c=${user.referral.code}` : ''
    const cat = getSelectCategory()

    if (articleShare) {
      return urlPost === '2' ? `${getAppConfig().homepage}/n/${shareMessage.id}${ref}` : `${getAppConstants().url_news}/i${shareMessage.id}`
    }

    if (articleShareImg) {
      return shareMessage?.content?.[0]?.array?.[0] || ''
    }

    if (appShare) {
      return shareMessage.url
    }

    if (shareMessage) {
      const catParam = ref ? `&cat=${cat.id}` : `?cat=${cat.id || '1'}`
      return `${getAppConfig().homepage}/m/${shareMessage.id}${ref}${catParam}`
    }

    return ''
  }, [user, articleShare, articleShareImg, appShare, shareMessage, urlPost])

  const referralUrl = useMemo(() => `${getAppConstants().url_main}/?c=${shareCode}`, [shareCode])

  const handleAction = useCallback(
    actionFn => {
      return () => componentChat.setState({ openAlert: false }, actionFn)
    },
    [componentChat]
  )

  const renderCopyInput = useCallback(
    inputUrl => (
      <View style={PADDING_20}>
        <TextInput value={inputUrl} disabled />
      </View>
    ),
    [TextInput, Clipboard]
  )

  const renderActionButton = useCallback(
    (condition, onPress, label = t('common.yes')) => {
      if (!condition) return null

      return (
        <TouchableOpacity onPress={onPress} style={BUTTON_STYLE}>
          <Text style={[TEXT_STYLE, { color: MAIN_COLOR }]}>{label}</Text>
        </TouchableOpacity>
      )
    },
    [t]
  )

  const actionButtons = useMemo(
    () => [
      {
        condition: currentMessage,
        onPress: handleAction(async () => {
          const { AppData } = await import('app-services-web')
          await AppData.onPressRowSetLike(componentChat, bubble, currentMessage)
        })
      },
      {
        condition: deleteMessage,
        onPress: handleAction(() => onSend())
      },
      {
        condition: warningMessage,
        onPress: handleAction(() => componentChat.onWarningMessage(warningMessage))
      },
      {
        condition: banMessage,
        onPress: handleAction(() => componentChat.onBanMessage(banMessage))
      },
      {
        condition: complainMessage,
        onPress: handleAction(async () => {
          const { chatServiceGet } = await import('app-services-web')
          const res = await chatServiceGet.fetchComplain()

          if (res.code === 0) {
            const message = t('containers.alertdialog.complain')
            if (Platform.OS !== 'web') {
              Alert.alert(t('common.attention'), message)
            } else {
              componentChat.setState({
                complainMessage: null,
                isComplainMessage: false,
                openAlert: true,
                titleAlert: t('common.attention'),
                bodyAlert: message
              })
            }
          }
        })
      },
      {
        condition: actionMessage,
        onPress: handleAction(() => componentChat.sendBronRequest(actionMessage))
      }
    ],
    [currentMessage, deleteMessage, warningMessage, banMessage, complainMessage, actionMessage, handleAction, componentChat, bubble, onSend, t, Alert]
  )

  const closeButtonLabel = isShareMessage || isShareReferal || menuMessage ? t('common.close') : t('common.no')

  return (
    <>
      <View style={PADDING_20}>
        <ParsedText viewUrl={true} style={[styleAlert, TEXT_STYLE]} parse={[{ type: 'url', style: { color: MAIN_COLOR }, onPress: onUrlPress }]}>
          {bodyAlert}
        </ParsedText>
      </View>

      {isShareMessage && url && renderCopyInput(url)}
      {isShareReferal && renderCopyInput(referralUrl)}

      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 20,
          width: '100%',
          height: 46,
          alignItems: 'flex-end',
          justifyContent: 'flex-end',
          flexDirection: 'row',
          paddingRight: 20
        }}>
        {actionButtons.map(({ condition, onPress }, index) => renderActionButton(condition, onPress) && <React.Fragment key={index}>{renderActionButton(condition, onPress)}</React.Fragment>)}

        <TouchableOpacity onPress={handleClose}>
          <Text style={[TEXT_STYLE, { color: MAIN_COLOR }]}>{closeButtonLabel}</Text>
        </TouchableOpacity>
      </View>
    </>
  )
}

export default AlertDialog
