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
