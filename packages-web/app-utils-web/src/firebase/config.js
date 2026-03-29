//const appFirebase = async () => {
import 'firebase/compat/messaging'
import 'firebase/compat/auth'

import firebase from 'firebase/compat/app'

// const messaging = await import('firebase/compat/messaging')
// const auth = await import('firebase/compat/auth')
// const firebase = await import('firebase/compat/app')

const firebaseConfig = {
  apiKey: '',
  projectId: 'distant-office',
  appId: '1:723349202322:web:5c6e7442a9464ad69dcd4b',
  authDomain: 'distant-office.firebaseapp.com',
  databaseURL: 'https://distant-office.firebaseio.com',
  messagingSenderId: '723349202322',
  storageBucket: 'distant-office.appspot.com'
}

firebase.initializeApp(firebaseConfig)
// console.log('messaging', messaging)
//  return firebase.default
// }

export default firebase
