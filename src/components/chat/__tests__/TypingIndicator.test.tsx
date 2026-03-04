import React from 'react';
import { render } from '@testing-library/react-native';
import { TypingIndicator } from '../TypingIndicator';

describe('TypingIndicator', () => {
  it('renders with typing-indicator testID', () => {
    const { getByTestId } = render(<TypingIndicator />);
    expect(getByTestId('typing-indicator')).toBeTruthy();
  });

  it('renders three animated dots', () => {
    const { getAllByTestId } = render(<TypingIndicator />);
    const dots = getAllByTestId(/typing-dot/);
    expect(dots).toHaveLength(3);
  });
});
