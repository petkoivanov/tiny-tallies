import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';

// Mock lucide icons
jest.mock('lucide-react-native', () => {
  const { View } = require('react-native');
  return {
    Sparkles: (props: any) => <View testID="sparkles-icon" {...props} />,
    ChevronDown: (props: any) => <View testID="chevron-down" {...props} />,
    ChevronUp: (props: any) => <View testID="chevron-up" {...props} />,
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
    fontSize: { xs: 12, sm: 14, md: 16, lg: 20 },
  },
  layout: {
    borderRadius: { sm: 8, md: 12, lg: 16 },
    minTouchTarget: 48,
  },
}));

// Mock parent summary service
const mockGenerateParentSummary = jest.fn();
jest.mock('@/services/reports', () => ({
  generateParentSummary: (...args: any[]) => mockGenerateParentSummary(...args),
}));

// Mock skills lookup for SessionHistoryList
jest.mock('@/services/mathEngine/skills', () => ({
  getSkillById: (id: string) => ({ name: id }),
}));

import { AiSummaryCard } from '@/components/reports/AiSummaryCard';
import type { ParentSummaryInput } from '@/services/reports';
import type { SessionHistoryEntry } from '@/store/slices/sessionHistorySlice';

const defaultSummaryInput: ParentSummaryInput = {
  childName: 'Emma',
  totalSkills: 50,
  mastered: 10,
  inProgress: 15,
  sessionsCompleted: 20,
  weeklyStreak: 3,
  recentAccuracy: 0.85,
  topDomains: ['addition', 'subtraction'],
  misconceptionCount: 2,
};

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

describe('AiSummaryCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGenerateParentSummary.mockResolvedValue(null);
  });

  it('renders with testID', () => {
    const { getByTestId } = render(
      <AiSummaryCard summaryInput={defaultSummaryInput} sessions={[]} />,
    );
    expect(getByTestId('ai-summary-card')).toBeTruthy();
  });

  it('shows Progress Summary title', () => {
    const { getByText } = render(
      <AiSummaryCard summaryInput={defaultSummaryInput} sessions={[]} />,
    );
    expect(getByText('Progress Summary')).toBeTruthy();
  });

  it('shows summary text when AI returns result', async () => {
    mockGenerateParentSummary.mockResolvedValue(
      'Emma is making great progress in math!',
    );

    const { getByText } = render(
      <AiSummaryCard summaryInput={defaultSummaryInput} sessions={[]} />,
    );

    await waitFor(() => {
      expect(getByText('Emma is making great progress in math!')).toBeTruthy();
    });
  });

  it('shows fallback text when AI returns null', async () => {
    mockGenerateParentSummary.mockResolvedValue(null);

    const { getByText } = render(
      <AiSummaryCard summaryInput={defaultSummaryInput} sessions={[]} />,
    );

    await waitFor(() => {
      expect(
        getByText('Summary unavailable. View session details below.'),
      ).toBeTruthy();
    });
  });

  it('shows fallback text when AI call fails', async () => {
    mockGenerateParentSummary.mockRejectedValue(new Error('API error'));

    const { getByText } = render(
      <AiSummaryCard summaryInput={defaultSummaryInput} sessions={[]} />,
    );

    await waitFor(() => {
      expect(
        getByText('Summary unavailable. View session details below.'),
      ).toBeTruthy();
    });
  });

  it('does not show expand button when no sessions', () => {
    const { queryByTestId } = render(
      <AiSummaryCard summaryInput={defaultSummaryInput} sessions={[]} />,
    );
    expect(queryByTestId('expand-sessions-button')).toBeNull();
  });

  it('shows expand button with session count', async () => {
    mockGenerateParentSummary.mockResolvedValue('Summary text');
    const sessions = [makeSession(), makeSession()];

    const { getByText } = render(
      <AiSummaryCard summaryInput={defaultSummaryInput} sessions={sessions} />,
    );

    await waitFor(() => {
      expect(getByText('View 2 Sessions')).toBeTruthy();
    });
  });

  it('uses singular "Session" for 1 session', async () => {
    mockGenerateParentSummary.mockResolvedValue('Summary text');

    const { getByText } = render(
      <AiSummaryCard
        summaryInput={defaultSummaryInput}
        sessions={[makeSession()]}
      />,
    );

    await waitFor(() => {
      expect(getByText('View 1 Session')).toBeTruthy();
    });
  });

  it('expands to show session list on button press', async () => {
    mockGenerateParentSummary.mockResolvedValue('Summary text');
    const sessions = [makeSession()];

    const { getByTestId, getByText } = render(
      <AiSummaryCard summaryInput={defaultSummaryInput} sessions={sessions} />,
    );

    await waitFor(() => {
      expect(getByText('View 1 Session')).toBeTruthy();
    });

    fireEvent.press(getByTestId('expand-sessions-button'));
    expect(getByText('Hide Sessions')).toBeTruthy();
    expect(getByTestId('session-history-list')).toBeTruthy();
  });

  it('collapses session list on second press', async () => {
    mockGenerateParentSummary.mockResolvedValue('Summary text');
    const sessions = [makeSession()];

    const { getByTestId, getByText, queryByTestId } = render(
      <AiSummaryCard summaryInput={defaultSummaryInput} sessions={sessions} />,
    );

    await waitFor(() => {
      expect(getByText('View 1 Session')).toBeTruthy();
    });

    fireEvent.press(getByTestId('expand-sessions-button'));
    expect(getByTestId('session-history-list')).toBeTruthy();

    fireEvent.press(getByTestId('expand-sessions-button'));
    expect(queryByTestId('session-history-list')).toBeNull();
  });

  it('calls generateParentSummary with input', async () => {
    mockGenerateParentSummary.mockResolvedValue('Summary');

    render(
      <AiSummaryCard summaryInput={defaultSummaryInput} sessions={[]} />,
    );

    await waitFor(() => {
      expect(mockGenerateParentSummary).toHaveBeenCalledWith(
        defaultSummaryInput,
        expect.any(AbortSignal),
      );
    });
  });
});
