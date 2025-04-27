import '@testing-library/jest-native/extend-expect';
import { mockTamagui } from '@tamagui/core/testing';
import { StyleSheet } from 'react-native';

// Mock Tamagui for testing
mockTamagui({
  // Use Native StyleSheet for testing
  // This allows us to check styles in tests
  createStyle: (style) => StyleSheet.create({ style }).style,
});

// Mock the router from expo-router
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  },
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useNavigation: () => ({
    navigate: jest.fn(),
  }),
  useLocalSearchParams: jest.fn().mockReturnValue({}),
}));

// Mock the Ionicons component
jest.mock('@expo/vector-icons', () => {
  const { View } = require('react-native');
  return {
    Ionicons: (props) => {
      return <View testID={`icon-${props.name}`} {...props} />;
    },
  };
});

// Mock the trpc hook
jest.mock('@/utils/trpc', () => ({
  trpc: {
    useQuery: jest.fn().mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    }),
    useMutation: jest.fn().mockReturnValue({
      mutate: jest.fn(),
      isLoading: false,
    }),
    useContext: jest.fn(),
  },
}));

// Silence React Native warnings during tests
global.console = {
  ...global.console,
  warn: jest.fn(),
  error: jest.fn(),
};
