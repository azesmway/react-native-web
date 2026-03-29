import uniqBy from 'lodash/uniqBy'
import { useEffect, useRef, useState } from 'react'
import { Dimensions, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

const { width } = Dimensions.get('window')

const ViewCamera = props => {
  const { CameraView, useCameraPermissions, Portal, Modal, isMobile, Alert, t, Geolocation } = props.utils

  const { viewCamera, setViewCamera, images, setChatImages } = props

  const [facing, setFacing] = useState('back')
  const [permission, requestPermission] = useCameraPermissions()
  const cameraRef = useRef(null)

  useEffect(() => {
    requestPermission()
  }, [])

  if (!permission) {
    // Camera permissions are still loading.
    return <></>
  }

  if (!permission.granted) {
    // Camera permissions are still loading.
    return <></>
  }

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'))
  }

  function createUUID() {
    var s = []
    var hexDigits = '0123456789ABCDEF'
    for (var i = 0; i < 24; i++) {
      s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1)
    }
    s[12] = '4' // bits 12-15 of the time_hi_and_version field to 0010
    s[16] = hexDigits.substr((s[16] & 0x3) | 0x8, 1) // bits 6-7 of the clock_seq_hi_and_reserved to 01

    var uuid = s.join('')
    return uuid
  }

  const takePicture = async () => {
    if (cameraRef) {
      try {
        const data = await cameraRef.current.takePictureAsync({
          exif: true,
          base64: false,
          imageType: 'jpg'
        })
        delete data.base64

        data.is_send = 0
        data.camera = true
        data.localIdentifier = createUUID()

        if (images.length + 1 > 30) {
          Alert.alert(t('common.attention'), t('core.mobile.pic12'))
          return
        }

        if (images.length === 0) {
          setChatImages([data])
        } else {
          let addImg = images.concat([data])
          addImg = uniqBy(addImg, 'localIdentifier')
          setChatImages(addImg)
        }

        setViewCamera()
      } catch (error) {
        console.log(error)
      }
    }
  }

  if (Platform.OS === 'web') {
    return (
      <Portal>
        <Modal visible={viewCamera} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} onDismiss={() => setViewCamera()}>
          <View style={isMobile ? { width, height: 200 } : { width: 600, height: 400 }}>
            <CameraView ref={cameraRef} facing={facing} />
          </View>
          <View
            style={{
              position: 'absolute',
              bottom: -30,
              flexDirection: 'row',
              backgroundColor: 'transparent',
              width: '100%',
              paddingHorizontal: 64
            }}>
            <TouchableOpacity style={styles.button} onPress={takePicture}>
              <Text style={styles.text}>Сделать фото</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      </Portal>
    )
  }

  return (
    <Portal>
      <Modal visible={viewCamera} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} onDismiss={() => setViewCamera()}>
        <View style={styles.camera}>
          <CameraView ref={cameraRef} style={styles.camera} facing={facing} />
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
            <Text style={styles.text}>{facing ? 'Передняя камера' : 'Задняя камера'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={takePicture}>
            <Text style={styles.text}>Сделать фото</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={setViewCamera}>
            <Text style={styles.text}>Отмена</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </Portal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center'
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10
  },
  camera: {
    flex: 1,
    width: Dimensions.get('window').width - 20
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 64,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    width: '100%',
    paddingHorizontal: 64
  },
  button: {
    flex: 1,
    alignItems: 'center'
  },
  text: {
    fontSize: Platform.OS === 'web' ? 24 : 14,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center'
  }
})

export default ViewCamera
