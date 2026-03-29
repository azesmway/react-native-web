import { PureComponent } from 'react'
import { ActivityIndicator, Image, ImageBackground, StyleSheet, View } from 'react-native'

import empty_image from '../../../../../images/empty-image.png'

export default class ImageLoad extends PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      isLoaded: false,
      isError: false
    }
  }

  onLoadEnd() {
    this.setState({
      isLoaded: true
    })
  }

  onError() {
    this.setState({
      isError: true
    })
  }

  render() {
    const { style, source, resizeMode, borderRadius, backgroundColor, children, loadingStyle, placeholderSource, placeholderStyle, customImagePlaceholderDefaultStyle } = this.props

    return (
      <ImageBackground
        onLoadEnd={this.onLoadEnd.bind(this)}
        onError={this.onError.bind(this)}
        style={[styles.backgroundImage, style]}
        source={source}
        // resizeMode={resizeMode}
        borderRadius={borderRadius}>
        {this.state.isLoaded && !this.state.isError ? (
          children
        ) : (
          <View style={[styles.viewImageStyles, { borderRadius: borderRadius }, backgroundColor ? { backgroundColor: backgroundColor } : {}]}>
            {this.props.isShowActivity && !this.state.isError && (
              <ActivityIndicator style={styles.activityIndicator} size={loadingStyle ? loadingStyle.size : 'small'} color={loadingStyle ? loadingStyle.color : 'gray'} />
            )}
            <Image style={{ width: 100, height: 100 }} source={empty_image} />
          </View>
        )}
        {this.props.children && <View style={styles.viewChildrenStyles}>{this.props.children}</View>}
      </ImageBackground>
    )
  }
}

const styles = StyleSheet.create({
  viewChildrenStyles: {},
  viewImageStyles: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  backgroundImage: {},
  activityIndicator: {},
  imagePlaceholderStyles: {}
})
