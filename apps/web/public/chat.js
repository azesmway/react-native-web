var body = document.getElementsByTagName('body')[0]
var head = document.getElementsByTagName('head')[0]
var divChat = document.getElementById('chat')
var w = divChat.getAttribute('width')
var h = divChat.getAttribute('height')
var f = divChat.getAttribute('fullScreen')

var width = '100%'
var height = '100%'

if (!f) {
  width = w
  height = h
}

var newStyle = document.createElement('style')
var style = 'html, body\n' +
  '    {\n' +
  '      overflow: auto;\n' +
  '    }\n' +
  '    html, body, div, iframe\n' +
  '    {\n' +
  '      margin: 0px;\n' +
  '      padding: 0px;\n' +
  '      border: none;\n' +
  '    }\n' +
  '    iframe\n' +
  '    {\n' +
  '      display: block;\n' +
  '      width: ' + width + ';\n' +
  '      height: ' + height + ';\n' +
  '      border: none;\n' +
  '      overflow-y: auto;\n' +
  '      overflow-x: hidden;\n' +
  '    }'

newStyle.append(style)
head.appendChild(newStyle)

const iframe = document.createElement('iframe')
iframe.setAttribute('id', 'chat_iframe')
iframe.setAttribute('allowFullScreen', 'true')
iframe.setAttribute('frameborder', '0')
iframe.setAttribute('scrolling', 'auto')
// iframe.setAttribute('marginheight', '0')
// iframe.setAttribute('marginwidth', '0')
if (!f) {
  iframe.setAttribute('width', width)
  iframe.setAttribute('height', height)
  iframe.setAttribute('style', '"margin: 0px; padding: 0px; border: none;top: 0; right: 0;bottom: 0; left: 0; width: ' + width + '; height: ' + height + ';"')
}
//
iframe.setAttribute('src', 'https://web.onlinetur.ru')
divChat.appendChild(iframe)
