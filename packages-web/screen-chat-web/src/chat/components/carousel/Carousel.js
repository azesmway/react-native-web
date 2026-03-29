/**
 * -----------------------------------------------------------------------
 *  Author      : Alexey Zolotarеv
 *  E-mail      : azesm@me.com
 * -----------------------------------------------------------------------
 */

import { Image, TouchableOpacity } from 'react-native'

import png360 from '../../../../images/360.png'

const CarouselImages = props => {
  const { Carousel, ImageLoad } = props.utils
  const { message, height, indexTab, onPress } = props

  if (_.isEmpty(message)) {
    return null
  }

  if (indexTab === 1) {
    return (
      <Carousel infiniteLoop={true} autoPlay={true} interval={2000} width={'100%'} showThumbs={false} showIndicators={false}>
        {message.map((block, index) => {
          if (block.is_image360 === 1) {
            return (
              <TouchableOpacity onPress={() => onPress(block.image_path)} key={index.toString()}>
                <ImageLoad style={{ aspectRatio: 16 / 9 }} source={block.image_path_min} alt="" />
                <Image source={png360} style={{ width: 60, height: 60, position: 'absolute', top: 10, left: 10 }} />
              </TouchableOpacity>
            )
          }
          return (
            <div key={index.toString()}>
              <ImageLoad style={{ aspectRatio: 16 / 9 }} source={block.image_path_min} alt="" />
            </div>
          )
        })}
      </Carousel>
    )
  }

  const imgs = message.content.filter(function (item) {
    return item.type === 'image'
  })

  let numImg = -1

  if (message.isNullHotel) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', paddingTop: 100 }}>
        <img style={{ width: 200, border: 0 }} src={message.content[0].string} />
      </div>
    )
  }

  return (
    <Carousel infiniteLoop={true} autoPlay={true} interval={2000} width={'100%'} showThumbs={false} showIndicators={false}>
      {message.content.map((block, index) => {
        if (numImg === imgs.length - 1) {
          numImg = 0
        } else {
          numImg += 1
        }

        if (block.type === 'image') {
          return (
            <div key={index.toString()}>
              <ImageLoad style={{ aspectRatio: 16 / 9 }} source={block.string.indexOf('http') > -1 ? block.string : 'https://zagrebon.com/' + block.string} alt="" />
            </div>
          )
        }
      })}
    </Carousel>
  )
}

export default CarouselImages
