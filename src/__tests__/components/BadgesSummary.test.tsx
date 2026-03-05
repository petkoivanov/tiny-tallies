import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

// Mock achievement service
jest.mock('@/services/achievement', () => ({
  getBadgeById: (id: string) => {
    const badges: Record<string, any> = {
      'badge-1': {
        id: 'badge-1',
        name: 'Addition Starter',
        description: 'Master adding within 10',
        tier: 'gold',
      },
      'badge-2': {
        id: 'badge-2',
        name: 'Quick Adder',
        description: 'Master adding within 20',
        tier: 'silver',
      },
    };
    return badges[id] ?? null;
  },
}));

// Mock BadgeIcon as simple View
jest.mock('@/components/badges/BadgeIcon', () => {
  const { View } = require('react-native');
  return {
    BadgeIcon: (props: any) => <View testID="badge-icon" {...props} />,
  };
});

jest.mock('@/components/badges/badgeEmojis', () => ({
  BADGE_EMOJIS: {
    'badge-1': '\u2B50',
    'badge-2': '\uD83D\uDC8E',
  },
}));

import { BadgesSummary } from '@/components/badges/BadgesSummary';

describe('BadgesSummary', () => {
  const mockOnViewAll = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns null when badgeIds is empty', () => {
    const { toJSON } = render(
      <BadgesSummary badgeIds={[]} onViewAll={mockOnViewAll} />,
    );
    expect(toJSON()).toBeNull();
  });

  it('renders "Badges Earned" header and badge names when badgeIds is non-empty', () => {
    const { getByText } = render(
      <BadgesSummary
        badgeIds={['badge-1', 'badge-2']}
        onViewAll={mockOnViewAll}
      />,
    );
    expect(getByText('Badges Earned')).toBeTruthy();
    expect(getByText('Addition Starter')).toBeTruthy();
    expect(getByText('Quick Adder')).toBeTruthy();
  });

  it('renders "View All Badges" pressable link', () => {
    const { getByText } = render(
      <BadgesSummary badgeIds={['badge-1']} onViewAll={mockOnViewAll} />,
    );
    expect(getByText('View All Badges')).toBeTruthy();
  });

  it('pressing "View All Badges" calls onViewAll callback', () => {
    const { getByText } = render(
      <BadgesSummary badgeIds={['badge-1']} onViewAll={mockOnViewAll} />,
    );

    fireEvent.press(getByText('View All Badges'));

    expect(mockOnViewAll).toHaveBeenCalledTimes(1);
  });
});
