/**
 * -----------------------------------------------------------------------
 *  Header      : AddNewTheme.ts
 *  Created     : 10.04.2025
 *  Modified    : 10.04.2025
 *  Author      : Alexey Zolotarеv
 *  E-mail      : azesm@me.com
 * -----------------------------------------------------------------------
 */

import { useEffect, useRef, useState } from 'react'
import { connect } from 'react-redux'

import AddNewTheme from './AddNewTheme'

export default function AddNewThemeComponent(props) {
  const [isLoading, setLoading] = useState(true)
  const module = useRef(undefined)

  const loadModules = async () => {
    const store = await import('app-store-web')
    module.current = {
      store: store
    }

    const Alert = await import('@blazejkustra/react-native-alert')
    module.current = {
      ...module.current,
      Alert: Alert.default
    }

    const { chatServicePost } = await import('app-services-web')
    module.current = {
      ...module.current,
      chatServicePost: chatServicePost
    }

    const { Button, Checkbox, Dialog, Portal, RadioButton, TextInput } = await import('react-native-paper')
    module.current = {
      ...module.current,
      Button: Button,
      Checkbox: Checkbox,
      Dialog: Dialog,
      Portal: Portal,
      RadioButton: RadioButton,
      TextInput: TextInput
    }
  }

  useEffect(() => {
    if (isLoading) {
      loadModules().then(() => setLoading(false))
    }
  }, [isLoading])

  if (isLoading) {
    return <></>
  }

  const mapStateToProps = state => ({})

  const mapDispatchToProps = dispatch => ({})

  const AddNewThemeWithStore = connect(mapStateToProps, mapDispatchToProps)(AddNewTheme)

  return <AddNewThemeWithStore {...props} utils={module.current} />
}
