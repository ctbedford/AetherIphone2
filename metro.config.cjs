const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

/**
 * Export a function so that Expo Doctor executes the config instead of
 * importing the object directly (avoids `require is not defined` in ESM
 * sandbox). It also layers NativeWind support.
 */
module.exports = async () => {
  const config = getDefaultConfig(__dirname);
  return withNativeWind(config, { input: './global.css' });
};
