import React from 'react';
import { render } from '@testing-library/react-native';

// Mock react-native-svg
jest.mock('react-native-svg', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: (props: any) => <View testID="svg" {...props} />,
    Rect: (props: any) => <View testID="svg-rect" {...props} />,
    Line: (props: any) => <View testID="svg-line" {...props} />,
  };
});

// Mock theme
jest.mock('@/theme', () => ({
  useTheme: () => ({
    colors: {
      surface: '#2a2a3e',
      correct: '#22c55e',
      primary: '#6366f1',
      backgroundLight: '#333',
      textPrimary: '#ffffff',
      textMuted: '#777777',
    },
  }),
  spacing: { xs: 4, sm: 8, md: 16, lg: 24 },
  typography: {
    fontFamily: { regular: 'System', semiBold: 'System' },
    fontSize: { md: 16, lg: 20 },
  },
  layout: {
    borderRadius: { lg: 16, round: 9999 },
  },
}));

import { SessionBarChart } from '@/components/reports/SessionBarChart';
import type { SessionHistoryEntry } from '@/store/slices/sessionHistorySlice';

function makeSession(overrides: Partial<SessionHistoryEntry> = {}): SessionHistoryEntry {
  return {
    completedAt: '2026-03-10T10:00:00.000Z',
    score: 8,
    total: 10,
    xpEarned: 120,
    durationMs: 90000,
    mode: 'standard',
    skillIds: ['addition.single-digit.no-carry'],
    ...overrides,
  };
}

describe('SessionBarChart', () => {
  it('renders with testID', () => {
    const { getByTestId } = render(<SessionBarChart sessions={[]} />);
    expect(getByTestId('session-bar-chart')).toBeTruthy();
  });

  it('shows empty state when no sessions', () => {
    const { getByText } = render(<SessionBarChart sessions={[]} />);
    expect(getByText('No sessions completed yet. Start practicing!')).toBeTruthy();
  });

  it('renders title', () => {
    const { getByText } = render(<SessionBarChart sessions={[]} />);
    expect(getByText('Recent Sessions')).toBeTruthy();
  });

  it('renders bars for sessions', () => {
    const sessions = [
      makeSession({ completedAt: '2026-03-08T10:00:00.000Z' }),
      makeSession({ completedAt: '2026-03-09T10:00:00.000Z' }),
      makeSession({ completedAt: '2026-03-10T10:00:00.000Z' }),
    ];

    const { getAllByTestId } = render(<SessionBarChart sessions={sessions} />);
    expect(getAllByTestId('svg-rect')).toHaveLength(3);
  });

  it('renders date labels for each session', () => {
    const sessions = [
      makeSession({ completedAt: '2026-03-10T10:00:00.000Z' }),
    ];

    const { getByText } = render(<SessionBarChart sessions={sessions} />);
    expect(getByText('3/10')).toBeTruthy();
  });

  it('limits to 10 most recent sessions', () => {
    const sessions = Array.from({ length: 15 }, (_, i) =>
      makeSession({ completedAt: `2026-03-${String(i + 1).padStart(2, '0')}T10:00:00.000Z` }),
    );

    const { getAllByTestId } = render(<SessionBarChart sessions={sessions} />);
    expect(getAllByTestId('svg-rect')).toHaveLength(10);
  });
});
