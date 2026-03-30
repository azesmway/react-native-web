'use strict'

// eslint-disable-next-line no-undef
importScripts('https://www.gstatic.com/firebasejs/8.4.1/firebase-app.js')
// eslint-disable-next-line no-undef
importScripts('https://www.gstatic.com/firebasejs/8.4.1/firebase-messaging.js')

// eslint-disable-next-line no-undef
firebase.initializeApp({
  apiKey: '',
  authDomain: 'distant-office.firebaseapp.com',
  databaseURL: 'https://distant-office.firebaseio.com',
  projectId: 'distant-office',
  storageBucket: 'distant-office.appspot.com',
  messagingSenderId: '723349202322',
  appId: '1:723349202322:web:5c6e7442a9464ad69dcd4b'
})

// eslint-disable-next-line no-undef
const messaging = firebase.messaging()

const URL_CHAT = 'https://web.onlinetur.ru'

// messaging.onBackgroundMessage((payload) => {
//   // Customize notification here
//   console.log('onBackgroundMessage', payload)
//   const notificationTitle = payload.notification.title
//   const notificationOptions = {
//     body: payload.notification.body,
//     icon: URL_MAIN + '/a/imgs_logo/logoonlinetur.png',
//     data: payload.data
//   }
//
//   if (notificationOptions.icon) {
//     self.registration.showNotification(notificationTitle, notificationOptions)
//   }
// })

// eslint-disable-next-line no-undef
self.addEventListener('notificationclose', event => {})

// eslint-disable-next-line no-undef
self.addEventListener('notificationclick', event => {
  const urlNew = '/m/' + event.notification.data.id_chat
  event.notification.close()

  event.waitUntil(
    (async function () {
      // eslint-disable-next-line no-undef
      const allClients = await self.clients.matchAll({
        includeUncontrolled: true
      })

      let chatClient

      for (const client of allClients) {
        const url = new URL(client.url)

        if (url.href.indexOf(URL_CHAT) > -1 || url.href.indexOf('localhost') > -1) {
          // Excellent, let's use it!
          client.focus()
          chatClient = client
          break
        }
      }

      if (!chatClient) {
        // eslint-disable-next-line no-undef
        return self.clients.openWindow(URL_CHAT + urlNew)
      }

      chatClient.postMessage({
        action: 'notificationclick',
        openurl: urlNew
      })
    })()
  )
})

// eslint-disable-next-line no-undef
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0'
      }
    })
  )
})
