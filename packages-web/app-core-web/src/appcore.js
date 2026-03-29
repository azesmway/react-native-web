import isEmpty from 'lodash/isEmpty'
import isObject from 'lodash/isObject'
import isString from 'lodash/isString'
import trim from 'lodash/trim'

/**
 * Функция конвертации приходящих данных под Gifted Chat
 *
 * @param data
 * @returns {Array}
 */
export const convertRequestWeb = async data => {
  let messages = []
  let index, res
  let img_chat = []
  let img_chat_min = []
  let contact = []
  const regex = /(<([^>]+)>)/gi
  // let is_not_send = ''

  for (index = 0; index < data.length; index++) {
    // for (index = data.length - 1; index >= 0; --index) {
    if (data[index].img_chat && data[index].img_chat !== '') {
      if (data[index].img_chat.indexOf('[{') > -1) {
        let json = data[index].img_chat.substr(data[index].img_chat.indexOf('[{'))
        try {
          res = JSON.parse(json)
          res.forEach(function (img) {
            img_chat.push({
              src: img.path.replace('/a/', '/').replace('www.', 'a.'),
              is_image360: img.is_image360 ? 1 : 0,
              latitude: img.latitude,
              longitude: img.longitude,
              date: img.date,
              days_pos: data[index].days_pos,
              caption: data[index].post_title + (data[index].name_hotel ? ' - ' + data[index].name_hotel : '')
            })
          })
        } catch (e) {
          console.log('Error', e)
        }
      } else {
        if (data[index].img_chat.indexOf('{"name"') > -1) {
          try {
            const tmp = JSON.parse(data[index].img_chat)
            contact.push(tmp)
          } catch (e) {
            console.log('Error', e)
          }
        } else {
          img_chat.push({
            src: data[index].img_chat.replace('/a/', '/').replace('www.', 'a.'),
            is_image360: data[index].is_image360 ? 1 : 0,
            latitude: data[index].latitude,
            longitude: data[index].longitude,
            date: data[index].date,
            days_pos: data[index].days_pos,
            caption: data[index].post_title + (data[index].name_hotel ? ' - ' + data[index].name_hotel : '')
          })
        }
      }
    }

    if (data[index].img_chat_min !== null && data[index].img_chat_min !== undefined) {
      if (data[index].img_chat_min.indexOf('[{') !== -1) {
        let json = data[index].img_chat_min.substr(data[index].img_chat_min.indexOf('[{'))
        try {
          res = JSON.parse(json)
          res.forEach(function (img) {
            img_chat_min.push(img.path.replace('/a/', '/').replace('www.', 'a.'))
          })
        } catch (e) {
          console.log('Error', e)
        }
      } else {
        if (data[index].img_chat.indexOf('{"name"') === -1) {
          img_chat_min.push(data[index].img_chat_min)
        }
      }
    }

    let urlNew = []
    if (data[index] && data[index].msg && data[index].msg !== '') {
      const url = data[index].msg.match(/\bhttps?:\/\/\S+/gi)

      if (url && url[0]) {
        for (let i = 0; i < url.length; i++) {
          if (youTubeGetID(url[i])) {
            urlNew.push(url[i])
          }

          if (url[i].includes('rutube')) {
            urlNew.push(url[i])
          }

          if (url[i].includes('vk.')) {
            urlNew.push(url[i])
          }

          if (url[i].includes('tiktok')) {
            urlNew.push(url[i])
          }

          if (url[i].includes('t.me')) {
            urlNew.push(url[i])
          }
        }

        if (urlNew.length > 0) {
          for (let i = 0; i < urlNew.length; i++) {
            let msg = data[index].msg.replace(urlNew[i], '')
            data[index].msg = trim(msg)
          }
        }
      }
    }

    var createdAt
    if (data[index].dt_create.toString().indexOf('T') === -1) {
      var d = data[index].dt_create.split('.')[0]
      var d0 = d.split(' ')[0]
      var t0 = d.split(' ')[1]
      var dA = d0.split('-')
      var tA = t0.split(':')
      createdAt = new Date(dA[0], dA[1] - 1, dA[2], tA[0], tA[1], tA[2])
    } else {
      createdAt = data[index].dt_create
    }

    messages.push({
      _id: data[index].id,
      id: data[index].id,
      text: data[index].msg ? data[index].msg.replace(regex, '') : '',
      urlYoutube: urlNew,
      createdAt: createdAt,
      date_create: data[index].date_create,
      cnt_reply: data[index].cnt_reply,
      cnt_like: data[index].cnt_like,
      is_like: data[index].is_like,
      is_favorite: data[index].is_favorite,
      cnt_favorite: data[index].cnt_favorite,
      hashtag: data[index].hashtag,
      dt: data[index].dt,
      cnt_rating: data[index].cnt_rating,
      id_user: data[index].id_user,
      id_parent: data[index].id_parent,
      id_user_parent: data[index].id_user_parent,
      user: {
        _id: data[index].id_user,
        name: data[index].name,
        avatar: data[index].img_path.replace('/a/', '/').replace('www.', 'a.')
      },
      name_parent: data[index].name_parent !== '' ? data[index].name_parent : null,
      msg_parent: data[index].msg_parent !== '' ? (data[index].msg_parent ? data[index].msg_parent.replace(regex, '') : '') : null,
      // image: img_chat_gifted,
      image: img_chat,
      image_min: img_chat_min,
      post_title: data[index].post_title,
      is_owner: data[index].is_owner,
      id_hotel: data[index].id_otel,
      id_hobbi: data[index].id_interes,
      city: data[index].city,
      id_post: data[index].id_post,
      fav_id_user: data[index].fav_id_user ? data[index].fav_id_user : '',
      name_hotel: data[index].name_hotel,
      name_hobbi: data[index].name_hobbi,
      days_pos: data[index].days_pos,
      day: data[index].day,
      name_city: data[index].name_city,
      bottom_text: data[index].bottom_text,
      warning_message: data[index].warning_message,
      id_country: data[index].id_country,
      date_pos: data[index].date_pos,
      summ: data[index].summ,
      rash_like: data[index].rash_like,
      prih_like: data[index].prih_like,
      contact: contact,
      is_edit: data[index].is_edit,
      // is_not_send: data[index].is_not_send ? data[index].is_not_send : is_not_send,
      is_moderator: data[index].is_moderator,
      is_admin: data[index].is_admin,
      is_sotr: data[index].is_sotr,
      is_warning: data[index].is_warning,
      is_ban: data[index].is_ban,
      tip: data[index].tip,
      image_parent: data[index].image_parent,
      promo: data[index].promo,
      cnt_pos_country: data[index].cnt_pos_country,
      cnt_pos_hotels: data[index].cnt_pos_hotels
    })

    img_chat = []
    img_chat_min = []
    contact = []
  }

  data = null
  img_chat = null

  return messages
}

