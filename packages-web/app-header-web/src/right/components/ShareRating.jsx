import React, { PureComponent } from 'react'
import { Platform, TouchableOpacity } from 'react-native'

const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
const { getAppConfig, getSelectCategory } = GLOBAL_OBJ.onlinetur.storage
const { MAIN_COLOR } = GLOBAL_OBJ.onlinetur.constants

class ShareRating extends PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      titleAlert: '',
      bodyAlert: '',
      shareMessage: null,
      isShareMessage: false
    }

    this.shareRating = () => {
      const { params, setModalAlert } = this.props
      const { t } = this.props.utils
      const { slideIndex, user } = params
      let shareOptions = {}
      const cat = getSelectCategory()

      if (params.screen === 'main') {
        shareOptions = {
          title: t('components.common.mainheader.share'),
          message: t('components.common.mainheader.shareText'),
          url: getAppConfig().homepage + '/?c=' + (user && user.referral && user.referral.code ? user.referral.code : '') + '&cat=' + (cat.id ? cat.id : '1')
        }
      } else {
        shareOptions = {
          title: t('common.application') + ' ' + getAppConfig().displayName,
          message: t('common.application') + ' ' + getAppConfig().displayName,
          url:
            getAppConfig().homepage +
            '/r' +
            (slideIndex !== 0 ? '/' + (Number(slideIndex) + 1) : '/1') +
            '?c=' +
            (user && user.referral && user.referral.code ? user.referral.code : '') +
            '&cat=' +
            (cat.id ? cat.id : '1')
        }
      }

      this.setState(
        {
          titleAlert: shareOptions.title,
          bodyAlert: shareOptions.message,
          shareMessage: shareOptions,
          isShareMessage: true,
          appShare: true
        },
        () => {
          GLOBAL_OBJ.onlinetur.state = this.state
          setModalAlert(true)
        }
      )
    }

    this.handleCloseAlert = () => {
      const { setModalAlert } = this.props

      this.setState(
        {
          titleAlert: '',
          bodyAlert: '',
          shareMessage: null,
          isShareMessage: false,
          appShare: false
        },
        () => {
          GLOBAL_OBJ.onlinetur.state = {}
          setModalAlert(false)
        }
      )
    }
  }

  render() {
    const { isMobile, SvgIcon, Circle, Path, Rect, G, Defs, ClipPath } = this.props.utils
    const { params } = this.props

    return (
      <>
        <TouchableOpacity onPress={() => this.shareRating()} style={{ paddingRight: params.screen === 'main' ? 0 : 10 }}>
          <SvgIcon width={isMobile ? 28 : 32} height={isMobile ? 28 : 32} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <G clip-path="url(#clip0_15_72)">
              <Rect width="24" height="24" fill="none" />
              <Circle cx="7" cy="12" r="2" stroke={MAIN_COLOR} stroke-linejoin="round" />
              <Circle cx="17" cy="6" r="2" stroke={MAIN_COLOR} stroke-linejoin="round" />
              <Path d="M15 7L8.5 11" stroke={MAIN_COLOR} />
              <Circle cx="17" cy="18" r="2" stroke={MAIN_COLOR} stroke-linejoin="round" />
              <Path d="M8.5 13.5L15 17" stroke={MAIN_COLOR} />
            </G>
            <Defs>
              <ClipPath id="clip0_15_72">
                <Rect width="24" height="24" fill="none" />
              </ClipPath>
            </Defs>
          </SvgIcon>
        </TouchableOpacity>
      </>
    )
  }
}

export default ShareRating
