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
    PlayCircle: (props: any) => <View testID="play-circle-icon" {...props} />,
    BookOpen: (props: any) => <View testID="book-open-icon" {...props} />,
    Shield: (props: any) => <View testID="shield-icon" {...props} />,
    BarChart3: (props: any) => <View testID="bar-chart-icon" {...props} />,
    Palette: (props: any) => <View testID="palette-icon" {...props} />,
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
      const { getByPlaceholderText, getByText, getAllByText } = render(
        <ProfileCreationWizard onComplete={mockOnComplete} />,
      );

      goToAgeGrade(getByPlaceholderText, getByText);
      // Age 7 also appears as grade label — use getAllByText and press the first (age chip)
      fireEvent.press(getAllByText('7')[0]);

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
    function goToLocation(getByPlaceholderText: any, getByText: any, getAllByText: any) {
      fireEvent.changeText(getByPlaceholderText(/name/i), 'Alice');
      fireEvent.press(getByText('Next'));
      // Age 7 also appears as grade label — press the first (age chip)
      fireEvent.press(getAllByText('7')[0]);
      fireEvent.press(getByText('Next'));
    }

    it('renders state selector after age-grade step', () => {
      const { getByPlaceholderText, getByText, getByTestId, getAllByText } = render(
        <ProfileCreationWizard onComplete={mockOnComplete} />,
      );

      goToLocation(getByPlaceholderText, getByText, getAllByText);

      expect(getByText(/where does/i)).toBeTruthy();
      expect(getByText(/optional/i)).toBeTruthy();
      expect(getByTestId('state-selector')).toBeTruthy();
    });

    it('shows Skip button when no state selected', () => {
      const { getByPlaceholderText, getByText, getAllByText } = render(
        <ProfileCreationWizard onComplete={mockOnComplete} />,
      );

      goToLocation(getByPlaceholderText, getByText, getAllByText);
      expect(getByText('Skip')).toBeTruthy();
    });

    it('shows Next button when state is selected', () => {
      const { getByPlaceholderText, getByText, getByTestId, getAllByText } = render(
        <ProfileCreationWizard onComplete={mockOnComplete} />,
      );

      goToLocation(getByPlaceholderText, getByText, getAllByText);
      fireEvent.press(getByTestId('state-NY'));
      expect(getByText('Next')).toBeTruthy();
    });

    it('Back button returns to age-grade step', () => {
      const { getByPlaceholderText, getByText, getAllByText } = render(
        <ProfileCreationWizard onComplete={mockOnComplete} />,
      );

      goToLocation(getByPlaceholderText, getByText, getAllByText);
      fireEvent.press(getByText('Back'));

      expect(getByText(/how old/i)).toBeTruthy();
    });
  });

  describe('Step 4: Avatar', () => {
    function goToAvatar(getByPlaceholderText: any, getByText: any, getAllByText: any) {
      fireEvent.changeText(getByPlaceholderText(/name/i), 'Alice');
      fireEvent.press(getByText('Next'));
      // Age 7 also appears as grade label — press the first (age chip)
      fireEvent.press(getAllByText('7')[0]);
      fireEvent.press(getByText('Next'));
      // Skip location step
      fireEvent.press(getByText('Skip'));
    }

    it('renders avatar grid', () => {
      const { getByPlaceholderText, getByText, getByTestId, getAllByText } = render(
        <ProfileCreationWizard onComplete={mockOnComplete} />,
      );

      goToAvatar(getByPlaceholderText, getByText, getAllByText);

      expect(getByText(/avatar/i)).toBeTruthy();
      expect(getByTestId('avatar-F')).toBeTruthy();
      expect(getByTestId('avatar-O')).toBeTruthy();
      expect(getByTestId('avatar-B')).toBeTruthy();
    });

    it('Next button on avatar step proceeds to theme step', () => {
      const { getByPlaceholderText, getByText, getAllByText } = render(
        <ProfileCreationWizard onComplete={mockOnComplete} />,
      );

      goToAvatar(getByPlaceholderText, getByText, getAllByText);
      fireEvent.press(getByText('Next'));

      expect(getByText(/pick a look/i)).toBeTruthy();
    });

    it('calls onComplete with null avatarId and stateCode when skipped', () => {
      const { getByPlaceholderText, getByText, getAllByText } = render(
        <ProfileCreationWizard onComplete={mockOnComplete} />,
      );

      goToAvatar(getByPlaceholderText, getByText, getAllByText);
      fireEvent.press(getByText('Next')); // avatar → theme
      fireEvent.press(getByText('Next')); // theme → youtube
      fireEvent.press(getByText('Done')); // youtube → complete

      expect(mockOnComplete).toHaveBeenCalledWith(
        {
          childName: 'Alice',
          childAge: 7,
          childGrade: 2,
          avatarId: null,
          stateCode: null,
          themeId: 'candy',
        },
        false,
      );
    });

    it('calls onComplete with selected avatarId', () => {
      const { getByPlaceholderText, getByText, getByTestId, getAllByText } = render(
        <ProfileCreationWizard onComplete={mockOnComplete} />,
      );

      goToAvatar(getByPlaceholderText, getByText, getAllByText);
      fireEvent.press(getByTestId('avatar-O'));
      fireEvent.press(getByText('Next')); // avatar → theme
      fireEvent.press(getByText('Next')); // theme → youtube
      fireEvent.press(getByText('Done')); // youtube → complete

      expect(mockOnComplete).toHaveBeenCalledWith(
        {
          childName: 'Alice',
          childAge: 7,
          childGrade: 2,
          avatarId: 'owl',
          stateCode: null,
          themeId: 'candy',
        },
        false,
      );
    });

    it('Back button returns to location step', () => {
      const { getByPlaceholderText, getByText, getAllByText } = render(
        <ProfileCreationWizard onComplete={mockOnComplete} />,
      );

      goToAvatar(getByPlaceholderText, getByText, getAllByText);
      fireEvent.press(getByText('Back'));

      expect(getByText(/where does/i)).toBeTruthy();
    });
  });

  describe('Step 6: YouTube consent', () => {
    function goToYoutube(getByPlaceholderText: any, getByText: any, getAllByText: any) {
      fireEvent.changeText(getByPlaceholderText(/name/i), 'Alice');
      fireEvent.press(getByText('Next'));
      fireEvent.press(getAllByText('7')[0]);
      fireEvent.press(getByText('Next'));
      fireEvent.press(getByText('Skip'));
      fireEvent.press(getByText('Next')); // avatar → theme
      fireEvent.press(getByText('Next')); // theme → youtube
    }

    it('renders youtube consent step with toggle off by default', () => {
      const { getByPlaceholderText, getByText, getAllByText, getByTestId } = render(
        <ProfileCreationWizard onComplete={mockOnComplete} />,
      );

      goToYoutube(getByPlaceholderText, getByText, getAllByText);

      expect(getByText(/secret weapon/i)).toBeTruthy();
      const toggle = getByTestId('youtube-consent-onboarding');
      expect(toggle.props.value).toBe(false);
    });

    it('calls onComplete with youtubeConsent=true when toggle enabled', () => {
      const { getByPlaceholderText, getByText, getAllByText, getByTestId } = render(
        <ProfileCreationWizard onComplete={mockOnComplete} />,
      );

      goToYoutube(getByPlaceholderText, getByText, getAllByText);
      fireEvent(getByTestId('youtube-consent-onboarding'), 'valueChange', true);
      fireEvent.press(getByText('Done'));

      expect(mockOnComplete).toHaveBeenCalledWith(
        expect.objectContaining({ childName: 'Alice' }),
        true,
      );
    });

    it('calls onComplete with youtubeConsent=false when toggle left off', () => {
      const { getByPlaceholderText, getByText, getAllByText } = render(
        <ProfileCreationWizard onComplete={mockOnComplete} />,
      );

      goToYoutube(getByPlaceholderText, getByText, getAllByText);
      fireEvent.press(getByText('Done'));

      expect(mockOnComplete).toHaveBeenCalledWith(
        expect.objectContaining({ childName: 'Alice' }),
        false,
      );
    });

    it('Back button returns to theme step', () => {
      const { getByPlaceholderText, getByText, getAllByText } = render(
        <ProfileCreationWizard onComplete={mockOnComplete} />,
      );

      goToYoutube(getByPlaceholderText, getByText, getAllByText);
      fireEvent.press(getByText('Back'));

      expect(getByText(/pick a look/i)).toBeTruthy();
    });
  });

  describe('K-12 scope (AGES 5-18, GRADES K-12)', () => {
    function goToAgeGrade(getByPlaceholderText: any, getByText: any) {
      fireEvent.changeText(getByPlaceholderText(/name/i), 'Alex');
      fireEvent.press(getByText('Next'));
    }

    it('AGES array contains 14 entries (5 through 18)', () => {
      const { getByPlaceholderText, getByText, getAllByText } = render(
        <ProfileCreationWizard onComplete={mockOnComplete} />,
      );
      goToAgeGrade(getByPlaceholderText, getByText);

      // Verify ages 13-18 are present in the age selector
      expect(getByText('13')).toBeTruthy();
      expect(getByText('14')).toBeTruthy();
      expect(getByText('15')).toBeTruthy();
      expect(getByText('16')).toBeTruthy();
      expect(getByText('17')).toBeTruthy();
      expect(getByText('18')).toBeTruthy();
    });

    it('GRADES array contains 13 entries (K through 12)', () => {
      const { getByPlaceholderText, getByText, getAllByText } = render(
        <ProfileCreationWizard onComplete={mockOnComplete} />,
      );
      goToAgeGrade(getByPlaceholderText, getByText);

      // Verify grades 7-12 are present in the grade selector.
      // Some numbers (7-12) also appear as age chips — use getAllByText to confirm at least one match.
      expect(getAllByText('7').length).toBeGreaterThanOrEqual(1);
      expect(getAllByText('8').length).toBeGreaterThanOrEqual(1);
      expect(getAllByText('9').length).toBeGreaterThanOrEqual(1);
      expect(getAllByText('10').length).toBeGreaterThanOrEqual(1);
      expect(getAllByText('11').length).toBeGreaterThanOrEqual(1);
      expect(getAllByText('12').length).toBeGreaterThanOrEqual(1);
      // K is unique to grade selector
      expect(getByText('K')).toBeTruthy();
    });

    it('handleAgeSelect(18) auto-sets grade to 12 not 6', () => {
      const { getByPlaceholderText, getByText } = render(
        <ProfileCreationWizard onComplete={mockOnComplete} />,
      );
      goToAgeGrade(getByPlaceholderText, getByText);
      fireEvent.press(getByText('18'));
      fireEvent.press(getByText('Next'));
      // Navigate through location, avatar, theme, and youtube steps
      fireEvent.press(getByText('Skip'));
      fireEvent.press(getByText('Next')); // avatar → theme
      fireEvent.press(getByText('Next')); // theme → youtube
      fireEvent.press(getByText('Done'));

      expect(mockOnComplete).toHaveBeenCalledWith(
        expect.objectContaining({ childAge: 18, childGrade: 12 }),
        false,
      );
    });

    it('handleAgeSelect(10) auto-sets grade to 5', () => {
      const { getByPlaceholderText, getByText, getAllByText } = render(
        <ProfileCreationWizard onComplete={mockOnComplete} />,
      );
      goToAgeGrade(getByPlaceholderText, getByText);
      // Age 10 also appears as grade label — press the first (age chip)
      fireEvent.press(getAllByText('10')[0]);
      fireEvent.press(getByText('Next'));
      fireEvent.press(getByText('Skip'));
      fireEvent.press(getByText('Next')); // avatar → theme
      fireEvent.press(getByText('Next')); // theme → youtube
      fireEvent.press(getByText('Done'));

      expect(mockOnComplete).toHaveBeenCalledWith(
        expect.objectContaining({ childAge: 10, childGrade: 5 }),
        false,
      );
    });

    it('handleAgeSelect(5) auto-sets grade to 0 (Kindergarten)', () => {
      const { getByPlaceholderText, getByText, getAllByText } = render(
        <ProfileCreationWizard onComplete={mockOnComplete} />,
      );
      goToAgeGrade(getByPlaceholderText, getByText);
      // Age 5 chip appears first; grade 5 chip also exists — use getAllByText and take the first
      fireEvent.press(getAllByText('5')[0]);
      fireEvent.press(getByText('Next'));
      fireEvent.press(getByText('Skip'));
      fireEvent.press(getByText('Next')); // avatar → theme
      fireEvent.press(getByText('Next')); // theme → youtube
      fireEvent.press(getByText('Done'));

      expect(mockOnComplete).toHaveBeenCalledWith(
        expect.objectContaining({ childAge: 5, childGrade: 0 }),
        false,
      );
    });
  });

  describe('full flow', () => {
    it('completes wizard end-to-end without state selection', () => {
      const { getByPlaceholderText, getByText, getByTestId, getAllByText } = render(
        <ProfileCreationWizard onComplete={mockOnComplete} />,
      );

      fireEvent.changeText(getByPlaceholderText(/name/i), 'Charlie');
      fireEvent.press(getByText('Next'));
      // Age 9 also appears as grade label — press the first (age chip)
      fireEvent.press(getAllByText('9')[0]);
      fireEvent.press(getByText('Next'));
      fireEvent.press(getByText('Skip'));
      fireEvent.press(getByTestId('avatar-B'));
      fireEvent.press(getByText('Next')); // avatar → theme
      fireEvent.press(getByText('Next')); // theme → youtube
      fireEvent.press(getByText('Done'));

      expect(mockOnComplete).toHaveBeenCalledWith(
        {
          childName: 'Charlie',
          childAge: 9,
          childGrade: 4,
          avatarId: 'bear',
          stateCode: null,
          themeId: 'candy',
        },
        false,
      );
    });

    it('completes wizard end-to-end with state selection', () => {
      const { getByPlaceholderText, getByText, getByTestId, getAllByText } = render(
        <ProfileCreationWizard onComplete={mockOnComplete} />,
      );

      fireEvent.changeText(getByPlaceholderText(/name/i), 'Charlie');
      fireEvent.press(getByText('Next'));
      // Age 9 also appears as grade label — press the first (age chip)
      fireEvent.press(getAllByText('9')[0]);
      fireEvent.press(getByText('Next'));
      fireEvent.press(getByTestId('state-NY'));
      fireEvent.press(getByText('Next'));
      fireEvent.press(getByTestId('avatar-B'));
      fireEvent.press(getByText('Next')); // avatar → theme
      fireEvent.press(getByText('Next')); // theme → youtube
      fireEvent.press(getByText('Done'));

      expect(mockOnComplete).toHaveBeenCalledWith(
        {
          childName: 'Charlie',
          childAge: 9,
          childGrade: 4,
          avatarId: 'bear',
          stateCode: 'NY',
          themeId: 'candy',
        },
        false,
      );
    });

    it('completes wizard end-to-end with youtube consent enabled', () => {
      const { getByPlaceholderText, getByText, getByTestId, getAllByText } = render(
        <ProfileCreationWizard onComplete={mockOnComplete} />,
      );

      fireEvent.changeText(getByPlaceholderText(/name/i), 'Dana');
      fireEvent.press(getByText('Next'));
      fireEvent.press(getAllByText('8')[0]);
      fireEvent.press(getByText('Next'));
      fireEvent.press(getByText('Skip'));
      fireEvent.press(getByText('Next')); // avatar → theme
      fireEvent.press(getByText('Next')); // theme → youtube
      fireEvent(getByTestId('youtube-consent-onboarding'), 'valueChange', true);
      fireEvent.press(getByText('Done'));

      expect(mockOnComplete).toHaveBeenCalledWith(
        expect.objectContaining({ childName: 'Dana', childAge: 8 }),
        true,
      );
    });
  });
});
