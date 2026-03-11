import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';

// Mock safe area
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

// Mock theme
jest.mock('@/theme', () => ({
  useTheme: () => ({
    colors: {
      background: '#1a1a2e',
      surface: '#2a2a3e',
      primary: '#6366f1',
      textPrimary: '#ffffff',
      textSecondary: '#aaaaaa',
      textMuted: '#777777',
      incorrect: '#ef4444',
      correct: '#22c55e',
      backgroundLight: '#333',
    },
  }),
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 },
  typography: {
    fontFamily: {
      regular: 'System',
      medium: 'System',
      semiBold: 'System',
      bold: 'System',
    },
    fontSize: { xs: 12, sm: 14, md: 16, lg: 20, xl: 24 },
  },
  layout: {
    borderRadius: { sm: 8, md: 12, lg: 16, xl: 24, round: 9999 },
    minTouchTarget: 48,
  },
}));

// Mock navigation
const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ goBack: mockGoBack }),
}));

// Mock PinGate to immediately render children
jest.mock('@/components/profile/PinGate', () => {
  const { View } = require('react-native');
  return {
    PinGate: ({ children }: any) => (
      <View testID="pin-gate">{children}</View>
    ),
  };
});

// Mock privacy storage
const mockGetSentryOptOut = jest.fn();
const mockSetSentryOptOut = jest.fn();
jest.mock('@/services/consent/privacyStorage', () => ({
  getSentryOptOut: () => mockGetSentryOptOut(),
  setSentryOptOut: (...args: unknown[]) => mockSetSentryOptOut(...args),
}));

// Mock Sentry service
const mockUpdateSentryOptOut = jest.fn();
jest.mock('@/services/sentry/sentryService', () => ({
  updateSentryOptOut: (...args: unknown[]) => mockUpdateSentryOptOut(...args),
}));

// Mock auth service
const mockSignInWithGoogle = jest.fn();
const mockSignInWithApple = jest.fn();
const mockAuthSignOut = jest.fn();
const mockIsAppleAvailable = jest.fn();
jest.mock('@/services/auth/authService', () => ({
  signInWithGoogle: () => mockSignInWithGoogle(),
  signInWithApple: () => mockSignInWithApple(),
  signOut: () => mockAuthSignOut(),
  isAppleSignInAvailable: () => mockIsAppleAvailable(),
}));

// Mock reminder service
jest.mock('@/services/reminder/reminderService', () => ({
  ReminderService: {
    requestPermissions: jest.fn().mockResolvedValue(true),
    scheduleReminder: jest.fn().mockResolvedValue(true),
    cancelReminder: jest.fn().mockResolvedValue(undefined),
    isReminderScheduled: jest.fn().mockResolvedValue(false),
  },
  REMINDER_TIME_OPTIONS: [
    { label: '5:00 PM', value: '17:00' },
    { label: '5:30 PM', value: '17:30' },
  ],
}));

// Mock API client
const mockVerifyAuth = jest.fn();
const mockDeleteUserData = jest.fn();
jest.mock('@/services/api/apiClient', () => ({
  verifyAuth: (...args: unknown[]) => mockVerifyAuth(...args),
  deleteUserData: (...args: unknown[]) => mockDeleteUserData(...args),
}));

// Mock store
const mockSetAuth = jest.fn();
const mockClearAuth = jest.fn();
const mockSetTutorConsentGranted = jest.fn();
let mockStoreState: Record<string, unknown> = {};

jest.mock('@/store/appStore', () => ({
  useAppStore: (selector: any) => selector(mockStoreState),
}));

function setMockState(overrides: Record<string, unknown> = {}) {
  mockStoreState = {
    isSignedIn: false,
    userId: null,
    userEmail: null,
    authProvider: null,
    tutorConsentGranted: true,
    setTutorConsentGranted: mockSetTutorConsentGranted,
    setAuth: mockSetAuth,
    clearAuth: mockClearAuth,
    wrongAnswerHistory: [],
    soundEnabled: true,
    setSoundEnabled: jest.fn(),
    reminderEnabled: true,
    reminderTime: '17:00',
    setReminderEnabled: jest.fn(),
    setReminderTime: jest.fn(),
    ...overrides,
  };
}

import ParentalControlsScreen from '@/screens/ParentalControlsScreen';

