import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

// Mock lucide icons
jest.mock('lucide-react-native', () => {
  const { View } = require('react-native');
  return {
    X: (props: any) => <View testID="x-icon" {...props} />,
  };
});

// Mock CpaModeIcon
jest.mock('@/components/session/CpaModeIcon', () => {
  const { View } = require('react-native');
  return {
    CpaModeIcon: ({ stage }: any) => (
      <View testID="cpa-mode-icon" accessibilityHint={stage} />
    ),
  };
});

import { SessionHeader } from '@/components/session/SessionHeader';

const defaultProps = {
  sessionPhase: 'warmup' as const,
  cpaStage: 'abstract' as const,
  currentIndex: 0,
  totalProblems: 15,
  feedbackState: null,
  onQuit: jest.fn(),
};

describe('SessionHeader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders phase label "Warmup" for warmup phase', () => {
    const { getByText } = render(<SessionHeader {...defaultProps} />);
    expect(getByText('Warmup')).toBeTruthy();
  });

  it('renders phase label "Practice" for practice phase', () => {
    const { getByText } = render(
      <SessionHeader {...defaultProps} sessionPhase="practice" />,
    );
    expect(getByText('Practice')).toBeTruthy();
  });

  it('renders phase label "Cooldown" for cooldown phase', () => {
    const { getByText } = render(
      <SessionHeader {...defaultProps} sessionPhase="cooldown" />,
    );
    expect(getByText('Cooldown')).toBeTruthy();
  });

  it('renders progress text "1 / 15" for currentIndex=0, totalProblems=15', () => {
    const { getByText } = render(<SessionHeader {...defaultProps} />);
    expect(getByText('1 / 15')).toBeTruthy();
  });

  it('renders progress bar', () => {
    const { getByTestId } = render(<SessionHeader {...defaultProps} />);
    expect(getByTestId('progress-bar')).toBeTruthy();
    expect(getByTestId('progress-bar-fill')).toBeTruthy();
  });

  it('progress bar accounts for feedback state (adds 1 to done count)', () => {
    const { getByTestId } = render(
      <SessionHeader
        {...defaultProps}
        currentIndex={2}
        totalProblems={10}
        feedbackState={{ visible: true, correct: true }}
      />,
    );
    const fill = getByTestId('progress-bar-fill');
    // With feedback: (2 + 1) / 10 = 30%
    expect(fill.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ width: '30%' }),
      ]),
    );
  });

  it('quit button calls onQuit when pressed', () => {
    const onQuit = jest.fn();
    const { getByTestId } = render(
      <SessionHeader {...defaultProps} onQuit={onQuit} />,
    );

    fireEvent.press(getByTestId('quit-button'));
    expect(onQuit).toHaveBeenCalledTimes(1);
  });

  it('renders CpaModeIcon', () => {
    const { getByTestId } = render(<SessionHeader {...defaultProps} />);
    expect(getByTestId('cpa-mode-icon')).toBeTruthy();
  });
});
