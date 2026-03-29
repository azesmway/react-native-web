import isEmpty from 'lodash/isEmpty'
import React, { memo, useMemo } from 'react'
import { ActivityIndicator, Platform } from 'react-native'

import Send from '../icons/send'

const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
const { MAIN_COLOR } = GLOBAL_OBJ.onlinetur.constants
const ICON_SIZE = { width: 25, height: 25 }

// Мемоизируем объект ICON_SIZE, чтобы он не создавался заново
const memoizedIconSize = ICON_SIZE

export const SendIcon = memo(({ textMessage, imagesLength, images360, isSendMessage, utils }) => {
  // Вычисляем значения с useMemo, чтобы не пересчитывать при каждом рендере
  const hasContent = textMessage !== '' || imagesLength > 0 || !isEmpty(images360)

  const { color, line } = useMemo(
    () => ({
      color: hasContent ? MAIN_COLOR : '#757575',
      line: hasContent ? 2 : 1
    }),
    [hasContent]
  )

  if (isSendMessage) {
    return <ActivityIndicator animating size="small" color={MAIN_COLOR} />
  }

  return <Send {...memoizedIconSize} color={color} line={line} utils={utils} />
})

SendIcon.displayName = 'SendIcon'
