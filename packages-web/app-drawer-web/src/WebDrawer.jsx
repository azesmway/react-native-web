import { useCallback, useEffect, useMemo, useState } from 'react'
import { Platform, View } from 'react-native'

import LeftMenu from './menu'

const GLOBAL_OBJ = Platform.OS === 'web' ? window : global
const { MAIN_COLOR } = GLOBAL_OBJ.onlinetur.constants

export default function WebDrawer(props) {
  const { setDrawer, openDrawer, children } = props
  const { Drawer, isMobile, Svg, Path } = props.utils

  // const handleOpenDrawer = useCallback(() => {
  //   setDrawer(!openDrawer)
  // }, [setDrawer, openDrawer])
  //
  // const toggleDrawer = useCallback(
  //   (anchor, open) => event => {
  //     if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
  //       return
  //     }
  //
  //     setDrawer(open)
  //   },
  //   [setDrawer]
  // )
  //
  // const handleCloseDrawer = useMemo(() => toggleDrawer('left', false), [toggleDrawer])

  // useEffect(() => {
  //   setDrawer(false)
  // }, [])

  // return (
  //   <View style={{ justifyContent: 'center' }}>
  //     {/*<TouchableOpacity onPress={handleOpenDrawer} style={{ marginLeft: 0 }}>*/}
  //     {/*  <MenuIcon iconSize={iconSize} />*/}
  //     {/*</TouchableOpacity>*/}
  //     {/*<DrawerContent />*/}
  //     <Drawer open={openDrawer} onOpen={() => {}} onClose={() => setDrawer(false)} renderDrawerContent={() => <LeftMenu />}>
  //       <>{children}</>
  //     </Drawer>
  //   </View>
  // )

  return (
    <Drawer
      open={openDrawer}
      onOpen={() => {}}
      onClose={() => setDrawer(false)}
      renderDrawerContent={() => <LeftMenu />}
      drawerType={'front'}
      drawerStyle={{ backgroundColor: '#fff', width: isMobile ? 260 : 300 }}>
      {children}
    </Drawer>
  )
}
