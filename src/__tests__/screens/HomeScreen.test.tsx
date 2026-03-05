import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

// Mock safe area
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

// Mock lucide icons as simple View components
jest.mock('lucide-react-native', () => {
  const { View } = require('react-native');
  return {
    Flame: (props: any) => <View testID="flame-icon" {...props} />,
    Check: (props: any) => <View testID="check-icon" {...props} />,
    Focus: (props: any) => <View testID="focus-icon" {...props} />,
    GitBranch: (props: any) => <View testID="git-branch-icon" {...props} />,
  };
});

// Mock achievement service
jest.mock('@/services/achievement', () => ({
  BADGES: Array.from({ length: 27 }, (_, i) => ({ id: `badge-${i}` })),
}));

// Mock ExploreGrid as a simple View with testID
jest.mock('@/components/home', () => {
  const { View } = require('react-native');
  return {
    ExploreGrid: () => <View testID="explore-grid" />,
  };
});

// Mock store state
let mockStoreState: Record<string, unknown> = {};
jest.mock('@/store/appStore', () => ({
  useAppStore: (selector: (state: Record<string, unknown>) => unknown) =>
    selector(mockStoreState),
}));

import HomeScreen from '@/screens/HomeScreen';

function setMockState(overrides: Record<string, unknown> = {}) {
  mockStoreState = {
    childName: null,
    avatarId: null,
    xp: 0,
    level: 1,
    weeklyStreak: 0,
    lastSessionDate: null,
    exploredManipulatives: [],
    markExplored: jest.fn(),
    misconceptions: {},
    earnedBadges: {},
    ...overrides,
  };
}

