/** @type {import('tailwindcss').Config} */
import nativewindPreset from 'nativewind/preset'

module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', '../../packages-web/**/*.{js,jsx,ts,tsx}'],
  presets: [nativewindPreset],
  theme: {
    extend: {}
  },
  plugins: []
}
