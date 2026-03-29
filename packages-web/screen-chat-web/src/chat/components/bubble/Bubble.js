import isObject from 'lodash/isObject'
import { createRef, PureComponent } from 'react'
import { Appearance, Dimensions, Image, Platform, Text, TouchableOpacity, View } from 'react-native'

import ic_location_off from '../../../../images/ic_location_off.png'
import ic_location_on from '../../../../images/ic_location_on.png'
import ic_location_on_this from '../../../../images/ic_location_on_this.png'
import triangle from '../../../../images/triangle.png'
import Actions from './action'
// import BubbleBottom from './bottom'
import createStyles from './Bubble.styles'
import MessageImage from './image'
import ContextMenu from './menu'
import BubbleModel from './model/BubbleModel'
import Request from './request'
import MessageText from './text'
import MessageVideo from './video'

const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
const { width } = Dimensions.get('window')
const { WIDTH_MAX, MAIN_COLOR } = GLOBAL_OBJ.onlinetur.constants

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')

// Memoize theme computation
const getThemeColors = theme => {
  const isDarkMode = Appearance.getColorScheme() === 'dark'
  return {
    bg: isDarkMode ? theme.dark.colors.background : theme.light.colors.background,
    txt: isDarkMode ? theme.dark.colors.text : theme.light.colors.text,
    isDarkMode
  }
}

function createUUID() {
  var s = []
  var hexDigits = '0123456789ABCDEF'
  for (var i = 0; i < 24; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1)
  }
  s[12] = '4' // bits 12-15 of the time_hi_and_version field to 0010
  s[16] = hexDigits.substr((s[16] & 0x3) | 0x8, 1) // bits 6-7 of the clock_seq_hi_and_reserved to 01

  return s.join('')
}

class Bubble extends PureComponent {
  constructor(props) {
    super(props)

    Object.assign(this, new BubbleModel(this, props.utils))

    this.state = {
      compactView: true,
      tooltipOpen: false,
      statusRequest: {},
      newDate: Date.now(),
      optionsMenu: null,
      menuMessage: null,
      menuVisible: false,
      menuPosition: { x: 0, y: 0 },

      favorite: props.currentMessage.is_favorite,
      load_favorite: false,
      cnt_favorite: props.currentMessage.cnt_favorite ? props.currentMessage.cnt_favorite : 0,
      is_like: props.currentMessage.is_like ? props.currentMessage.is_like : false,
      cnt_like: props.currentMessage.cnt_like ? props.currentMessage.cnt_like : 0,
      load_like: false
    }

    this.messageRef = createRef(null)

    const MENU_WIDTH = 300
    const MENU_HEIGHT = props.currentMessage.user.id === props.user.id_user ? 320 : 260

    // Initialize styles once
    this.styles = createStyles(props.utils.isMobile)

    this.setMenuVisible = () => {
      this.setState(prevState => ({ menuVisible: !prevState.menuVisible }))
    }

    this.calculateMenuPosition = (pageX, pageY) => {
      const { isMobile } = this.props.utils
      // Пробуем разместить меню справа от места нажатия
      let left = pageX
      let top = 0

      // Проверяем, не выходит ли меню за правый край
      if (left + MENU_WIDTH > SCREEN_WIDTH) {
        left = SCREEN_WIDTH - MENU_WIDTH - 10 // Отступ от края 10px
      }

      // Проверяем, не выходит ли меню за левый край
      if (left < 10) {
        left = 10
      }

      // Проверяем верхнюю границу
      if (isMobile) {
        top = pageY > SCREEN_HEIGHT / 2 ? SCREEN_HEIGHT / 2 : pageY
      } else {
        top = pageY > SCREEN_HEIGHT / 2 ? SCREEN_HEIGHT / 2 : pageY
        //STATUS_BAR_HEIGHT + 20
      }

      // Проверяем нижнюю границу
      if (top + MENU_HEIGHT > SCREEN_HEIGHT - 20) {
        top = SCREEN_HEIGHT - MENU_HEIGHT - 20
      }

      return { top, left }
    }

    this.handleLongPress = event => {
      if (event.nativeEvent) {
        const { pageX, pageY } = event.nativeEvent
        const position = this.calculateMenuPosition(pageX, pageY)

        this.setState(prevState => ({
          menuPosition: position,
          menuVisible: true
        }))
      }
    }

    // this.handleLongPress = this.onLongPress.bind(this)
  }

