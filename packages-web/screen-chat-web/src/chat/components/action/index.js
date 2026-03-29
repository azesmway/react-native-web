import { useEffect, useMemo, useRef, useState } from 'react'
import { connect } from 'react-redux'

import ActionModal from './ActionModal'

export default function ActionModalComponent(props) {
  const [isLoading, setLoading] = useState(true)
  const module = useRef(undefined)

  const loadModules = async () => {
    const [
      store,
      { chatServiceGet, chatServicePost },
      { withRouter, t, theme, moment },
      { mobile },
      { Icon, Header },
      { TextInput, Portal, Modal },
      DateTimePickerModal,
      ModalDropdown,
      SelectDropdown,
      Alert
    ] = await Promise.all([
      import('app-store-web'),
      import('app-services-web'),
      import('app-utils-web'),
      import('app-mobile-web'),
      import('react-native-elements'),
      import('react-native-paper'),
      import('react-native-modal-datetime-picker'),
      import('react-native-modal-dropdown'),
      import('react-native-select-dropdown'),
      import('@blazejkustra/react-native-alert')
    ])

    module.current = {
      store,
      chatServiceGet,
      chatServicePost,
      withRouter,
      t,
      theme,
      moment,
      mobile,
      Icon,
      Header,
      TextInput,
      Portal,
      Modal,
      DateTimePickerModal: DateTimePickerModal.default,
      ModalDropdown: ModalDropdown.default,
      SelectDropdown: SelectDropdown.default,
      Alert: Alert.default
    }
  }

  useEffect(() => {
    loadModules().then(() => setLoading(false))
  }, [])

  const ActionModalWithProps = useMemo(() => {
    if (isLoading || !module.current) return null

    const { store, withRouter } = module.current

    const mapStateToProps = state => ({})

    const mapDispatchToProps = dispatch => ({})

    return withRouter(connect(mapStateToProps, mapDispatchToProps)(ActionModal))
  }, [isLoading])

  if (isLoading || !ActionModalWithProps) {
    return <></>
  }

  return <ActionModalWithProps {...props} utils={module.current} />
}
