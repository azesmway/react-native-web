import React, { PureComponent } from 'react'
import { Button, Platform, TouchableOpacity, View } from 'react-native'

const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
const { WIDTH_BLOCK, MAIN_COLOR } = GLOBAL_OBJ.onlinetur.constants

class ShowSearch extends PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      open: false,
      vertical: 'top',
      horizontal: 'center',
      search: '',
      showLoading: false
    }

    this.handleClose = () => {
      this.setState({ open: false })
    }
  }

  render() {
    const { Drawer, Icon, SearchBar } = this.props.utils
    const { params } = this.props
    const { open, vertical, search, showLoading } = this.state
    const color = MAIN_COLOR

    if (params.openSearch) {
      return null
    }

    return (
      <>
        <TouchableOpacity onPress={() => this.setState({ open: true })}>
          <Icon name={'search'} size={35} color={params.showSearch ? 'red' : color} />
        </TouchableOpacity>
        <Drawer anchor={vertical} open={open} onClose={() => this.handleClose()}>
          <View style={{ height: 120 }}>
            <SearchBar
              placeholder={params.placeholder}
              onChangeText={text => this.setState({ search: text })}
              value={search}
              lightTheme={true}
              containerStyle={{ backgroundColor: '#fff', padding: 0, width: WIDTH_BLOCK, alignSelf: 'center', marginTop: 10, borderRadius: 10 }}
              inputStyle={{ backgroundColor: '#fff', padding: 0, color: '#000' }}
              inputContainerStyle={{ backgroundColor: '#fff', padding: 0 }}
              autoCapitalize={'none'}
              autoCorrect={false}
              searchIcon={<Icon name="search" size={30} color={'#8d8d8d'} />}
              clearIcon={
                <Icon
                  name="close"
                  size={30}
                  color={'red'}
                  onPress={() => {
                    this.setState({ search: '' })
                    params.onClearSearch()
                  }}
                />
              }
              showLoading={showLoading}
              onSubmitEditing={() => params.onSubmitEditingWeb(search)}
              keyboardType={'web-search'}
              onCancel={() => params.onOpenSearch(!params.openSearch)}
              onClear={() => params.onClearSearch()}
            />
            <View style={{ flexDirection: 'row', alignSelf: 'center', marginTop: 10 }}>
              <Button variant="outlined" onClick={() => params.onSubmitEditingWeb(search)} title={'Искать'} />
              <View style={{ width: 20 }} />
              <Button variant="outlined" onClick={() => this.handleClose()} title={'Закрыть'} />
            </View>
          </View>
        </Drawer>
      </>
    )
  }
}

export default ShowSearch