  setGeoImage = days_pos => {
    this.props.currentMessage.days_pos = days_pos
    this.setState({ newDate: Date.now() })
  }

  // Memoize geo image selection
  getGeoImage = () => {
    const { currentMessage, geo } = this.props
    const days_pos = geo !== undefined ? geo : currentMessage.days_pos

    if (days_pos === -1) return ic_location_off
    if (days_pos >= 0 && days_pos <= 1) return ic_location_on_this
    return ic_location_on
  }

  renderMessageText() {
    const { currentMessage, renderMessageText } = this.props
    if (!currentMessage?.text) return null

    const { containerStyle, wrapperStyle, optionTitles, ...messageTextProps } = this.props

    if (renderMessageText) {
      return renderMessageText(messageTextProps)
    }
    return <MessageText key={createUUID()} {...messageTextProps} />
  }

  renderMessageImage() {
    const { currentMessage, renderMessageImage, history } = this.props
    if (!currentMessage?.image) return null

    const { containerStyle, wrapperStyle, ...messageImageProps } = this.props

    if (renderMessageImage) {
      return renderMessageImage(messageImageProps)
    }

    return <MessageImage key={createUUID()} {...messageImageProps} history={history} referral={''} />
  }

  renderMessageVideo() {
    const { currentMessage, renderMessageVideo } = this.props
    if (!currentMessage?.urlYoutube?.length) return null

    const { containerStyle, wrapperStyle, ...messageVideoProps } = this.props

    if (renderMessageVideo) {
      return renderMessageVideo(messageVideoProps)
    }
    return <MessageVideo key={createUUID()} urls={currentMessage.urlYoutube} />
  }

  renderUsername(viewAction, viewRequest) {
    const { currentMessage, filter, mini, renderUsernameOnMessage } = this.props

    if (!renderUsernameOnMessage || !currentMessage) return null

    const { theme } = this.props.utils
    const { txt } = getThemeColors(theme)

    const username = currentMessage.user.name
    const hotel = currentMessage.name_hotel
    const padd = hotel.length < 10 ? 30 : 20
    const name = currentMessage.name_hobbi !== '' && currentMessage.post_title === null ? currentMessage.name_hobbi : currentMessage.post_title

    return (
      <View style={this.styles.content.usernameView}>
        {filter.selectedCountry === '-1' && filter.selectedHobby !== '-1' && (
          <TouchableOpacity onPress={this.onHobbyCountry}>
            <Text style={{ color: MAIN_COLOR, fontSize: 16, fontWeight: 'bold' }}>{'#' + name + ' : '}</Text>
          </TouchableOpacity>
        )}
        <View style={{ flex: 0.7 }}>
          <Text numberOfLines={1} ellipsizeMode="tail" style={{ color: txt, fontSize: 12 }}>
            {username}
          </Text>
          {!mini && <Text style={{ fontSize: 10, color: '#8c8c8c' }}>{String(currentMessage.dt)}</Text>}
        </View>
        <View
          style={{
            flex: 0.3,
            paddingTop: 2,
            paddingRight: viewAction || viewRequest ? 0 : padd,
            alignItems: 'flex-end'
          }}>
          <Text numberOfLines={1} ellipsizeMode={'tail'} style={{ fontSize: 11, color: 'green', right: 20, position: 'absolute' }}>
            {hotel}
          </Text>
        </View>
      </View>
    )
  }

  renderCustomView() {
    const { renderCustomView } = this.props
    return renderCustomView ? renderCustomView(this.props) : null
  }

