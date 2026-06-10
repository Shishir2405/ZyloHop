const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);
const { assetExts, sourceExts } = config.resolver;

config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve('react-native-svg-transformer'),
};
config.resolver = {
  ...config.resolver,
  assetExts: assetExts.filter(ext => ext !== 'svg').concat('lottie'),
  sourceExts: [...sourceExts, 'svg'],
  // Alias react-native-linear-gradient to expo-linear-gradient so that
  // packages like react-native-skeleton-placeholder work in Expo Go
  extraNodeModules: {
    'react-native-linear-gradient': path.resolve(
      __dirname,
      'node_modules/expo-linear-gradient',
    ),
  },
};

module.exports = config;
