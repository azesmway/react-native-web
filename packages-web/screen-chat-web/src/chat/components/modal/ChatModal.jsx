import { Appearance, Dimensions, Platform, View } from 'react-native'

import ActionModal from '../action'
import ActionSelect from '../actionselect'
import ContactList from '../contactlist'
import FilterDialog from '../filter'

const { width, height } = Dimensions.get('window')
const GLOBAL_OBJ = Platform.OS === 'web' ? window : global

const ChatModal = props => {
  const { theme, Portal, Modal, isMobile } = props.utils
  const { modalFilter, modalAction, modalContact, setModalFilter, setModalContact, countries, hotels, hobby, places, agent, filter, user } = props

  const visibleModal = !!((modalFilter && modalFilter.visibleModal) || (modalAction && modalAction.visibleModal) || (modalContact && modalContact.visibleModal))

  let isDarkMode = Appearance.getColorScheme() === 'dark'
  let bg = isDarkMode ? theme.dark.colors.background : theme.light.colors.background
  let txt = isDarkMode ? theme.dark.colors.text : theme.light.colors.text

  const onCancel = () => {
    GLOBAL_OBJ.onlinetur.currentComponent = {}
    setModalFilter({})
    setModalContact({})
  }

  const onCancelFilter = () => {
    GLOBAL_OBJ.onlinetur.currentComponent = {}
    setModalFilter({})
  }

  const onCancelContact = () => {
    GLOBAL_OBJ.onlinetur.currentComponent = {}
    setModalContact({})
  }

  const renderModalContent = android => {
    const cmp = GLOBAL_OBJ.onlinetur.currentComponent
    const { ActionFilter } = props.utils

    if (modalFilter && modalFilter.isFilterOpen) {
      return (
        <FilterDialog
          onCancel={onCancelFilter}
          startUpdatingLocation={ActionFilter.startUpdatingLocation}
          onChangeCountry={ActionFilter.onChangeCountry}
          onChangeHotel={ActionFilter.onChangeHotel}
          onChangePlace={ActionFilter.onChangePlace}
          onChangeHobby={ActionFilter.onChangeHobby}
          onClearFilter={ActionFilter.onClearFilter}
          onClearHobby={ActionFilter.onClearHobby}
          onClearPlace={ActionFilter.onClearPlace}
          onClearHotel={ActionFilter.onClearHotel}
          onClearCountry={ActionFilter.onClearCountry}
          hobby={hobby}
          hotels={hotels}
          places={places}
          countries={countries}
          agent={agent}
          callComponent={cmp}
          openGeo={cmp.state.openGeo}
          android={android}
          viewType={modalFilter.viewType}
          geoFilter={modalFilter.geoFilter}
          clearFilterGeo={cmp.clearFilterGeo}
        />
      )
    } else if (modalAction && modalAction.isActionOpen) {
      return (
        <ActionModal
          user={user}
          filter={filter}
          isAdd={cmp.state.isAdd}
          onNewMessages={cmp.setNewMessages}
          android={android}
          closeModalAction={() => {}}
          currentAction={cmp.state.currentAction}
          action={cmp.state.action}
        />
      )
    } else if (modalContact && modalContact.isContactOpen) {
      return <ContactList android={android} onSelectContact={cmp.onSelectContact} closeModalContact={onCancelContact} />
    } else if (modalAction && modalAction.isActionSelectOpen) {
      return <ActionSelect action={cmp.state.actionPromo.action} onSelect={cmp.state.actionPromo.onSelect} android={android} closeModalActionSelect={onCancel} />
    }

    return <View />
  }

  return (
    <Portal>
      <Modal visible={visibleModal} onDismiss={() => onCancel()} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <View
          style={{
            width: isMobile ? width : width / 2,
            height: height / 1.7,
            borderRadius: 10,
            backgroundColor: bg,
            alignSelf: 'center'
          }}>
          {renderModalContent(Platform.OS === 'android')}
        </View>
      </Modal>
    </Portal>
  )
}

export default ChatModal
