const { getDefaultConfig } = require('expo/metro-config');
const { wrapWithReanimatedMetroConfig } = require('react-native-reanimated/metro-config');
const path = require('path');

// Get Expo's default Metro config
const config = getDefaultConfig(__dirname, { isCSSEnabled: true });

// Add .mjs extension support
config.resolver.sourceExts.push('mjs');

// Force Metro to resolve Tamagui packages to a single path
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  'tamagui': path.resolve(__dirname, 'node_modules/tamagui'),
  '@tamagui/core': path.resolve(__dirname, 'node_modules/@tamagui/core'),
  '@tamagui/config': path.resolve(__dirname, 'node_modules/@tamagui/config'),
  '@tamagui/toast': path.resolve(__dirname, 'node_modules/@tamagui/toast')
};

// Wrap with Reanimated's config for better error handling
module.exports = wrapWithReanimatedMetroConfig(config); 