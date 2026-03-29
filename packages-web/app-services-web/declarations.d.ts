declare module '*.svg' {
  import { SvgProps } from 'react-native-svg'
  const content: React.FC<SvgProps>
  export default content
}

declare module '*.png' {
  const value: any
  export default value
}

declare module '*.jpg' {
  const value: any
  export default value
}

declare module 'app-core-web'
declare module 'app-store-web'
declare module 'app-mobile-web'
declare module 'app-utils-web'
