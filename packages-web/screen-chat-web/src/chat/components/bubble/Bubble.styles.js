import { Dimensions, StyleSheet } from 'react-native'

const { width } = Dimensions.get('window')

// Extract static styles outside component
const createStyles = isMobile => ({
  left: StyleSheet.create({
    container: {
      alignItems: 'flex-start',
      marginLeft: isMobile ? 0 : 5,
      backgroundColor: '#fbfbfb'
    },
    wrapper: {
      maxWidth: isMobile ? width - 50 : width / 3,
      minWidth: isMobile ? width / 1.4 : width / 7,
      minHeight: 20,
      justifyContent: 'flex-end',
      borderBottomEndRadius: 20,
      borderTopRightRadius: 20,
      borderTopLeftRadius: 20,
      borderColor: '#ccc',
      backgroundColor: '#fbfbfb'
      // borderWidth: 1
    },
    wrapperImage: {
      maxWidth: isMobile ? width : width / 3,
      minHeight: 20,
      justifyContent: 'flex-end',
      borderBottomEndRadius: 20,
      borderTopRightRadius: 20,
      borderTopLeftRadius: 20,
      borderColor: '#ccc',
      backgroundColor: '#fbfbfb',
      // borderWidth: 1,
      paddingBottom: 3
    },
    containerToNext: {
      borderBottomLeftRadius: 0
    },
    containerToPrevious: {
      borderTopLeftRadius: 0
    },
    bottom: {
      flexDirection: 'row',
      justifyContent: 'flex-start'
    }
  }),
  right: StyleSheet.create({
    container: {
      alignItems: 'flex-end',
      marginRight: isMobile ? 0 : 5
    },
    wrapper: {
      maxWidth: isMobile ? width - 50 : width / 3,
      minWidth: isMobile ? width / 1.4 : width / 7,
      backgroundColor: 'rgb(230,254,204)',
      minHeight: 20,
      justifyContent: 'flex-end',
      borderBottomEndRadius: 20,
      borderTopRightRadius: 20,
      borderTopLeftRadius: 20,
      borderColor: '#ccc',
      marginRight: 5
      // borderWidth: 1
    },
    wrapperImage: {
      maxWidth: isMobile ? width : width / 3,
      backgroundColor: 'rgb(230,254,204)',
      minHeight: 20,
      justifyContent: 'flex-end',
      borderBottomEndRadius: 20,
      borderTopRightRadius: 20,
      borderTopLeftRadius: 20,
      borderColor: '#ccc',
      marginRight: 5,
      paddingBottom: 3
      // borderWidth: 1
    },
    containerToNext: {
      borderBottomRightRadius: 0
    },
    containerToPrevious: {
      borderTopRightRadius: 0
    },
    bottom: {
      flexDirection: 'row',
      justifyContent: 'flex-end'
    }
  }),
  content: StyleSheet.create({
    tick: {
      fontSize: 10,
      backgroundColor: 'transparent',
      color: '#fff'
    },
    tickView: {
      flexDirection: 'row',
      marginRight: 10
    },
    username: {
      fontSize: 14,
      backgroundColor: 'transparent',
      fontWeight: 'bold',
      color: 'rgb(17,73,91)',
      flex: 3
    },
    usernameView: {
      flexDirection: 'row',
      marginHorizontal: 10,
      marginTop: 10,
      marginBottom: 10
    },
    avatarContainer: {
      borderColor: '#c9c9c9',
      backgroundColor: 'transparent',
      borderWidth: 1,
      margin: 0,
      padding: 0
    },
    iconContainer: {
      width: 24,
      height: 24
    }
  }),
  slackImage: {
    borderRadius: 3,
    marginLeft: 0,
    marginRight: 0
  },
  colorLeft: {
    backgroundColor: '#fff'
  },
  colorRight: {
    backgroundColor: '#f7fff0'
  },
  colorBG: {
    backgroundColor: '#f6f6f6'
  },
  colorWarning: {
    backgroundColor: '#fee6d3'
  },
  colorBGT: {
    backgroundColor: '#fff'
  },
  reactionsContainer: {
    flexDirection: 'row',
    marginTop: 4,
    marginLeft: 5,
    // paddingBottom: 10,
    gap: 4,
    maxWidth: '100%',
    flexWrap: 'wrap'
  },
  currentUserReactions: {
    justifyContent: 'flex-end'
  },
  otherUserReactions: {
    justifyContent: 'flex-start'
  },
  reactionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgb(235, 242, 249)',
    borderRadius: 12,
    paddingHorizontal: 6,
    // paddingVertical: 2,
    gap: 2
    // borderWidth: 1,
    // borderColor: '#E5E5EA'
  },
  reactionBadgeActive: {
    backgroundColor: '#EFFDDE',
    borderColor: '#40A7E3'
  },
  reactionEmoji: {
    fontSize: 12
  },
  reactionCount: {
    fontSize: 11,
    color: '#8E8E93',
    fontWeight: '500'
  }
})

export default createStyles
