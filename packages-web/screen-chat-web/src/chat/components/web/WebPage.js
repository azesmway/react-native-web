/**
 * -----------------------------------------------------------------------
 *  Author      : Alexey Zolotarеv
 *  E-mail      : azesm@me.com
 * -----------------------------------------------------------------------
 */

import { PureComponent, useEffect } from 'react'
import { ActivityIndicator, Platform, View } from 'react-native'

const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
const { MAIN_COLOR } = GLOBAL_OBJ.onlinetur.constants

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

class WebPage extends PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      isLoading: true
    }

    this.goBack = () => {
      const { expoRouter } = this.props

      expoRouter.back()
    }

    this.goForward = () => {
      this._web.goForward()
    }

    this.reload = () => {
      this._web.reload()
    }

    this.onMessage = async (data, params) => {
      const { Alert, t } = this.props.utils

      if (!params.verifyPhone) {
        return
      }

      const { user, setUser } = this.props
      let result = {}

      try {
        result = JSON.parse(data)
      } catch (e) {
        console.log('PARSE ERROR', e)
      }

      if (result.code === 0) {
        let obj = Object.assign({}, user)
        obj.phone = '+7' + params.phone
        obj.note_for_user = params.note
        setUser(obj)
        this.goBack()
      } else {
        Alert.alert(t('common.errorTitle'), t('screens.webpage.errorVerify') + '\n' + result.error, [
          {
            text: t('common.close'),
            style: 'destructive',
            onPress: () => {
              this.goBack()
            }
          }
        ])
      }
    }

    this.getParams = () => {
      const { setHeaderParams, navigation, globPath } = this.props

      let params = {}
      params.screen = 'web'
      params.app = true
      params.navigation = navigation
      params.title = globPath.title ? globPath.title : ''
      params.subtitle = globPath.subtitle ? globPath.subtitle : ''

      setHeaderParams(params)
    }
  }

  renderLoading = () => {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', borderWidth: 3 }}>
        <ActivityIndicator animating size="large" color={MAIN_COLOR} />
      </View>
    )
  }

  componentDidMount() {
    this.getParams()
  }

  render() {
    const { WebView } = this.props.utils
    const { globPath } = this.props
    const { isLoading } = this.state

    return (
      <>
        {Platform.OS !== 'web' ? (
          <WebView
            useWebKit={true}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            ref={component => (this._web = component)}
            source={{ uri: globPath.url }}
            renderLoading={this.renderLoading}
            startInLoadingState={true}
            onLoad={() => this.setState({ isLoading: false })}
            style={{ flex: 1 }}
            // onMessage={event => this.onMessage(event.nativeEvent.data, {})}
          />
        ) : (
          <ForeignIframe src={globPath.url} width={'100%'} height={'100%'} onLoaded={() => this.setState({ isLoading: false })} />
        )}
        {isLoading && (
          <View style={{ position: 'absolute', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' }}>
            <ActivityIndicator animating size="large" color={MAIN_COLOR} />
          </View>
        )}
      </>
    )
  }
}

export default WebPage
