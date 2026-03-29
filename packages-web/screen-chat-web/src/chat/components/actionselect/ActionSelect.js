import { useCallback, useMemo } from 'react'
import { Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native'

const IOS_LEGACY_VERSION = 13
const TEXT_STYLE = { fontSize: 16 }

function ActionSelect({ utils, action, onSelect, android, closeModalActionSelect }) {
  const { Header, Icon, t, theme, moment } = utils

  const textStyle = useMemo(() => ({ ...TEXT_STYLE, color: theme.text }), [theme.text])

  const headerProps = useMemo(() => (android ? { containerStyle: { borderTopLeftRadius: 15, borderTopRightRadius: 15 } } : {}), [android])

  const leftIcon = useMemo(
    () => (
      <TouchableOpacity onPress={closeModalActionSelect}>
        <Icon name="close" color="red" />
      </TouchableOpacity>
    ),
    [closeModalActionSelect, Icon]
  )

  const handleSelect = useCallback(
    (el, i) => {
      onSelect(el, i)
      closeModalActionSelect()
    },
    [onSelect, closeModalActionSelect]
  )

  const isLegacyIOS = Platform.OS === 'ios' && parseInt(Platform.Version, 10) < IOS_LEGACY_VERSION

  return (
    <>
      {isLegacyIOS && <View style={{ height: 20 }} />}

      <Header
        {...headerProps}
        onlineTurHeader
        statusBarProps={{ translucent: true }}
        leftComponent={leftIcon}
        centerComponent={{
          text: t('containers.action.select'),
          style: { color: '#000', fontSize: 16, fontWeight: 'bold', paddingTop: 2 }
        }}
        backgroundColor="#ececec"
      />

      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {action.promo.map((el, i) => (
          <View key={`${el.id ?? i}`} style={{ backgroundColor: '#ffffff' }}>
            <TouchableOpacity style={{ flex: 1 }} onPress={() => handleSelect(el, i)}>
              <View style={{ flexDirection: 'row' }}>
                <Text style={textStyle}>{`${el.price_full}${el.symbol} = `}</Text>
                <Text style={textStyle}>{`${el.cnt_days}н., `}</Text>
                <Text style={textStyle}>{`${el.id_categ1_name}, `}</Text>
                <Text style={textStyle}>{`${el.id_categ2_name}, `}</Text>
                <Text style={textStyle}>{moment(el.date_zaezd).format('DD MMM YYYY')}</Text>
              </View>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </>
  )
}

export default ActionSelect
