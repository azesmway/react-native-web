import isEmpty from 'lodash/isEmpty'
import { Dimensions, Platform } from 'react-native'

export const youTubeGetID = url => {
  var ID = ''
  url = url.replace(/(>|<)/gi, '').split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/)
  if (url[2] !== undefined) {
    ID = url[2].split(/[^0-9a-z_\-]/i)
    ID = ID[0]
  } else {
    ID = false
  }
  return ID
}

// /**
//  * Функция конвертации приходящих данных под Gifted Chat
//  *
//  * @param data
//  * @returns {Array}
//  */
// export const convertRequest = async data => {
//   let messages = []
//   let index, res
//   let img_chat = []
//   let img_chat_min = []
//   let img_chat_gifted = ''
//   let contact = []
//   const regex = /(<([^>]+)>)/gi
//   let is_not_send = ''
//
//   for (index = data.length - 1; index >= 0; --index) {
//     if (data[index].img_chat && data[index].img_chat !== '') {
//       if (data[index].img_chat.indexOf('[{') > -1) {
//         let json = data[index].img_chat.substr(data[index].img_chat.indexOf('[{'))
//         res = JSON.parse(json)
//         img_chat_gifted = res[0].path
//         res.forEach(function(img) {
//           img_chat.push({
//             url: img.path,
//             is_image360: img.is_image360 ? 1 : 0,
//             latitude: img.latitude,
//             longitude: img.longitude,
//             date: img.date
//           })
//         })
//       } else {
//         if (data[index].img_chat.indexOf('{"name"') > -1) {
//           const tmp = JSON.parse(data[index].img_chat)
//           contact.push(tmp)
//         } else {
//           img_chat_gifted = data[index].path
//           img_chat.push({
//             url: data[index].img_chat,
//             is_image360: data[index].is_image360 ? 1 : 0,
//             latitude: data[index].latitude,
//             longitude: data[index].longitude,
//             date: data[index].date
//           })
//         }
//       }
//     }
//
//     if (data[index].img_chat_min !== null) {
//       if (data[index].img_chat_min.indexOf('[{') !== -1) {
//         let json = data[index].img_chat_min.substr(data[index].img_chat_min.indexOf('[{'))
//         res = JSON.parse(json)
//         res.forEach(function(img) {
//           img_chat_min.push(img.path)
//         })
//       } else {
//         if (data[index].img_chat.indexOf('{"name"') === -1) {
//           img_chat_min.push(data[index].img_chat_min)
//         }
//       }
//     }
//
//     for (var ind in offline_edit) {
//       if (offline_edit.hasOwnProperty(ind)) {
//         let id = offline_edit[ind]._parts.find(item => item[0] === 'id_chat')
//         if (id && id[1] * 1 === data[index].id) {
//           is_not_send = 'Ожидает отправки...'
//         }
//       }
//     }
//
//     for (var ind in offline_delete) {
//       if (offline_delete.hasOwnProperty(ind)) {
//         let id = offline_delete[ind]._parts.find(item => item[0] === 'id_chat')
//         if (id && id[1] * 1 === data[index].id) {
//           is_not_send = 'Ожидает удаления...'
//         }
//       }
//     }
//
//     const url = data[index].msg.match(/\bhttps?:\/\/\S+/gi)
//     let urlNew = []
//
//     if (url && url[0]) {
//       urlNew = url.filter(function(u) {
//         return youTubeGetID(u) !== false
//       })
//
//       if (urlNew.length > 0) {
//         for (let i = 0; i < urlNew.length; i++) {
//           let msg = data[index].msg.replace(urlNew[i], '')
//           data[index].msg = trim(msg)
//         }
//       }
//     }
//
//     messages.push({
//       _id: data[index].id,
//       id: data[index].id,
//       text: data[index].msg ? data[index].msg.replace(regex, '') : '',
//       urlYoutube: urlNew,
//       createdAt: new Date(data[index].date_create),
//       cnt_reply: data[index].cnt_reply,
//       cnt_like: data[index].cnt_like,
//       is_like: data[index].is_like,
//       is_favorite: data[index].is_favorite,
//       cnt_favorite: data[index].cnt_favorite,
//       hashtag: data[index].hashtag,
//       dt: data[index].dt,
//       cnt_rating: data[index].cnt_rating,
//       id_user: data[index].id_user,
//       id_parent: data[index].id_parent,
//       user: {
//         _id: data[index].id_user,
//         name: data[index].name,
//         avatar: data[index].img_path
//       },
//       name_parent: data[index].name_parent !== '' ? data[index].name_parent : null,
//       msg_parent: data[index].msg_parent !== '' ? (data[index].msg_parent ? data[index].msg_parent.replace(regex, '') : '') : null,
//       // image: img_chat_gifted,
//       image: img_chat,
//       image_min: img_chat_min,
//       post_title: data[index].post_title,
//       is_owner: data[index].is_owner,
//       id_hotel: data[index].id_otel,
//       id_hobbi: data[index].id_interes,
//       city: data[index].city,
//       id_post: data[index].id_post,
//       fav_id_user: data[index].fav_id_user,
//       name_hotel: data[index].name_hotel,
//       name_hobbi: data[index].name_hobbi,
//       days_pos: data[index].days_pos,
//       summ: data[index].summ,
//       rash_like: data[index].rash_like,
//       prih_like: data[index].prih_like,
//       contact: contact,
//       is_edit: data[index].is_edit,
//       is_not_send: data[index].is_not_send ? data[index].is_not_send : is_not_send,
//       is_moderator: data[index].is_moderator,
//       is_admin: data[index].is_admin,
//       is_sotr: data[index].is_sotr,
//       is_warning: data[index].is_warning,
//       is_ban: data[index].is_ban
//     })
//
//     img_chat = []
//     img_chat_min = []
//     contact = []
//   }
//
//   data = null
//   img_chat = null
//
//   return messages
// }

