import { Redirect, usePathname } from 'expo-router'

export default function Index(props: any) {
  const pathname = usePathname()

  if (pathname === '/rn') {
    return <Redirect href={'/rn/1'} />
  } else {
    return <Redirect href={'/rn/1'} />
  }
}
