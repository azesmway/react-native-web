/**
 * -----------------------------------------------------------------------
 *  Author      : Alexey Zolotarеv
 *  E-mail      : azesm@me.com
 * -----------------------------------------------------------------------
 */

import { PermissionsAndroid, Platform } from 'react-native'
import SharedGroupPreferences from 'react-native-shared-group-preferences'

const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
const { APP_GROUP_IDENTIFIER_IOS, APP_GROUP_IDENTIFIER_ANDROID } = GLOBAL_OBJ.onlinetur.constants

class ShareData {
  async dealWithPermissions(key, data) {
    try {
      const grantedStatus = await PermissionsAndroid.requestMultiple([PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE, PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE])
      const writeGranted = grantedStatus['android.permission.WRITE_EXTERNAL_STORAGE'] === PermissionsAndroid.RESULTS.GRANTED
      const readGranted = grantedStatus['android.permission.READ_EXTERNAL_STORAGE'] === PermissionsAndroid.RESULTS.GRANTED
      if (writeGranted && readGranted) {
        await this.saveUserDataToSharedStorage(key, data)
      } else {
        // You can either limit the user in access to the app's content,
        // or do a workaround where the user's data is saved using only
        // within the user's local app storage using something like AsyncStorage
        // instead. This is only an android issue since it uses read/write external storage.
      }
    } catch (err) {
      console.warn('dealWithPermissions', err)
      return false
    }
  }

  async saveUserDataToSharedStorage(key, data) {
    try {
      if (Platform.OS === 'ios') {
        await SharedGroupPreferences.setItem(key, data, APP_GROUP_IDENTIFIER_IOS)
      } else {
        await SharedGroupPreferences.setItem(key, data, APP_GROUP_IDENTIFIER_ANDROID)
      }

      return true
    } catch (errorCode) {
      // errorCode 0 = There is no suite with that name
      console.log('saveUserDataToSharedStorage', errorCode)
      return false
    }
  }

  async loadUsernameFromSharedStorage(key) {
    try {
      let loadedData = null

      if (Platform.OS === 'ios') {
        loadedData = await SharedGroupPreferences.getItem(key, APP_GROUP_IDENTIFIER_IOS)
      } else {
        loadedData = await SharedGroupPreferences.getItem(key, APP_GROUP_IDENTIFIER_ANDROID)
      }

      if (loadedData) {
        return loadedData
      } else {
        return false
      }
    } catch (errorCode) {
      // errorCode 0 = no group name exists. You probably need to setup your Xcode Project properly.
      // errorCode 1 = there is no value for that key
      console.log('loadUsernameFromSharedStorage', errorCode)
      return false
    }
  }
}

export default new ShareData()
