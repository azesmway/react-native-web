import { useEffect, useRef, useState } from 'react'
import { Dimensions, Platform } from 'react-native'
import { connect } from 'react-redux'

import ReviewEditor from './ReviewEditor'

export default function ReviewEditorComponent(props) {
  const [isLoading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const module = useRef(undefined)

  const loadModules = async () => {
    try {
      // Parallel loading of independent modules
      const [store, utilsModule, servicesModule, alertModule, imagePickerModule, blurViewModule, deviceDetectModule] = await Promise.all([
        import('app-store-web'),
        import('app-utils-web'),
        import('app-services-web'),
        import('@blazejkustra/react-native-alert'),
        import('expo-image-picker'),
        import('expo-blur'),
        import('react-device-detect')
      ])

      module.current = {
        store,
        withRouter: utilsModule.withRouter,
        moment: utilsModule.moment,
        t: utilsModule.t,
        chatServiceGet: servicesModule.chatServiceGet,
        chatServicePost: servicesModule.chatServicePost,
        Alert: alertModule.default,
        requestMediaLibraryPermissionsAsync: imagePickerModule.requestMediaLibraryPermissionsAsync,
        requestCameraPermissionsAsync: imagePickerModule.requestCameraPermissionsAsync,
        launchImageLibraryAsync: imagePickerModule.launchImageLibraryAsync,
        launchCameraAsync: imagePickerModule.launchCameraAsync,
        MediaTypeOptions: imagePickerModule.MediaTypeOptions,
        BlurView: blurViewModule.BlurView
      }

      // Calculate isMobile after modules are loaded
      const getIsMobile = () => {
        const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
        const { IS_MOBILE } = GLOBAL_OBJ.onlinetur.constants
        const { width } = Dimensions.get('window')
        return deviceDetectModule.isMobile || width < IS_MOBILE
      }

      module.current.isMobile = getIsMobile()
    } catch (err) {
      console.error('Failed to load modules:', err)
      setError(err)
    }
  }

  useEffect(() => {
    loadModules().then(() => {
      if (!error) setLoading(false)
    })
  }, [error])

  if (isLoading) {
    return <></>
  }

  if (error) {
    return <></>
  }

  const { store, withRouter } = module.current

  const mapStateToProps = state => ({
    user: store.userSelector.getUser(state)
  })

  const mapDispatchToProps = () => ({})

  const ReviewEditorWithProps = withRouter(connect(mapStateToProps, mapDispatchToProps)(ReviewEditor))

  return <ReviewEditorWithProps {...props} utils={module.current} />
}
