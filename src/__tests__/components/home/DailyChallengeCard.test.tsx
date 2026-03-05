import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

// Mock challenge service
const mockGetTodaysChallenge = jest.fn();
const mockGetTodayDateKey = jest.fn();
jest.mock('@/services/challenge', () => ({
  getTodaysChallenge: () => mockGetTodaysChallenge(),
  getTodayDateKey: () => mockGetTodayDateKey(),
}));

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}));

// Mock store
import { useAppStore } from '@/store/appStore';

jest.mock('@/store/appStore', () => {
  const actual = jest.requireActual('@/store/appStore');
  return {
    ...actual,
    useAppStore: jest.fn(),
  };
});

const mockUseAppStore = useAppStore as unknown as jest.Mock;

import { DailyChallengeCard } from '@/components/home';

describe('DailyChallengeCard', () => {
  const mockTheme = {
    id: 'addition-adventure',
    name: 'Addition Adventure',
    emoji: '\u{1F680}',
    description: 'Practice your addition skills today!',
    skillFilter: { operations: ['addition'] },
    goals: { accuracyTarget: 8, streakTarget: 4 },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetTodaysChallenge.mockReturnValue(mockTheme);
    mockGetTodayDateKey.mockReturnValue('2026-03-05');
    mockUseAppStore.mockImplementation((selector: (state: unknown) => unknown) =>
      selector({ challengeCompletions: {} }),
    );
  });

  describe('active state (not completed)', () => {
    it('renders theme name', () => {
      const { getByText } = render(<DailyChallengeCard />);
      expect(getByText(/Addition Adventure/)).toBeTruthy();
    });

    it('renders theme emoji', () => {
      const { getByText } = render(<DailyChallengeCard />);
      expect(getByText('\u{1F680}')).toBeTruthy();
    });

    it('shows goal description', () => {
      const { getByText } = render(<DailyChallengeCard />);
      expect(getByText(/8\/10 correct/)).toBeTruthy();
      expect(getByText(/4 in a row/)).toBeTruthy();
    });

    it('shows "Not started" status text', () => {
      const { getByText } = render(<DailyChallengeCard />);
      expect(getByText('Not started')).toBeTruthy();
    });

    it('navigates to Session with challenge params on press', () => {
      const { getByTestId } = render(<DailyChallengeCard />);
      fireEvent.press(getByTestId('daily-challenge-card'));

      expect(mockNavigate).toHaveBeenCalledWith('Session', expect.objectContaining({
        mode: 'challenge',
        challengeThemeId: 'addition-adventure',
      }));
    });

    it('does NOT show any missed or penalty text', () => {
      const { queryByText } = render(<DailyChallengeCard />);
      expect(queryByText(/missed/i)).toBeNull();
      expect(queryByText(/skip/i)).toBeNull();
      expect(queryByText(/penalty/i)).toBeNull();
      expect(queryByText(/haven't/i)).toBeNull();
    });
  });

  describe('completed state', () => {
    beforeEach(() => {
      mockUseAppStore.mockImplementation((selector: (state: unknown) => unknown) =>
        selector({
          challengeCompletions: {
            '2026-03-05': {
              themeId: 'addition-adventure',
              score: 9,
              total: 10,
              accuracyGoalMet: true,
              streakGoalMet: false,
              bonusXpAwarded: 50,
              completedAt: '2026-03-05T12:00:00Z',
            },
          },
        }),
      );
    });

    it('shows "Challenge Complete!" text', () => {
      const { getByText } = render(<DailyChallengeCard />);
      expect(getByText(/Challenge Complete/)).toBeTruthy();
    });

    it('shows score', () => {
      const { getByText } = render(<DailyChallengeCard />);
      expect(getByText(/9\/10/)).toBeTruthy();
    });

    it('shows bonus XP', () => {
      const { getByText } = render(<DailyChallengeCard />);
      expect(getByText(/\+50 bonus XP/i)).toBeTruthy();
    });

    it('is not pressable (does not navigate)', () => {
      const { getByTestId } = render(<DailyChallengeCard />);
      fireEvent.press(getByTestId('daily-challenge-card'));
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('does NOT show any missed or penalty text', () => {
      const { queryByText } = render(<DailyChallengeCard />);
      expect(queryByText(/missed/i)).toBeNull();
      expect(queryByText(/skip/i)).toBeNull();
      expect(queryByText(/penalty/i)).toBeNull();
    });
  });
});
