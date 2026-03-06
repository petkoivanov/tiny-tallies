import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Text } from 'react-native';

// Mock parentalPin service with controllable jest.fn() variables
const mockHasParentalPin = jest.fn();
const mockSetParentalPin = jest.fn();
const mockVerifyParentalPin = jest.fn();

jest.mock('@/services/consent/parentalPin', () => ({
  hasParentalPin: (...args: unknown[]) => mockHasParentalPin(...args),
  setParentalPin: (...args: unknown[]) => mockSetParentalPin(...args),
  verifyParentalPin: (...args: unknown[]) => mockVerifyParentalPin(...args),
}));

// Mock lucide icons
jest.mock('lucide-react-native', () => {
  const { View } = require('react-native');
  return {
    Delete: (props: any) => <View testID="delete-icon" {...props} />,
    X: (props: any) => <View testID="x-icon" {...props} />,
  };
});

import { PinGate } from '@/components/profile';

const ProtectedContent = () => <Text>Protected Content</Text>;

// Helper to enter a 4-digit PIN
function enterPin(
  getByText: (text: string) => any,
  pin: string
) {
  for (const digit of pin) {
    fireEvent.press(getByText(digit));
  }
}

describe('PinGate', () => {
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockHasParentalPin.mockResolvedValue(false);
    mockSetParentalPin.mockResolvedValue(undefined);
    mockVerifyParentalPin.mockResolvedValue(false);
  });

  describe('create flow (no PIN exists)', () => {
    beforeEach(() => {
      mockHasParentalPin.mockResolvedValue(false);
    });

    it('shows create PIN prompt when no PIN exists', async () => {
      const { findByText } = render(
        <PinGate onCancel={mockOnCancel}>
          <ProtectedContent />
        </PinGate>
      );

      expect(await findByText('Create PIN')).toBeTruthy();
    });

    it('moves to confirm step after entering 4 digits', async () => {
      const { findByText, getByText } = render(
        <PinGate onCancel={mockOnCancel}>
          <ProtectedContent />
        </PinGate>
      );

      await findByText('Create PIN');
      await act(async () => {
        enterPin(getByText, '1234');
      });

      expect(await findByText('Confirm PIN')).toBeTruthy();
    });

    it('calls setParentalPin and shows children on matching confirm', async () => {
      mockSetParentalPin.mockResolvedValue(undefined);

      const { findByText, getByText } = render(
        <PinGate onCancel={mockOnCancel}>
          <ProtectedContent />
        </PinGate>
      );

      await findByText('Create PIN');
      await act(async () => {
        enterPin(getByText, '1234');
      });
      await findByText('Confirm PIN');
      await act(async () => {
        enterPin(getByText, '1234');
      });

      expect(mockSetParentalPin).toHaveBeenCalledWith('1234');
      expect(await findByText('Protected Content')).toBeTruthy();
    });

    it('shows error and resets on PIN mismatch during confirm', async () => {
      const { findByText, getByText } = render(
        <PinGate onCancel={mockOnCancel}>
          <ProtectedContent />
        </PinGate>
      );

      await findByText('Create PIN');
      await act(async () => {
        enterPin(getByText, '1234');
      });
      await findByText('Confirm PIN');
      await act(async () => {
        enterPin(getByText, '5678');
      });

      // Should show error and go back to create
      expect(await findByText(/don't match|mismatch/i)).toBeTruthy();
    });
  });

  describe('verify flow (PIN exists)', () => {
    beforeEach(() => {
      mockHasParentalPin.mockResolvedValue(true);
    });

    it('shows enter PIN prompt when PIN exists', async () => {
      const { findByText } = render(
        <PinGate onCancel={mockOnCancel}>
          <ProtectedContent />
        </PinGate>
      );

      expect(await findByText('Enter PIN')).toBeTruthy();
    });

    it('renders children after successful verification', async () => {
      mockVerifyParentalPin.mockResolvedValue(true);

      const { findByText, getByText } = render(
        <PinGate onCancel={mockOnCancel}>
          <ProtectedContent />
        </PinGate>
      );

      await findByText('Enter PIN');
      await act(async () => {
        enterPin(getByText, '1234');
      });

      expect(mockVerifyParentalPin).toHaveBeenCalledWith('1234');
      expect(await findByText('Protected Content')).toBeTruthy();
    });

    it('shows error on wrong PIN', async () => {
      mockVerifyParentalPin.mockResolvedValue(false);

      const { findByText, getByText } = render(
        <PinGate onCancel={mockOnCancel}>
          <ProtectedContent />
        </PinGate>
      );

      await findByText('Enter PIN');
      await act(async () => {
        enterPin(getByText, '9999');
      });

      expect(await findByText(/wrong|incorrect/i)).toBeTruthy();
    });
  });

  describe('cancel', () => {
    it('calls onCancel when cancel is pressed', async () => {
      mockHasParentalPin.mockResolvedValue(true);

      const { findByText, getByText } = render(
        <PinGate onCancel={mockOnCancel}>
          <ProtectedContent />
        </PinGate>
      );

      await findByText('Enter PIN');
      fireEvent.press(getByText('Cancel'));

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });
  });
});
