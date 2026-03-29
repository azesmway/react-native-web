// @ts-ignore
import isArray from 'lodash/isArray'
// @ts-ignore
import isObject from 'lodash/isObject'
import { Platform } from 'react-native'

export const getObjectAssign = (type: any, obj: any) => {
  if (isArray(obj) || isObject(obj)) {
    return JSON.parse(JSON.stringify(obj))
  }

  return type
}

export const ios26 = () => {
  return Platform.OS === 'ios' && Platform.Version.includes('26')
}
