import isEmpty from 'lodash/isEmpty'
import React from 'react'
import { ActivityIndicator, Dimensions, ImageBackground, Image, Linking, Platform, ScrollView, Text, TouchableOpacity, View, Modal } from 'react-native'

import bg from '../images/bgnews.jpeg'
import ArticleMenu from './ArticleMenu'

const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
const { MAIN_COLOR, WIDTH_MAX, WIDTH_BLOCK } = GLOBAL_OBJ.onlinetur.constants
const { getAppConstants } = GLOBAL_OBJ.onlinetur.storage
const { width, height } = Dimensions.get('window')

const Loading = ({ text }) => {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator color={MAIN_COLOR} />
      {text && <Text style={{ color: '#272727' }}>{text}</Text>}
    </View>
  )
}

class Article extends React.PureComponent {
  constructor(props) {
    super(props)

    const { webEventController } = this.props.utils

    Object.assign(this, new webEventController(this, this.props.utils))

    this.state = {
      article: {},
      isLoading: true,
      voice: false,
      openMenu: false,
      spinner: false,
      openAlert: false,
      titleAlert: '',
      bodyAlert: '',
      shareMessage: null,
      isShareMessage: false,
      articleShare: false,
      articleShareImg: false,
      isMenuOpen: null,
      photoIndex: 0,
      isOpen: false,
      isOpenLogin: false
    }

    this.images = []

    this.loadingArticle = async () => {
      const { pathname, user, globPath, localPath } = this.props
      const { chatServiceGet } = this.props.utils
      let android_id_install = ''
      let token = ''

      if (!isEmpty(user)) {
        android_id_install = user.android_id_install
        token = user.device.token
      }

      let article = await chatServiceGet.fetchGetArticle(globPath.nId, android_id_install, token)

      if (article.code === 0) {
        this.setState({ article: article.ot_request, isLoading: false }, () => {
          this.getParams()
        })
      }
    }

    this.setLike = async (id, like) => {
      const { chatServiceGet } = this.props.utils
      const { article } = this.state
      const { user } = this.props
      this.setState({ spinner: true })
      const result = await chatServiceGet.fetchLikeNews(id, !isEmpty(user) ? user : {}, like)

      if (result.code === 0 && result.ot_request.success) {
        let newArticle = Object.assign({}, article)
        if (like > 0) {
          newArticle.likes += 1

          if (!isEmpty(newArticle.mylikes)) {
            newArticle.mylikes.like = 1
          } else {
            newArticle.mylikes = {}
            newArticle.mylikes.like = 1
          }
        } else {
          newArticle.dlikes += 1
          if (!isEmpty(newArticle.mylikes)) {
            newArticle.mylikes.like = -1
          } else {
            newArticle.mylikes = {}
            newArticle.mylikes.like = -1
          }
        }

        this.setState({ article: newArticle })
      }
      this.setState({ spinner: false })
    }

    this.onShareWeb = async () => {
      const { setModalAlert } = this.props
      const { t } = this.props.utils
      const { article } = this.state

      this.setState(
        {
          openAlert: true,
          titleAlert: t('common.share'),
          bodyAlert: t('screens.article.link'),
          shareMessage: article,
          isShareMessage: true,
          articleShare: true,
          isMenuOpen: null
        },
        () => {
          GLOBAL_OBJ.onlinetur.state = this.state
          GLOBAL_OBJ.onlinetur.props = {
            urlPost: this.props.urlPost,
            componentChat: this
          }
          setModalAlert(true)
        }
      )
    }

    this.onShareImgWeb = () => {
      const { t } = this.props.utils
      const { article } = this.state

      this.setState({
        openAlert: true,
        titleAlert: t('common.share'),
        bodyAlert: t('screens.article.link'),
        shareMessage: article,
        isShareMessage: true,
        articleShareImg: true,
        isMenuOpen: null
      })
    }

    this.onShareVKWeb = () => {
      const { t } = this.props.utils
      const { userVK, urlPost, user, setVK } = this.props
      const { article } = this.state

      this.setState({ isMenuOpen: null }, () => {
        if (!isEmpty(userVK)) {
          let url = encodeURI(getAppConstants().url_news + '/i' + article.id)
          let message = t('screens.article.news')

          if (urlPost === '2') {
            const href = window.location.href.split('/')
            url = href[0] + '//' + href[2] + /n/ + article.id // + '?c=' + user.referral.code
          }

          if (article.type === 18) {
            message = t('screens.article.overview')
          }
        } else {
          this.setState({
            openAlert: true,
            isShareMessage: true,
            titleAlert: t('common.attention'),
            bodyAlert: t('screens.article.vk')
          })
        }
      })
    }

    this.handleCloseAlert = () => {
      this.setState({
        openAlert: false,
        titleAlert: '',
        bodyAlert: '',
        shareMessage: null,
        isShareMessage: false,
        articleShare: false,
        articleShareImg: false
      })
    }

    this.handleCloseNewsMenu = () => {
      this.setState({ isMenuOpen: null })
    }

    this.handleOpenMenu = event => {
      const { x, y } = event
      this.setState(prevState => ({ ...prevState, isMenuOpen: { x, y } }))
    }

    this.getParams = () => {
      const { t } = this.props.utils
      const { article } = this.state
      const { location, setHeaderParams } = this.props

      let params = {}
      params.screen = 'article'
      params.onShare = this.onShareWeb
      params.onShareImg = this.onShareImgWeb
      params.item = article
      params.title = article && article.title ? article.title : t('common.loading')

      if (article.type === 1) {
        params.subtitle = t('screens.article.subtitle1')
      } else if (article.type === 18) {
        params.subtitle = t('screens.article.subtitle2')
      } else {
        params.subtitle = t('screens.article.subtitle')
      }

      params.app = !!(location && location.key)
      params.handleOpenMenu = this.handleOpenMenu

      setHeaderParams(params)
    }

    this.setFooter = () => {
      const { setFooterBar } = this.props

      setFooterBar({})
    }

    this.auth = () => {
      const { setModalLogin } = this.props

      GLOBAL_OBJ.onlinetur.state = this.state
      setModalLogin(true)
    }
  }

