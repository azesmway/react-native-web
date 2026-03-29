import { PureComponent } from 'react'
import { Appearance, Dimensions, Image, Platform, StyleSheet, Text, View } from 'react-native'

import CloseIcon from '../../images/close-circle-pngrepo-com.png'
import TrashIcon from '../../images/garbage-pngrepo-com.png'
import HelpIcon from '../../images/information-pngrepo-com.png'
import placeholder from '../../images/sky.jpg'

const WIDTH_TOOLTIP = 200
const HEIGHT_TOOLTIP = 240

const SCALE_FONT = Platform.isPad ? 6 : 14
const SCALE_SUBFONT = Platform.isPad ? 4 : 11

const optionsStyles = {
  optionsContainer: {
    width: 300
  },
  optionsWrapper: {
    width: 300
  },
  optionTouchable: {
    activeOpacity: 70
  },
  optionText: {
    padding: 10,
    fontSize: 16
  }
}

const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
const { getAppConstants } = GLOBAL_OBJ.onlinetur.storage
const { width } = Dimensions.get('window')

class ItemMy extends PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      expanded: false,
      isMenuOpen: false,
      tooltipOpen: false,
      currentItem: props.item
    }

    this.changeRatingHotelLocal = rating => {
      const { item, changeRatingHotel, saveRatingCurrent } = this.props
      const { currentItem } = this.state

      const itm = Object.assign({}, currentItem)
      itm.my_rating = rating
      itm.notSave = true

      this.setState({ currentItem: itm }, () => {
        changeRatingHotel(item, rating)

        setTimeout(() => {
          saveRatingCurrent(item).then(result => {
            if (result.ids) {
              const i = Object.assign({}, this.state.currentItem)
              itm.my_rating = rating
              delete i.notSave
              this.setState({ currentItem: i })
            }
          })
        }, 1000)
      })
    }
  }

  renderTooltip = (item, history, country, user, expoRouter) => {
    const { theme, ListItem, t } = this.props.utils
    const { removeFromMyRating, removeFromMyCategory, slideIndex } = this.props
    let id_country = 0

    if (country && country.length > 0) {
      id_country = country[0].id
    }

    let isDarkMode = Appearance.getColorScheme() === 'dark'
    let bg = isDarkMode ? theme.dark.colors.background : theme.light.colors.background
    let txt = isDarkMode ? theme.dark.colors.text : theme.light.colors.text

    return (
      <View style={{ width: WIDTH_TOOLTIP - 10 }}>
        <ListItem
          key={0}
          bottomDivider
          onPress={() =>
            this.setState({ tooltipOpen: false }, () => {
              let email = ''
              let name = ''
              let addUrl = ''
              const path = getAppConstants().url_main_link
              let url = path + '/bestt.php?i=ols' + item.huid + '&only=1&t=0;0&app=11'

              if (user && user.id_user) {
                url += '&apid=' + user.id_user + (user.is_sotr === 1 ? '&agn=2' : '')
                email = btoa(user.login)
                name = btoa(encodeURI(user.my_name))
                addUrl = url + `&ue=${email}&uk=${user.hash_ml}&un=${name}`
              }

              expoRouter.push({
                pathname: '/web',
                params: { url: addUrl, title: item.name, subtitle: t('screens.ratings.components.itemmenu.hotel') }
              })
            })
          }
          containerStyle={{ backgroundColor: bg }}>
          <Image source={HelpIcon} style={styles.iconContainer} />
          <ListItem.Content>
            <ListItem.Subtitle style={{ color: txt }}>{t('tooltip.subject')}</ListItem.Subtitle>
          </ListItem.Content>
        </ListItem>
        <ListItem
          key={1}
          bottomDivider
          onPress={() =>
            this.setState({ tooltipOpen: false }, () => {
              removeFromMyCategory(item, slideIndex)
            })
          }
          containerStyle={{ backgroundColor: bg }}>
          <Image source={CloseIcon} style={styles.iconContainerDel} />
          <ListItem.Content>
            <ListItem.Subtitle style={{ color: txt }}>{t('tooltip.delcat')}</ListItem.Subtitle>
          </ListItem.Content>
        </ListItem>
        <ListItem
          key={2}
          onPress={() =>
            this.setState({ tooltipOpen: false }, () => {
              removeFromMyRating(item)
            })
          }
          containerStyle={{ backgroundColor: bg }}>
          <Image source={TrashIcon} style={styles.iconContainerDel} />
          <ListItem.Content>
            <ListItem.Subtitle style={{ color: txt }}>{t('tooltip.delrating')}</ListItem.Subtitle>
          </ListItem.Content>
        </ListItem>
      </View>
    )
  }

  renderContentItem = currentItem => {
    const { Icon, theme, ListItem, Rating, isMobile, Tooltip } = this.props.utils

    let hclass = <Text style={{ fontSize: 12, color: 'blue' }}>{currentItem.hclass}</Text>

    if (currentItem.hclass.indexOf('*') > -1) {
      let stars = Number(currentItem.hclass.replace('*', ''))
      let view = []

      for (let i = 0; i < stars; i++) {
        view.push(<Icon key={i.toString()} name={'star'} color={'#ecce00'} size={16} />)
      }
      hclass = <View style={{ flexDirection: 'row', marginTop: 2 }}>{view}</View>
    }

    const img = currentItem.cover_image ? { uri: currentItem.cover_image } : placeholder

    let isDarkMode = Appearance.getColorScheme() === 'dark'
    let bg = isDarkMode ? theme.dark.colors.background : theme.light.colors.background
    let txt = isDarkMode ? theme.dark.colors.text : theme.light.colors.text

    return (
      <ListItem containerStyle={{ marginVertical: 5, padding: 5, backgroundColor: 'rgba(255,255,255,0.7)', height: 80 }}>
        <View style={{ margin: 0, padding: 0 }}>
          <View style={{ paddingLeft: 5, width: isMobile ? width - 100 : width / 2 - 140 }}>
            {hclass}
            <Text lineBreakMode={'tail'} numberOfLines={1} ellipsizeMode={'tail'} style={{ fontSize: isMobile ? 16 : 18, fontWeight: 'bold', color: currentItem.notSave ? 'red' : txt }}>
              {currentItem.name}
            </Text>
          </View>
          {/*<View style={{ width: '100%', height: 1, backgroundColor: '#ccc', marginTop: 10, marginBottom: 10 }} />*/}
          <View style={{ flexDirection: 'row', paddingLeft: 5 }}>
            {currentItem.cname !== '' ? <Text style={{ fontSize: SCALE_SUBFONT, color: txt }}>{currentItem.cname}</Text> : null}
            {currentItem.pname !== '' ? <Text style={{ fontSize: SCALE_SUBFONT, color: txt }}>{' • ' + currentItem.pname}</Text> : null}
          </View>
        </View>
      </ListItem>
    )
  }

  render() {
    const { theme, Tooltip, Rating, isMobile } = this.props.utils
    const { history, country, user, expoRouter } = this.props
    const { tooltipOpen } = this.state
    const { currentItem } = this.state

    let isDarkMode = Appearance.getColorScheme() === 'dark'
    let bg = isDarkMode ? theme.dark.colors.background : theme.light.colors.background

    return (
      <View style={{ flexDirection: 'row', width: isMobile ? width : width / 2 }}>
        <View style={{ width: isMobile ? width - 120 : width / 2 - 122 }}>
          <Tooltip
            popover={this.renderTooltip(currentItem, history, country, user, expoRouter)}
            width={WIDTH_TOOLTIP}
            height={HEIGHT_TOOLTIP - 70}
            backgroundColor={bg}
            overlayColor={'rgba(100, 100, 100, 0.8)'}
            visible={tooltipOpen}
            onOpen={() => this.setState({ tooltipOpen: true })}>
            {this.renderContentItem(currentItem)}
          </Tooltip>
        </View>
        <View style={{ width: 1, paddingVertical: 10, backgroundColor: '#ccc' }} />
        <View style={{ backgroundColor: 'rgba(255,255,255,0.7)', marginVertical: 5, width: 120 }}>
          <Rating
            showRating
            fractions={2}
            startingValue={currentItem.my_rating ? currentItem.my_rating : 0}
            imageSize={20}
            onFinishRating={rating => this.changeRatingHotelLocal(rating)}
            minValue={0}
          />
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  itemContainer: {
    padding: 16
  },
  avatarContainer: {
    borderColor: '#c9c9c9',
    backgroundColor: 'transparent',
    borderWidth: 1,
    margin: 0,
    padding: 0
  },
  iconContainer: {
    width: 24,
    height: 24
  },
  iconContainerDel: {
    width: 24,
    height: 24,
    tintColor: 'red'
  }
})

export default ItemMy
