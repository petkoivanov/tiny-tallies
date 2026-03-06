import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

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
  });

  describe('fresh install (no children)', () => {
    it('passes Parent Setup title to PinGate', () => {
      const { getByTestId } = render(<ProfileSetupScreen />);
      const pinGate = getByTestId('pin-gate');
      expect(pinGate.props.accessibilityHint).toBe('Parent Setup');
    });

    it('does not show cancel on wizard for fresh install', () => {
      const { queryByTestId } = render(<ProfileSetupScreen />);
      expect(queryByTestId('wizard-cancel')).toBeNull();
    });

    it('calls addChild and resets to Home on complete', () => {
      const { getByTestId } = render(<ProfileSetupScreen />);
      fireEvent.press(getByTestId('wizard-complete'));

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
      // Title should be undefined (default PinGate behavior)
      expect(pinGate.props.accessibilityHint).toBeUndefined();
    });

    it('shows cancel on wizard when children exist', () => {
      const { getByTestId } = render(<ProfileSetupScreen />);
      expect(getByTestId('wizard-cancel')).toBeTruthy();
    });

    it('wizard cancel calls goBack', () => {
      const { getByTestId } = render(<ProfileSetupScreen />);
      fireEvent.press(getByTestId('wizard-cancel'));
      expect(mockGoBack).toHaveBeenCalledTimes(1);
    });
  });

  describe('migration prompt', () => {
    it('shows migration banner when _needsMigrationPrompt is true', () => {
      mockNeedsMigrationPrompt = true;
      const { getByText } = render(<ProfileSetupScreen />);
      expect(getByText(/Welcome/i)).toBeTruthy();
    });

    it('calls setMigrationComplete on wizard complete', () => {
      mockNeedsMigrationPrompt = true;
      const { getByTestId } = render(<ProfileSetupScreen />);
      fireEvent.press(getByTestId('wizard-complete'));
      expect(mockSetMigrationComplete).toHaveBeenCalledTimes(1);
    });

    it('does not call setMigrationComplete when flag is false', () => {
      mockNeedsMigrationPrompt = false;
      const { getByTestId } = render(<ProfileSetupScreen />);
      fireEvent.press(getByTestId('wizard-complete'));
      expect(mockSetMigrationComplete).not.toHaveBeenCalled();
    });
  });
});
