/**
 * -----------------------------------------------------------------------
 *  Author      : Alexey Zolotarеv
 *  E-mail      : azesm@me.com
 * -----------------------------------------------------------------------
 */

import queryString from 'query-string'

class VideoUrl {
  youTubeGetID = url => {
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

  convertUrl = url => {
    if (url.includes('youtu')) {
      return 'https://www.youtube.com/embed/' + this.youTubeGetID(url)
    }

    if (url.includes('rutube')) {
      let videoId = ''

      if (url.indexOf('pl_video=') > -1) {
        videoId = url.substring(url.indexOf('pl_video=') + 9, url.length)
      } else if (url.indexOf('private/') > -1) {
        videoId = 'private'
      } else if (url.indexOf('video/') > -1) {
        videoId = url.substring(url.indexOf('video/') + 6, url.length).replace('/', '')
      } else if (url.indexOf('embed/') > -1) {
        videoId = url.substring(url.indexOf('embed/') + 6, url.length).replace('/', '')
      }

      return videoId !== 'private' ? 'https://rutube.ru/play/embed/' + videoId : ''
    }

    if (url.includes('vk.') && !url.includes('video_ext')) {
      const vk = queryString.parseUrl(url)

      if (vk && vk.query && vk.query.z) {
        const z = vk.query.z.split('/')
        const ids = z[0].split('_')
        const oid = ids[0].replace('video', '')

        return `https://vk.com/video_ext.php?oid=${oid}&id=${ids[1]}&hd=2`
      }

      return url
    } else if (url.includes('vk.') && url.includes('video_ext')) {
      return url
    }

    if (url.includes('tiktok')) {
      const u = url.split('/')
      const u1 = u[5].split('?')

      return 'https://www.tiktok.com/player/v1/' + u1[0]
    }

    if (url.includes('dzen.ru/embed')) {
      return url
    }

    if (url.includes('t.me')) {
      return url
    }

    return ''
  }
}

export default new VideoUrl()
