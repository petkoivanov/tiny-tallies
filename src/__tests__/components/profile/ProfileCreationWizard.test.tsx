import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

// Mock lucide icons
jest.mock('lucide-react-native', () => {
  const { View } = require('react-native');
  return {
    ChevronLeft: (props: any) => <View testID="chevron-left" {...props} />,
    ChevronRight: (props: any) => <View testID="chevron-right" {...props} />,
    Check: (props: any) => <View testID="check-icon" {...props} />,
    X: (props: any) => <View testID="x-icon" {...props} />,
  };
});

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  SafeAreaView: ({ children }: any) => children,
}));

// Mock AvatarCircle
jest.mock('@/components/avatars', () => {
  const { Pressable, Text } = require('react-native');
  return {
    AvatarCircle: ({ emoji, onPress }: any) => (
      <Pressable testID={`avatar-${emoji}`} onPress={onPress}>
        <Text>{emoji}</Text>
      </Pressable>
    ),
  };
});

// Mock StateSelector
jest.mock('@/components/shared/StateSelector', () => {
  const { View, Pressable, Text } = require('react-native');
  return {
    StateSelector: ({ value, onChange }: any) => (
      <View testID="state-selector">
        <Pressable testID="state-NY" onPress={() => onChange(value === 'NY' ? null : 'NY')}>
          <Text>NY</Text>
        </Pressable>
        <Pressable testID="state-CA" onPress={() => onChange(value === 'CA' ? null : 'CA')}>
          <Text>CA</Text>
        </Pressable>
      </View>
    ),
  };
});

// Mock AVATARS constant with 3 test avatars
jest.mock('@/store/constants/avatars', () => ({
  AVATARS: [
    { id: 'fox', label: 'Fox', emoji: 'F' },
    { id: 'owl', label: 'Owl', emoji: 'O' },
    { id: 'bear', label: 'Bear', emoji: 'B' },
  ] as const,
}));

// Mock theme
jest.mock('@/theme', () => ({
  useTheme: () => ({
    colors: {
      background: '#1a1a2e',
      surface: '#16213e',
      surfaceLight: '#2a2a3e',
      primary: '#7c5cfc',
      text: '#fff',
      textPrimary: '#fff',
      textSecondary: '#aaa',
      incorrect: '#ff6b6b',
      border: '#333',
    },
  }),
}));

import { ProfileCreationWizard } from '@/components/profile';

