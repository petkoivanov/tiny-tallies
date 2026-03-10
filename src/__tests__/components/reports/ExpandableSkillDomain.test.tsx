import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

// Mock lucide icons
jest.mock('lucide-react-native', () => {
  const { View } = require('react-native');
  return {
    ChevronDown: (props: any) => <View testID="chevron-down" {...props} />,
    ChevronRight: (props: any) => <View testID="chevron-right" {...props} />,
  };
});

// Mock theme
jest.mock('@/theme', () => ({
  useTheme: () => ({
    colors: {
      correct: '#22c55e',
      primary: '#6366f1',
      backgroundLight: '#333',
      textPrimary: '#ffffff',
      textSecondary: '#aaaaaa',
      textMuted: '#777777',
    },
  }),
  spacing: { xs: 4, sm: 8, md: 16, lg: 24 },
  typography: {
    fontFamily: { regular: 'System', medium: 'System' },
    fontSize: { xs: 12, sm: 14, md: 16 },
  },
  layout: {
    borderRadius: { round: 9999 },
    minTouchTarget: 48,
  },
}));

import { ExpandableSkillDomain } from '@/components/reports/ExpandableSkillDomain';
import type { SkillDefinition } from '@/services/mathEngine/types';

const mockSkills: SkillDefinition[] = [
  { id: 'addition.single-digit.no-carry', name: 'Add within 10', operation: 'addition', grade: 1, standards: [], prerequisites: [] },
  { id: 'addition.single-digit.carry', name: 'Add with carry', operation: 'addition', grade: 2, standards: [], prerequisites: [] },
  { id: 'addition.double-digit', name: 'Add 2-digit', operation: 'addition', grade: 2, standards: [], prerequisites: [] },
];

const defaultProps = {
  domainLabel: 'Addition',
  skills: mockSkills,
  skillStates: {},
  masteredCount: 1,
  totalCount: 3,
  inProgressCount: 1,
};

describe('ExpandableSkillDomain', () => {
  it('renders domain label and count', () => {
    const { getByText } = render(<ExpandableSkillDomain {...defaultProps} />);
    expect(getByText('Addition')).toBeTruthy();
    expect(getByText('1/3')).toBeTruthy();
  });

  it('renders collapsed by default (chevron-right)', () => {
    const { getByTestId, queryByTestId } = render(
      <ExpandableSkillDomain {...defaultProps} />,
    );
    expect(getByTestId('chevron-right')).toBeTruthy();
    expect(queryByTestId('skills-addition')).toBeNull();
  });

  it('expands to show skills on press', () => {
    const { getByTestId, getByText } = render(
      <ExpandableSkillDomain {...defaultProps} />,
    );

    fireEvent.press(getByTestId('domain-addition'));

    expect(getByTestId('skills-addition')).toBeTruthy();
    expect(getByText('Add within 10')).toBeTruthy();
    expect(getByText('Add with carry')).toBeTruthy();
    expect(getByText('Add 2-digit')).toBeTruthy();
  });

  it('shows chevron-down when expanded', () => {
    const { getByTestId } = render(
      <ExpandableSkillDomain {...defaultProps} />,
    );

    fireEvent.press(getByTestId('domain-addition'));
    expect(getByTestId('chevron-down')).toBeTruthy();
  });

  it('collapses on second press', () => {
    const { getByTestId, queryByTestId } = render(
      <ExpandableSkillDomain {...defaultProps} />,
    );

    fireEvent.press(getByTestId('domain-addition'));
    expect(getByTestId('skills-addition')).toBeTruthy();

    fireEvent.press(getByTestId('domain-addition'));
    expect(queryByTestId('skills-addition')).toBeNull();
  });

  it('shows accuracy percentage for practiced skills', () => {
    const { getByTestId, getByText } = render(
      <ExpandableSkillDomain
        {...defaultProps}
        skillStates={{
          'addition.single-digit.no-carry': {
            eloRating: 1000,
            attempts: 10,
            correct: 8,
            masteryProbability: 0.8,
            consecutiveWrong: 0,
            masteryLocked: true,
            leitnerBox: 6,
            nextReviewDue: null,
            consecutiveCorrectInBox6: 3,
            cpaLevel: 'abstract',
          },
          'addition.single-digit.carry': {
            eloRating: 900,
            attempts: 5,
            correct: 3,
            masteryProbability: 0.5,
            consecutiveWrong: 0,
            masteryLocked: false,
            leitnerBox: 3,
            nextReviewDue: null,
            consecutiveCorrectInBox6: 0,
            cpaLevel: 'pictorial',
          },
        }}
      />,
    );

    fireEvent.press(getByTestId('domain-addition'));
    expect(getByText('80%')).toBeTruthy();
    expect(getByText('60%')).toBeTruthy();
  });

  it('does not show accuracy for not-started skills', () => {
    const { getByTestId, queryByText } = render(
      <ExpandableSkillDomain {...defaultProps} />,
    );

    fireEvent.press(getByTestId('domain-addition'));
    // No accuracy percentages should appear for not-started skills
    expect(queryByText('%')).toBeNull();
  });

  it('has correct accessibility label', () => {
    const { getByTestId } = render(
      <ExpandableSkillDomain {...defaultProps} />,
    );

    const button = getByTestId('domain-addition');
    expect(button.props.accessibilityLabel).toContain('Addition');
    expect(button.props.accessibilityLabel).toContain('1 of 3 mastered');
  });
});
