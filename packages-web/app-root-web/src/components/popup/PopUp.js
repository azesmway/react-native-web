import { getAppConstants } from 'app-core-web/src/storage.js'
import t from 'app-utils/src/i18n'
import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { notify } from 'reapop'

const PopUp = props => {
  const dispatch = useDispatch()

  useEffect(() => {
    setTimeout(function () {
      dispatch(
        notify({
          title: t('core.popup.title'),
          dismissible: false,
          dismissAfter: 0,
          status: 'info',
          closeButton: false,
          image: getAppConstants().url_main + '/o.png',
          message: '<span style="font-size: 13px;">' + t('core.popup.message') + '</span>',
          buttons: [
            {
              name: t('common.agree'),
              primary: true,
              onClick: () => props.initMessaging()
            },
            {
              name: t('common.cancel'),
              onClick: () => props.breakMessaging()
            }
          ]
        })
      )
    }, 10000)
  }, [])

  return null
}

export default PopUp
