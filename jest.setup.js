import '@testing-library/jest-native/extend-expect';
import { StyleSheet } from 'react-native';

// Mock tRPC procedures *before* routers are imported by tests
jest.mock('./server/src/router', () => {
  // console.log('MOCKING ./server/src/router'); // Debugging line
  const actualTrpc = jest.requireActual('./server/src/router');

  // Simple mock procedure chain structure
  const mockProcedure = {
    input: jest.fn().mockReturnThis(),
    output: jest.fn().mockReturnThis(),
    query: jest.fn((resolver) => resolver), // Pass resolver through
    mutation: jest.fn((resolver) => resolver), // Pass resolver through
    use: jest.fn().mockReturnThis(), // Mock middleware usage
  };

  return {
    ...actualTrpc, // Keep other exports (like appRouter if needed elsewhere, though unlikely in unit tests)
    router: jest.fn((definition) => definition), // Mock the router factory function
    publicProcedure: mockProcedure,
    protectedProcedure: mockProcedure,
  };
});

// No longer using global mockTamagui

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
