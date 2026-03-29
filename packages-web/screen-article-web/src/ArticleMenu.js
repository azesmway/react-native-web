import isEmpty from 'lodash/isEmpty'
import React, { PureComponent } from 'react'

class ArticleMenu extends PureComponent {
  constructor(props) {
    super(props)

    this.state = {}

    this.openSettings = () => {
      const { history, handleCloseNewsMenu } = this.props

      handleCloseNewsMenu()
      history('/u')
    }
  }

  render() {
    const { isArticle, isMenuOpen, handleCloseNewsMenu, onShareWeb, user } = this.props
    const { Menu, Divider, t } = this.props.utils

    if (!isArticle) {
      return null
    }

    return (
      <>
        <Menu anchor={isMenuOpen} visible={isMenuOpen} onDismiss={handleCloseNewsMenu} contentStyle={{ backgroundColor: '#fff' }}>
          <Menu.Item onPress={onShareWeb} title={t('components.common.articlemenu.share')} />
          <Divider />
          {!isEmpty(user) ? <Menu.Item onPress={() => this.openSettings()} title={t('components.common.articlemenu.setting')} /> : null}
        </Menu>
      </>
    )
  }
}

export default ArticleMenu
