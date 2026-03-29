import React, { PureComponent } from 'react'
import { ActivityIndicator, Image, Platform, TouchableOpacity, View } from 'react-native'

import DoneIcon from '../../../images/done-ring-round-pngrepo-com.png'

const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
const { MAIN_COLOR } = GLOBAL_OBJ.onlinetur.constants

class MyRating extends PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      isLoading: false
    }

    this.saveNotNull = () => {
      const { Alert, t } = this.props.utils
      const { saveRating } = this.props.params
      const { nullHotels } = this.props.params.isNotSave
      // eslint-disable-next-line consistent-this
      const cmp = this

      Alert.alert(t('screens.ratings.components.myhotels.saveRating'), 'Внимание! ' + nullHotels + ' объект(ов) без оценок будут удалены из вашей номинации рейтинга.', [
        {
          text: t('common.cancel'),
          style: 'destructive'
        },
        {
          text: t('common.save'),
          onPress: () => {
            this.setState({ isLoading: true }, () => {
              setTimeout(function () {
                saveRating(nullHotels)
                cmp.setState({ isLoading: false })
              }, 500)
            })
          }
        }
      ])
    }

    this.onPressSave = () => {
      const { Alert, t } = this.props.utils
      const { saveRating } = this.props.params
      const { nullHotels } = this.props.params.isNotSave

      // eslint-disable-next-line consistent-this
      const cmp = this

      Alert.alert(t('screens.ratings.components.myhotels.saveRating'), t('screens.ratings.components.myhotels.sortHotels'), [
        {
          text: t('common.cancel'),
          style: 'destructive'
        },
        {
          text: t('common.save'),
          onPress: () => {
            if (Number(nullHotels) === 0) {
              this.setState({ isLoading: true }, () => {
                setTimeout(function () {
                  saveRating(nullHotels)
                  cmp.setState({ isLoading: false })
                }, 500)
              })
            } else {
              this.saveNotNull()
            }
          }
        }
      ])
    }
  }

  render() {
    const { notSaveHotels } = this.props.params.isNotSave
    const { isLoading } = this.state
    const color = MAIN_COLOR

    if (!notSaveHotels) {
      return <></>
    }

    if (isLoading) {
      return (
        <View style={{ height: 50, justifyContent: 'center' }}>
          <ActivityIndicator size={30} animating color={color} />
        </View>
      )
    }

    return (
      <>
        <TouchableOpacity onPress={() => this.onPressSave()}>
          <Image source={DoneIcon} style={{ width: 36, height: 36, tintColor: MAIN_COLOR }} />
        </TouchableOpacity>
      </>
    )
  }
}

export default MyRating
