import { PureComponent } from 'react'
import { Appearance, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
const { MAIN_COLOR } = GLOBAL_OBJ.onlinetur.constants

class VariantsModal extends PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      variants: [
        {
          cnt_adults: 1,
          children: [],
          percent: '100'
        }
      ]
    }

    this.initData = () => {
      const { variants } = this.props

      if (variants.length > 0) {
        this.setState({ variants: variants })
      }
    }

    this.changeBlockChildren = (index, value) => {
      const { variants } = this.state

      let data = []

      for (let i = 0; i < value; i++) {
        data.push('0')
      }

      let newVariants = Object.assign([], variants)

      if (value === 0) {
        newVariants[index].children = []
      } else {
        newVariants[index].children = data
      }

      this.setState({ variants: newVariants })
    }

    this.changeBlockChildrenOld = (index, indx, value) => {
      const { variants } = this.state
      let newVariants = Object.assign([], variants)
      newVariants[index].children[indx] = value

      this.setState({ variants: newVariants })
    }

    this.removeBlock = index => {
      const { variants } = this.state

      let newVariants = Object.assign([], variants)

      delete newVariants[index]

      this.setState({ variants: newVariants })
    }

    this.addBlock = () => {
      const { variants } = this.state

      let newVariants = Object.assign([], variants)

      newVariants.push({
        cnt_adults: 1,
        children: [],
        percent: '100'
      })

      this.setState({ variants: newVariants })
    }

    this.changeProcentBlock = (index, value) => {
      const { variants } = this.state

      let newVariants = Object.assign([], variants)

      newVariants[index].percent = value

      this.setState({ variants: newVariants })
    }
  }

  renderFieldsAdults = value => {
    const { theme, SelectDropdown, Icon } = this.props.utils
    const cnt_adults = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30]

    return (
      <>
        <Text style={{ fontSize: 12, color: theme.text }}>Взрослых</Text>
        <SelectDropdown
          data={cnt_adults}
          defaultValue={value}
          onSelect={(selectedItem, index) => {
            console.log(selectedItem, index)
          }}
          buttonTextAfterSelection={(selectedItem, index) => {
            // text represented after item is selected
            // if data array is an array of objects then return selectedItem.property to render after item is selected
            return selectedItem
          }}
          rowTextForSelection={(item, index) => {
            // text represented for each item in dropdown
            // if data array is an array of objects then return item.property to represent item in dropdown
            return item
          }}
          buttonStyle={styles.dropdown1BtnStyle}
          buttonTextStyle={styles.dropdown1BtnTxtStyle}
          renderDropdownIcon={isOpened => {
            return <Icon name={isOpened ? 'keyboard-arrow-up' : 'keyboard-arrow-down'} color={'#444'} size={18} />
          }}
          dropdownIconPosition={'right'}
          dropdownStyle={styles.dropdown1DropdownStyle}
          rowStyle={styles.dropdown1RowStyle}
          rowTextStyle={styles.dropdown1RowTxtStyle}
        />
      </>
    )
  }

  renderFieldsChildrens = (value, i) => {
    const { theme, SelectDropdown, Icon } = this.props.utils
    const children = ['0', '1', '2', '3']

    return (
      <>
        <Text style={{ fontSize: 12, color: theme.text }}>Дети</Text>
        <SelectDropdown
          data={children}
          defaultValue={value.toString()}
          onSelect={(selectedItem, index) => {
            this.changeBlockChildren(i, index)
          }}
          buttonTextAfterSelection={(selectedItem, index) => {
            // text represented after item is selected
            // if data array is an array of objects then return selectedItem.property to render after item is selected
            return selectedItem
          }}
          rowTextForSelection={(item, index) => {
            // text represented for each item in dropdown
            // if data array is an array of objects then return item.property to represent item in dropdown
            return item
          }}
          buttonStyle={styles.dropdown1BtnStyle}
          buttonTextStyle={styles.dropdown1BtnTxtStyle}
          renderDropdownIcon={isOpened => {
            return <Icon name={isOpened ? 'keyboard-arrow-up' : 'keyboard-arrow-down'} color={'#444'} size={18} />
          }}
          dropdownIconPosition={'right'}
          dropdownStyle={styles.dropdown1DropdownStyle}
          rowStyle={styles.dropdown1RowStyle}
          rowTextStyle={styles.dropdown1RowTxtStyle}
        />
      </>
    )
  }

  renderFieldsChildrenOld = (value, i, inx) => {
    const { theme, SelectDropdown, Icon } = this.props.utils
    const old = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15']

    return (
      <>
        <Text style={{ fontSize: 12, color: theme.text }}>Возраст</Text>
        <SelectDropdown
          data={old}
          defaultValue={value.toString()}
          onSelect={(selectedItem, index) => {
            this.changeBlockChildrenOld(i, inx, selectedItem)
          }}
          buttonTextAfterSelection={(selectedItem, index) => {
            // text represented after item is selected
            // if data array is an array of objects then return selectedItem.property to render after item is selected
            return selectedItem
          }}
          rowTextForSelection={(item, index) => {
            // text represented for each item in dropdown
            // if data array is an array of objects then return item.property to represent item in dropdown
            return item
          }}
          buttonStyle={styles.dropdown1BtnStyle}
          buttonTextStyle={styles.dropdown1BtnTxtStyle}
          renderDropdownIcon={isOpened => {
            return <Icon name={isOpened ? 'keyboard-arrow-up' : 'keyboard-arrow-down'} color={'#444'} size={18} />
          }}
          dropdownIconPosition={'right'}
          dropdownStyle={styles.dropdown1DropdownStyle}
          rowStyle={styles.dropdown1RowStyle}
          rowTextStyle={styles.dropdown1RowTxtStyle}
        />
      </>
    )
  }

  renderBlock = () => {
    const { theme, TextInput, Icon } = this.props.utils
    const { variants } = this.state

    return variants.map((item, index) => {
      return (
        <View key={index.toString()}>
          <View style={{ width: '100%', flexDirection: 'row', alignContent: 'stretch', margin: 10 }}>
            <View style={{ width: '16%', marginHorizontal: 5 }}>{this.renderFieldsAdults(item.cnt_adults)}</View>
            <View style={{ width: '16%', marginHorizontal: 5 }}>{this.renderFieldsChildrens(item.children.length > 0 ? item.children.length - 1 : 0, index)}</View>
            {item.children.length > 0 &&
              item.children.map((c, i) => {
                return (
                  <View key={i.toString()} style={{ width: '16%', marginHorizontal: 5 }}>
                    {this.renderFieldsChildrenOld(c, index, i)}
                  </View>
                )
              })}
          </View>
          <View style={{ width: '100%', flexDirection: 'row' }}>
            <View style={{ width: '80%', flexDirection: 'row' }}>
              <TextInput
                value={item.percent.toString()}
                defaultValue={item.percent.toString()}
                onChangeText={text => this.changeProcentBlock(index, text)}
                style={{ backgroundColor: 'transparent', width: 60, height: 40, marginLeft: 16, color: theme.text }}
              />
              <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: theme.text }}>% от базовой цены</Text>
              </View>
            </View>
            <View style={{ width: '20%', alignItems: 'flex-end' }}>
              <TouchableOpacity onPress={() => this.removeBlock(index)} style={{ flex: 1, paddingRight: 10 }}>
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
    const { Portal, Modal, Icon, theme, Header } = this.props.utils
    const { variantsModal, openCloseVarints, changeVarints, items, id_categ, price_full } = this.props
    const { variants } = this.state

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
        <Modal visible={variantsModal} onDismiss={() => openCloseVarints()} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ScrollView style={{ flex: 1, marginTop: 100, backgroundColor: bg, borderRadius: 10 }} contentContainerStyle={{ borderRadius: 10 }}>
            <Header
              onlineTurHeader
              centerComponent={{ text: 'Варианты размещения', style: { color: txt, fontSize: 16, fontWeight: 'bold', paddingTop: 2, borderRadius: 10 } }}
              backgroundColor={isDarkMode ? bg : '#ececec'}
              leftComponent={{
                icon: 'close',
                color: 'red',
                onPress: () => {
                  openCloseVarints()
                }
              }}
              rightComponent={
                <View style={{ flexDirection: 'row' }}>
                  <TouchableOpacity onPress={() => this.addBlock()} style={{ marginRight: 10 }}>
                    <Icon name="add" color={'blue'} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => changeVarints(variants)}>
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

const styles = StyleSheet.create({
  dropdown1BtnStyle: {
    width: '100%',
    height: 40,
    backgroundColor: '#FFF',
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: '#bebebe'
  },
  dropdown1BtnTxtStyle: { color: '#444', textAlign: 'left', fontSize: 14 },
  dropdown1DropdownStyle: { backgroundColor: '#EFEFEF' },
  dropdown1RowStyle: { backgroundColor: '#EFEFEF', borderBottomColor: '#C5C5C5' },
  dropdown1RowTxtStyle: { color: '#444', textAlign: 'left', fontSize: 14 }
})

export default VariantsModal