// export function createNewMessage(cmp, body) {
//   let tmp_id = body.getParts().find(item => item.fieldName === 'tmp_id')
//   let msg_text = body.getParts().find(item => item.fieldName === 'msg')
//   let id_otel = body.getParts().find(item => item.fieldName === 'id_hotel')
//   let id_hobbi = body.getParts().find(item => item.fieldName === 'id_hobbi')
//   let img = body.getParts().find(item => item.fieldName === 'img')
//   let img360 = body.getParts().find(item => item.fieldName === 'img360')
//   let images = body.getParts().find(item => item.fieldName === 'images')
//
//   let id_parent = body.getParts().find(item => item.fieldName === 'id_parent')
//   let id_user_parent = body.getParts().find(item => item.fieldName === 'id_user_parent')
//   let msg_parent = body.getParts().find(item => item.fieldName === 'msg_parent')
//   let name_parent = body.getParts().find(item => item.fieldName === 'name_parent')
//
//   let fav = body.getParts().find(item => item.fieldName === 'fav')
//
//   let sotr_chat = body.getParts().find(item => item.fieldName === 'sotr_chat')
//
//   let msg = [
//     {
//       id: tmp_id.string,
//       msg: msg_text.string,
//       age: null,
//       bottom_text: '',
//       date_create: moment(new Date()).format('YYYY-MM-DD hh:mm:ss'),
//       city: '',
//       cnt_favorite: 0,
//       cnt_like: 0,
//       cnt_rating: 0,
//       cnt_reply: 0,
//       date_pos: null,
//       day: null,
//       days_pos: -1,
//       del: 0,
//       hashtag: '',
//       id_country: 1,
//       id_interes: id_hobbi ? id_hobbi.string * 1 : null,
//       id_otel: id_otel ? id_otel.string * 1 : null,
//       id_parent: id_parent ? id_parent.string * 1 : 0,
//       id_post: !fav ? cmp.state.themeId * 1 : 'fav',
//       id_user: cmp.state.apiData.id_user,
//       id_user_parent: id_parent ? id_user_parent.string * 1 : 0,
//       image_hash: null,
//       img: '',
//       img_path: '',
//       img_chat: '',
//       img_chat_min: '',
//       is_edit: true,
//       is_favorite: false,
//       is_like: false,
//       is_owner: true,
//       is_pay: null,
//       is_pay_maggi: 0,
//       is_pay_sch: 0,
//       is_show_rost: null,
//       is_show_ves: null,
//       last_month: 0,
//       msg_parent: id_parent ? msg_parent.string : '',
//       name: cmp.state.apiData.my_name,
//       name_city: '',
//       name_hobbi: '',
//       name_hotel: '',
//       name_parent: id_parent ? name_parent.string : '',
//       post_title: cmp.state.themeName,
//       rost: null,
//       super_ves: null,
//       this_month: 0,
//       this_ves: null,
//       tip: 1,
//       tip_chat: 0,
//       ves: null,
//       is_not_send: 'Ожидает отправки...'
//     }
//   ]
//
//   if (img) {
//     msg[0].img_chat = img.string
//     msg[0].img_chat_min = null
//   }
//
//   if (img360) {
//     msg[0].img_chat = '[{"is_send":1,"path":"https://stuzon.com/chat/images/imgs/52/52b3902230f1b11ff7c094ef8a24f32fdf638111.JPG","is_image360":1}]'
//     msg[0].img_chat_min = '[{"is_send":1,"path":"https://stuzon.com/chat/images/imgs/52/52b3902230f1b11ff7c094ef8a24f32fdf638011_min.JPG","is_image360":1}]'
//   }
//
//   if (images) {
//     msg[0].img_chat = '[{"is_send":1,"path":"https://stuzon.com/chat/images/imgs/52/52b3902230f1b11ff7c094ef8a24f32fdf638111.JPG"}]'
//     msg[0].img_chat_min = '[{"is_send":1,"path":"https://stuzon.com/chat/images/imgs/52/52b3902230f1b11ff7c094ef8a24f32fdf638011_min.JPG"}]'
//   }
//
//   if (sotr_chat) {
//     msg[0].sotr_chat = sotr_chat.string * 1
//   }
//
//   return msg
// }

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