  async componentDidMount() {
    this.setFooter()
    await this.loadingArticle()
  }

  componentWillUnmount() {
    const { setFooterBar, setHeaderParams } = this.props

    setHeaderParams({})
    setFooterBar({})
  }

  renderTitle = item => {
    const { isMobile } = this.props.utils

    return (
      <View
        style={{
          width: isMobile ? width - 20 : width / 2,
          alignItems: 'center',
          textAlign: 'center',
          paddingHorizontal: 15,
          paddingVertical: 15,
          marginBottom: 20,
          borderRadius: 10,
          backgroundColor: 'rgba(255, 255, 255, 0.6)'
        }}>
        <Text style={{ fontSize: isMobile ? 16 : 20, color: '#5e5e5e', width: isMobile ? width : width / 2, textAlign: 'center', paddingHorizontal: 20, fontWeight: 'bold' }}>{item.title}</Text>
      </View>
    )
  }

  renderAuthButton = () => {
    const { Button, t } = this.props.utils
    return (
      <>
        <View style={{ height: 100 }} />
        <Button
          buttonStyle={{ backgroundColor: '#eee', shadowColor: '#000', shadowOpacity: 0.5, shadowOffset: { width: 0, height: 2 }, shadowRadius: 5 }}
          title={t('screens.article.auth')}
          titleStyle={{ color: MAIN_COLOR }}
          style={{ width: 200 }}
          onPress={() => this.auth()}
        />
        <View style={{ height: 50 }} />
      </>
    )
  }

