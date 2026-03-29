import Reactotron, { trackGlobalErrors } from 'reactotron-react-native'
// import ReactotronReactNative from 'reactotron-react-native/src/reactotron-react-native'
// import mmkvPlugin from 'reactotron-react-native-mmkv'
import { reactotronRedux } from 'reactotron-redux'

// @ts-ignore
console.log = Reactotron.log
// @ts-ignore
//console.warn = Reactotron.logImportant
// @ts-ignore
console.error = Reactotron.logImportant
// @ts-ignore
console.tron = Reactotron

// @ts-ignore
const reactotron = Reactotron.configure()
  .useReactNative()
  // @ts-ignore
  .use(reactotronRedux())
  // @ts-ignore
  .use(trackGlobalErrors({}))
  .connect()

export default reactotron
