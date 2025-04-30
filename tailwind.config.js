/** @type {import('tailwindcss').Config} */
// Import the Zelda theme tokens
const zelda = require('./design-system/tokens');
// Import NativeWind preset
const nativewind = require('nativewind/preset');

module.exports = {
  presets: [nativewind],
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./design-system/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'heading': ['HyliaSerif'],
        'body': ['CalamitySans'],
      },
      colors: {
        // Zelda theme colors
        'parchment': zelda.colors.parchment,
        'sheikahCyan': zelda.colors.sheikahCyan,
        'korokGreen': zelda.colors.korokGreen,
        'darkText': zelda.colors.darkText,
        'guardianOrange': zelda.colors.guardianOrange,
        'darkTealBg': zelda.colors.darkTealBg,
        'cyanGlow': zelda.colors.cyanGlow,
        
        // iOS standard colors
        // iOS system colors
        'ios-blue': '#007AFF',
        'ios-dark-blue': '#0A84FF', // dark mode variant
        'ios-red': '#FF3B30',
        'ios-dark-red': '#FF453A', // dark mode variant
        'ios-green': '#34C759',
        'ios-dark-green': '#30D158', // dark mode variant
        'ios-orange': '#FF9500',
        'ios-dark-orange': '#FF9F0A', // dark mode variant
        'ios-purple': '#AF52DE',
        'ios-dark-purple': '#BF5AF2', // dark mode variant
        'ios-yellow': '#FFCC00',
        'ios-dark-yellow': '#FFD60A', // dark mode variant
        'ios-pink': '#FF2D55',
        'ios-dark-pink': '#FF375F', // dark mode variant
        'ios-indigo': '#5856D6',
        'ios-dark-indigo': '#5E5CE6', // dark mode variant
        
        // iOS gray palette
        'ios-gray': {
          1: '#8E8E93',
          2: '#AEAEB2',
          3: '#C7C7CC',
          4: '#D1D1D6',
          5: '#E5E5EA',
          6: '#F2F2F7',
        },
        'ios-dark-gray': {
          1: '#8E8E93',
          2: '#636366',
          3: '#48484A',
          4: '#3A3A3C',
          5: '#2C2C2E',
          6: '#1C1C1E',
        },
        
        // System background colors
        'ios-system': {
          DEFAULT: '#FFFFFF',
          secondary: '#F2F2F7',
          tertiary: '#FFFFFF',
        },
        'ios-dark-system': {
          DEFAULT: '#000000',
          secondary: '#1C1C1E',
          tertiary: '#2C2C2E',
        },
      },
      
      // iOS standard spacing
      spacing: {
        // Added standard iOS spacing if needed beyond Tailwind defaults
      },
      
      // iOS standard border radius
      borderRadius: {
        'ios-small': '4px',
        'ios-regular': '8px',
        'ios-large': '12px',
        'ios-xl': '16px',
      },
      
      // iOS system font weights
      fontWeight: {
        'ios-regular': '400',
        'ios-medium': '500', 
        'ios-semibold': '600',
        'ios-bold': '700',
      },
      
      // iOS shadows
      boxShadow: {
        'ios-small': '0 1px 2px rgba(0, 0, 0, 0.05)',
        'ios-medium': '0 2px 4px rgba(0, 0, 0, 0.1)',
        'ios-large': '0 4px 6px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
}; 