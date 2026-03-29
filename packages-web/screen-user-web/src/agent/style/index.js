import { StyleSheet } from 'react-native'

const stylesCurrent = StyleSheet.create({
  inputAndroid: {
    fontSize: 18,
    height: 45,
    marginTop: 5,
    paddingLeft: 15,
    marginLeft: 10,
    borderColor: 'rgb(246,246,246)',
    backgroundColor: 'rgb(246,246,246)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgb(117,131,142)',
    borderRadius: 4,
    color: '#000',
    paddingRight: 30, // to ensure the text is never behind the icon
    marginRight: 10
  },
  inputIOS: {
    fontSize: 18,
    paddingVertical: 12,
    paddingHorizontal: 10,
    color: '#000',
    paddingLeft: 20,
    marginTop: 3,
    borderBottomWidth: 1,
    borderBottomColor: 'rgb(176,176,176)'
  }
})

export default stylesCurrent
