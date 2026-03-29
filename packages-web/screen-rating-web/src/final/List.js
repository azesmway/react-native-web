import React, { lazy, Suspense, useRef, useState } from 'react'
import { ActivityIndicator, Appearance, Dimensions, FlatList, Platform, StyleSheet, Text, View } from 'react-native'

const Item = lazy(() => import('../item/Item'))

const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
const { MAIN_COLOR } = GLOBAL_OBJ.onlinetur.constants
const { width, height } = Dimensions.get('window')

const FinalList = ({
  history,
  slideIndex,
  categories,
  countries,
  ratingHotelView,
  onPressShare,
  user,
  setVisibleModalSearch,
  indexTab,
  urlRequestPriceId,
  hotelList,
  isLoading,
  onEndReached,
  utils,
  hotels,
  setHotels,
  currentCategory,
  setModalLogin
}) => {
  const { theme, FAB, isMobile } = utils
  const [isLoadingReached, setIsLoadingReached] = useState(false)
  const [ratingHotelV, setRatingHotelView] = useState(ratingHotelView || '')
  const [initialScrollIndex, setInitialScrollIndex] = useState(0)
  const [loadingPrice, setLoadingPrice] = useState(' Запрос цен...')
  const listRef = useRef(null)

  const setVisibleModalSearchWithHotelist = (visible, countryId, hotelId, placeId, hclass, index) => {
    const listHotels = []

    if (index < 3) {
      for (let i = 0; i < hotelList.length; i++) {
        if (i < 10 && Number(hotelList[i].cuid) === Number(countryId)) {
          listHotels.push(hotelList[i])
        }
      }
    } else if (index > 10) {
      for (let i = 10; i > 0; i--) {
        if (Number(hotelList[i].cuid) === Number(countryId)) {
          listHotels.push(hotelList[i])
        }
      }

      for (let i = 10; i < hotelList.length; i++) {
        if (i < 20 && Number(hotelList[i].cuid) === Number(countryId)) {
          listHotels.push(hotelList[i])
        }
      }
    }

    setVisibleModalSearch(visible, countryId, hotelId, placeId, hclass, listHotels)
  }

  const renderItem = ({ item, index }) => {
    let country = countries.filter(function (c) {
      return Number(c.id_country) === Number(item.cuid)
    })

    if (item.huid) {
      return (
        <Suspense>
          <Item
            key={item.huid.toString()}
            item={item}
            setHotels={setHotels}
            hotels={hotels}
            history={history}
            country={country}
            ratingHotelView={ratingHotelV}
            onPressShare={onPressShare}
            user={user}
            setVisibleModalSearch={setVisibleModalSearchWithHotelist}
            indexTab={indexTab}
            index={index}
            utils={utils}
            currentCategory={currentCategory}
            setModalLogin={setModalLogin}
          />
        </Suspense>
      )
    } else {
      return (
        <View style={{ height: 200, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#808080' }}>{item.name}</Text>
        </View>
      )
    }
  }

  let isDarkMode = Appearance.getColorScheme() === 'dark'
  let bg = isDarkMode ? theme.dark.colors.background : theme.light.colors.background
  let txt = isDarkMode ? theme.dark.colors.text : theme.light.colors.text

  return (
    <>
      <>
        {isLoading ? (
          <View style={{ flex: 1, width: isMobile ? width : width / 2, backgroundColor: 'rgba(255,255,255,0.7)', alignItems: 'center', justifyContent: 'center', alignSelf: 'center' }}>
            <ActivityIndicator size={'large'} color={MAIN_COLOR} />
          </View>
        ) : (
          <>
            <FlatList
              ref={listRef}
              style={{ flex: 1, marginTop: 5 }}
              contentContainerStyle={{ backgroundColor: 'transparent' }}
              data={hotelList}
              renderItem={item => renderItem(item)}
              keyExtractor={(item, index) => index.toString()}
              initialNumToRender={initialScrollIndex + 20}
              onScrollToIndexFailed={error => {
                listRef.current.scrollToOffset({ offset: error.averageItemLength * error.index, animated: false })
                setTimeout(() => {
                  if (hotelList.length !== 0 && listRef.current !== null) {
                    listRef.current.scrollToIndex({ index: error.index, animated: false })
                  }
                }, 100)
              }}
              scrollEventThrottle={16}
              onEndReached={onEndReached}
              onEndReachedThreshold={0.5}
              ListHeaderComponent={
                urlRequestPriceId !== '' ? (
                  <View style={{ alignItems: 'center' }}>
                    <View style={{ flexDirection: 'row' }}>
                      <ActivityIndicator color={txt} />
                      <Text style={{ fontSize: 16, color: txt }}>{loadingPrice}</Text>
                    </View>
                  </View>
                ) : null
              }
            />
            {isLoadingReached && hotelList.length !== 0 ? (
              <View style={{ width: '100%', height: 60, alignItems: 'center', justifyContent: 'center', position: 'absolute', bottom: 40 }}>
                <ActivityIndicator size={'large'} color={txt} />
              </View>
            ) : null}
          </>
        )}
      </>
      {initialScrollIndex !== 0 ? (
        <FAB
          style={styles.fabTop}
          color={'#fff'}
          icon={'arrow-collapse-up'}
          onPress={() => {
            if (listRef && listRef.current) {
              listRef.current.scrollToOffset({ offset: 0, animated: false })
              setInitialScrollIndex(0)
            }
          }}
          customSize={50}
        />
      ) : null}
    </>
  )
}

const styles = StyleSheet.create({
  saveArea: {
    flex: 1
  },
  fabTop: {
    position: 'absolute',
    backgroundColor: '#a2ddff',
    margin: 16,
    right: 0,
    bottom: 10,
    borderRadius: 25
  }
})

export default FinalList
