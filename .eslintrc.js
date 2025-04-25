// https://docs.expo.dev/guides/using-eslint/
module.exports = {
  extends: 'expo',
  ignorePatterns: ['/dist/*'],
  env: {
    'react-native/react-native': true, // for React Native environment (e.g. __DEV__)
    node: true,                      // allows Node globals like process, module
    jest: true                       // if you have test files using Jest globals
  },
  globals: {
    __DEV__: 'readonly',
  },
  rules: {
    // Optional: adjust specific lint rules if needed
  }
};
