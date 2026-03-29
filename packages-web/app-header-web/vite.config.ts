import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: 'src/index.jsx',
      name: 'app-header-web',
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
        'app-utils-web'
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
      'react-native': 'react-native-web' // Для Web
    },
    extensions: ['.js', '.web.js', '.jsx', '.web.jsx', '.ts', '.web.ts', '.tsx', '.web.tsx', '.json']
  }
})