export const convertRequest = async data => {
  let messages = []
  let index, res
  let img_chat = []
  let img_chat_min = []
  // let img_chat_gifted = ''
  let contact = []
  const regex = /(<([^>]+)>)/gi
  // let is_not_send = ''

  try {
    for (index = 0; index < data.length; index++) {
      // for (index = data.length - 1; index >= 0; --index) {
      if (data[index].img_chat && data[index].img_chat !== '') {
        if (data[index].img_chat.indexOf('[{') > -1) {
          let json = data[index].img_chat.substr(data[index].img_chat.indexOf('[{'))
          try {
            res = JSON.parse(json)
            // img_chat_gifted = res[0].path
            res.forEach(function (img) {
              img_chat.push({
                url: img.path.replace('/a/', '/').replace('www.', 'a.'),
                is_image360: img.is_image360 ? 1 : 0,
                latitude: img.latitude,
                longitude: img.longitude,
                date: img.date
              })
            })
          } catch (e) {
            console.log('PARSE ERROR', e)
          }
        } else {
          if (data[index].img_chat.indexOf('{"name"') > -1) {
            try {
              const tmp = JSON.parse(data[index].img_chat)
              contact.push(tmp)
            } catch (e) {
              console.log('PARSE ERROR', e)
            }
          } else {
            // img_chat_gifted = data[index].path
            img_chat.push({
              url: data[index].img_chat,
              is_image360: data[index].is_image360 ? 1 : 0,
              latitude: data[index].latitude,
              longitude: data[index].longitude,
              date: data[index].date
            })
          }
        }
      }

      if (data[index].img_chat_min !== null) {
        if (data[index].img_chat_min.indexOf('[{') !== -1) {
          let json = data[index].img_chat_min.substr(data[index].img_chat_min.indexOf('[{'))
          try {
            res = JSON.parse(json)
            res.forEach(function (img) {
              img_chat_min.push(img.path.replace('/a/', '/').replace('www.', 'a.'))
            })
          } catch (e) {
            console.log('PARSE ERROR', e)
          }
        } else {
          if (data[index].img_chat.indexOf('{"name"') === -1) {
            img_chat_min.push(data[index].img_chat_min.replace('/a/', '/').replace('www.', 'a.'))
          }
        }
      }

      // for (var ind in offline_edit) {
      //   if (offline_edit.hasOwnProperty(ind)) {
      //     let id = offline_edit[ind]._parts.find(item => item[0] === 'id_chat')
      //     if (id && id[1] * 1 === data[index].id) {
      //       is_not_send = 'Ожидает отправки...'
      //     }
      //   }
      // }
      //
      // for (var ind in offline_delete) {
      //   if (offline_delete.hasOwnProperty(ind)) {
      //     let id = offline_delete[ind]._parts.find(item => item[0] === 'id_chat')
      //     if (id && id[1] * 1 === data[index].id) {
      //       is_not_send = 'Ожидает удаления...'
      //     }
      //   }
      // }

      const url = data[index].msg.match(/\bhttps?:\/\/\S+/gi)
      let urlNew = []

      if (url && url[0]) {
        for (let i = 0; i < url.length; i++) {
          if (youTubeGetID(url[i])) {
            urlNew.push(url[i])
          }

          if (url[i].includes('rutube')) {
            urlNew.push(url[i])
          }

          if (url[i].includes('vk.')) {
            urlNew.push(url[i])
          }

          if (url[i].includes('tiktok')) {
            urlNew.push(url[i])
          }

          if (url[i].includes('t.me')) {
            urlNew.push(url[i])
          }
        }

        if (urlNew.length > 0) {
          for (let i = 0; i < urlNew.length; i++) {
            let msg = data[index].msg.replace(urlNew[i], '')
            data[index].msg = trim(msg)
          }
        }
      }

      var createdAt
      if (data[index].dt_create.toString().indexOf('T') === -1) {
        var d = data[index].dt_create.split('.')[0]
        var d0 = d.split(' ')[0]
        var t0 = d.split(' ')[1]
        var dA = d0.split('-')
        var tA = t0.split(':')
        createdAt = new Date(dA[0], dA[1] - 1, dA[2], tA[0], tA[1], tA[2])
      } else {
        createdAt = data[index].dt_create
      }

      messages.push({
        _id: data[index].id,
        id: data[index].id,
        text: data[index].msg ? data[index].msg.replace(regex, '') : '',
        urlYoutube: urlNew,
        createdAt: createdAt,
        date_create: data[index].date_create,
        cnt_reply: data[index].cnt_reply,
        cnt_like: data[index].cnt_like,
        is_like: data[index].is_like,
        is_favorite: data[index].is_favorite,
        cnt_favorite: data[index].cnt_favorite,
        hashtag: data[index].hashtag,
        dt: data[index].dt,
        cnt_rating: data[index].cnt_rating,
        id_user: data[index].id_user,
        id_parent: data[index].id_parent,
        id_user_parent: data[index].id_user_parent,
        user: {
          _id: data[index].id_user,
          name: data[index].name,
          avatar: data[index].img_path.replace('/a/', '/').replace('www.', 'a.')
        },
        name_parent: data[index].name_parent !== '' ? data[index].name_parent : null,
        msg_parent: data[index].msg_parent !== '' ? (data[index].msg_parent ? data[index].msg_parent.replace(regex, '') : '') : null,
        // image: img_chat_gifted,
        image: img_chat,
        image_min: img_chat_min,
        post_title: data[index].post_title,
        is_owner: data[index].is_owner,
        id_hotel: data[index].id_otel,
        id_hobbi: data[index].id_interes,
        city: data[index].city,
        id_post: data[index].id_post,
        fav_id_user: data[index].fav_id_user ? data[index].fav_id_user : '',
        name_hotel: data[index].name_hotel,
        name_hobbi: data[index].name_hobbi,
        days_pos: data[index].days_pos,
        day: data[index].day,
        name_city: data[index].name_city,
        bottom_text: data[index].bottom_text,
        warning_message: data[index].warning_message,
        id_country: data[index].id_country,
        date_pos: data[index].date_pos,
        summ: data[index].summ,
        rash_like: data[index].rash_like,
        prih_like: data[index].prih_like,
        contact: contact,
        is_edit: data[index].is_edit,
        // is_not_send: data[index].is_not_send ? data[index].is_not_send : is_not_send,
        is_moderator: data[index].is_moderator,
        is_admin: data[index].is_admin,
        is_sotr: data[index].is_sotr,
        is_warning: data[index].is_warning,
        is_ban: data[index].is_ban,
        tip: data[index].tip,
        image_parent: data[index].image_parent,
        promo: data[index].promo,
        cnt_pos_country: data[index].cnt_pos_country,
        cnt_pos_hotels: data[index].cnt_pos_hotels
      })

      img_chat = []
      img_chat_min = []
      contact = []
    }

    data = null
    img_chat = null

    return messages
  } catch (e) {
    console.log('ERROR convertRequest', e)
  }
}

