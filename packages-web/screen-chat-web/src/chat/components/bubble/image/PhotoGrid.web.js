import each from 'lodash/each'
import take from 'lodash/take'
import { lazy, PureComponent, Suspense } from 'react'
import { Dimensions, Image, ImageBackground, Text, TouchableOpacity, View } from 'react-native'

const ImageLoad = lazy(() => import('./ImageLoad'))

const styles = {
  image: {
    flex: 1,
    resizeMode: 'contain',
    borderWidth: 1,
    borderColor: '#fff'
  },
  lastWrapper: {
    flex: 1,
    // borderWidth: 2,
    backgroundColor: 'rgba(200, 200, 200, .5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  textCount: {
    color: '#fff',
    fontSize: 60
  }
}

import png360 from '../../../../../images/360.png'

class PhotoGrid extends PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      width: props.width,
      height: props.height
    }
  }

  static defaultProps = {
    numberImagesToShow: 0
  }

  isLastImage = (index, secondViewImages) => {
    const { source, numberImagesToShow } = this.props

    return (source.length > 5 || numberImagesToShow) && index === secondViewImages.length - 1
  }

  handlePressImage = (event, { image, img360, index, type }, secondViewImages) => {
    const { onPressImage, currentMessage } = this.props

    onPressImage({
      images: this.props.currentMessage.image,
      index: type === 'second' ? index + 1 : index,
      modalIsOpen: true,
      img360: img360,
      currentMessage: currentMessage,
      click: this.props.currentMessage.image.findIndex(value => {
        return value.src === image.replace('_min', '')
      })
    })
  }

  render() {
    const { imageProps } = this.props
    const source = take(this.props.source, 5)
    const firstViewImages = []
    const secondViewImages = []
    const firstItemCount = source.length === 5 ? 2 : 1
    let index = 0

    each(source, (img, callback) => {
      if (index === 0) {
        firstViewImages.push(img)
      } else if (index === 1 && firstItemCount === 2) {
        firstViewImages.push(img)
      } else {
        secondViewImages.push(img)
      }
      index++
    })

    let { width, height, img360 } = this.props
    let ratio = 0
    if (secondViewImages.length === 0) {
      ratio = 0
    } else if (secondViewImages.length === 1) {
      ratio = 1 / 2
    } else {
      ratio = this.props.ratio
    }
    const direction = source.length === 5 ? 'row' : 'column'

    const firstImageWidth = direction === 'column' ? width / firstViewImages.length : width * (1 - ratio)
    const firstImageHeight = direction === 'column' ? height * (1 - ratio) : height / firstViewImages.length

    const secondImageWidth = direction === 'column' ? width / secondViewImages.length : width * ratio
    let secondImageHeight = direction === 'column' ? height / secondViewImages.length : height * ratio

    const secondViewWidth = direction === 'column' ? width : width * ratio
    const secondViewHeight = direction === 'column' ? height * ratio : height

    let styleImg = {}
    if (firstViewImages.length === 1 && secondViewImages.length === 1) {
      styleImg = { width: firstImageWidth, height: firstImageHeight }
      secondImageHeight = secondImageHeight / 2
    } else if (firstViewImages.length === 1 && secondViewImages.length === 2) {
      styleImg = { width: firstImageWidth, height: firstImageHeight }
      secondImageHeight = secondViewHeight
    } else if (firstViewImages.length === 1 && secondViewImages.length === 3) {
      styleImg = { width: firstImageWidth, height: firstImageHeight }
    } else if (secondViewImages.length === 0) {
      styleImg = { width: firstImageWidth, height: firstImageHeight }
    }

    return source.length ? (
      <View style={[{ flexDirection: direction, width }, this.props.styles]}>
        <View style={[styleImg, { flexDirection: direction === 'row' ? 'column' : 'row' }]}>
          {firstViewImages.map((image, index) => (
            <TouchableOpacity activeOpacity={0.7} key={index} style={{ flex: 1 }} onPress={event => this.handlePressImage(event, { image, img360, index, type: 'first' })}>
              <Suspense fallback={null}>
                <ImageLoad
                  resizeMode={null}
                  style={[styles.image, { width: firstImageWidth, height: firstImageHeight, borderWidth: 1 }, this.props.imageStyle]}
                  source={typeof image === 'string' ? { uri: image } : image}
                  {...imageProps}
                />
              </Suspense>
              {img360 ? <Image source={png360} style={{ width: 60, height: 60, position: 'absolute', top: firstImageHeight / 2 - 30, left: firstImageWidth / 2 - 30 }} /> : null}
            </TouchableOpacity>
          ))}
        </View>
        {secondViewImages.length ? (
          <View style={{ width: secondViewWidth, height: secondViewHeight, flexDirection: direction === 'row' ? 'column' : 'row' }}>
            {secondViewImages.map((image, index) => (
              <TouchableOpacity activeOpacity={0.7} key={index} style={{ flex: 1 }} onPress={event => this.handlePressImage(event, { image, img360, index, type: 'second' }, secondViewImages)}>
                {this.isLastImage(index, secondViewImages) ? (
                  <ImageBackground style={[styles.image, { width: secondImageWidth, height: secondImageHeight }, this.props.imageStyle]} source={typeof image === 'string' ? { uri: image } : image}>
                    <View style={styles.lastWrapper}>
                      <Text style={[styles.textCount, this.props.textStyles]}>+{this.props.numberImagesToShow || this.props.source.length - 5}</Text>
                    </View>
                  </ImageBackground>
                ) : (
                  <Suspense fallback={null}>
                    <ImageLoad
                      style={[styles.image, { width: secondImageWidth, height: secondImageHeight }, this.props.imageStyle]}
                      source={typeof image === 'string' ? { uri: image } : image}
                      {...imageProps}
                    />
                  </Suspense>
                )}
              </TouchableOpacity>
            ))}
          </View>
        ) : null}
      </View>
    ) : null
  }
}

// PhotoGrid.prototypes = {
//   source: PropTypes.array.isRequired,
//   width: PropTypes.number,
//   height: PropTypes.number,
//   style: PropTypes.object,
//   imageStyle: PropTypes.object,
//   onPressImage: PropTypes.func,
//   ratio: PropTypes.float,
//   imageProps: PropTypes.object
// }

PhotoGrid.defaultProps = {
  style: {},
  imageStyle: {},
  imageProps: {},
  width: Dimensions.get('window').width,
  height: 400,
  ratio: 1 / 3
}

export default PhotoGrid
