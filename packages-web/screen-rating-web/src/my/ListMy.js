import { lazy, PureComponent, Suspense } from 'react'
import { ActivityIndicator, Appearance, Dimensions, Platform, ScrollView, Text, View } from 'react-native'

const ItemMy = lazy(() => import('./ItemMy'))

const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
const { MAIN_COLOR } = GLOBAL_OBJ.onlinetur.constants
const { width } = Dimensions.get('window')

class ListMy extends PureComponent {
  constructor(props) {
    super(props)

    this.state = {}

    this.changeCat = index => {
      const { setSlideIndex } = this.props

      setSlideIndex(index)
    }
  }

  render() {
    const { theme, isMobile } = this.props.utils
    const { hotels, removeFromMyRating, removeFromMyCategory, changeRatingHotel, history, visibleWinner, slideIndex, categories, user, isLoading, setSelectedRatingCategory } = this.props

    let isDarkMode = Appearance.getColorScheme() === 'dark'
    let bg = isDarkMode ? theme.dark.colors.background : theme.light.colors.background
    let txt = isDarkMode ? theme.dark.colors.text : theme.light.colors.text
    let actxt = isDarkMode ? theme.dark.colors.main : theme.light.colors.main
    let intxt = isDarkMode ? theme.dark.colors.textInactive : theme.light.colors.textInactive

    return (
      <>
        {isLoading ? (
          <View style={{ flex: 1, width: isMobile ? width : width / 2, backgroundColor: 'rgba(255,255,255,0.5)', alignSelf: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size={'large'} color={MAIN_COLOR} />
          </View>
        ) : hotels.length === 0 ? (
          <View
            style={{
              flex: 1,
              width: isMobile ? width : width / 2,
              alignItems: 'center',
              alignSelf: 'center',
              backgroundColor: 'rgba(255,255,255,0.5)'
            }}>
            <Text style={{ color: '#595959', fontSize: 20, fontWeight: 'bold', top: 200 }}>{'Данных в рейтинге еще нет.'}</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={{ flex: 1, width: isMobile ? width : width / 2, backgroundColor: 'rgba(255,255,255,0.5)', alignSelf: 'center' }}>
            {hotels.map((item, index) => {
              return (
                <Suspense>
                  <ItemMy
                    key={index.toString()}
                    item={item}
                    removeFromMyRating={removeFromMyRating}
                    removeFromMyCategory={removeFromMyCategory}
                    changeRatingHotel={changeRatingHotel}
                    history={history}
                    visibleWinner={visibleWinner}
                    slideIndex={slideIndex}
                    index={index}
                    user={user}
                    utils={this.props.utils}
                    saveRatingCurrent={this.props.saveRatingCurrent}
                  />
                </Suspense>
              )
            })}
            <View style={{ height: 100 }} />
          </ScrollView>
        )}
      </>
    )
  }
}

export default ListMy
