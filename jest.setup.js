// Jest setup file for Tiny Tallies — React Native / Expo

// Mock @sentry/react-native (must be before other imports)
jest.mock('@sentry/react-native', () => ({
  init: jest.fn(),
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  setUser: jest.fn(),
  setTag: jest.fn(),
  setTags: jest.fn(),
  setContext: jest.fn(),
  setExtra: jest.fn(),
  setExtras: jest.fn(),
  addBreadcrumb: jest.fn(),
  withScope: jest.fn((callback) => callback({ setExtra: jest.fn(), setTag: jest.fn() })),
  Severity: {
    Fatal: 'fatal',
    Error: 'error',
    Warning: 'warning',
    Info: 'info',
    Debug: 'debug',
  },
  wrap: (component) => component,
  ReactNavigationInstrumentation: jest.fn(),
  ReactNativeTracing: jest.fn(),
}));

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  Reanimated.useReducedMotion = jest.fn(() => false);
  return Reanimated;
});

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => ({
  GestureHandlerRootView: ({ children }) => children,
  PanGestureHandler: 'PanGestureHandler',
  TapGestureHandler: 'TapGestureHandler',
  State: {},
  Directions: {},
}));

// Mock @react-native-async-storage/async-storage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock expo-file-system
jest.mock('expo-file-system', () => ({
  documentDirectory: 'file:///mock/documents/',
  cacheDirectory: 'file:///mock/cache/',
  readAsStringAsync: jest.fn(),
  writeAsStringAsync: jest.fn(),
  deleteAsync: jest.fn(),
  getInfoAsync: jest.fn().mockResolvedValue({ exists: false }),
  makeDirectoryAsync: jest.fn(),
  EncodingType: { UTF8: 'utf8', Base64: 'base64' },
  File: jest.fn().mockImplementation((path, name) => ({
    uri: `${path}/${name}`,
    exists: false,
    write: jest.fn().mockResolvedValue(undefined),
    delete: jest.fn().mockResolvedValue(undefined),
  })),
  Paths: {
    cache: 'file:///mock/cache',
    document: 'file:///mock/documents',
  },
}));

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
  NotificationFeedbackType: {
    Success: 'success',
    Warning: 'warning',
    Error: 'error',
  },
}));

// Mock expo-secure-store
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

// Mock expo-apple-authentication
jest.mock('expo-apple-authentication', () => ({
  isAvailableAsync: jest.fn().mockResolvedValue(true),
  signInAsync: jest.fn().mockResolvedValue({
    identityToken: 'mock-apple-identity-token',
    email: 'test@example.com',
    user: 'mock-apple-user-id',
  }),
  AppleAuthenticationScope: {
    FULL_NAME: 0,
    EMAIL: 1,
  },
  AppleAuthenticationButton: () => null,
  AppleAuthenticationButtonType: {
    SIGN_IN: 0,
    CONTINUE: 1,
    SIGN_UP: 2,
  },
  AppleAuthenticationButtonStyle: {
    WHITE: 0,
    WHITE_OUTLINE: 1,
    BLACK: 2,
  },
}));

// Mock @react-native-google-signin/google-signin
jest.mock('@react-native-google-signin/google-signin', () => {
  const MockGoogleSigninButton = () => null;
  MockGoogleSigninButton.Size = { Wide: 0, Icon: 1, Standard: 2 };
  MockGoogleSigninButton.Color = { Light: 0, Dark: 1 };

  return {
    GoogleSignin: {
      configure: jest.fn(),
      hasPlayServices: jest.fn().mockResolvedValue(true),
      signIn: jest.fn().mockResolvedValue({
        data: {
          user: {
            id: 'mock-google-user-id',
            email: 'test@gmail.com',
            name: 'Test User',
          },
        },
      }),
      getTokens: jest.fn().mockResolvedValue({
        idToken: 'mock-google-id-token',
        accessToken: 'mock-google-access-token',
      }),
      signOut: jest.fn().mockResolvedValue(null),
    },
    GoogleSigninButton: MockGoogleSigninButton,
    statusCodes: {
      SIGN_IN_CANCELLED: 'SIGN_IN_CANCELLED',
      IN_PROGRESS: 'IN_PROGRESS',
      PLAY_SERVICES_NOT_AVAILABLE: 'PLAY_SERVICES_NOT_AVAILABLE',
    },
  };
});

// Mock lucide-react-native
jest.mock('lucide-react-native', () => {
  const MockIcon = () => null;
  return new Proxy({}, {
    get: () => MockIcon,
  });
});

// Mock lottie-react-native
jest.mock('lottie-react-native', () => 'LottieView');

// Mock expo-linear-gradient
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: 'LinearGradient',
}));

// Mock @react-native-community/netinfo
jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(() => jest.fn()),
  fetch: jest.fn().mockResolvedValue({
    isConnected: true,
    isInternetReachable: true,
  }),
}));

// Mock @google/genai
jest.mock('@google/genai', () => ({
  GoogleGenAI: jest.fn().mockImplementation(() => ({
    models: {
      generateContent: jest.fn().mockResolvedValue({
        text: JSON.stringify({
          problem: 'What is 3 + 4?',
          answer: 7,
          explanation: 'When you add 3 and 4, you get 7.',
        }),
      }),
    },
  })),
}));

// Mock react-native-screens
jest.mock('react-native-screens', () => ({
  enableScreens: jest.fn(),
}));

// Mock @react-navigation/native
jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({ children }) => children,
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  }),
  useRoute: () => ({
    params: {},
  }),
}));

// Mock @react-navigation/native-stack
jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: () => ({
    Navigator: ({ children }) => children,
    Screen: ({ children }) => children,
  }),
}));

// Suppress known false positive warnings
const originalWarn = console.warn;
const originalError = console.error;

const suppressedPatterns = [
  /useNativeDriver/,
  /Animated: `useNativeDriver`/,
  /React does not recognize the .* prop/,
  /Warning: Each child in a list should have a unique "key" prop/,
  /AsyncStorage has been extracted/,
  /Require cycle:/,
];

global.console = {
  ...console,
  warn: (...args) => {
    const message = args[0]?.toString() || '';
    if (suppressedPatterns.some(pattern => pattern.test(message))) {
      return;
    }
    originalWarn.apply(console, args);
  },
  error: (...args) => {
    const message = args[0]?.toString() || '';
    const errorSuppressedPatterns = [
      /Warning: ReactDOM.render is no longer supported/,
      /Warning: The current testing environment/,
    ];
    if (errorSuppressedPatterns.some(pattern => pattern.test(message))) {
      return;
    }
    originalError.apply(console, args);
  },
  debug: jest.fn(),
  info: jest.fn(),
};
