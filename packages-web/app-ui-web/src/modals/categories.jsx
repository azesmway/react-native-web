import { useEffect } from 'react'
import { Platform, ScrollView, TouchableOpacity, View } from 'react-native'

const GLOBAL_OBJ = Platform.OS === 'web' ? window : global

const SelectCategory = props => {
  const { categories } = props
  const { Icon, Header, t, ListItem } = props.utils
  const { onSelect, closeModalFilter } = GLOBAL_OBJ.onlinetur.currentComponent

  const escFunction = event => {
    if (event.keyCode === 27) {
      closeModalFilter()
    }
  }

  useEffect(() => {
    if (Platform.OS === 'web') {
      document.addEventListener('keydown', escFunction, false)
    }

    return () => {
      if (Platform.OS === 'web') {
        document.removeEventListener('keydown', escFunction, false)
      }
    }
  }, [])

  const renderLeftIcon = () => {
    return (
      <TouchableOpacity onPress={() => closeModalFilter()}>
        <Icon name={'close'} color={'red'} />
      </TouchableOpacity>
    )
  }

  return (
    <>
      <Header
        onlineTurHeader
        statusBarProps={{ translucent: true }}
        containerStyle={{ borderTopLeftRadius: 10, borderTopRightRadius: 10 }}
        leftComponent={renderLeftIcon()}
        centerComponent={{ text: t('components.header.selectcategory.cat'), style: { color: '#000', fontSize: 16, fontWeight: 'bold', paddingTop: 2 } }}
        backgroundColor={'#ececec'}
      />
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 10 }} scrollEnabled>
        {categories.map((el, i) => (
          <ListItem
            key={el.id.toString()}
            bottomDivider
            onPress={() => {
              closeModalFilter()
              setTimeout(() => {
                onSelect(el)
              }, 400)
            }}>
            <ListItem.Content>
              <ListItem.Title>{el.name.trim()}</ListItem.Title>
            </ListItem.Content>
          </ListItem>
        ))}
        <View style={{ height: 500 }} />
      </ScrollView>
    </>
  )
}

export default SelectCategory
