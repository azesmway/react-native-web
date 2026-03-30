import { lazy, PureComponent, Suspense } from 'react'
import { Dimensions, View } from 'react-native'

const PhotoGrid = lazy(() => import('./PhotoGrid'))

class MessageImage extends PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      viewWidth: null
    }
  }

  render() {
    const { isMobile } = this.props.utils

    const { currentMessage, setImagesView } = this.props
    const { viewWidth } = this.state
    let aspectRatio =
      Dimensions.get('window').width > Dimensions.get('window').height
        ? Dimensions.get('window').width / Dimensions.get('window').height
        : Dimensions.get('window').height / Dimensions.get('window').width

    const img360 = currentMessage.image && currentMessage.image[0] && currentMessage.image[0].is_image360 && currentMessage.image[0].is_image360 === 1

    // return (
    //   <iframe src={'https://docs.google.com/gview?embedded=true&url=
    //   https://a.OnlineTur.ru/images/files/dc/dcd0d5b5269124e2dbd49893f6662ebde9a190c1.pdf'} style={{ width: '100%', height: 400, borderWidth: 0 }} />
    // )

    if (currentMessage.tip === 7 && currentMessage.image.length > 0 && currentMessage.image[0].src && currentMessage.image[0].src.includes('.pdf')) {
      return (
        // <TouchableOpacity onPress={() => Linking.openURL('https://docs.google.com/gview?embedded=true&url=' + currentMessage.image[0].src, '_blank')}>
        <View
          style={{
            width: viewWidth,
            alignItems: 'center',
            alignContent: 'center',
            margin: 5,
            marginRight: 7
          }}
          onLayout={event => {
            const { width } = event.nativeEvent.layout
            this.setState({ viewWidth: width })
          }}>
          <iframe src={currentMessage.image[0].src} style={{ width: '100%', height: 400, borderWidth: 0 }} />
        </View>
        // </TouchableOpacity>
      )
    }

    if (currentMessage.image && currentMessage.image.length > 0) {
      return (
        <View
          style={{
            // flex: 1,
            width: isMobile ? 300 : 500,
            alignItems: 'center',
            alignContent: 'center',
            // paddingLeft: 10,
            // paddingRight: 10,
            // borderWidth: 2
            margin: 5,
            marginRight: 7
          }}
          onLayout={event => {
            const { width } = event.nativeEvent.layout
            this.setState({ viewWidth: width })
          }}>
          <Suspense fallback={null}>
            <PhotoGrid
              currentMessage={currentMessage}
              source={currentMessage.image_min}
              sourceImages={currentMessage.image}
              onPressImage={setImagesView}
              width={viewWidth}
              height={viewWidth / aspectRatio}
              img360={img360}
              utils={this.props.utils}
            />
          </Suspense>
          {/*// <View style={{ height: 5 }} />*/}
        </View>
      )
    }

    return null
  }
}

export default MessageImage
