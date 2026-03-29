import { PureComponent } from 'react'
import { ActivityIndicator, Dimensions, Platform, TouchableOpacity, View } from 'react-native'

const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
const { MAIN_COLOR } = GLOBAL_OBJ.onlinetur.constants

class ModalYoutube extends PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      url: props.openYoutubeLink
    }
  }

  componentDidMount = () => {}

  renderLoading = () => {
    return (
      <View style={{ flex: 1, alignItems: 'center' }}>
        <ActivityIndicator animating size="large" color={MAIN_COLOR} />
      </View>
    )
  }

  renderRightsButtons = () => {
    const { Icon } = this.props.utils

    const { closeModalAction } = this.props

    return (
      <TouchableOpacity onPress={() => closeModalAction()}>
        <Icon name={'close'} color={'red'} />
      </TouchableOpacity>
    )
  }

  render() {
    const { Header, WebView } = this.props.utils

    return (
      <>
        <Header
          containerStyle={{ borderTopLeftRadius: 15, borderTopRightRadius: 15 }}
          statusBarProps={{ translucent: true }}
          centerComponent={{
            text: t('common.loadVideo'),
            style: { color: '#000', fontSize: 16, fontWeight: 'bold', paddingTop: 2 }
          }}
          backgroundColor={'#ececec'}
          rightComponent={this.renderRightsButtons()}
        />
        <WebView
          useWebKit={true}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          ref={component => (this._web = component)}
          source={{ uri: this.state.url }}
          style={{ marginTop: 0, width: '100%', height: '100%' }}
          renderLoading={this.renderLoading}
          startInLoadingState={true}
        />
      </>
    )
  }
}

export default ModalYoutube
