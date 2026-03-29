// @ts-ignore
import React from 'react'

type BgStoryProps = {
  width?: number
  height?: number
  color?: string
  line?: number
  utils: any
}

const Send = ({ width, height, color, line, utils }: BgStoryProps) => {
  const { SvgXml } = utils

  // eslint-disable-next-line max-len
  const xml = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" stroke="${color}" stroke-width="${line}" stroke-linecap="round" stroke-linejoin="round" class="feather feather-send">
      <line x1="22" y1="2" x2="11" y2="13"></line>
      <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
    </svg>`

  return <SvgXml xml={xml} />
}

export default Send
