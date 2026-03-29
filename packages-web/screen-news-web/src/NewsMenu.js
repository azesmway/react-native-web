import isEmpty from 'lodash/isEmpty'
import { memo, useCallback } from 'react'
import { Text, View } from 'react-native'

// Define styles outside component to avoid recreation on each render
const CHECKBOX_STYLE = { color: 'rgb(70,140,215)', borderWidth: 1, top: -10 }
const ICON_STYLE_CLOSE = { color: 'red', marginRight: 10 }
const ICON_STYLE_SETTINGS = { color: 'rgb(70,140,215)', marginRight: 10 }

const NewsMenu = memo(({ utils, isMenuOpen, handleCloseNewsMenu, menuNews, user, hotelView, history, setNewsHotel, clearViewHotel, selectMenu }) => {
  const { Menu, Divider, Checkbox, t, Icon } = utils

  const clearFilter = useCallback(() => {
    setNewsHotel([])
    clearViewHotel()
    handleCloseNewsMenu()
    history('/l')
  }, [handleCloseNewsMenu, setNewsHotel, history, clearViewHotel])

  const openSettings = useCallback(() => {
    handleCloseNewsMenu()
    history('/u')
  }, [history, handleCloseNewsMenu])

  const handleCheckboxChange = useCallback(
    (index, currentCheck) => {
      const menu = [...menuNews]
      menu[index].is_check = currentCheck === 1 ? 0 : 1
      selectMenu(menu, index)
    },
    [menuNews, selectMenu]
  )

  const renderMenuNews = useCallback(() => {
    if (!menuNews?.length) {
      return null
    }

    return menuNews.map((el, i) => (
      <Menu.Item
        key={el.id || i}
        title={
          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
            <Checkbox status={el.is_check === 1 ? 'checked' : 'unchecked'} onPress={() => {}} name="checkedPrice" style={CHECKBOX_STYLE} />
            <Text style={{ fontSize: 16, fontStyle: 'italic' }}>{el.name}</Text>
          </View>
        }
        onPress={() => handleCheckboxChange(i, el.is_check)}
      />
    ))
  }, [menuNews, Menu, Checkbox, handleCheckboxChange])

  const hasHotelView = !isEmpty(hotelView)
  const hasUser = !isEmpty(user)

  return (
    <Menu visible={isMenuOpen} anchor={isMenuOpen} onDismiss={handleCloseNewsMenu} contentStyle={{ backgroundColor: '#fff' }}>
      <Menu.Item title={t('screens.screennews.newsmenu.newsmenu.cat')} />

      {!hasHotelView && renderMenuNews()}

      {hasHotelView && (
        <Menu.Item
          onPress={clearFilter}
          title={
            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
              <Icon name={'close'} style={ICON_STYLE_CLOSE} />
              <Text style={{ fontSize: 16, fontStyle: 'italic' }}>{hotelView.title}</Text>
            </View>
          }
        />
      )}

      {hasUser && (
        <>
          <Divider />
          <Menu.Item
            onPress={openSettings}
            title={
              <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                <Icon name={'settings'} style={ICON_STYLE_SETTINGS} />
                <Text style={{ fontSize: 16, fontStyle: 'italic' }}>{t('common.settings')}</Text>
              </View>
            }
          />
        </>
      )}
    </Menu>
  )
})

NewsMenu.displayName = 'NewsMenu'

export default NewsMenu
