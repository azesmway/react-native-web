import { Redirect, usePathname } from 'expo-router'

export default function Index(props: any) {
  const pathname = usePathname()

  if (pathname === '/a') {
    return <Redirect href={'/a/146'} />
  } else {
    return <Redirect href={'/a/146'} />
  }
}
