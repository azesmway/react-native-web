import React, { PureComponent } from 'react'
import { TouchableOpacity, View } from 'react-native'

class Radio extends PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      play: false,
      radio: [],
      radioSelect: ''
    }

    this.refSelect = React.createRef()

    this.initRadionStations = async () => {
      const { chatServiceGet, appcore } = this.props.utils

      chatServiceGet.getStation().then(radio => {
        this.setState({ radio: appcore.convertRadio(radio) })
      })
    }

    this.handleChange = e => {
      this.setState({ radioSelect: e.target.value })
    }
  }

  componentDidMount = async () => {
    await this.initRadionStations()
  }

  render() {
    const { TextField, MenuItem, ReactAudioPlayer, Icon, t } = this.props.utils
    const { play, radio, radioSelect, isFocus } = this.state

    return (
      <View style={{ position: 'absolute', flexDirection: 'row', height: 40, width: 900, borderWidth: 1 }}>
        <View style={{ justifyContent: 'center', width: 300 }}>
          <TextField inputRef={this.refSelect} select label={t('components.common.radio.radios')} value={radioSelect} onChange={this.handleChange} style={{ margin: 0, padding: 0 }}>
            {radio.map(option => (
              <MenuItem key={option.id.toString()} value={option.value}>
                {option.title}
              </MenuItem>
            ))}
          </TextField>
        </View>
        <View style={{ justifyContent: 'center' }}>
          <TouchableOpacity
            onPress={() => {
              if (radioSelect !== '') {
                this.setState({ play: !this.state.play }, () => {})
              }
            }}
            style={{ width: 50 }}>
            <Icon name={this.state.play ? 'pause' : 'play-arrow'} size={35} />
          </TouchableOpacity>
        </View>
        {play && <ReactAudioPlayer src={radioSelect} autoPlay />}
      </View>
    )
  }
}

export default Radio
