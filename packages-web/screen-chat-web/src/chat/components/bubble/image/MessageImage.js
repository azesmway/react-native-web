import isEmpty from 'lodash/isEmpty'
import { lazy, PureComponent, Suspense } from 'react'
import { ActivityIndicator, BackHandler, Dimensions, Image, Platform, Text, TouchableOpacity, View, Modal } from 'react-native'

import ic_location_off from '../../../../../images/ic_location_off.png'
import ic_location_on from '../../../../../images/ic_location_on.png'
import ic_location_on_this from '../../../../../images/ic_location_on_this.png'

const PhotoGrid = lazy(() => import('./PhotoGrid'))

const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
const { width, height } = Dimensions.get('window')
const { getAppConstants, getAppConfig } = GLOBAL_OBJ.onlinetur.storage

class MessageImage extends PureComponent {
  constructor(props) {
    super(props)

    this.backHandler = BackHandler.addEventListener('hardwareBackPress', this.closeComponent)

    this.state = {
      modalVisible: false,
      index: 0,
      imagesView: [],
      currentPicture: '',
      curImg: {},
      modalMap: false,
      progressBar: true,
      loadingPdf: false,
      pdfPath: ''
    }

    this.setImage = () => {
      const { currentMessage } = this.props
      this.setState({ imagesView: currentMessage.image })

      if (currentMessage.tip === 7 && currentMessage.image[0] && currentMessage.image[0].url) {
        this.openPdf(currentMessage.image[0].url, 'view')
      }
    }

    this.getUrlExtension = url => {
      return url.split(/[#?]/)[0].split('.').pop().trim()
    }

    this.openPdf = async (url, type) => {
      const { FileViewer } = this.props.utils

      if (type === 'open') {
        FileViewer.open(this.state.pdfPath).then()

        return
      }

      this.setState({ loadingPdf: true }, () => {
        const { RNFS } = this.props.utils

        const extension = this.getUrlExtension(url)

        const localFile = `${RNFS.DocumentDirectoryPath}/pdffile.${extension}`

        const options = {
          fromUrl: url,
          toFile: localFile
        }

        RNFS.downloadFile(options)
          .promise.then(() => {
            this.setState({ loadingPdf: false }, () => {
              this.setState({ pdfPath: localFile })
            })
          })
          .then(() => {
            // success
          })
          .catch(error => {
            // error
          })
      })
    }

    this.closeComponent = () => {
      this.setState({ modalVisible: false })
    }

    this.onDelete = curImg => {
      const { Alert, t, chatServicePost } = this.props.utils

      const { currentMessage, history, user } = this.props
      const { index, imagesView } = this.state

      Alert.alert(t('common.attention'), 'Вы действительно хотите удалить фото?', [
        { text: t('common.cancel'), style: 'destructive' },
        {
          text: t('common.yes'),
          onPress: async () => {
            const path = getAppConstants().url_main + getAppConstants().url_api3_path

            const postUrl = path + '/edit_chat.php'
            const img = curImg.url.split('/')[curImg.url.split('/').length - 1]
            const img_path = []
            const img_path_msg = []
            const img_path_min = []
            const img_path_min_msg = []

            let body = new FormData()
            body.append('id_chat', currentMessage.id)
            body.append('token', user.device.token)
            body.append('android_id_install', user.android_id_install)

            for (let i = 0; i < currentMessage.image.length; i++) {
              const item = currentMessage.image[i]

              if (!item.url.toLowerCase().includes(img.toLowerCase())) {
                img_path.push({
                  is_send: 1,
                  is_image360: 0,
                  path: item.url,
                  date: item.date,
                  latitude: item.latitude,
                  longitude: item.longitude
                })

                img_path_min.push({
                  is_send: 1,
                  is_image360: 0,
                  path: currentMessage.image_min[i],
                  date: item.date,
                  latitude: item.latitude,
                  longitude: item.longitude
                })

                img_path_msg.push({
                  is_image360: 0,
                  url: item.url,
                  date: item.date,
                  latitude: item.latitude,
                  longitude: item.longitude,
                  props: item.props
                })

                img_path_min_msg.push(currentMessage.image_min[i])
              }
            }

            body.append('img_path', JSON.stringify(img_path))
            body.append('img_path_min', JSON.stringify(img_path_min))

            const result = await chatServicePost.onPostMessage(body, postUrl)

            currentMessage.image = img_path_msg
            currentMessage.image_min = img_path_min_msg

            this.setState({ imagesView: img_path_msg, index: 0 })
          }
        }
      ])
    }
  }

  componentDidMount = () => {
    this.setImage()
  }

  componentWillUnmount() {
    if (this.backHandler) {
      this.backHandler.remove()
    }
  }

  search = (nameKey, myArray) => {
    for (var i = 0; i < myArray.length; i++) {
      const img1 = myArray[i].url.substring(myArray[i].url.indexOf('images')).toLowerCase()
      const img2 = nameKey.substring(nameKey.indexOf('images')).toLowerCase()

      if (img1 === img2) {
        return i
      }
    }

    return -1
  }

  showImage = (event, img) => {
    const { Alert } = this.props.utils

    const { imagesView } = this.state
    let res = this.search(img.replace('_min', ''), imagesView)

    if (res > -1 && imagesView && imagesView[res] && imagesView[res].url) {
      this.setState({
        modalVisible: true,
        index: res,
        currentPicture: imagesView[res].url,
        curImg: imagesView[res]
      })
    } else {
      Alert.alert('ОШИБКА!', 'Не возможно открыть фото!\nНе верная ссылка.')
    }
  }

  onShare = async () => {
    const { ReactNativeBlobUtil, Share, Alert } = this.props.utils

    const { user } = this.props
    const { currentPicture } = this.state
    const ext = currentPicture.split('.').pop()
    const referral = !isEmpty(user) ? user.referral.code : ''
    const title = getAppConstants().url_main + '/?c=' + referral
    const subject = getAppConstants().url_main + '/?c=' + referral

    if (Platform.OS === 'ios') {
      try {
        ReactNativeBlobUtil.config({
          fileCache: true,
          appendExt: ext
        })
          .fetch('GET', currentPicture)
          .then(async res => {
            const img = await res.base64()
            let base64Str = 'data:image/' + ext + ';base64,' + img
            const result = await Share.open({
              title: title,
              subject: subject,
              message: subject,
              url: res.path()
            })

            if (result.action === Share.sharedAction) {
              if (result.activityType) {
                // shared with activity type of result.activityType
              } else {
                // shared
              }
            } else if (result.action === Share.dismissedAction) {
              // dismissed
            }
            await ReactNativeBlobUtil.fs.unlink(res.path())
          })
      } catch (error) {
        Alert.alert(error.message)
      }
    } else {
      const configOptions = { fileCache: true }

      ReactNativeBlobUtil.config(configOptions)
        .fetch('GET', currentPicture)
        .then(resp => {
          return resp.readFile('base64')
        })
        .then(async base64Data => {
          base64Data = 'data:image/' + ext + ';base64,' + base64Data

          await Share.open({
            title: title,
            subject: title,
            // message: title,
            url: base64Data
          })
        })
    }
  }

  onOpenMap = async () => {
    const { curImg, imagesView } = this.state
    const { currentMessage, history } = this.props

    this.setState({ modalVisible: false }, () => {
      let title = 'Фото на карте'
      let subtitle = getAppConfig().domainMain

      history('/map', {
        state: {
          imagesView: imagesView,
          latitude: curImg.latitude,
          longitude: curImg.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
          title: title,
          subtitle: subtitle,
          id_hotel: currentMessage.id_hotel,
          name_hotel: currentMessage.name_hotel,
          post_title: currentMessage.post_title
        }
      })
    })
  }

  renderHeader() {
    const { Icon, moment } = this.props.utils

    const { curImg } = this.state
    const { days_pos, user } = this.props.currentMessage
    let date

    if (curImg.date && curImg.date !== -1) {
      date = curImg.date.split(' ')
      date[0] = date[0].replace(/:/g, '-')
      date = date[0] + ' ' + date[1]
    }

    const view = !!(curImg.latitude && curImg.latitude !== -1 && curImg.latitude !== 0)
    return (
      <View
        style={{
          position: 'absolute',
          left: 15,
          right: 15,
          top: 45,
          zIndex: 130,
          justifyContent: 'space-between',
          backgroundColor: 'transparent',
          flexDirection: 'row'
        }}>
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity style={{ zIndex: 14, width: 45, height: 45 }} onPress={() => this.closeComponent()}>
            <Icon name="close" size={35} color={'white'} />
          </TouchableOpacity>
          <View>
            <Text style={{ color: '#fff', paddingLeft: 10, fontWeight: 'bold' }}>{user.name}</Text>
            <Text style={{ color: '#fff', paddingLeft: 10, fontWeight: 'bold' }}>{date ? moment(date, 'YYYY-MM-DD hh:mm:ss').format('MMM YYYY') : ''}</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row' }}>
          {view && (
            <TouchableOpacity onPress={() => this.onOpenMap()} style={{ marginRight: 10, width: 40, height: 40 }}>
              <Image source={days_pos === -1 ? ic_location_off : days_pos >= 0 && days_pos <= 1 ? ic_location_on_this : ic_location_on} style={{ width: 30, height: 30 }} />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => this.onShare()} style={{ marginRight: 14, width: 40, height: 40 }}>
            <Icon name="share" size={35} color={'white'} />
          </TouchableOpacity>
          {this.props.currentMessage.is_edit && this.props.currentMessage.id_user === this.props.user.id_user && (
            <TouchableOpacity onPress={() => this.onDelete(curImg)}>
              <Icon name="delete" size={35} color={'white'} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    )
  }

  viewImage = url => {
    const { ImageViewer } = this.props.utils

    const { index, imagesView, modalVisible } = this.state

    return (
      <Modal visible={modalVisible} style={{ flex: 1 }}>
        <ImageViewer
          useNativeDriver={true}
          imageUrls={url}
          index={index}
          enablePreload={true}
          saveToLocalByLongPress={false}
          renderHeader={() => this.renderHeader()}
          onChange={async index => {
            this.setState({
              currentPicture: imagesView[index].url,
              index: index
            })
          }}
          style={{ flex: 1 }}
        />
      </Modal>
    )
  }

  onImageLoaded = () => {
    this.setState({ progressBar: false })
  }

  view360Image = img => {
    const { PanoramaView, Icon, moment } = this.props.utils

    const { curImg, progressBar, modalVisible } = this.state
    const { days_pos } = this.props.currentMessage
    const view = curImg.latitude && curImg.latitude !== -1 && curImg.latitude !== 0

    return (
      <Modal visible={modalVisible} style={{ flex: 1, backgroundColor: '#000' }}>
        {progressBar && (
          <View style={{ top: Dimensions.get('window').height / 2, alignItems: 'center', justifyContent: 'center', zIndex: 150 }}>
            <Text style={{ fontSize: 16 }}>{'Загрузка...'}</Text>
            <ActivityIndicator animating size="large" />
          </View>
        )}
        <PanoramaView
          style={{ height: Dimensions.get('window').height, width: Dimensions.get('window').width }}
          dimensions={{
            height: Dimensions.get('window').height,
            width: Dimensions.get('window').width
          }}
          inputType="mono"
          imageUrl={img.url}
          enableTouchTracking
          onImageLoaded={this.onImageLoaded}
        />
        <View
          style={{
            position: 'absolute',
            left: 15,
            right: 15,
            top: 40,
            zIndex: 130,
            justifyContent: 'space-between',
            backgroundColor: 'transparent',
            flexDirection: 'row'
          }}>
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity style={{ zIndex: 14 }} onPress={() => this.setState({ modalVisible: false })}>
              <Icon name="close" size={35} color={'white'} />
            </TouchableOpacity>
            <Text style={{ color: '#fff', paddingLeft: 10, paddingTop: 10, fontWeight: 'bold' }}>{moment(curImg.date).format('DD MMM YYYY')}</Text>
          </View>
          <View style={{ flexDirection: 'row' }}>
            {!!view && (
              <TouchableOpacity onPress={() => this.onOpenMap()} style={{ paddingRight: 10 }}>
                <Image source={days_pos === -1 ? ic_location_off : days_pos >= 0 && days_pos <= 1 ? ic_location_on_this : ic_location_on} style={{ width: 30, height: 30 }} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    )
  }

  render() {
    const { Pdf, Portal, Modal } = this.props.utils

    let w = null
    let aspectRatio = width > height ? width / height : height / width

    if (width < height) {
      w = width - 70
    } else {
      w = width - 43
    }

    if (Platform.isPad) {
      w = 540
    }

    const { currentMessage } = this.props
    const { modalVisible, loadingPdf, pdfPath } = this.state

    const img360 = currentMessage.image && currentMessage.image[0] && currentMessage.image[0].is_image360 && currentMessage.image[0].is_image360 === 1

    if (currentMessage.tip === 7 && currentMessage.image[0] && currentMessage.image[0].url) {
      return (
        <TouchableOpacity onPress={() => this.openPdf(currentMessage.image[0].url, 'open')}>
          {loadingPdf ? (
            <View style={{ width: w, height: 400, backgroundColor: 'transparent', alignItems: 'center', justifyContent: 'center' }}>
              <ActivityIndicator />
            </View>
          ) : (
            <Pdf
              source={{ uri: pdfPath, cache: true }}
              onLoadComplete={(numberOfPages, filePath) => {}}
              style={{ width: w, height: 400, backgroundColor: 'transparent' }}
              onError={error => console.log('PDF Load error: ', error)}
              enablePaging={true}
              enableRTL={true}
            />
          )}
        </TouchableOpacity>
      )
    }

    if (!!currentMessage && currentMessage.image_min[0]) {
      let arrayPicExt = ['jpg', 'gif', 'png', 'jpeg', 'tiff']
      let extPicture = currentMessage.image_min[0].toLowerCase().split('.').pop()

      if (arrayPicExt.indexOf(extPicture) !== -1) {
        return (
          <View style={{ alignItems: 'center', alignContent: 'center', paddingRight: 5, paddingLeft: 5 }}>
            <Suspense fallback={null}>
              <PhotoGrid source={currentMessage.image_min} onPressImage={this.showImage} width={w} height={img360 ? 150 : w / aspectRatio + 60} img360={img360} utils={this.props.utils} />
            </Suspense>
            {modalVisible && img360 ? this.view360Image(currentMessage.image[0]) : this.viewImage(currentMessage.image)}
            <View style={{ height: 10 }} />
          </View>
        )
      }
    }
    return null
  }
}
// MessageImage.defaultProps = {
//   currentMessage: {
//     image: null
//   },
//   containerStyle: {},
//   imageStyle: {},
//   imageProps: {},
//   lightboxProps: {}
// }
// MessageImage.propTypes = {
//   currentMessage: PropTypes.object,
//   containerStyle: PropTypes.any,
//   imageStyle: PropTypes.object,
//   imageProps: PropTypes.object,
//   lightboxProps: PropTypes.object
// }

export default MessageImage