describe('ParentalControlsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setMockState();
    mockGetSentryOptOut.mockResolvedValue(false);
    mockIsAppleAvailable.mockResolvedValue(false);
    mockAuthSignOut.mockResolvedValue(undefined);
    mockSetSentryOptOut.mockResolvedValue(undefined);
  });

  it('renders the screen with header', async () => {
    const { findByText } = render(<ParentalControlsScreen />);
    expect(await findByText('Parental Controls')).toBeTruthy();
  });

  it('shows all three sections', async () => {
    const { findByText } = render(<ParentalControlsScreen />);
    expect(await findByText('Privacy & Data')).toBeTruthy();
    expect(await findByText('Account')).toBeTruthy();
    expect(await findByText('AI Helper')).toBeTruthy();
  });

  it('back button calls goBack', async () => {
    const { findByTestId } = render(<ParentalControlsScreen />);
    const btn = await findByTestId('back-button');
    fireEvent.press(btn);
    expect(mockGoBack).toHaveBeenCalled();
  });

  describe('Privacy & Data', () => {
    it('shows Sentry toggle', async () => {
      const { findByTestId } = render(<ParentalControlsScreen />);
      expect(await findByTestId('sentry-toggle')).toBeTruthy();
    });

    it('toggles Sentry opt-out', async () => {
      const { findByTestId } = render(<ParentalControlsScreen />);
      const toggle = await findByTestId('sentry-toggle');
      // Toggle is initially on (not opted out), clicking it should opt out
      fireEvent(toggle, 'valueChange', false);
      await waitFor(() => {
        expect(mockSetSentryOptOut).toHaveBeenCalledWith(true);
        expect(mockUpdateSentryOptOut).toHaveBeenCalledWith(true);
      });
    });
  });

  describe('Account (not signed in)', () => {
    it('shows sign-in prompt', async () => {
      const { findByText } = render(<ParentalControlsScreen />);
      expect(
        await findByText('Sign in to sync progress across devices.'),
      ).toBeTruthy();
    });

    it('shows Google sign-in button', async () => {
      const { findByTestId } = render(<ParentalControlsScreen />);
      expect(await findByTestId('google-sign-in-button')).toBeTruthy();
    });

    it('does not show sign-out or delete when not signed in', async () => {
      const { queryByTestId, findByTestId } = render(
        <ParentalControlsScreen />,
      );
      await findByTestId('google-sign-in-button');
      expect(queryByTestId('sign-out-button')).toBeNull();
      expect(queryByTestId('delete-account-button')).toBeNull();
    });
  });

  describe('Account (signed in)', () => {
    beforeEach(() => {
      setMockState({
        isSignedIn: true,
        userId: 'u-1',
        userEmail: 'test@example.com',
        authProvider: 'google',
      });
    });

    it('shows signed-in status', async () => {
      const { findByText } = render(<ParentalControlsScreen />);
      expect(
        await findByText(/Signed in with Google.*test@example.com/),
      ).toBeTruthy();
    });

    it('shows sign-out button', async () => {
      const { findByTestId } = render(<ParentalControlsScreen />);
      expect(await findByTestId('sign-out-button')).toBeTruthy();
    });

    it('shows delete account button', async () => {
      const { findByTestId } = render(<ParentalControlsScreen />);
      expect(await findByTestId('delete-account-button')).toBeTruthy();
    });

    it('sign-out clears auth', async () => {
      const { findByTestId } = render(<ParentalControlsScreen />);
      const btn = await findByTestId('sign-out-button');
      fireEvent.press(btn);
      await waitFor(() => {
        expect(mockAuthSignOut).toHaveBeenCalled();
        expect(mockClearAuth).toHaveBeenCalled();
      });
    });
  });

  describe('AI Helper', () => {
    it('shows tutor toggle', async () => {
      const { findByTestId } = render(<ParentalControlsScreen />);
      expect(await findByTestId('tutor-toggle')).toBeTruthy();
    });

    it('toggles tutor consent', async () => {
      const { findByTestId } = render(<ParentalControlsScreen />);
      const toggle = await findByTestId('tutor-toggle');
      fireEvent(toggle, 'valueChange', true);
      expect(mockSetTutorConsentGranted).toHaveBeenCalledWith(true);
    });
  });
});
