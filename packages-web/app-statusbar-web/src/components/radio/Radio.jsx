import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Dimensions, TouchableOpacity, View } from 'react-native'

const { width } = Dimensions.get('window')

const Radio = ({ utils }) => {
  const [play, setPlay] = useState(false)
  const [radio, setRadio] = useState([])
  const [radioSelect, setRadioSelect] = useState('')

  const { isMobile, ReactAudioPlayer, Icon, t, Dropdown, chatServiceGet, appcore } = utils

  // Initialize radio stations on mount
  useEffect(() => {
    const initRadioStations = async () => {
      try {
        const radioData = await chatServiceGet.getStation()
        setRadio(appcore.convertRadio(radioData))
      } catch (error) {
        console.error('Failed to fetch radio stations:', error)
      }
    }

    initRadioStations()
  }, [chatServiceGet, appcore])

  // Memoize dropdown change handler
  const handleDropdownChange = useCallback(item => {
    setRadioSelect(item.value)
  }, [])

  // Memoize play/pause handler
  const handlePlayPause = useCallback(() => {
    if (radioSelect !== '') {
      setPlay(prev => !prev)
    }
  }, [radioSelect])

  // Memoize icon renderer
  const renderLeftIcon = useCallback(() => <Icon name="radio" size={24} color="#ccc" />, [Icon])

  // Memoize styles
  const containerStyle = useMemo(() => ({ flexDirection: 'row', height: 50, width: isMobile ? width - 20 : width / 2 }), [])

  const dropdownContainerStyle = useMemo(() => ({ justifyContent: 'center', width: isMobile ? width - 60 : width / 2 - 50 }), [])

  const buttonContainerStyle = useMemo(() => ({ justifyContent: 'center', width: 40 }), [])

  return (
    <View style={containerStyle}>
      <View style={dropdownContainerStyle}>
        <Dropdown
          style={{ flex: 1 }}
          placeholderStyle={{ paddingLeft: 5, color: '#888888' }}
          selectedTextStyle={{ paddingLeft: 5 }}
          data={radio}
          maxHeight={300}
          labelField="title"
          valueField="value"
          placeholder={t('components.common.radio.radios')}
          value={radioSelect}
          onChange={handleDropdownChange}
          renderLeftIcon={renderLeftIcon}
        />
      </View>
      <View style={buttonContainerStyle}>
        <TouchableOpacity onPress={handlePlayPause} style={{ width: 50 }}>
          <Icon name={play ? 'pause' : 'play-arrow'} size={35} color={play ? 'red' : 'green'} />
        </TouchableOpacity>
      </View>
      {play && <ReactAudioPlayer src={radioSelect} autoPlay />}
    </View>
  )
}

export default Radio
