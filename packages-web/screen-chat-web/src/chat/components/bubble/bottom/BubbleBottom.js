import isEmpty from 'lodash/isEmpty'
import { Component } from 'react'
import { ActivityIndicator, Appearance, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Svg, { Path, G } from 'react-native-svg'

const PushPinIcon = ({ color = '#be202e', size = 24 }) => (
  <Svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24">
    <Path fill={color} d="M9 3.5a1 1 0 0 0 0 2h1L9.25 11c-1.167.167-2.75 1-3.25 3.5h12c-.5-2.5-2.083-3.333-3.25-3.5L14 5.5h1a1 1 0 1 0 0-2z" opacity="0.5" />
    <Path
      fill={color}
      fill-rule="evenodd"
      d="M9 4.25a.25.25 0 1 0 0 .5h1c.448 0 .804.408.743.851l-.75 5.5a.75.75 0 0 1-.637.641c-1.124.161-1.957.98-2.361 2.008h10.01c-.404-1.028-1.237-1.847-2.36-2.008a.75.75 0 0 1-.638-.64l-.75-5.5A.757.757 0 0 1 14 4.75h1a.25.25 0 0 0 0-.5zm-1.75.25c0-.966.784-1.75 1.75-1.75h6c.967 0 1.75.784 1.75 1.75c0 1.063-.89 1.75-1.89 1.75l.562 4.128c1.835.52 2.951 2.165 3.314 3.975a.758.758 0 0 1-.736.897H6a.758.758 0 0 1-.735-.897c.362-1.81 1.478-3.454 3.313-3.975l.563-4.128c-1.002 0-1.89-.687-1.89-1.75M12 15.75a.75.75 0 0 1 .75.75v4a.75.75 0 0 1-1.5 0v-4a.75.75 0 0 1 .75-.75"
      clip-rule="evenodd"
    />
  </Svg>
)

class BubbleBottom extends Component {
  constructor(props) {
    super(props)

    this.state = {
      favorite: props.currentMessage.is_favorite,
      load_favorite: false,
      cnt_favorite: props.currentMessage.cnt_favorite ? props.currentMessage.cnt_favorite : 0,
      is_like: props.currentMessage.is_like ? props.currentMessage.is_like : false,
      cnt_like: props.currentMessage.cnt_like ? props.currentMessage.cnt_like : 0,
      load_like: false
    }

    this.onPressResponse = currentMessage => {
      const { filter, setFilter } = this.props

      let data = Object.assign({}, filter)

      data.searchFav = '4'
      data.idUserFav = currentMessage.id

      setFilter(data)
    }


  }

  render() {
    const { theme, t, Icon, isMobile } = this.props.utils

    const { currentMessage, setChatReplyMessage, isConnect, filter, offline, MaterialIcons } = this.props
    const { device } = this.props.user
    const { cnt_favorite, favorite, is_like, load_favorite, cnt_like, load_like } = this.state
    let colorBG

    if (!isEmpty(device)) {
      colorBG = currentMessage.is_owner ? styles.colorRight : styles.colorLeft
    } else {
      colorBG = styles.colorBG
    }

    if (currentMessage.is_warning === 1) {
      colorBG = styles.colorWarning
    }

    if (currentMessage.id === -10000) {
      return null
    }

    let isDarkMode = Appearance.getColorScheme() === 'dark'
    let bg = isDarkMode ? theme.dark.colors.background : theme.light.colors.background
    let txt = isDarkMode ? theme.dark.colors.text : theme.light.colors.text

    return (
      <View style={{ flexDirection: 'row', position: 'absolute', alignSelf: 'flex-end', bottom: 5, right: 15 }}>
        <View style={{ flexDirection: 'row', marginRight: 5, marginTop: 2 }}>
          <Text>{is_like ? '❤️' : '🩶'}</Text>
          {cnt_like > 0 ? <Text style={{ fontSize: 12, color: txt }}>{cnt_like}</Text> : null}
        </View>
        <View style={{ flexDirection: 'row' }}>
          <PushPinIcon color={favorite ? 'red' : 'rgb(143,141,141)'} />
          {cnt_favorite > 0 ? <Text style={{ fontSize: 12, marginTop: 3, color: txt }}>{cnt_favorite}</Text> : null}
        </View>
      </View>
      // <View
      //   style={[
      //     {
      //       flexDirection: 'row',
      //       // justifyContent: 'space-around',
      //       // alignItems: 'center',
      //       // borderTopWidth: 1,
      //       // borderTopColor: '#ccc',
      //       // backgroundColor: 'transparent',
      //       height: 4,
      //       minWidth: isMobile ? 240 : 300
      //       // paddingHorizontal: 20
      //     }
      //   ]}>
      //   <TouchableOpacity
      //     style={{ flexDirection: 'row', flex: 1 }}
      //     onPress={() => {
      //       if (!isConnect) {
      //         // eslint-disable-next-line no-undef
      //         toast.show(t('common.notNet'), {
      //           type: 'danger',
      //           placement: 'top',
      //           animationType: 'zoom-in',
      //           onPress: id => {
      //             // eslint-disable-next-line no-undef
      //             toast.hide(id)
      //           }
      //         })
      //
      //         return
      //       }
      //       if (isEmpty(device)) {
      //         // eslint-disable-next-line no-undef
      //         toast.show(t('common.like'), {
      //           type: 'danger',
      //           placement: 'top',
      //           animationType: 'zoom-in',
      //           onPress: id => {
      //             // eslint-disable-next-line no-undef
      //             toast.hide(id)
      //           }
      //         })
      //
      //         return
      //       }
      //       if (!currentMessage.is_owner) {
      //         this.setState({ load_like: true }, async () => {
      //           await this.onPressRowLike(currentMessage)
      //         })
      //       } else {
      //         // eslint-disable-next-line no-undef
      //         toast.show(t('common.notLike'), {
      //           type: 'danger',
      //           placement: 'top',
      //           animationType: 'zoom-in',
      //           onPress: id => {
      //             // eslint-disable-next-line no-undef
      //             toast.hide(id)
      //           }
      //         })
      //       }
      //     }}>
      //     <Icon name={'favorite'} size={24} color={is_like ? 'red' : 'rgb(192,197,204)'} />
      //     {cnt_like > 0 ? <Text style={{ fontSize: 16, paddingTop: 4, color: txt }}>&nbsp;{cnt_like}</Text> : null}
      //   </TouchableOpacity>
      //   <TouchableOpacity
      //     style={{ flexDirection: 'row', flex: 1 }}
      //     onPress={() => {
      //       if (!isEmpty(device)) {
      //         const { _id, user, text, id_post, id_hobbi } = currentMessage
      //
      //         setChatReplyMessage({ replyId: _id, id_parent: user._id, name_parent: user.name, msg_parent: text, id_post: filter.chatAgent ? id_hobbi : id_post, data: currentMessage })
      //       } else {
      //         // eslint-disable-next-line no-undef
      //         toast.show(t('common.notAuth'), {
      //           type: 'danger',
      //           placement: 'top',
      //           animationType: 'zoom-in',
      //           onPress: id => {
      //             // eslint-disable-next-line no-undef
      //             toast.hide(id)
      //           }
      //         })
      //       }
      //     }}>
      //     <Icon name={'reply'} size={24} color={'rgb(192,197,204)'} />
      //   </TouchableOpacity>
      //   {currentMessage.cnt_reply > 0 ? (
      //     <TouchableOpacity
      //       style={{ flexDirection: 'row', flex: 1 }}
      //       onPress={() => {
      //         if (currentMessage.cnt_reply > 0) {
      //           this.onPressResponse(currentMessage)
      //         } else {
      //           // eslint-disable-next-line no-undef
      //           toast.show(t('common.notAnswer'), {
      //             type: 'danger',
      //             placement: 'top',
      //             animationType: 'zoom-in',
      //             onPress: id => {
      //               // eslint-disable-next-line no-undef
      //               toast.hide(id)
      //             }
      //           })
      //         }
      //       }}>
      //       <Icon name={'chat'} size={24} color={currentMessage.cnt_reply > 0 ? '#037aff' : 'rgb(192,197,204)'} />
      //       {currentMessage.cnt_reply > 0 ? <Text style={{ fontSize: 16, paddingTop: 4, color: '#037aff' }}>&nbsp;{currentMessage.cnt_reply}</Text> : null}
      //     </TouchableOpacity>
      //   ) : (
      //     <View style={{ flexDirection: 'row', flex: 1 }}>
      //       <Icon name={'chat'} size={24} color={'rgb(192,197,204)'} />
      //     </View>
      //   )}
      //   <TouchableOpacity
      //     style={{
      //       flexDirection: 'row',
      //       justifyContent: 'flex-end'
      //     }}
      //     onPress={() => {
      //       if (!isConnect) {
      //         // eslint-disable-next-line no-undef
      //         toast.show(t('common.notNet'), {
      //           type: 'danger',
      //           placement: 'top',
      //           animationType: 'zoom-in',
      //           onPress: id => {
      //             // eslint-disable-next-line no-undef
      //             toast.hide(id)
      //           }
      //         })
      //
      //         return
      //       }
      //       if (isEmpty(device)) {
      //         // eslint-disable-next-line no-undef
      //         toast.show(t('common.notAuth'), {
      //           type: 'danger',
      //           placement: 'top',
      //           animationType: 'zoom-in',
      //           onPress: id => {
      //             // eslint-disable-next-line no-undef
      //             toast.hide(id)
      //           }
      //         })
      //
      //         return
      //       }
      //       this.setState({ load_favorite: true }, async () => {
      //         await this.onPressRowFavorite(currentMessage)
      //       })
      //     }}>
      //     {load_favorite ? <ActivityIndicator /> : <Icon name={'bookmark'} size={24} color={favorite ? 'red' : 'rgb(192,197,204)'} />}
      //     {cnt_favorite > 0 ? <Text style={{ fontSize: 16, paddingTop: 4, color: txt }}>&nbsp;{cnt_favorite}</Text> : null}
      //   </TouchableOpacity>
      // </View>
    )
  }
}

const styles = StyleSheet.create({
  colorLeft: {
    backgroundColor: '#fff'
  },
  colorRight: {
    backgroundColor: '#f7fff0'
  },
  colorBG: {
    backgroundColor: '#f6f6f6'
  },
  colorWarning: {
    backgroundColor: '#fee6d3'
  }
})

export default BubbleBottom
