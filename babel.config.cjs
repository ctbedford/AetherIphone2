module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // NativeWind/Tailwind macros for className support
      'nativewind/babel',
      // Keep Reanimated last per docs
      'react-native-reanimated/plugin',
    ],
  };
};

module.exports = function(api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel"
    ],
    plugins: [
      // Expo Router v4 is included via expo-preset, no need for expo-router/babel
      // (Expo preset also auto-includes Reanimated for SDK>=50)
      // Add any other plugins (e.g. module-resolver) if needed here
    ]
  };
};
