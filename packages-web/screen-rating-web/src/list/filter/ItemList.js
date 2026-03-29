import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Appearance, Text, View } from 'react-native'

const ItemList = ({ item, changeHotelsInMyRating, myHotelsList, utils }) => {
  const { Icon, ListItem, theme } = utils
  const [checked, setChecked] = useState(() => myHotelsList.some(hotel => Number(hotel.huid) === Number(item.huid)))

  const isDarkMode = useMemo(() => Appearance.getColorScheme() === 'dark', [])
  const textColor = useMemo(() => (isDarkMode ? theme.dark.colors.text : theme.light.colors.text), [isDarkMode, theme])

  const renderHClass = useMemo(() => {
    if (!item.hclass) return null

    if (!item.hclass.includes('*')) {
      return <Text style={styles.hclassText}>{item.hclass}</Text>
    }

    const stars = Number(item.hclass.replace('*', ''))
    const starIcons = Array.from({ length: stars }, (_, i) => <Icon key={i} name="star" color="#ecce00" size={16} />)

    return <View style={styles.starContainer}>{starIcons}</View>
  }, [item.hclass, Icon])

  const changeHotels = useCallback(
    (itemCurrent, checkedCurrent) => {
      setChecked(checkedCurrent)
      changeHotelsInMyRating(itemCurrent, checkedCurrent)
    },
    [changeHotelsInMyRating]
  )

  const handlePress = useCallback(() => {
    changeHotels(item, !checked)
  }, [changeHotels, item, checked])

  useEffect(() => {
    const isChecked = myHotelsList.some(hotel => Number(hotel.huid) === Number(item.huid))
    setChecked(isChecked)
  }, [myHotelsList, item.huid])

  const locationText = useMemo(() => {
    const parts = []
    if (item.cname) parts.push(item.cname)
    if (item.pname) parts.push(item.pname)
    return parts.join(' • ')
  }, [item.cname, item.pname])

  return (
    <ListItem bottomDivider onPress={handlePress} containerStyle={styles.container}>
      <ListItem.Content>
        <View style={styles.nameContainer}>
          <Text numberOfLines={1} ellipsizeMode="tail" style={[styles.nameText, { color: textColor }]}>
            {item.name}
          </Text>
          {renderHClass}
        </View>
        {locationText ? (
          <View style={styles.locationContainer}>
            <Text style={[styles.locationText, { color: textColor }]}>{locationText}</Text>
          </View>
        ) : null}
      </ListItem.Content>
      <ListItem.CheckBox checked={checked} onPress={handlePress} />
    </ListItem>
  )
}

const styles = {
  container: { padding: 5 },
  nameContainer: { width: '90%' },
  nameText: { fontSize: 14, fontWeight: 'bold' },
  hclassText: { fontSize: 12, color: 'blue' },
  starContainer: { flexDirection: 'row' },
  locationContainer: { flexDirection: 'row' },
  locationText: { fontSize: 12 }
}

export default ItemList
