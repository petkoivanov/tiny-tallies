import React from 'react';
import { render } from '@testing-library/react-native';

// Mock lucide icons
jest.mock('lucide-react-native', () => {
  const { View } = require('react-native');
  return {
    Clock: (props: any) => <View testID="clock-icon" {...props} />,
    Target: (props: any) => <View testID="target-icon" {...props} />,
  };
});

// Mock theme
jest.mock('@/theme', () => ({
  useTheme: () => ({
    colors: {
      surface: '#2a2a3e',
      correct: '#22c55e',
      primary: '#6366f1',
      primaryLight: '#818cf8',
      backgroundLight: '#333',
      textPrimary: '#ffffff',
      textSecondary: '#aaaaaa',
      textMuted: '#777777',
    },
  }),
  spacing: { xs: 4, sm: 8, md: 16, lg: 24 },
  typography: {
    fontFamily: { regular: 'System', medium: 'System', semiBold: 'System' },
    fontSize: { xs: 12, sm: 14, md: 16 },
  },
  layout: {
    borderRadius: { sm: 8, md: 12 },
  },
}));

// Mock skills lookup
jest.mock('@/services/mathEngine/skills', () => ({
  getSkillById: (id: string) => {
    const skills: Record<string, { name: string }> = {
      'addition.single-digit.no-carry': { name: 'Add within 10' },
      'subtraction.single-digit.no-borrow': { name: 'Subtract within 10' },
      'multiplication.equal-groups': { name: 'Equal groups' },
    };
    return skills[id] ?? undefined;
  },
}));

import { SessionHistoryList } from '@/components/reports/SessionHistoryList';
import type { SessionHistoryEntry } from '@/store/slices/sessionHistorySlice';

function makeSession(overrides: Partial<SessionHistoryEntry> = {}): SessionHistoryEntry {
  return {
    completedAt: '2026-03-10T14:30:00.000Z',
    score: 8,
    total: 10,
    xpEarned: 120,
    durationMs: 90000,
    mode: 'standard',
    skillIds: ['addition.single-digit.no-carry'],
    ...overrides,
  };
}

describe('SessionHistoryList', () => {
  it('shows empty state when no sessions', () => {
    const { getByText } = render(<SessionHistoryList sessions={[]} />);
    expect(getByText('No sessions completed yet.')).toBeTruthy();
  });

  it('renders session items', () => {
    const sessions = [makeSession(), makeSession({ score: 5 })];
    const { getAllByTestId } = render(<SessionHistoryList sessions={sessions} />);
    expect(getAllByTestId('session-history-item')).toHaveLength(2);
  });

  it('renders list testID when sessions exist', () => {
    const { getByTestId } = render(
      <SessionHistoryList sessions={[makeSession()]} />,
    );
    expect(getByTestId('session-history-list')).toBeTruthy();
  });

  it('displays formatted date', () => {
    const { getByText } = render(
      <SessionHistoryList
        sessions={[makeSession({ completedAt: '2026-03-10T14:30:00.000Z' })]}
      />,
    );
    // Mar 10
    expect(getByText(/Mar 10/)).toBeTruthy();
  });

  it('displays mode badge', () => {
    const { getByText } = render(
      <SessionHistoryList sessions={[makeSession({ mode: 'challenge' })]} />,
    );
    expect(getByText('Challenge')).toBeTruthy();
  });

  it('displays standard mode as Practice', () => {
    const { getByText } = render(
      <SessionHistoryList sessions={[makeSession({ mode: 'standard' })]} />,
    );
    expect(getByText('Practice')).toBeTruthy();
  });

  it('displays remediation mode as Review', () => {
    const { getByText } = render(
      <SessionHistoryList sessions={[makeSession({ mode: 'remediation' })]} />,
    );
    expect(getByText('Review')).toBeTruthy();
  });

  it('displays score and percentage', () => {
    const { getByText } = render(
      <SessionHistoryList sessions={[makeSession({ score: 8, total: 10 })]} />,
    );
    expect(getByText('8/10')).toBeTruthy();
    expect(getByText(/80%/)).toBeTruthy();
  });

  it('displays duration', () => {
    const { getByText } = render(
      <SessionHistoryList sessions={[makeSession({ durationMs: 90000 })]} />,
    );
    expect(getByText('1m 30s')).toBeTruthy();
  });

  it('displays skill names', () => {
    const { getByText } = render(
      <SessionHistoryList
        sessions={[
          makeSession({
            skillIds: ['addition.single-digit.no-carry', 'subtraction.single-digit.no-borrow'],
          }),
        ]}
      />,
    );
    expect(getByText(/Add within 10/)).toBeTruthy();
  });

  it('shows +N more for extra skills', () => {
    const { getByText } = render(
      <SessionHistoryList
        sessions={[
          makeSession({
            skillIds: [
              'addition.single-digit.no-carry',
              'subtraction.single-digit.no-borrow',
              'multiplication.equal-groups',
              'unknown.skill',
            ],
          }),
        ]}
      />,
    );
    expect(getByText(/\+1 more/)).toBeTruthy();
  });

  it('limits to 20 displayed sessions', () => {
    const sessions = Array.from({ length: 25 }, (_, i) =>
      makeSession({ completedAt: `2026-03-${String(i + 1).padStart(2, '0')}T10:00:00.000Z` }),
    );

    const { getAllByTestId } = render(<SessionHistoryList sessions={sessions} />);
    expect(getAllByTestId('session-history-item')).toHaveLength(20);
  });
});