export const youTubeGetID = url => {
  var ID
  url = url.replace(/(>|<)/gi, '').split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/)
  if (url[2] !== undefined) {
    ID = url[2].split(/[^0-9a-z_\-]/i)
    ID = ID[0]
  } else {
    ID = false
  }
  return ID
}

export function createUUID() {
  var s = []
  var hexDigits = '0123456789ABCDEF'
  for (var i = 0; i < 24; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1)
  }
  s[12] = '4' // bits 12-15 of the time_hi_and_version field to 0010
  s[16] = hexDigits.substr((s[16] & 0x3) | 0x8, 1) // bits 6-7 of the clock_seq_hi_and_reserved to 01

  var uuid = s.join('')
  return uuid
}

export function toType(obj) {
  return {}.toString
    .call(obj)
    .match(/\s([a-zA-Z]+)/)[1]
    .toLowerCase()
}

export const testResponse = jsonData => {
  if (isString(jsonData)) {
    return true
  } else if (isObject(jsonData) && (jsonData.code === '96' || jsonData.code === '11')) {
    return true
  }

  return false
}

export const errorTextResponse = jsonData => {
  if (isString(jsonData)) {
    return isString(jsonData)
  } else if (isObject(jsonData) && (jsonData.code === '96' || jsonData.code === '11')) {
    return jsonData.error
  }

  return ''
}