describe('HomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setMockState();
  });

  it('renders greeting with child name', () => {
    setMockState({ childName: 'Emma' });

    const { getByText } = render(<HomeScreen />);
    expect(getByText('Hi, Emma!')).toBeTruthy();
  });

  it('renders fallback greeting when no name', () => {
    setMockState({ childName: null });

    const { getByText } = render(<HomeScreen />);
    expect(getByText('Hi, Mathematician!')).toBeTruthy();
  });

  it('renders current level', () => {
    setMockState({ level: 5 });

    const { getByText } = render(<HomeScreen />);
    expect(getByText('Level 5')).toBeTruthy();
  });

  it('renders XP progress', () => {
    // Level 2 starts at 120 XP. 150 XP = 30 XP into level 2.
    // Level 3 threshold = 260 XP, so xpNeededForNextLevel = 260 - 120 = 140.
    setMockState({ xp: 150, level: 2 });

    const { getByText } = render(<HomeScreen />);
    expect(getByText('30 / 140 XP')).toBeTruthy();
  });

  it('renders streak count', () => {
    setMockState({ weeklyStreak: 3 });

    const { getByText } = render(<HomeScreen />);
    expect(getByText('3 week streak')).toBeTruthy();
  });

  it('renders Start Practice button', () => {
    const { getByLabelText } = render(<HomeScreen />);
    expect(getByLabelText('Start Practice')).toBeTruthy();
  });

  it('navigates to Session on button press', () => {
    const { getByLabelText } = render(<HomeScreen />);

    fireEvent.press(getByLabelText('Start Practice'));

    expect(mockNavigate).toHaveBeenCalledWith('Session', {
      sessionId: expect.any(String),
    });
  });

  it('renders Explore section', () => {
    const { getByTestId } = render(<HomeScreen />);
    expect(getByTestId('explore-grid')).toBeTruthy();
  });

  it('renders Start Practice button below explore section', () => {
    const { getByLabelText, getByTestId } = render(<HomeScreen />);
    // Both exist in the rendered tree
    expect(getByTestId('explore-grid')).toBeTruthy();
    expect(getByLabelText('Start Practice')).toBeTruthy();
  });

  // Remediation button tests
  it('hides remediation button when fewer than 2 confirmed misconceptions', () => {
    setMockState({
      misconceptions: {
        'add_no_carry::addition.single': {
          bugTag: 'add_no_carry',
          skillId: 'addition.single',
          occurrenceCount: 3,
          status: 'confirmed',
          firstSeen: '2026-01-01',
          lastSeen: '2026-01-02',
          remediationCorrectCount: 0,
        },
      },
    });

    const { queryByTestId } = render(<HomeScreen />);
    expect(queryByTestId('remediation-button')).toBeNull();
  });

  it('shows remediation button when 2+ confirmed misconceptions exist', () => {
    setMockState({
      misconceptions: {
        'add_no_carry::addition.single': {
          bugTag: 'add_no_carry',
          skillId: 'addition.single',
          occurrenceCount: 3,
          status: 'confirmed',
          firstSeen: '2026-01-01',
          lastSeen: '2026-01-02',
          remediationCorrectCount: 0,
        },
        'sub_no_borrow::subtraction.single': {
          bugTag: 'sub_no_borrow',
          skillId: 'subtraction.single',
          occurrenceCount: 3,
          status: 'confirmed',
          firstSeen: '2026-01-01',
          lastSeen: '2026-01-02',
          remediationCorrectCount: 0,
        },
      },
    });

    const { getByTestId, getByText } = render(<HomeScreen />);
    expect(getByTestId('remediation-button')).toBeTruthy();
    expect(getByText('Practice Tricky Skills')).toBeTruthy();
    expect(getByText('2 skills need extra practice')).toBeTruthy();
  });

  it('excludes resolved misconceptions from remediation count', () => {
    setMockState({
      misconceptions: {
        'add_no_carry::addition.single': {
          bugTag: 'add_no_carry',
          skillId: 'addition.single',
          occurrenceCount: 3,
          status: 'resolved',
          firstSeen: '2026-01-01',
          lastSeen: '2026-01-02',
          remediationCorrectCount: 3,
          resolvedAt: '2026-01-03',
        },
        'sub_no_borrow::subtraction.single': {
          bugTag: 'sub_no_borrow',
          skillId: 'subtraction.single',
          occurrenceCount: 3,
          status: 'confirmed',
          firstSeen: '2026-01-01',
          lastSeen: '2026-01-02',
          remediationCorrectCount: 0,
        },
      },
    });

    const { queryByTestId } = render(<HomeScreen />);
    // Only 1 confirmed, so button hidden
    expect(queryByTestId('remediation-button')).toBeNull();
  });

  it('navigates to remediation session on remediation button press', () => {
    setMockState({
      misconceptions: {
        'add_no_carry::addition.single': {
          bugTag: 'add_no_carry',
          skillId: 'addition.single',
          occurrenceCount: 3,
          status: 'confirmed',
          firstSeen: '2026-01-01',
          lastSeen: '2026-01-02',
          remediationCorrectCount: 0,
        },
        'sub_no_borrow::subtraction.single': {
          bugTag: 'sub_no_borrow',
          skillId: 'subtraction.single',
          occurrenceCount: 3,
          status: 'confirmed',
          firstSeen: '2026-01-01',
          lastSeen: '2026-01-02',
          remediationCorrectCount: 0,
        },
      },
    });

    const { getByTestId } = render(<HomeScreen />);
    fireEvent.press(getByTestId('remediation-button'));

    expect(mockNavigate).toHaveBeenCalledWith('Session', {
      sessionId: expect.any(String),
      mode: 'remediation',
      remediationSkillIds: expect.arrayContaining([
        'addition.single',
        'subtraction.single',
      ]),
    });
  });

  // Badge count tests
  it('shows badge count button with correct count', () => {
    setMockState({
      earnedBadges: {
        'badge-0': { earnedAt: '2026-01-01' },
        'badge-1': { earnedAt: '2026-01-02' },
        'badge-2': { earnedAt: '2026-01-03' },
      },
    });

    const { getByText } = render(<HomeScreen />);
    expect(getByText('3 / 27 Badges')).toBeTruthy();
  });

  it('badge count button navigates to BadgeCollection', () => {
    setMockState();

    const { getByTestId } = render(<HomeScreen />);
    fireEvent.press(getByTestId('badge-count-button'));

    expect(mockNavigate).toHaveBeenCalledWith('BadgeCollection');
  });

  // Skill map button tests
  it('renders skill map button', () => {
    setMockState();

    const { getByTestId } = render(<HomeScreen />);
    expect(getByTestId('skill-map-button')).toBeTruthy();
  });

  it('skill map button navigates to SkillMap', () => {
    setMockState();

    const { getByTestId } = render(<HomeScreen />);
    fireEvent.press(getByTestId('skill-map-button'));

    expect(mockNavigate).toHaveBeenCalledWith('SkillMap');
  });
});
