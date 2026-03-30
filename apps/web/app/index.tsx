import { Redirect, usePathname } from 'expo-router'

export default function Index() {
  const pathname = usePathname()
  // @ts-ignore
  const { getAppConfig } = window.onlinetur.storage

  const urlStart = pathname === '/' ? getAppConfig().startPage : pathname

  return <Redirect href={urlStart} />
}
