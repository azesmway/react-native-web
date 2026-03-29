import isEmpty from 'lodash/isEmpty'
import { PureComponent, useEffect } from 'react'
import { ActivityIndicator, Dimensions, Platform, TouchableOpacity, View } from 'react-native'

const { width, height } = Dimensions.get('window')

const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
const { WIDTH_MAX } = GLOBAL_OBJ.onlinetur.constants

const ForeignIframe = ({ src, width, height, onLoaded }) => {
  useEffect(() => {
    const handler = e => {
      if (e.data === 'iframe-loaded') onLoaded?.()
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [onLoaded])

  return <iframe src={src} style={{ width, height, border: 0 }} title="" onLoad={onLoaded} />
}

class MessageVideo extends PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      isLoading: true
    }
  }

  render() {
    const { VideoUrl, WebView, isMobile } = this.props.utils
    const { isLoading } = this.state
    // eslint-disable-next-line consistent-this
    let cmp = this
    const { urls } = this.props
    let aspectRatio = width > height ? width / height : height / width
    let w = width - 66 > WIDTH_MAX - 20 ? WIDTH_MAX - 20 : width - 66

    if (isEmpty(urls)) {
      return null
    }

    return (
      <>
        {urls.map(function (u, i) {
          let url = VideoUrl.convertUrl(u)

          if (url.includes('t.me') && !url.includes('?embed=1')) {
            url = url + '?embed=1'
          }

          if (Platform.OS !== 'web') {
            return (
              <View key={i.toString()} style={{ width: w, aspectRatio, alignSelf: 'center' }}>
                <WebView
                  originWhitelist={['*']}
                  key={'23423423'}
                  style={{ width: w, aspectRatio, alignSelf: 'center' }}
                  javaScriptEnabled={true}
                  domStorageEnabled={true}
                  source={{ uri: url }}
                  useWebKit={true}
                  allowFileAccess={true}
                  allowUniversalAccessFromFileURLs={true}
                  allowFileAccessFromFileURLs={true}
                />
                <View style={{ height: 5 }} />
              </View>
            )
          } else {
            return (
              <View key={i.toString()} style={{ width: w, height: isMobile ? 180 : 320, alignSelf: 'center', alignItems: 'center', justifyContent: 'center' }}>
                <ForeignIframe src={url} width={w - 30} height={isMobile ? 180 : 290} onLoaded={() => cmp.setState({ isLoading: false })} />
                {isLoading && (
                  <View style={{ position: 'absolute', width: w - 30, height: isMobile ? 180 : 290, alignItems: 'center', justifyContent: 'center', backgroundColor: '#efefef' }}>
                    <ActivityIndicator color={'#000'} />
                  </View>
                )}
              </View>
            )
          }
        })}
      </>
    )
  }
}

export default MessageVideo