describe('ProfileCreationWizard', () => {
  const mockOnComplete = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Step 1: Name', () => {
    it('renders name input on initial render', () => {
      const { getByPlaceholderText, getByText } = render(
        <ProfileCreationWizard onComplete={mockOnComplete} />,
      );

      expect(getByPlaceholderText(/name/i)).toBeTruthy();
      expect(getByText(/learner/i)).toBeTruthy();
    });

    it('disables Next when name is empty', () => {
      const { getByText } = render(
        <ProfileCreationWizard onComplete={mockOnComplete} />,
      );

      // The Pressable wrapping the text has disabled prop
      const nextText = getByText('Next');
      // Walk up to find the Pressable with disabled prop
      let node = nextText;
      let isDisabled = false;
      while (node.parent) {
        node = node.parent as any;
        if (node.props.disabled || node.props.accessibilityState?.disabled) {
          isDisabled = true;
          break;
        }
      }
      expect(isDisabled).toBe(true);
    });

    it('enables Next when name has content', () => {
      const { getByPlaceholderText, getByText } = render(
        <ProfileCreationWizard onComplete={mockOnComplete} />,
      );

      fireEvent.changeText(getByPlaceholderText(/name/i), 'Alice');
      const nextButton = getByText('Next');
      const disabled = nextButton.props.accessibilityState?.disabled || nextButton.parent?.props.accessibilityState?.disabled;
      expect(disabled).toBeFalsy();
    });

    it('shows character count', () => {
      const { getByPlaceholderText, getByText } = render(
        <ProfileCreationWizard onComplete={mockOnComplete} />,
      );

      fireEvent.changeText(getByPlaceholderText(/name/i), 'Alice');
      expect(getByText('5/20')).toBeTruthy();
    });

    it('shows Cancel button when onCancel provided', () => {
      const { getByText } = render(
        <ProfileCreationWizard
          onComplete={mockOnComplete}
          onCancel={mockOnCancel}
        />,
      );

      fireEvent.press(getByText('Cancel'));
      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });
  });

  describe('Step 2: Age & Grade', () => {
    function goToAgeGrade(getByPlaceholderText: any, getByText: any) {
      fireEvent.changeText(getByPlaceholderText(/name/i), 'Alice');
      fireEvent.press(getByText('Next'));
    }

    it('renders age and grade selectors after name step', () => {
      const { getByPlaceholderText, getByText } = render(
        <ProfileCreationWizard onComplete={mockOnComplete} />,
      );

      goToAgeGrade(getByPlaceholderText, getByText);

      expect(getByText(/how old/i)).toBeTruthy();
      expect(getByText(/grade/i)).toBeTruthy();
    });

    it('auto-selects grade when age is tapped', () => {
      const { getByPlaceholderText, getByText } = render(
        <ProfileCreationWizard onComplete={mockOnComplete} />,
      );

      goToAgeGrade(getByPlaceholderText, getByText);
      fireEvent.press(getByText('7'));

      const nextButton = getByText('Next');
      const disabled = nextButton.props.accessibilityState?.disabled || nextButton.parent?.props.accessibilityState?.disabled;
      expect(disabled).toBeFalsy();
    });

    it('Back button returns to name step', () => {
      const { getByPlaceholderText, getByText } = render(
        <ProfileCreationWizard onComplete={mockOnComplete} />,
      );

      goToAgeGrade(getByPlaceholderText, getByText);
      fireEvent.press(getByText('Back'));

      expect(getByPlaceholderText(/name/i)).toBeTruthy();
    });
  });

  describe('Step 3: Location', () => {
    function goToLocation(getByPlaceholderText: any, getByText: any) {
      fireEvent.changeText(getByPlaceholderText(/name/i), 'Alice');
      fireEvent.press(getByText('Next'));
      fireEvent.press(getByText('7'));
      fireEvent.press(getByText('Next'));
    }

    it('renders state selector after age-grade step', () => {
      const { getByPlaceholderText, getByText, getByTestId } = render(
        <ProfileCreationWizard onComplete={mockOnComplete} />,
      );

      goToLocation(getByPlaceholderText, getByText);

      expect(getByText(/where does/i)).toBeTruthy();
      expect(getByText(/optional/i)).toBeTruthy();
      expect(getByTestId('state-selector')).toBeTruthy();
    });

    it('shows Skip button when no state selected', () => {
      const { getByPlaceholderText, getByText } = render(
        <ProfileCreationWizard onComplete={mockOnComplete} />,
      );

      goToLocation(getByPlaceholderText, getByText);
      expect(getByText('Skip')).toBeTruthy();
    });

    it('shows Next button when state is selected', () => {
      const { getByPlaceholderText, getByText, getByTestId } = render(
        <ProfileCreationWizard onComplete={mockOnComplete} />,
      );

      goToLocation(getByPlaceholderText, getByText);
      fireEvent.press(getByTestId('state-NY'));
      expect(getByText('Next')).toBeTruthy();
    });

    it('Back button returns to age-grade step', () => {
      const { getByPlaceholderText, getByText } = render(
        <ProfileCreationWizard onComplete={mockOnComplete} />,
      );

      goToLocation(getByPlaceholderText, getByText);
      fireEvent.press(getByText('Back'));

      expect(getByText(/how old/i)).toBeTruthy();
    });
  });

  describe('Step 4: Avatar', () => {
    function goToAvatar(getByPlaceholderText: any, getByText: any) {
      fireEvent.changeText(getByPlaceholderText(/name/i), 'Alice');
      fireEvent.press(getByText('Next'));
      fireEvent.press(getByText('7'));
      fireEvent.press(getByText('Next'));
      // Skip location step
      fireEvent.press(getByText('Skip'));
    }

    it('renders avatar grid', () => {
      const { getByPlaceholderText, getByText, getByTestId } = render(
        <ProfileCreationWizard onComplete={mockOnComplete} />,
      );

      goToAvatar(getByPlaceholderText, getByText);

      expect(getByText(/avatar/i)).toBeTruthy();
      expect(getByTestId('avatar-F')).toBeTruthy();
      expect(getByTestId('avatar-O')).toBeTruthy();
      expect(getByTestId('avatar-B')).toBeTruthy();
    });

    it('calls onComplete with null avatarId and stateCode when skipped', () => {
      const { getByPlaceholderText, getByText } = render(
        <ProfileCreationWizard onComplete={mockOnComplete} />,
      );

      goToAvatar(getByPlaceholderText, getByText);
      fireEvent.press(getByText('Done'));

      expect(mockOnComplete).toHaveBeenCalledWith({
        childName: 'Alice',
        childAge: 7,
        childGrade: 2,
        avatarId: null,
        stateCode: null,
      });
    });

    it('calls onComplete with selected avatarId', () => {
      const { getByPlaceholderText, getByText, getByTestId } = render(
        <ProfileCreationWizard onComplete={mockOnComplete} />,
      );

      goToAvatar(getByPlaceholderText, getByText);
      fireEvent.press(getByTestId('avatar-O'));
      fireEvent.press(getByText('Done'));

      expect(mockOnComplete).toHaveBeenCalledWith({
        childName: 'Alice',
        childAge: 7,
        childGrade: 2,
        avatarId: 'owl',
        stateCode: null,
      });
    });

    it('Back button returns to location step', () => {
      const { getByPlaceholderText, getByText } = render(
        <ProfileCreationWizard onComplete={mockOnComplete} />,
      );

      goToAvatar(getByPlaceholderText, getByText);
      fireEvent.press(getByText('Back'));

      expect(getByText(/where does/i)).toBeTruthy();
    });
  });

  describe('full flow', () => {
    it('completes wizard end-to-end without state selection', () => {
      const { getByPlaceholderText, getByText, getByTestId } = render(
        <ProfileCreationWizard onComplete={mockOnComplete} />,
      );

      fireEvent.changeText(getByPlaceholderText(/name/i), 'Charlie');
      fireEvent.press(getByText('Next'));
      fireEvent.press(getByText('9'));
      fireEvent.press(getByText('Next'));
      fireEvent.press(getByText('Skip'));
      fireEvent.press(getByTestId('avatar-B'));
      fireEvent.press(getByText('Done'));

      expect(mockOnComplete).toHaveBeenCalledWith({
        childName: 'Charlie',
        childAge: 9,
        childGrade: 4,
        avatarId: 'bear',
        stateCode: null,
      });
    });

    it('completes wizard end-to-end with state selection', () => {
      const { getByPlaceholderText, getByText, getByTestId } = render(
        <ProfileCreationWizard onComplete={mockOnComplete} />,
      );

      fireEvent.changeText(getByPlaceholderText(/name/i), 'Charlie');
      fireEvent.press(getByText('Next'));
      fireEvent.press(getByText('9'));
      fireEvent.press(getByText('Next'));
      fireEvent.press(getByTestId('state-NY'));
      fireEvent.press(getByText('Next'));
      fireEvent.press(getByTestId('avatar-B'));
      fireEvent.press(getByText('Done'));

      expect(mockOnComplete).toHaveBeenCalledWith({
        childName: 'Charlie',
        childAge: 9,
        childGrade: 4,
        avatarId: 'bear',
        stateCode: 'NY',
      });
    });
  });
});