export function convertTowns(data) {
  let towns = []
  let index

  if (!data) {
    return towns
  }

  for (index = 0; index < data.length; index++) {
    towns.push({
      id: data[index].id,
      value: data[index].id,
      label: data[index].title,
      title: data[index].title
    })
  }

  return towns
}

export function convertRadio(data) {
  let station = []
  let index

  for (index = 0; index < data.length; index++) {
    if (data[index].active === '1') {
      if (!isEmpty(data[index].country) && !isEmpty(data[index].name) && !isEmpty(data[index].href)) {
        station.push({
          id: Number(data[index].id),
          value: data[index].href,
          label: data[index].country + ', (' + data[index].name + ')',
          title: data[index].country + ', (' + data[index].name + ')'
        })
      }
    }
  }

  return station
}

export async function getClipboardContents(event) {
  let blob
  let clipboardItems

  if (event.clipboardData.files.length > 0) {
    event.preventDefault()

    let items = event.clipboardData.files

    if (items[0].type === 'image/png' || items[0].type === 'image/jpg' || items[0].type === 'image/jpeg' || items[0].type === 'image/gif' || items[0].type === 'application/pdf') {
      blob = items[0]
    }
  }

  // try {
  //   // if (navigator.clipboard) {
  //   //   console.log('navigator.clipboard', navigator.clipboard)
  //   //   clipboardItems = await navigator.clipboard.read()
  //   //   console.log('clipboardItems', clipboardItems)
  //   //   for (const clipboardItem of clipboardItems) {
  //   //     for (const type of clipboardItem.types) {
  //   //       if (type === 'image/png' || type === 'image/jpg' || type === 'image/jpeg') {
  //   //         blob = await clipboardItem.getType(type)
  //   //         break
  //   //       }
  //   //     }
  //   //   }
  //   // } else {
  //
  // let items = (event.clipboardData || event.originalEvent.clipboardData).items
  //
  // if (items.length > 0 && items[0].kind === 'file') {
  //   if (items[0].type === 'image/png' || items[0].type === 'image/jpg' || items[0].type === 'image/jpeg' || items[0].type.indexOf('pdf') > -1) {
  //     blob = items[0].getAsFile()
  //   }
  // }
  //
  // console.log('blob', blob)
  //
  //   // }
  // } catch (err) {
  //   console.error(err.name, err.message)
  // }

  return blob
}

export const getResponseFromError = err => {
  const { response } = err
  if (!response) {
    const message = `No response from server at "${err.config.baseURL}".
If testing against a server other than the default local instance, you may set the server URL via "SITE_URL" environment variable.
`

    // Throw an error instead of failing silently
    throw new Error(message)
  }

  const { data, status } = response

  // Explicitly print out response data from server for ease of debugging
  console.warn(data)

  return { error: data, status }
}

// export const diffObject = (oldFilter, newFilter) => {
//   var BreakException = {}
//
//   try {
//     Object.keys(newFilter).forEach(key => {
//       if (oldFilter[key] !== newFilter[key]) {
//         throw BreakException
//       }
//     })
//   } catch (e) {
//     if (e !== BreakException) {
//       throw e
//     } else {
//       return true
//     }
//   }
// }