  renderContent = item => {
    const { user } = this.props
    const { theme, t, RenderHTML, isMobile } = this.props.utils

    if (isEmpty(user)) {
      return (
        <View
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            width: isMobile ? width : width / 2,
            paddingVertical: 30
          }}>
          <View style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0.5, backgroundColor: '#fff', borderRadius: 10, top: 0 }} />
          <Text style={{ fontFamily: 'sans-serif', color: theme.text }}>{t('screens.article.info')}</Text>
          <TouchableOpacity onPress={() => this.auth()} style={{ marginBottom: 5 }}>
            <Text style={{ color: 'red', fontWeight: 'bold', fontFamily: 'sans-serif' }}> {t('screens.article.auth')}</Text>
          </TouchableOpacity>
          {/*{isEmpty(user) ? this.renderAuthButton() : null}*/}
        </View>
      )
    }

    if (isEmpty(item.content)) {
      return null
    }

    let images = []
    for (let i = 0; i < item.content.length; i++) {
      if (item.content[i].type === 'image') {
        let img = item.content[i].string.replace('medium', 'large').replace('middle', 'full')

        if (img.indexOf('http') === -1) {
          img = getAppConstants().url_news + img
        }

        images.push(img)
      } else if (item.content[i].array) {
        for (let j = 0; j < item.content[i].array.length; j++) {
          let img = item.content[i].array[j].replace('medium', 'large').replace('middle', 'full')

          if (img.indexOf('http') === -1) {
            img = getAppConstants().url_news + img
          }

          images.push(img)
        }
      }
    }

    this.images = images

    return (
      <View style={{ width: isMobile ? width - 20 : width / 2, backgroundColor: 'rgba(255,255,255,0.5)', marginTop: 10 }}>
        {item.content.map((el, i) => {
          if (!isEmpty(el.type) && el.type === 'slides') {
            el.array.map((e, j) => {
              return (
                <View key={j.toString()} style={{ width: '100%' }}>
                  {j !== 0 ? <View style={{ height: 10 }} /> : null}
                  <TouchableOpacity onPress={() => this.setState({ isOpen: true })}>
                    <Image
                      style={{
                        height: ((Platform.OS !== 'web' ? width * 0.9 : width < height ? width * 0.92 : width * 0.3) / 100) * 90,
                        alignSelf: 'center',
                        width: Platform.OS !== 'web' ? width * 0.9 : isMobile ? width : width / 2
                      }}
                      source={{ uri: e }}
                    />
                  </TouchableOpacity>
                </View>
              )
            })
          } else {
            let txt = el.string.split('\n')
            let img = el.string.replace('medium', 'large').replace('middle', 'full')

            if (img.indexOf('http') === -1) {
              img = getAppConstants().url_news + img
            }

            return (
              <View key={i.toString()}>
                {el.type === 'image' ? (
                  <View style={{ width: '100%' }}>
                    {i !== 0 ? <View style={{ height: 10 }} /> : null}
                    <TouchableOpacity onPress={() => this.setState({ isOpen: true })}>
                      <Image
                        style={{
                          height: ((Platform.OS !== 'web' ? width * 0.9 : width < height ? width * 0.92 : width * 0.3) / 100) * 90,
                          alignSelf: 'center',
                          width: Platform.OS !== 'web' ? width * 0.9 : isMobile ? width : width / 2
                        }}
                        source={{ uri: img }}
                      />
                    </TouchableOpacity>
                  </View>
                ) : null}
                {el.type === 'text'
                  ? txt.map((el, j) => (
                      <View key={j.toString()} style={{ width: isMobile ? width - 20 : width / 2, padding: 10 }}>
                        <RenderHTML
                          contentWidth={width < height ? width * 0.92 : width * 0.3}
                          source={{ html: el.replace(/(?:\r\n|\r|\n|\t)/g, '') }}
                          tagsStyles={{
                            body: {
                              whiteSpace: 'normal',
                              fontSize: 16
                            },
                            a: {
                              color: 'blue'
                            }
                          }}
                        />
                      </View>
                    ))
                  : null}
              </View>
            )
          }
        })}
      </View>
    )
  }

  renderImage = item => {
    const { isMobile } = this.props.utils
    const imgs = !isEmpty(item) && !isEmpty(item.content) && !isEmpty(item.content[0].array) ? item.content[0].array : null
    this.images = imgs

    return (
      <View>
        {imgs &&
          imgs.length > 0 &&
          imgs.map((e, i) => {
            if (i !== 0) {
              return <></>
            }
            return (
              <View
                key={i.toString()}
                style={{
                  width: isMobile ? width : width / 2
                }}>
                <TouchableOpacity onPress={() => this.setState({ isOpen: true })}>
                  <Image
                    style={{
                      aspectRatio: 16 / 9,
                      alignSelf: 'center',
                      width: isMobile ? width - 20 : width / 2,
                      borderRadius: 10
                    }}
                    source={{ uri: e.replace('medium', 'large').replace('middle', 'full') }}
                  />
                </TouchableOpacity>
              </View>
            )
          })}
      </View>
    )
  }

  renderImageReview = item => {
    const { isMobile } = this.props.utils
    const { user } = this.props

    if (!isEmpty(user)) {
      return null
    }

    let img

    for (let i = 0; i < item.content.length; i++) {
      if (item.content[i].type === 'image') {
        img = item.content[i].string
        break
      }
    }
    // WIDTH_BLOCK
    return (
      img && (
        <View
          style={{
            width: isMobile ? width : width / 2
          }}>
          <Image
            style={{
              aspectRatio: 16 / 9,
              alignSelf: 'center',
              width: isMobile ? width - 20 : width / 2,
              borderRadius: 10
            }}
            source={{ uri: getAppConstants().url_news + img }}
          />
        </View>
      )
    )
  }

  renderBottomButton = item => {
    const { Button, t, isMobile } = this.props.utils
    const { history, user, countries, setArticle } = this.props
    let url = getAppConstants().url_main + '/redirect.php?token='

    if (user && user.device && user.device.token) {
      url += user.device.token + '&url=' + getAppConstants().url_main_link + '/poisk.php?get=1&c=' + item.id_country
    } else {
      url += '&url=' + getAppConstants().url_main_link + '/poisk.php?get=1&c=' + item.id_country
    }

    url = getAppConstants().url_main_link + '/poisk.php?get=1&c=' + item.id_country

    if (user && user.device && user.device.token) {
      url += '&apid=' + user.id_user + (user.is_sotr === 1 ? '&agn=2' : '')
    }

    const country = countries.filter(function (itm) {
      return itm.id_country === Number(item.id_country)
    })[0]

    return (
      <View style={{ flex: 1, width: isMobile ? width - 20 : width / 2, flexDirection: 'row', justifyContent: 'space-between', paddingTop: 50, backgroundColor: 'rgba(255,255,255,0.5)' }}>
        {user && user.device && user.device.token && (
          <View style={{ width: item.type === 9 ? '33%' : '50%', alignItems: 'flex-start' }}>
            <Button
              title={t('screens.article.order').toUpperCase()}
              titleStyle={{ fontWeight: 'bold', fontSize: isMobile ? 14 : 16 }}
              style={{ marginLeft: 20, width: isMobile ? 140: 180 }}
              // backgroundColor: 'transparent',
              buttonStyle={{ borderRadius: 10, height: 56 }}
              onPress={() => {
                Linking.openURL(url, '_blank')
              }}
            />
          </View>
        )}
        {item.chat_id && item.chat_id > 0 ? (
          <View style={{ flex: 1 }}>
            <Button
              title={t('screens.article.action')}
              titleStyle={{ fontWeight: 'bold' }}
              style={{ alignSelf: 'center' }}
              onPress={() => {
                history('/m/' + item.chat_id)
              }}
            />
          </View>
        ) : null}
        {user && item.type === 9 && (item.chat_user_id === user.id_user || user.is_admin === 1 || user.is_moderator === 1) ? (
          <View style={{ width: '33%' }}>
            <Button
              title={t('screens.article.price')}
              titleStyle={{ fontWeight: 'bold' }}
              style={{ alignSelf: 'center' }}
              onPress={() => {
                if (country) {
                  setArticle(item)
                  history('/y/' + country.id + '/v/2')
                }
              }}
            />
          </View>
        ) : null}
        {user && user.device && user.device.token && (
          <View style={{ alignItems: 'flex-end', width: item.type === 9 ? '33%' : '50%' }}>
            <Button
              title={t('screens.article.discuss')}
              titleStyle={{ fontWeight: 'bold', fontSize: isMobile ? 14 : 16 }}
              style={{ marginRight: 20, width: isMobile? 140 : 180 }}
              buttonStyle={{ borderRadius: 10, height: 56 }}
              onPress={() => {
                history('/y/' + item.post_id + (item.object_type === 1 ? '/h/' + item.object_id : '/b/141'), {
                  state: { article: item }
                })
              }}
            />
          </View>
        )}
      </View>
    )
  }

  renderBottomArticle = item => {
    const { moment, t, Icon, isMobile } = this.props.utils
    const { user } = this.props

    if (isEmpty(user)) {
      return null
    }

    const fS = isMobile ? 14 : 16

    return (
      <View style={{ width: isMobile ? width - 20 : width / 2, height: 140, justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.5)' }}>
        <Text style={{ color: 'grey', fontSize: fS, marginLeft: 20, fontFamily: 'sans-serif', paddingVertical: 20 }}>{moment(item.created_at).format('DD MMM YYYY')}</Text>
        <View
          style={{
            width: '100%',
            flexDirection: 'row',
            paddingRight: isMobile ? 10 : 20
          }}>
          <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: -8 }}>
              <TouchableOpacity style={{ flexDirection: 'row' }} onPress={() => this.setLike(item.id, 1)}>
                <Icon name={'thumb-up'} type={'material'} size={isMobile ? 26 : 36} color={!isEmpty(item.mylikes) && item.mylikes.like === 1 ? 'green' : '#acacac'} />
              </TouchableOpacity>
              <View style={{ width: 20 }} />
              <TouchableOpacity style={{ flexDirection: 'row' }} onPress={() => this.setLike(item.id, -1)}>
                <Icon name={'thumb-down'} type={'material'} size={isMobile ? 26 : 36} color={!isEmpty(item.mylikes) && item.mylikes.like === -1 ? 'red' : '#acacac'} />
              </TouchableOpacity>
              <View style={{ width: 20 }} />
            </View>
            <View style={{ flexDirection: 'row' }}>
              <Text style={{ color: 'grey', fS, fontFamily: 'sans-serif' }}>{t('screens.article.rating') + ' '}</Text>
              {item.likes > 0 ? (
                <Text style={{ color: 'green', fS, fontFamily: 'sans-serif' }}>{'+' + item.likes + ' '}</Text>
              ) : (
                <Text style={{ color: '#acacac', fS, fontFamily: 'sans-serif' }}>{'+' + item.likes + ' '}</Text>
              )}
              <Text style={{ color: 'grey', fS, fontFamily: 'sans-serif' }}>{'/'}</Text>
              {item.dlikes > 0 ? (
                <Text style={{ color: 'red', fS, fontFamily: 'sans-serif' }}>{'-' + item.dlikes}</Text>
              ) : (
                <Text style={{ color: '#acacac', fS, fontFamily: 'sans-serif' }}>{'-' + item.dlikes}</Text>
              )}
            </View>
            <View style={{ flexDirection: 'row', paddingLeft: 20, top: -2 }}>
              <Icon name={'remove-red-eye'} type={'material'} size={22} color={'#acacac'} />
              <Text style={{ color: 'grey', fS, fontFamily: 'sans-serif', paddingLeft: 5, paddingTop: 1 }}>{item.show}</Text>
            </View>
          </View>
        </View>
        <View style={{ height: 50 }} />
      </View>
    )
  }

  renderNews = item => {
    const { isMobile } = this.props.utils

    return (
      <ScrollView style={{ padding: 0, flex: 1, paddingTop: 5 }}>
        <View
          style={{
            alignItems: 'center',
            width: isMobile ? width : width / 2,
            alignSelf: 'center',
            paddingTop: 20,
            borderRadius: 10
          }}>
          {this.renderTitle(item)}
          {item.type !== 18 ? this.renderImage(item) : this.renderImageReview(item)}
          {this.renderContent(item)}
          {this.renderBottomButton(item)}
          {this.renderBottomArticle(item)}
        </View>
        {/*<View style={{ backgroundColor: '#fff', height: 100, width: width < WIDTH_MAX ? '100%' : WIDTH_BLOCK, alignSelf: 'center' }} />*/}
      </ScrollView>
    )
  }

  render() {
    const { t, Lightbox, isMobile, ImageViewer } = this.props.utils
    const { isLoading, article, openAlert, isMenuOpen, isOpen, photoIndex, isOpenLogin } = this.state
    const { history, user, userVK, setUser } = this.props

    return (
      <>
        <ImageBackground source={bg} resizeMode={'cover'} style={{ width: '100%', height: '100%' }}>
          <View style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0.5, backgroundColor: '#fff' }} />
          {isLoading ? <Loading text={t('common.loading')} /> : this.renderNews(article)}
          {/*{openAlert && <AlertDialog componentChat={this} handleCloseAlert={this.handleCloseAlert} />}*/}
          <ArticleMenu
            isArticle={true}
            handleCloseNewsMenu={this.handleCloseNewsMenu}
            isMenuOpen={isMenuOpen}
            history={history}
            user={user}
            onShareWeb={this.onShareWeb}
            onShareImgWeb={this.onShareImgWeb}
            onShareVKWeb={this.onShareVKWeb}
            userVK={userVK}
            utils={this.props.utils}
          />
          {isOpen && Platform.OS === 'web' && (
            <Lightbox
              mainSrc={this.images[photoIndex]}
              nextSrc={this.images[(photoIndex + 1) % this.images.length]}
              prevSrc={this.images[(photoIndex + this.images.length - 1) % this.images.length]}
              onCloseRequest={() => this.setState({ isOpen: false })}
              onMovePrevRequest={() =>
                this.setState({
                  photoIndex: (photoIndex + this.images.length - 1) % this.images.length
                })
              }
              onMoveNextRequest={() =>
                this.setState({
                  photoIndex: (photoIndex + 1) % this.images.length
                })
              }
            />
          )}
          {isOpen && Platform.OS !== 'web' && (
            <Modal visible={isOpen && Platform.OS !== 'web'} style={{ flex: 1 }}>
              <ImageViewer
                useNativeDriver={true}
                imageUrls={this.images}
                index={photoIndex}
                enablePreload={true}
                saveToLocalByLongPress={false}
                // renderHeader={() => this.renderHeader()}
                onChange={async index => {
                  this.setState({
                    currentPicture: this.images[index].url,
                    index: index
                  })
                }}
                style={{ width: '100%', height: '100%' }}
              />
            </Modal>
          )}
        </ImageBackground>
      </>
    )
  }
}

export default Article
