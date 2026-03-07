import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';

// Mock navigation
const mockReset = jest.fn();
const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    reset: mockReset,
    goBack: mockGoBack,
  }),
}));

// Mock PinGate to immediately render children
jest.mock('@/components/profile/PinGate', () => {
  const { View } = require('react-native');
  return {
    PinGate: ({ children, title, subtitle }: any) => (
      <View testID="pin-gate" accessibilityHint={title}>
        {children}
      </View>
    ),
  };
});

// Mock PrivacyDisclosure
jest.mock('@/components/profile/PrivacyDisclosure', () => {
  const { Pressable, Text } = require('react-native');
  return {
    PrivacyDisclosure: ({ onAccept }: any) => (
      <Pressable testID="privacy-disclosure" onPress={onAccept}>
        <Text>Privacy Disclosure</Text>
      </Pressable>
    ),
  };
});

// Mock ProfileCreationWizard as a button that calls onComplete
jest.mock('@/components/profile/ProfileCreationWizard', () => {
  const { Pressable, Text } = require('react-native');
  return {
    ProfileCreationWizard: ({ onComplete, onCancel }: any) => (
      <>
        <Pressable
          testID="wizard-complete"
          onPress={() =>
            onComplete({
              childName: 'TestChild',
              childAge: 7,
              childGrade: 2,
              avatarId: 'fox',
            })
          }
        >
          <Text>Complete Wizard</Text>
        </Pressable>
        {onCancel && (
          <Pressable testID="wizard-cancel" onPress={onCancel}>
            <Text>Cancel Wizard</Text>
          </Pressable>
        )}
      </>
    ),
  };
});

// Mock privacy storage
const mockHasPrivacyAcknowledged = jest.fn();
const mockSetPrivacyAcknowledged = jest.fn();
jest.mock('@/services/consent/privacyStorage', () => ({
  hasPrivacyAcknowledged: (...args: unknown[]) =>
    mockHasPrivacyAcknowledged(...args),
  setPrivacyAcknowledged: (...args: unknown[]) =>
    mockSetPrivacyAcknowledged(...args),
}));

// Mock store
const mockAddChild = jest.fn().mockReturnValue('child-1');
const mockSetMigrationComplete = jest.fn();
let mockChildren: Record<string, any> = {};
let mockNeedsMigrationPrompt = false;

jest.mock('@/store/appStore', () => ({
  useAppStore: (selector: any) => {
    const state = {
      children: mockChildren,
      addChild: mockAddChild,
      _needsMigrationPrompt: mockNeedsMigrationPrompt,
      setMigrationComplete: mockSetMigrationComplete,
    };
    return selector(state);
  },
}));

import ProfileSetupScreen from '@/screens/ProfileSetupScreen';

describe('ProfileSetupScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockChildren = {};
    mockNeedsMigrationPrompt = false;
    mockHasPrivacyAcknowledged.mockResolvedValue(true);
    mockSetPrivacyAcknowledged.mockResolvedValue(undefined);
  });

  describe('fresh install (no children)', () => {
    it('passes Parent Setup title to PinGate', async () => {
      const { getByTestId } = render(<ProfileSetupScreen />);
      const pinGate = getByTestId('pin-gate');
      expect(pinGate.props.accessibilityHint).toBe('Parent Setup');
    });

    it('shows privacy disclosure when not yet acknowledged', async () => {
      mockHasPrivacyAcknowledged.mockResolvedValue(false);
      const { findByTestId, queryByTestId } = render(<ProfileSetupScreen />);
      expect(await findByTestId('privacy-disclosure')).toBeTruthy();
      expect(queryByTestId('wizard-complete')).toBeNull();
    });

    it('shows wizard after accepting disclosure', async () => {
      mockHasPrivacyAcknowledged.mockResolvedValue(false);
      const { findByTestId } = render(<ProfileSetupScreen />);
      const disclosure = await findByTestId('privacy-disclosure');
      fireEvent.press(disclosure);
      expect(mockSetPrivacyAcknowledged).toHaveBeenCalled();
      expect(await findByTestId('wizard-complete')).toBeTruthy();
    });

    it('skips disclosure when already acknowledged', async () => {
      mockHasPrivacyAcknowledged.mockResolvedValue(true);
      const { findByTestId, queryByTestId } = render(<ProfileSetupScreen />);
      expect(await findByTestId('wizard-complete')).toBeTruthy();
      expect(queryByTestId('privacy-disclosure')).toBeNull();
    });

    it('does not show cancel on wizard for fresh install', async () => {
      const { findByTestId, queryByTestId } = render(<ProfileSetupScreen />);
      await findByTestId('wizard-complete');
      expect(queryByTestId('wizard-cancel')).toBeNull();
    });

    it('calls addChild and resets to Home on complete', async () => {
      const { findByTestId } = render(<ProfileSetupScreen />);
      const btn = await findByTestId('wizard-complete');
      fireEvent.press(btn);

      expect(mockAddChild).toHaveBeenCalledWith({
        childName: 'TestChild',
        childAge: 7,
        childGrade: 2,
        avatarId: 'fox',
      });
      expect(mockReset).toHaveBeenCalledWith({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    });
  });

  describe('add another child (children exist)', () => {
    beforeEach(() => {
      mockChildren = {
        'existing-1': { childName: 'Alice', childAge: 8, childGrade: 3 },
      };
    });

    it('does not pass custom title to PinGate when children exist', () => {
      const { getByTestId } = render(<ProfileSetupScreen />);
      const pinGate = getByTestId('pin-gate');
      expect(pinGate.props.accessibilityHint).toBeUndefined();
    });

    it('skips disclosure for additional children', async () => {
      const { findByTestId, queryByTestId } = render(<ProfileSetupScreen />);
      expect(await findByTestId('wizard-complete')).toBeTruthy();
      expect(queryByTestId('privacy-disclosure')).toBeNull();
    });

    it('shows cancel on wizard when children exist', async () => {
      const { findByTestId } = render(<ProfileSetupScreen />);
      expect(await findByTestId('wizard-cancel')).toBeTruthy();
    });

    it('wizard cancel calls goBack', async () => {
      const { findByTestId } = render(<ProfileSetupScreen />);
      const btn = await findByTestId('wizard-cancel');
      fireEvent.press(btn);
      expect(mockGoBack).toHaveBeenCalledTimes(1);
    });
  });

  describe('migration prompt', () => {
    it('shows migration banner when _needsMigrationPrompt is true', async () => {
      mockNeedsMigrationPrompt = true;
      const { findByText } = render(<ProfileSetupScreen />);
      expect(await findByText(/Welcome/i)).toBeTruthy();
    });

    it('calls setMigrationComplete on wizard complete', async () => {
      mockNeedsMigrationPrompt = true;
      const { findByTestId } = render(<ProfileSetupScreen />);
      const btn = await findByTestId('wizard-complete');
      fireEvent.press(btn);
      expect(mockSetMigrationComplete).toHaveBeenCalledTimes(1);
    });

    it('does not call setMigrationComplete when flag is false', async () => {
      mockNeedsMigrationPrompt = false;
      const { findByTestId } = render(<ProfileSetupScreen />);
      const btn = await findByTestId('wizard-complete');
      fireEvent.press(btn);
      expect(mockSetMigrationComplete).not.toHaveBeenCalled();
    });
  });
});
