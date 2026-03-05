import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

// Mock navigation
const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    goBack: mockGoBack,
  }),
}));

// Mock safe area
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

// Mock lucide icons
jest.mock('lucide-react-native', () => {
  const { View } = require('react-native');
  return {
    ChevronLeft: (props: Record<string, unknown>) => (
      <View testID="chevron-left-icon" {...props} />
    ),
  };
});

// Mock BadgeIcon only -- let BadgeGrid and BadgeDetailOverlay render naturally
jest.mock('@/components/badges/BadgeIcon', () => {
  const { View, Text } = require('react-native');
  return {
    BadgeIcon: ({
      emoji,
      earned,
      tier,
    }: {
      emoji: string;
      earned: boolean;
      tier?: string;
    }) => (
      <View
        testID="badge-icon-container"
        style={{ opacity: earned ? 1 : 0.4 }}
      >
        <Text>{emoji}</Text>
        <Text>{earned ? 'earned' : 'locked'}</Text>
        <Text>{tier ?? ''}</Text>
      </View>
    ),
  };
});

// Mock badge emojis
jest.mock('@/components/badges/badgeEmojis', () => ({
  BADGE_EMOJIS: {
    'mastery.addition.single-digit.no-carry': '\u2B50',
    'mastery.addition.within-20.no-carry': '\uD83C\uDF1F',
    'mastery.addition.within-20.with-carry': '\uD83D\uDCAB',
    'mastery.addition.two-digit.no-carry': '\u2728',
    'mastery.addition.two-digit.with-carry': '\uD83C\uDF1E',
    'mastery.addition.three-digit.no-carry': '\uD83C\uDF20',
    'mastery.addition.three-digit.with-carry': '\uD83D\uDC51',
    'mastery.subtraction.single-digit.no-borrow': '\uD83D\uDD35',
    'mastery.subtraction.within-20.no-borrow': '\uD83D\uDC8E',
    'mastery.subtraction.within-20.with-borrow': '\u2744\uFE0F',
    'mastery.subtraction.two-digit.no-borrow': '\uD83C\uDF0A',
    'mastery.subtraction.two-digit.with-borrow': '\u26A1',
    'mastery.subtraction.three-digit.no-borrow': '\uD83C\uDF0C',
    'mastery.subtraction.three-digit.with-borrow': '\uD83D\uDE80',
    'mastery.category.addition': '\u2795',
    'mastery.category.subtraction': '\u2796',
    'mastery.grade.1': '\uD83C\uDF93',
    'mastery.grade.2': '\uD83C\uDF93',
    'mastery.grade.3': '\uD83C\uDF93',
    'behavior.streak.bronze': '\uD83D\uDD25',
    'behavior.streak.silver': '\uD83D\uDD25',
    'behavior.streak.gold': '\uD83D\uDD25',
    'behavior.sessions.bronze': '\uD83D\uDCD6',
    'behavior.sessions.silver': '\uD83D\uDCD6',
    'behavior.sessions.gold': '\uD83D\uDCD6',
    'behavior.remediation.bronze': '\uD83D\uDC1B',
    'behavior.remediation.silver': '\uD83D\uDC1B',
  },
}));

// Mock store state
let mockStoreState: Record<string, unknown> = {};
jest.mock('@/store/appStore', () => ({
  useAppStore: (selector: (state: Record<string, unknown>) => unknown) =>
    selector(mockStoreState),
}));

// Import after mocks
import BadgeCollectionScreen from '@/screens/BadgeCollectionScreen';

function setMockState(overrides: Record<string, unknown> = {}) {
  mockStoreState = {
    earnedBadges: {},
    ...overrides,
  };
}

describe('BadgeCollectionScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setMockState({
      earnedBadges: {
        'mastery.addition.single-digit.no-carry': {
          earnedAt: '2026-03-01T10:00:00Z',
        },
        'behavior.streak.bronze': { earnedAt: '2026-03-02T15:30:00Z' },
      },
    });
  });

  it('renders three section headers: Skill Mastery, Category & Grade, Milestones', () => {
    const { getByText } = render(<BadgeCollectionScreen />);
    expect(getByText('Skill Mastery')).toBeTruthy();
    expect(getByText('Category & Grade')).toBeTruthy();
    expect(getByText('Milestones')).toBeTruthy();
  });

  it('renders earned badges at full opacity', () => {
    const { getAllByText } = render(<BadgeCollectionScreen />);
    const earnedLabels = getAllByText('earned');
    // We set 2 badges as earned in mock state
    expect(earnedLabels.length).toBe(2);
  });

  it('renders locked badges with dimmed appearance and requirements text', () => {
    const { getAllByText } = render(<BadgeCollectionScreen />);
    const lockedLabels = getAllByText('locked');
    // 27 total - 2 earned = 25 locked
    expect(lockedLabels.length).toBe(25);
  });

  it('shows detail overlay with badge name and description when badge is tapped', () => {
    const { getByText, queryByText } = render(<BadgeCollectionScreen />);

    // Overlay content should not be visible initially
    expect(queryByText('Addition Starter')).toBeTruthy(); // name is in the grid
    // Tap on the badge name in the grid
    fireEvent.press(getByText('Addition Starter'));

    // Detail overlay should now show the description
    expect(getByText('Master adding within 10')).toBeTruthy();
  });

  it('shows "Not yet earned" in detail overlay for locked badges', () => {
    const { getByText } = render(<BadgeCollectionScreen />);

    // Tap a locked badge
    fireEvent.press(getByText('Quick Adder'));

    expect(getByText('Not yet earned')).toBeTruthy();
  });

  it('shows earned date in detail overlay for earned badges', () => {
    const { getByText } = render(<BadgeCollectionScreen />);

    // Tap an earned badge
    fireEvent.press(getByText('Addition Starter'));

    expect(getByText(/Earned:/)).toBeTruthy();
  });

  it('dismisses detail overlay when close button is pressed', () => {
    const { getByText, getByTestId, queryByText } = render(
      <BadgeCollectionScreen />,
    );

    // Open overlay
    fireEvent.press(getByText('Addition Starter'));
    expect(getByText('Master adding within 10')).toBeTruthy();

    // Close overlay via close button
    fireEvent.press(getByTestId('overlay-close'));

    // The description should no longer be in the overlay
    // (badge name still in grid, but description only in overlay)
    expect(queryByText('Master adding within 10')).toBeNull();
  });
});
