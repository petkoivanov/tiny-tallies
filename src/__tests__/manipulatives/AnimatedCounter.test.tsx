import React from 'react';
import { render } from '@testing-library/react-native';

import { AnimatedCounter } from '@/components/manipulatives/shared/AnimatedCounter';

describe('AnimatedCounter', () => {
  it('displays the value as text', () => {
    const { getByText } = render(<AnimatedCounter value={7} />);
    expect(getByText('7')).toBeTruthy();
  });

  it('displays optional label', () => {
    const { getByText } = render(
      <AnimatedCounter value={42} label="Total" />,
    );
    expect(getByText('42')).toBeTruthy();
    expect(getByText('Total')).toBeTruthy();
  });

  it('does not display label when not provided', () => {
    const { queryByText, getByText } = render(<AnimatedCounter value={5} />);
    expect(getByText('5')).toBeTruthy();
    // No label text should be rendered
    expect(queryByText('Total')).toBeNull();
  });

  it('updates displayed value when prop changes', () => {
    const { getByText, rerender } = render(<AnimatedCounter value={3} />);
    expect(getByText('3')).toBeTruthy();

    rerender(<AnimatedCounter value={10} />);
    expect(getByText('10')).toBeTruthy();
  });

  it('shows correct accessibility label without custom label', () => {
    const { getByLabelText } = render(<AnimatedCounter value={15} />);
    expect(getByLabelText('Count: 15')).toBeTruthy();
  });

  it('shows correct accessibility label with custom label', () => {
    const { getByLabelText } = render(
      <AnimatedCounter value={8} label="Score" />,
    );
    expect(getByLabelText('Score: 8')).toBeTruthy();
  });

  it('renders with correct testID', () => {
    const { getByTestId } = render(<AnimatedCounter value={0} />);
    expect(getByTestId('animated-counter')).toBeTruthy();
  });
});
