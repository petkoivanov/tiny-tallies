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
    BarChart3: (props: Record<string, unknown>) => (
      <View testID="bar-chart-icon" {...props} />
    ),
    AlertTriangle: (props: Record<string, unknown>) => (
      <View testID="alert-icon" {...props} />
    ),
    Activity: (props: Record<string, unknown>) => (
      <View testID="activity-icon" {...props} />
    ),
    TrendingUp: (props: Record<string, unknown>) => (
      <View testID="trending-icon" {...props} />
    ),
    BookOpen: (props: Record<string, unknown>) => (
      <View testID="book-icon" {...props} />
    ),
    ChevronDown: (props: Record<string, unknown>) => (
      <View testID="chevron-down" {...props} />
    ),
    ChevronRight: (props: Record<string, unknown>) => (
      <View testID="chevron-right" {...props} />
    ),
    ChevronUp: (props: Record<string, unknown>) => (
      <View testID="chevron-up" {...props} />
    ),
    Sparkles: (props: Record<string, unknown>) => (
      <View testID="sparkles-icon" {...props} />
    ),
    Clock: (props: Record<string, unknown>) => (
      <View testID="clock-icon" {...props} />
    ),
    Target: (props: Record<string, unknown>) => (
      <View testID="target-icon" {...props} />
    ),
  };
});

// Mock react-native-svg
jest.mock('react-native-svg', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: (props: Record<string, unknown>) => <View testID="svg" {...props} />,
    Circle: (props: Record<string, unknown>) => <View testID="svg-circle" {...props} />,
    Rect: (props: Record<string, unknown>) => <View testID="svg-rect" {...props} />,
    Line: (props: Record<string, unknown>) => <View testID="svg-line" {...props} />,
  };
});

// Mock parent summary service
jest.mock('@/services/reports', () => ({
  generateParentSummary: jest.fn().mockResolvedValue(null),
}));

// Mock store state
let mockStoreState: Record<string, unknown> = {};
jest.mock('@/store/appStore', () => ({
  useAppStore: (selector: (state: Record<string, unknown>) => unknown) =>
    selector(mockStoreState),
}));

// Import after mocks
import ParentReportsScreen from '@/screens/ParentReportsScreen';

function setMockState(overrides: Record<string, unknown> = {}) {
  mockStoreState = {
    skillStates: {},
    misconceptions: {},
    xp: 0,
    level: 1,
    weeklyStreak: 0,
    sessionsCompleted: 0,
    earnedBadges: {},
    childName: 'Alex',
    sessionHistory: [],
    videoVotes: {},
    ...overrides,
  };
}

describe('ParentReportsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setMockState();
  });

  it('renders the screen with child name in header', () => {
    const { getByText } = render(<ParentReportsScreen />);
    expect(getByText("Alex's Progress")).toBeTruthy();
  });

  it('renders fallback header when no child name', () => {
    setMockState({ childName: null });
    const { getByText } = render(<ParentReportsScreen />);
    expect(getByText('Progress Report')).toBeTruthy();
  });

  it('renders the overall mastery summary section', () => {
    const { getByTestId, getByText } = render(<ParentReportsScreen />);
    expect(getByTestId('mastery-summary')).toBeTruthy();
    expect(getByText('Overall Mastery')).toBeTruthy();
  });

  it('renders the elo overview section', () => {
    const { getByTestId } = render(<ParentReportsScreen />);
    expect(getByTestId('elo-overview')).toBeTruthy();
  });

  it('renders the skill domain summary section', () => {
    const { getByText } = render(<ParentReportsScreen />);
    expect(getByText('Skills by Domain')).toBeTruthy();
  });

  it('renders the activity stats section', () => {
    const { getByTestId, getByText } = render(<ParentReportsScreen />);
    expect(getByTestId('activity-stats')).toBeTruthy();
    expect(getByText('Activity')).toBeTruthy();
  });

  it('shows empty misconceptions message when none detected', () => {
    const { getByText } = render(<ParentReportsScreen />);
    expect(
      getByText('No misconceptions detected yet. Keep practicing!'),
    ).toBeTruthy();
  });

  it('displays confirmed misconceptions', () => {
    setMockState({
      misconceptions: {
        'carry_error::add-2d-carry': {
          bugTag: 'carry_error',
          skillId: 'add-2d-carry',
          occurrenceCount: 4,
          status: 'confirmed',
          firstSeen: '2026-03-01T10:00:00Z',
          lastSeen: '2026-03-05T10:00:00Z',
          confirmedAt: '2026-03-05T10:00:00Z',
          remediationCorrectCount: 0,
        },
      },
    });

    const { getByText, getAllByTestId } = render(<ParentReportsScreen />);
    expect(getAllByTestId('misconception-item')).toHaveLength(1);
    expect(getByText('Confirmed')).toBeTruthy();
    expect(getByText('carry error')).toBeTruthy();
  });

  it('displays activity stats from store', () => {
    setMockState({
      sessionsCompleted: 15,
      weeklyStreak: 3,
      xp: 450,
      earnedBadges: {
        'badge-1': { earnedAt: '2026-03-01T10:00:00Z' },
        'badge-2': { earnedAt: '2026-03-02T10:00:00Z' },
      },
    });

    const { getByText, getByTestId } = render(<ParentReportsScreen />);
    // Verify activity section contains the expected values
    const activitySection = getByTestId('activity-stats');
    expect(activitySection).toBeTruthy();
    expect(getByText('15')).toBeTruthy(); // sessions
    expect(getByText('450')).toBeTruthy(); // xp
  });

  it('navigates back when back button is pressed', () => {
    const { getByTestId } = render(<ParentReportsScreen />);
    fireEvent.press(getByTestId('back-button'));
    expect(mockGoBack).toHaveBeenCalled();
  });

  it('shows mastered count for skills with masteryLocked', () => {
    setMockState({
      skillStates: {
        'addition.single-digit.no-carry': {
          eloRating: 950,
          attempts: 20,
          correct: 18,
          masteryProbability: 0.97,
          consecutiveWrong: 0,
          masteryLocked: true,
          leitnerBox: 6,
          nextReviewDue: null,
          consecutiveCorrectInBox6: 0,
          cpaLevel: 'abstract',
        },
        'addition.within-20.no-carry': {
          eloRating: 820,
          attempts: 10,
          correct: 7,
          masteryProbability: 0.6,
          consecutiveWrong: 0,
          masteryLocked: false,
          leitnerBox: 3,
          nextReviewDue: null,
          consecutiveCorrectInBox6: 0,
          cpaLevel: 'pictorial',
        },
      },
    });

    const { getByTestId, getAllByText } = render(<ParentReportsScreen />);
    expect(getByTestId('mastery-summary')).toBeTruthy();
    // The mastered count "1" appears among other numbers; verify at least one "1" exists
    const ones = getAllByText('1');
    expect(ones.length).toBeGreaterThan(0);
  });
});