export function fetch2(url, options = {}) {
  options = {
    credentials: 'same-origin',
    redirect: 'error',
    ...options
  }

  if (options.queryParams) {
    url += (url.indexOf('?') === -1 ? '?' : '&') + queryParams(options.queryParams)
    delete options.queryParams
  }

  return fetch(url, options)
}

function queryParams(params) {
  return Object.keys(params)
    .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k]))
    .join('&')
}

export function isIphoneX() {
  const dim = Dimensions.get('window')

  return (
    // This has to be iOS
    Platform.OS === 'ios' &&
    // Check either, iPhone X or XR
    (isIPhoneXSize(dim) || isIPhoneXrSize(dim))
  )
}

export function isIPhoneXSize(dim) {
  return dim.height === 812 || dim.width === 812
}

export function isIPhoneXrSize(dim) {
  return dim.height === 896 || dim.width === 896
}

export function convertRadio(data) {
  let station = []
  let index

  for (index = 0; index < data.length; index++) {
    if (data[index].active === '1') {
      if (!isEmpty(data[index].country) && !isEmpty(data[index].name) && !isEmpty(data[index].href)) {
        station.push({
          id: data[index].id,
          value: data[index].href,
          label: data[index].country + ', (' + data[index].name + ')',
          title: data[index].country + ', (' + data[index].name + ')'
        })
      }
    }
  }

  return station
}

export function convertTowns(data) {
  let towns = []
  let index

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

export function convertCategories(data) {
  let categories = []
  let index

  for (index = 0; index < data.length; index++) {
    categories.push({
      id: data[index].id,
      value: data[index].id,
      label: data[index].name,
      title: data[index].name
    })
  }

  return categories
}

export function convertContries(data) {
  let contries = []
  let index

  for (index = 0; index < data.length; index++) {
    if (data[index].del === 0) {
      contries.push({
        id: data[index].id,
        value: data[index].title,
        label: data[index].title,
        title: data[index].title
      })
    }
  }

  return contries
}

export async function findWithAttr(array, attr, value) {
  for (var i = 0; i < array.length; i += 1) {
    if (array[i][attr] === value) {
      return i
    }
  }
  return -1
}

export function pause(ms) {
  var date = new Date()
  var curDate = null
  do {
    curDate = new Date()
  } while (curDate - date > ms)
}

export function GetFilename(url) {
  if (url) {
    var m = url.toString().match(/.*\/(.+?)\./)
    if (m && m.length > 1) {
      return m[1]
    }
  }
  return ''
}

export function switchLang(lang) {
  const arr = lang.split('-')

  if (arr[0].toLowerCase() === 'ru') {
    return 'ru'
  } else {
    return 'en'
  }

  // switch () {
  //   case 'ru':
  //     return 'ru'
  //   case 'en-US':
  //     return 'en'
  //   case 'en-EN':
  //     return 'en'
  //   case 'en':
  //     return 'en'
  //   case 'ru':
  //     return 'ru'
  //   default:
  //     return 'ru'
  // }
}
