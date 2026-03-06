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
      primary: '#7c5cfc',
      text: '#fff',
      textSecondary: '#aaa',
      border: '#333',
      error: '#ff6b6b',
      success: '#4ecdc4',
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

      const nextButton = getByText('Next');
      expect(nextButton.props.accessibilityState?.disabled || nextButton.parent?.props.accessibilityState?.disabled).toBeTruthy();
    });

    it('disables Next when name is whitespace only', () => {
      const { getByPlaceholderText, getByText } = render(
        <ProfileCreationWizard onComplete={mockOnComplete} />,
      );

      fireEvent.changeText(getByPlaceholderText(/name/i), '   ');
      const nextButton = getByText('Next');
      // Find the pressable parent
      expect(nextButton.props.accessibilityState?.disabled || nextButton.parent?.props.accessibilityState?.disabled).toBeTruthy();
    });

    it('enables Next when name has content', () => {
      const { getByPlaceholderText, getByText } = render(
        <ProfileCreationWizard onComplete={mockOnComplete} />,
      );

      fireEvent.changeText(getByPlaceholderText(/name/i), 'Alice');
      const nextButton = getByText('Next');
      // Should not be disabled
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

    it('disables Next when name exceeds 20 chars', () => {
      const { getByPlaceholderText, getByText } = render(
        <ProfileCreationWizard onComplete={mockOnComplete} />,
      );

      fireEvent.changeText(getByPlaceholderText(/name/i), 'A'.repeat(21));
      const nextButton = getByText('Next');
      expect(nextButton.props.accessibilityState?.disabled || nextButton.parent?.props.accessibilityState?.disabled).toBeTruthy();
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

    it('does not show Cancel button when onCancel not provided', () => {
      const { queryByText } = render(
        <ProfileCreationWizard onComplete={mockOnComplete} />,
      );

      expect(queryByText('Cancel')).toBeNull();
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

    it('shows ages 5-12', () => {
      const { getByPlaceholderText, getByText } = render(
        <ProfileCreationWizard onComplete={mockOnComplete} />,
      );

      goToAgeGrade(getByPlaceholderText, getByText);

      for (let age = 5; age <= 12; age++) {
        expect(getByText(String(age))).toBeTruthy();
      }
    });

    it('auto-selects grade when age is tapped', () => {
      const { getByPlaceholderText, getByText } = render(
        <ProfileCreationWizard onComplete={mockOnComplete} />,
      );

      goToAgeGrade(getByPlaceholderText, getByText);

      // Tap age 7 -> grade should auto-select to 2 (7-5=2)
      fireEvent.press(getByText('7'));

      // Grade 2 should have selected styling - verify Next is enabled
      // We check by pressing Next which should work when both are selected
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

      // Should be back on name step
      expect(getByPlaceholderText(/name/i)).toBeTruthy();
    });
  });

  describe('Step 3: Avatar', () => {
    function goToAvatar(getByPlaceholderText: any, getByText: any) {
      fireEvent.changeText(getByPlaceholderText(/name/i), 'Alice');
      fireEvent.press(getByText('Next'));
      // Select age and grade
      fireEvent.press(getByText('7'));
      fireEvent.press(getByText('Next'));
    }

    it('renders avatar grid', () => {
      const { getByPlaceholderText, getByText, getByTestId } = render(
        <ProfileCreationWizard onComplete={mockOnComplete} />,
      );

      goToAvatar(getByPlaceholderText, getByText);

      expect(getByText(/avatar/i)).toBeTruthy();
      // Should have our 3 mocked avatars
      expect(getByTestId('avatar-F')).toBeTruthy();
      expect(getByTestId('avatar-O')).toBeTruthy();
      expect(getByTestId('avatar-B')).toBeTruthy();
    });

    it('calls onComplete with null avatarId when Done pressed without selection', () => {
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
      });
    });

    it('calls onComplete with selected avatarId when avatar tapped and Done pressed', () => {
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
      });
    });

    it('Back button returns to age-grade step', () => {
      const { getByPlaceholderText, getByText } = render(
        <ProfileCreationWizard onComplete={mockOnComplete} />,
      );

      goToAvatar(getByPlaceholderText, getByText);
      fireEvent.press(getByText('Back'));

      expect(getByText(/how old/i)).toBeTruthy();
    });
  });

  describe('initialValues', () => {
    it('pre-fills name from initialValues', () => {
      const { getByDisplayValue } = render(
        <ProfileCreationWizard
          onComplete={mockOnComplete}
          initialValues={{ childName: 'Bob', childAge: 8, childGrade: 3 }}
        />,
      );

      expect(getByDisplayValue('Bob')).toBeTruthy();
    });

    it('pre-fills age and grade on age-grade step', () => {
      const { getByText, getByDisplayValue } = render(
        <ProfileCreationWizard
          onComplete={mockOnComplete}
          initialValues={{ childName: 'Bob', childAge: 8, childGrade: 3 }}
        />,
      );

      // Advance to age-grade step
      fireEvent.press(getByText('Next'));

      // Next should be enabled since age and grade are pre-filled
      const nextButton = getByText('Next');
      const disabled = nextButton.props.accessibilityState?.disabled || nextButton.parent?.props.accessibilityState?.disabled;
      expect(disabled).toBeFalsy();
    });
  });

  describe('full flow', () => {
    it('completes wizard end-to-end', () => {
      const { getByPlaceholderText, getByText, getByTestId } = render(
        <ProfileCreationWizard onComplete={mockOnComplete} />,
      );

      // Step 1: Name
      fireEvent.changeText(getByPlaceholderText(/name/i), 'Charlie');
      fireEvent.press(getByText('Next'));

      // Step 2: Age & Grade
      fireEvent.press(getByText('9'));
      fireEvent.press(getByText('Next'));

      // Step 3: Avatar
      fireEvent.press(getByTestId('avatar-B'));
      fireEvent.press(getByText('Done'));

      expect(mockOnComplete).toHaveBeenCalledWith({
        childName: 'Charlie',
        childAge: 9,
        childGrade: 4,
        avatarId: 'bear',
      });
    });
  });
});
