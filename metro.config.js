const { getDefaultConfig } = require('expo/metro-config');
const { wrapWithReanimatedMetroConfig } = require('react-native-reanimated/metro-config');

// Get Expo's default Metro config
const config = getDefaultConfig(__dirname, { isCSSEnabled: true });

// Add .mjs extension support
config.resolver.sourceExts.push('mjs');

// Wrap with Reanimated's config for better error handling
module.exports = wrapWithReanimatedMetroConfig(config); 