  renderBubbleContent() {
    const { isCustomViewBottom } = this.props

    const content = [this.renderCustomView(), this.renderReplyMessage(), this.renderContact(), this.renderMessageImage(), this.renderMessageVideo(), this.renderMessageText()]

    if (isCustomViewBottom) {
      // Move custom view to end
      const customView = content.shift()
      content.push(customView)
    }

    return <View>{content}</View>
  }

  renderTopCoordView() {
    const { currentMessage, onPressCoord } = this.props

    if (!currentMessage.id_hotel) return null

    const geoImage = this.getGeoImage()

    return (
      <TouchableOpacity
        onPress={() => onPressCoord(this, currentMessage)}
        style={{
          position: 'absolute',
          top: 0,
          right: Platform.OS === 'web' ? 0 : 0,
          zIndex: 3
        }}>
        <Image source={triangle} style={{ width: 50, height: 50 }} />
        <Image source={geoImage} style={{ position: 'absolute', top: 0, right: 0, width: 30, height: 30 }} />
      </TouchableOpacity>
    )
  }

  renderHashTags() {
    const { ModalDropdown, isMobile, Icon } = this.props.utils
    const { onPressHashtag, currentMessage, chatAgent, appUser } = this.props
    const { cnt_like, cnt_favorite } = this.state

    if (!currentMessage.hashtag) {
      return null
    }

    let hash = currentMessage.hashtag.trim().split(' ')

    if (chatAgent || (appUser && !appUser.device)) {
      hash = hash.slice(1)
    }

    if (hash.length === 0) {
      return null
    }

    const handleHashtagPress = item => onPressHashtag(item, currentMessage)

    if (hash.length === 1) {
      return (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginLeft: 10, marginRight: 10, marginBottom: 8, borderTopWidth: 0.3, borderTopColor: '#ccc' }}>
          <View style={{ paddingTop: 4, flexWrap: 'wrap' }}>
            {hash.map((item, index) => (
              <TouchableOpacity key={index} onPress={() => handleHashtagPress(item)}>
                <Text ellipsizeMode={'tail'} numberOfLines={1} style={{ color: MAIN_COLOR, width: 160 }}>
                  {item}&nbsp;
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )
    }

    return (
      <View style={{ marginLeft: 10, marginRight: 10, marginBottom: 8, borderTopWidth: 0.3, borderTopColor: '#ccc' }}>
        <ModalDropdown
          options={hash}
          onSelect={index => handleHashtagPress(hash[index])}
          dropdownStyle={{
            width: isMobile ? width - 40 : 400,
            borderWidth: 1,
            borderColor: MAIN_COLOR,
            borderRadius: 10
          }}
          dropdownTextStyle={{ fontSize: 16 }}
          renderRow={(item, index) => (
            <View style={{ padding: 10 }} key={index}>
              <Text style={{ color: MAIN_COLOR, fontSize: 14 }}>{item}</Text>
            </View>
          )}>
          {hash.map((item, index) => (
            <Text key={index} ellipsizeMode={'tail'} numberOfLines={1} style={{ color: MAIN_COLOR, width: 160 }}>
              {item}&nbsp;
            </Text>
          ))}
        </ModalDropdown>
      </View>
    )
  }

  renderContact() {
    const { theme, Icon } = this.props.utils
    const { contact } = this.props.currentMessage

    if (!contact?.length) return null

    const { txt } = getThemeColors(theme)
    const n = isObject(contact[0].name) ? contact[0].name.title : contact[0].name

    const handleContactAction = action => () => {
      this.props.contactCard(contact[0], action)
    }

    const st = { width: 50, alignItems: 'center', justifyContent: 'center' }

    return (
      <View style={{ width: '90%', alignSelf: 'center' }}>
        <View style={{ backgroundColor: '#eff7fa', padding: 6 }}>
          <Text style={{ color: txt }}>{n}</Text>
        </View>
        <View style={{ padding: 6 }}>
          <Text style={{ color: txt }}>{contact[0].phones[0]}</Text>
        </View>
        <View
          style={{
            height: 40,
            backgroundColor: '#f5f5f5',
            marginTop: 20,
            paddingHorizontal: 20,
            flexDirection: 'row',
            justifyContent: 'space-evenly',
            borderRadius: 20,
            marginBottom: 10
          }}>
          <TouchableOpacity onPress={handleContactAction(0)} style={st}>
            <Icon name="phone" color="darkblue" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleContactAction(1)} style={st}>
            <Icon name="sms" color="darkblue" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleContactAction(2)} style={st}>
            <Icon name="add" color="darkblue" />
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  renderReplyMessage() {
    const { currentMessage, containerStyle, replyMessage } = this.props

    if (currentMessage.tip === 6) return null
    if (!currentMessage?.id_parent) return null

    return replyMessage ? replyMessage(currentMessage, containerStyle) : null
  }

  render() {
    const { theme, MaterialIcons, BlurView, Svg, Path } = this.props.utils
    const { containerStyle, wrapperStyle, currentMessage, viewableItems, appUser, openModalActionSelect, openModalAction, history, user } = this.props
    const { selectedHotel } = this.props.filter
    const { menuVisible, menuPosition, is_like, cnt_like, favorite, cnt_favorite } = this.state
    const isCurrentUser = currentMessage.user.id === user.id_user

    let { position } = this.props

    if (appUser && !appUser.device) {
      position = 'left'
    }

    const wrapper = currentMessage.image.length > 0 ? this.styles[position].wrapperImage : this.styles[position].wrapper

    const colorBG = currentMessage.is_warning === 1 ? { backgroundColor: '#fee6d3' } : {}

    const viewAction = currentMessage.tip === 5 || (viewableItems?.indexOf(currentMessage.id) !== -1 && currentMessage.tip === 5)
    const viewRequest = currentMessage.tip === 6 || (viewableItems?.indexOf(currentMessage.id) !== -1 && currentMessage.tip === 6)

    const { bg, txt } = getThemeColors(theme)

    const requestWidth = Platform.isPad ? (width < WIDTH_MAX ? width - 80 : WIDTH_MAX) : Dimensions.get('window').width - 56

    const PushPinIcon = ({ color = '#be202e', size = 24 }) => (
      <Svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24">
        <Path fill={color} d="M9 3.5a1 1 0 0 0 0 2h1L9.25 11c-1.167.167-2.75 1-3.25 3.5h12c-.5-2.5-2.083-3.333-3.25-3.5L14 5.5h1a1 1 0 1 0 0-2z" opacity="0.5" />
        <Path
          fill={color}
          fill-rule="evenodd"
          // eslint-disable-next-line max-len
          d="M9 4.25a.25.25 0 1 0 0 .5h1c.448 0 .804.408.743.851l-.75 5.5a.75.75 0 0 1-.637.641c-1.124.161-1.957.98-2.361 2.008h10.01c-.404-1.028-1.237-1.847-2.36-2.008a.75.75 0 0 1-.638-.64l-.75-5.5A.757.757 0 0 1 14 4.75h1a.25.25 0 0 0 0-.5zm-1.75.25c0-.966.784-1.75 1.75-1.75h6c.967 0 1.75.784 1.75 1.75c0 1.063-.89 1.75-1.89 1.75l.562 4.128c1.835.52 2.951 2.165 3.314 3.975a.758.758 0 0 1-.736.897H6a.758.758 0 0 1-.735-.897c.362-1.81 1.478-3.454 3.313-3.975l.563-4.128c-1.002 0-1.89-.687-1.89-1.75M12 15.75a.75.75 0 0 1 .75.75v4a.75.75 0 0 1-1.5 0v-4a.75.75 0 0 1 .75-.75"
          clip-rule="evenodd"
        />
      </Svg>
    )
    // style={[this.styles[position].container, containerStyle?.[position], { borderRadius: 20 }]}
    return (
      <>
        <View>
          <View style={[wrapper, wrapperStyle?.[position], colorBG]}>
            {viewAction || viewRequest ? (
              <View style={{ backgroundColor: bg }}>
                <TouchableOpacity onLongPress={this.handleLongPress} ref={this.messageRef} delayLongPress={200}>
                  {this.renderUsername(viewAction, viewRequest)}
                  {viewAction && (
                    <Actions
                      currentMessage={currentMessage}
                      appUser={appUser}
                      openModalActionSelect={openModalActionSelect}
                      openModalAction={openModalAction}
                      moreAction={this.handleLongPress}
                      chatAction={true}
                      selectedHotel={selectedHotel}
                      history={history}
                    />
                  )}
                  {viewRequest && appUser.id_user === currentMessage.id_user_parent && (
                    <View style={{ alignItems: 'center', width: requestWidth }}>
                      <View style={{ alignItems: 'center' }}>
                        <Text style={{ fontSize: 14, fontWeight: 'bold', color: 'blue' }}>{currentMessage.text}</Text>
                        <Text style={{ fontSize: 14, fontWeight: 'bold', color: 'green' }}>{currentMessage.name_hotel}</Text>
                      </View>
                      <View style={{ marginTop: 30, marginBottom: 10 }}>
                        <Text style={{ fontSize: 14, fontWeight: 'bold', color: MAIN_COLOR }}>{'Открыть Вашу бронь'}</Text>
                      </View>
                    </View>
                  )}
                  {viewRequest && appUser.id_user !== currentMessage.id_user_parent && (
                    <View style={{ alignItems: 'center', width: requestWidth }}>
                      <View style={{ alignItems: 'center' }}>
                        <Text style={{ fontSize: 14, fontWeight: 'bold', color: 'blue' }}>{currentMessage.text}</Text>
                        <Text style={{ fontSize: 14, fontWeight: 'bold', color: 'green' }}>{currentMessage.name_hotel}</Text>
                        <Text style={{ fontSize: 14, color: 'black' }}>{currentMessage.name_parent + ' забронировал(a) отель'}</Text>
                      </View>
                      <View style={{ marginTop: 10, marginBottom: 10 }}>
                        <Text style={{ fontSize: 14, fontWeight: 'bold', color: MAIN_COLOR }}>{'Открыть бронь'}</Text>
                      </View>
                    </View>
                  )}
                </TouchableOpacity>
                {this.renderHashTags()}
              </View>
            ) : (
              <TouchableOpacity onLongPress={this.handleLongPress} ref={this.messageRef} delayLongPress={200}>
                {currentMessage.id !== -10000 && this.renderTopCoordView()}
                {this.renderUsername()}
                {this.renderBubbleContent()}
                {viewRequest && <Request currentMessage={currentMessage} appUser={appUser} setStatusName={this.setStatusName} />}
                {this.renderHashTags()}
              </TouchableOpacity>
            )}
          </View>
          <View style={[this.styles.reactionsContainer, isCurrentUser ? this.styles.currentUserReactions : this.styles.otherUserReactions]}>
            {cnt_like > 0 && (
              <TouchableOpacity key={'1'} style={[this.styles.reactionBadge, isCurrentUser && this.styles.reactionBadgeActive]} onPress={() => {}}>
                <Text style={{ fontSize: 18 }}>{is_like ? '❤️' : '🩶'}</Text>
                <Text style={this.styles.reactionCount}>{cnt_like}</Text>
              </TouchableOpacity>
            )}
            {cnt_favorite > 0 && (
              <TouchableOpacity key={'2'} style={[this.styles.reactionBadge, isCurrentUser && this.styles.reactionBadgeActive]} onPress={() => {}}>
                <PushPinIcon color={favorite ? 'red' : 'rgb(143,141,141)'} />
                <Text style={this.styles.reactionCount}>{cnt_favorite}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        <ContextMenu
          isCurrentUser={isCurrentUser}
          menuVisible={menuVisible}
          setMenuVisible={this.setMenuVisible}
          menuPosition={menuPosition}
          MaterialIcons={MaterialIcons}
          BlurView={BlurView}
          options={this.getOptions()}
          runFunctionByIndex={this.runFunctionByIndex}
          onPressRowLike={this.onPressRowLike}
          currentMessage={currentMessage}
          onPressRowFavorite={this.onPressRowFavorite}
        />
      </>
    )
  }
}

export default Bubble
