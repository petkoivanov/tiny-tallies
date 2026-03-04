import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';

// --- Mocks ---

const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    goBack: mockGoBack,
  }),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('lucide-react-native', () => {
  const { View } = require('react-native');
  return {
    Shield: (props: any) => <View testID="shield-icon" {...props} />,
    Delete: (props: any) => <View testID="delete-icon" {...props} />,
  };
});

const mockHasParentalPin = jest.fn();
const mockSetParentalPin = jest.fn();
const mockVerifyParentalPin = jest.fn();
jest.mock('@/services/consent/parentalPin', () => ({
  hasParentalPin: (...args: unknown[]) => mockHasParentalPin(...args),
  setParentalPin: (...args: unknown[]) => mockSetParentalPin(...args),
  verifyParentalPin: (...args: unknown[]) => mockVerifyParentalPin(...args),
}));

const mockSetTutorConsentGranted = jest.fn();
jest.mock('@/store/appStore', () => ({
  useAppStore: (selector: (state: Record<string, unknown>) => unknown) =>
    selector({
      setTutorConsentGranted: mockSetTutorConsentGranted,
    }),
}));

import ConsentScreen from '@/screens/ConsentScreen';

// --- Helpers ---

function pressDigits(getByText: ReturnType<typeof render>['getByText'], digits: string) {
  for (const digit of digits) {
    fireEvent.press(getByText(digit));
  }
}

// --- Tests ---

beforeEach(() => {
  jest.clearAllMocks();
  mockSetParentalPin.mockResolvedValue(undefined);
  mockVerifyParentalPin.mockResolvedValue(true);
});

describe('ConsentScreen', () => {
  describe('info content', () => {
    it('renders consent info text explaining AI tutor safeguards', async () => {
      mockHasParentalPin.mockResolvedValue(false);
      const { getByText } = render(<ConsentScreen />);
      await waitFor(() => {
        expect(getByText(/AI Helper Setup/i)).toBeTruthy();
      });
    });

    it('shows safeguard bullet points', async () => {
      mockHasParentalPin.mockResolvedValue(false);
      const { getByText } = render(<ConsentScreen />);
      await waitFor(() => {
        expect(getByText(/No personal information is shared/i)).toBeTruthy();
        expect(getByText(/age-appropriate/i)).toBeTruthy();
        expect(getByText(/buttons only/i)).toBeTruthy();
        expect(getByText(/turn this off/i)).toBeTruthy();
      });
    });
  });

  describe('PIN creation mode', () => {
    beforeEach(() => {
      mockHasParentalPin.mockResolvedValue(false);
    });

    it('shows PIN creation mode when no PIN exists', async () => {
      const { getByText } = render(<ConsentScreen />);
      await waitFor(() => {
        expect(getByText(/Create a PIN/i)).toBeTruthy();
      });
    });

    it('shows 4 dot indicators for PIN entry', async () => {
      const { getAllByTestId } = render(<ConsentScreen />);
      await waitFor(() => {
        const dots = getAllByTestId('pin-dot');
        expect(dots).toHaveLength(4);
      });
    });

    it('renders number pad with digits 0-9', async () => {
      const { getByText } = render(<ConsentScreen />);
      await waitFor(() => {
        for (let i = 0; i <= 9; i++) {
          expect(getByText(String(i))).toBeTruthy();
        }
      });
    });

    it('confirms PIN match before storing', async () => {
      const { getByText } = render(<ConsentScreen />);
      await waitFor(() => {
        expect(getByText(/Create a PIN/i)).toBeTruthy();
      });

      // Enter first PIN
      await act(async () => {
        pressDigits(getByText, '1234');
      });

      // Should advance to confirm step
      await waitFor(() => {
        expect(getByText(/Confirm your PIN/i)).toBeTruthy();
      });

      // Enter matching PIN
      await act(async () => {
        pressDigits(getByText, '1234');
      });

      await waitFor(() => {
        expect(mockSetParentalPin).toHaveBeenCalledWith('1234');
        expect(mockSetTutorConsentGranted).toHaveBeenCalledWith(true);
        expect(mockGoBack).toHaveBeenCalled();
      });
    });

    it('shows error on mismatch between enter and confirm', async () => {
      const { getByText } = render(<ConsentScreen />);
      await waitFor(() => {
        expect(getByText(/Create a PIN/i)).toBeTruthy();
      });

      // Enter first PIN
      await act(async () => {
        pressDigits(getByText, '1234');
      });

      await waitFor(() => {
        expect(getByText(/Confirm your PIN/i)).toBeTruthy();
      });

      // Enter non-matching PIN
      await act(async () => {
        pressDigits(getByText, '5678');
      });

      await waitFor(() => {
        expect(getByText(/PINs don't match/i)).toBeTruthy();
      });

      // Should NOT have called setParentalPin
      expect(mockSetParentalPin).not.toHaveBeenCalled();
    });
  });

  describe('PIN verification mode', () => {
    beforeEach(() => {
      mockHasParentalPin.mockResolvedValue(true);
    });

    it('shows PIN verification mode when PIN exists', async () => {
      const { getByText } = render(<ConsentScreen />);
      await waitFor(() => {
        expect(getByText(/Enter your PIN/i)).toBeTruthy();
      });
    });

    it('calls setTutorConsentGranted(true) on correct PIN', async () => {
      mockVerifyParentalPin.mockResolvedValue(true);
      const { getByText } = render(<ConsentScreen />);
      await waitFor(() => {
        expect(getByText(/Enter your PIN/i)).toBeTruthy();
      });

      await act(async () => {
        pressDigits(getByText, '1234');
      });

      await waitFor(() => {
        expect(mockVerifyParentalPin).toHaveBeenCalledWith('1234');
        expect(mockSetTutorConsentGranted).toHaveBeenCalledWith(true);
        expect(mockGoBack).toHaveBeenCalled();
      });
    });

    it('shows error message on wrong PIN and clears dots', async () => {
      mockVerifyParentalPin.mockResolvedValue(false);
      const { getByText } = render(<ConsentScreen />);
      await waitFor(() => {
        expect(getByText(/Enter your PIN/i)).toBeTruthy();
      });

      await act(async () => {
        pressDigits(getByText, '9999');
      });

      await waitFor(() => {
        expect(getByText(/Wrong PIN/i)).toBeTruthy();
      });

      expect(mockSetTutorConsentGranted).not.toHaveBeenCalled();
      expect(mockGoBack).not.toHaveBeenCalled();
    });

    it('navigates back after successful consent grant', async () => {
      mockVerifyParentalPin.mockResolvedValue(true);
      const { getByText } = render(<ConsentScreen />);
      await waitFor(() => {
        expect(getByText(/Enter your PIN/i)).toBeTruthy();
      });

      await act(async () => {
        pressDigits(getByText, '1234');
      });

      await waitFor(() => {
        expect(mockGoBack).toHaveBeenCalled();
      });
    });
  });
});
