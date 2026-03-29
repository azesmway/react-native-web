const { getDefaultConfig } = require('expo/metro-config')
const path = require('path')

const config = getDefaultConfig(__dirname)

config.transformer.getTransformOptions = async () => ({
  transform: {
    inlineRequires: true
  }
})

config.resolver.unstable_enablePackageExports = true

config.transformer.minifierPath = 'metro-minify-esbuild'
config.transformer.minifierConfig = {
  minify: true,
  minifyWhitespace: true,
  minifyIdentifiers: true,
  minifySyntax: true,
  treeShaking: true,
  keepNames: false,
  legalComments: 'none',
  sourcemap: true, // Отключить sourcemaps в продакшене
  logLevel: 'error',
  define: {
    'process.env.NODE_ENV': '"production"'
  },
  platform: 'browser' // или 'browser' для web
}

// Custom resolver logic for platform-specific aliasing
// config.resolver.resolveRequest = (context, moduleName, platform) => {
//   if (platform === 'web' && moduleName === 'react-native-maps') {
//     return {
//       filePath: require.resolve('@teovilla/react-native-web-maps'),
//       type: 'sourceFile'
//     }
//   }
//   // Ensure you call the default resolver for all other cases
//   return context.resolveRequest(context, moduleName, platform)
// }

//
// config.serializer.getModulesRunBeforeMainModule = () => [require.resolve('react-native/Libraries/Core/InitializeCore')]

module.exports = config
