import { PureComponent } from 'react'
import { Appearance, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native'

const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
const { MAIN_COLOR } = GLOBAL_OBJ.onlinetur.constants

class DaysModal extends PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      days: [
        {
          cnt_days: '',
          percent: ''
        }
      ]
    }

    this.initData = () => {
      const { days } = this.props

      if (days.length > 0) {
        this.setState({ days: days })
      }
    }

    this.removeBlock = index => {
      const { days } = this.state

      let newDays = Object.assign([], days)

      delete newDays[index]

      this.setState({ days: newDays })
    }

    this.addBlock = () => {
      const { days } = this.state

      let newDays = Object.assign([], days)

      newDays.push({
        cnt_days: 0,
        percent: 0
      })

      this.setState({ days: newDays })
    }

    this.changeProcentBlock = (index, value) => {
      const { days } = this.state

      let newDays = Object.assign([], days)

      newDays[index].percent = value

      this.setState({ days: newDays })
    }

    this.changeNightBlock = (index, value) => {
      const { days } = this.state

      let newDays = Object.assign([], days)

      newDays[index].cnt_days = value

      this.setState({ days: newDays })
    }
  }

  renderBlock = () => {
    const { theme, TextInput, Icon } = this.props.utils

    const { price_full, items, id_categ } = this.props
    const { days } = this.state

    let cur = ''

    if (items[id_categ] === 'Рубли') {
      cur = '₽'
    } else if (items[id_categ] === 'Доллары') {
      cur = '$'
    } else if (items[id_categ] === 'Евро') {
      cur = '€'
    }

    let isDarkMode = Appearance.getColorScheme() === 'dark'
    let bg = isDarkMode ? theme.dark.colors.background : theme.light.colors.background
    let txt = isDarkMode ? theme.dark.colors.text : theme.light.colors.text

    return days.map((item, index) => {
      return (
        <View key={index.toString()}>
          <View style={{ flex: 1, flexDirection: 'row' }}>
            <View style={{ flex: 0.7, flexDirection: 'row' }}>
              <TextInput
                label={'Ночей'}
                value={item.cnt_days.toString()}
                defaultValue={item.cnt_days.toString()}
                onChangeText={text => this.changeNightBlock(index, text)}
                style={{ backgroundColor: 'transparent', flex: 0.4, marginLeft: 16, color: theme.text }}
              />
              <TextInput
                label={'Процент от базовой цены'}
                value={item.percent.toString()}
                defaultValue={item.percent.toString()}
                onChangeText={text => this.changeProcentBlock(index, text)}
                style={{ backgroundColor: 'transparent', flex: 0.6, marginLeft: 16, color: theme.text }}
              />
            </View>
            <View style={{ flex: 0.2, alignItems: 'flex-end', justifyContent: 'center' }}>
              <Text style={{ color: txt }}>{cur + Math.round((price_full / 100) * item.percent)}</Text>
            </View>
            <View style={{ flex: 0.1, alignItems: 'flex-end', justifyContent: 'center' }}>
              <TouchableOpacity onPress={() => this.removeBlock(index)} style={{ flex: 1, paddingRight: 10, alignItems: 'flex-end', justifyContent: 'center' }}>
                <Icon name="delete" size={25} color={'red'} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )
    })
  }

  componentDidMount = () => {
    this.initData()
  }

  render() {
    const { theme, Portal, Modal, Icon, Header } = this.props.utils

    const { daysModal, openCloseDays, changeDays, items, id_categ, price_full } = this.props
    const { days } = this.state

    let cur = ''

    if (items[id_categ] === 'Рубли') {
      cur = '₽'
    } else if (items[id_categ] === 'Доллары') {
      cur = '$'
    } else if (items[id_categ] === 'Евро') {
      cur = '€'
    }

    let isDarkMode = Appearance.getColorScheme() === 'dark'
    let bg = isDarkMode ? theme.dark.colors.background : theme.light.colors.background
    let txt = isDarkMode ? theme.dark.colors.text : theme.light.colors.text

    return (
      <Portal>
        <Modal visible={daysModal} onDismiss={() => openCloseDays()} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ScrollView style={{ flex: 1, marginTop: 100, backgroundColor: bg, borderRadius: 10 }} contentContainerStyle={{ borderRadius: 10 }}>
            <Header
              centerComponent={{ text: 'Варианты дней', style: { color: txt, fontSize: 16, fontWeight: 'bold', paddingTop: 2, borderRadius: 10 } }}
              backgroundColor={isDarkMode ? bg : '#ececec'}
              leftComponent={{
                icon: 'close',
                color: 'red',
                onPress: () => openCloseDays()
              }}
              rightComponent={
                <View style={{ flexDirection: 'row' }}>
                  <TouchableOpacity onPress={() => this.addBlock()} style={{ marginRight: 10 }}>
                    <Icon name="add" color={'blue'} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => changeDays(days)}>
                    <Icon name="done" color={'blue'} />
                  </TouchableOpacity>
                </View>
              }
            />
            <View style={{ alignItems: 'center', paddingTop: 10 }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: MAIN_COLOR }}>{'Базовая цена: ' + cur + price_full}</Text>
            </View>
            {this.renderBlock()}
          </ScrollView>
        </Modal>
      </Portal>
    )
  }
}

export default DaysModal
