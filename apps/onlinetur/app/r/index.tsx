import { Redirect, usePathname } from 'expo-router'

export default function Index(props: any) {
  const pathname = usePathname()

  if (pathname === '/r') {
    return <Redirect href={'/r/1'} />
  } else {
    return <Redirect href={'/r/1'} />
  }
}
