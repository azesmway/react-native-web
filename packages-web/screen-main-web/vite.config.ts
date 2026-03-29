import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: 'src/index.js',
      name: 'screen-main-web',
      formats: ['es']
    },
    rollupOptions: {
      external: [
        'react',
        'react-native',
        'expo',
        'expo-router',
        'app-controller-web',
        'app-core-web',
        'app-mobile-web',
        'app-services-web',
        'app-store-web',
        'app-utils-web',
        'app-header-web'
      ],
      output: {
        globals: {
          react: 'React',
          'react-native': 'ReactNative',
          expo: 'Expo'
        }
      }
    }
  },
  resolve: {
    alias: {
      'react-native': 'react-native-web',
    },
    extensions: ['.js', '.web.js', '.jsx', '.web.jsx', '.ts', '.web.ts', '.tsx', '.web.tsx', '.json']
  }
})
