module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Inline env variables for Tamagui
      [
        'transform-inline-environment-variables',
        {
          include: ['TAMAGUI_TARGET'],
        },
      ],
      
      // Tamagui plugin for optimized compilation
      [
        '@tamagui/babel-plugin',
        {
          components: ['tamagui'],
          config: './tamagui.config.ts',
          logTimings: true,
          disableExtraction: process.env.NODE_ENV === 'development',
        },
      ],
      
      // NativeWind plugin for Tailwind CSS support
      'nativewind/babel',
      
      // Reanimated plugin must be last
      'react-native-reanimated/plugin',
    ],
  };
}; 