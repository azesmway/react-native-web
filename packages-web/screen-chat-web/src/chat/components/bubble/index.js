import { useEffect, useMemo, useRef, useState } from 'react'
import { Dimensions, Platform } from 'react-native'
import { connect } from 'react-redux'

import Bubble from './Bubble'

export default function BubbleComponent(props) {
  const [isLoading, setLoading] = useState(true)
  const module = useRef(undefined)

  const loadModules = async () => {
    // Parallel imports for better performance
    const [store, utils, mobileModule, { Icon }, ModalDropdown, { isMobile }, { MaterialIcons }, { BlurView }, Svg, { Path, G }, Alert, { chatServiceGet, chatServicePost }] = await Promise.all([
      import('app-store-web'),
      import('app-utils-web'),
      import('app-mobile-web'),
      import('react-native-elements'),
      import('react-native-modal-dropdown'),
      import('react-device-detect'),
      import('@expo/vector-icons'),
      import('expo-blur'),
      import('react-native-svg'),
      import('react-native-svg'),
      import('@blazejkustra/react-native-alert'),
      import('app-services-web')
    ])

    const getIsMobile = () => {
      const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
      const { IS_MOBILE } = GLOBAL_OBJ.onlinetur.constants
      const { width } = Dimensions.get('window')
      return isMobile || width < IS_MOBILE
    }

    // Single assignment instead of multiple spread operations
    module.current = {
      store,
      withRouter: utils.withRouter,
      theme: utils.theme,
      t: utils.t,
      mobile: mobileModule.mobile,
      Icon,
      ModalDropdown: ModalDropdown.default,
      isMobile: getIsMobile(),
      MaterialIcons,
      BlurView,
      Svg: Svg.default,
      Path,
      G,
      Alert: Alert.default,
      chatServiceGet,
      chatServicePost
    }
  }

  useEffect(() => {
    loadModules().then(() => setLoading(false))
  }, [])

  // Memoize Redux connector to prevent recreation on every render
  const BubbleWithProps = useMemo(() => {
    if (isLoading || !module.current) return null

    const { store, withRouter } = module.current

    const mapStateToProps = state => ({
      user: store.userSelector.getUser(state),
      filter: store.filterSelector.getFilter(state),
      isConnect: store.appSelector.getConnect(state)
    })

    const mapDispatchToProps = dispatch => ({
      setFilter: data => dispatch(store.filterAction.setFilter(data.filter))
    })

    return withRouter(connect(mapStateToProps, mapDispatchToProps)(Bubble))
  }, [isLoading])

  if (isLoading || !BubbleWithProps) {
    return null
  }

  // const { id, text, image, user, createdAt } = props.currentMessage

  return <BubbleWithProps {...props} utils={module.current} />

  // return (
  //   <BubbleWithProps
  //     {...props}
  //     id={id}
  //     text={text}
  //     image={image.length > 0 ? image[0].url : null}
  //     sender={{ id: user._id, avatar: user.avatar ? user.avatar : null, name: user.name, isVerified: true }}
  //     createdAt={createdAt}
  //     isEdited={false}
  //     reactions={[{ emoji: '👍', count: 3, users: ['user1', 'user2'] }]}
  //     utils={module.current}
  //   />
  // )
}
