import { Redirect, usePathname } from 'expo-router'

export default function Index(props: any) {
  const pathname = usePathname()

  if (pathname === '/y') {
    return <Redirect href={'/y/26'} />
  } else {
    return <Redirect href={'/y/26'} />
  }
}
