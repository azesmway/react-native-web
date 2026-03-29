import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: 'src/ui.jsx',
      name: 'app-ui-web',
      formats: ['es']
    },
    rollupOptions: {
      external: ['react', 'react-native', 'expo'], // Не включать React в бандл
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
      'react-native': 'react-native-web'
    },
    extensions: ['.js', '.web.js', '.jsx', '.web.jsx', '.ts', '.web.ts', '.tsx', '.web.tsx', '.json']
  }
})
