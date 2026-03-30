import { Redirect, usePathname } from 'expo-router'

export default function Index(props: any) {
  const pathname = usePathname()

  if (pathname === '/rr') {
    return <Redirect href={'/rr/1'} />
  } else {
    return <Redirect href={'/rr/1'} />
  }
}
