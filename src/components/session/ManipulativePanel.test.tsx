import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Text } from 'react-native';

import { ManipulativePanel } from './ManipulativePanel';

describe('ManipulativePanel', () => {
  const defaultProps = {
    expanded: false,
    onToggle: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders toggle button with testID "manipulative-toggle"', () => {
    const { getByTestId } = render(
      <ManipulativePanel {...defaultProps}>
        <Text>workspace</Text>
      </ManipulativePanel>,
    );
    expect(getByTestId('manipulative-toggle')).toBeTruthy();
  });

  it('shows "Show blocks" label when collapsed and no custom label', () => {
    const { getByText } = render(
      <ManipulativePanel {...defaultProps} expanded={false}>
        <Text>workspace</Text>
      </ManipulativePanel>,
    );
    expect(getByText('Show blocks')).toBeTruthy();
  });

  it('shows "Hide blocks" label when expanded and no custom label', () => {
    const { getByText } = render(
      <ManipulativePanel {...defaultProps} expanded={true}>
        <Text>workspace</Text>
      </ManipulativePanel>,
    );
    expect(getByText('Hide blocks')).toBeTruthy();
  });

  it('shows custom manipulative label when provided', () => {
    const { getByText } = render(
      <ManipulativePanel
        {...defaultProps}
        expanded={false}
        manipulativeLabel="counters"
      >
        <Text>workspace</Text>
      </ManipulativePanel>,
    );
    expect(getByText('Show counters')).toBeTruthy();
  });

  it('shows "Hide" with custom label when expanded', () => {
    const { getByText } = render(
      <ManipulativePanel
        {...defaultProps}
        expanded={true}
        manipulativeLabel="counters"
      >
        <Text>workspace</Text>
      </ManipulativePanel>,
    );
    expect(getByText('Hide counters')).toBeTruthy();
  });

  it('calls onToggle when toggle button is pressed', () => {
    const onToggle = jest.fn();
    const { getByTestId } = render(
      <ManipulativePanel {...defaultProps} onToggle={onToggle}>
        <Text>workspace</Text>
      </ManipulativePanel>,
    );
    fireEvent.press(getByTestId('manipulative-toggle'));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('renders children inside the panel', () => {
    const { getByText } = render(
      <ManipulativePanel {...defaultProps} expanded={true}>
        <Text>My manipulative workspace</Text>
      </ManipulativePanel>,
    );
    expect(getByText('My manipulative workspace')).toBeTruthy();
  });

  it('toggle button has minimum 48dp touch target', () => {
    const { getByTestId } = render(
      <ManipulativePanel {...defaultProps}>
        <Text>workspace</Text>
      </ManipulativePanel>,
    );
    const toggle = getByTestId('manipulative-toggle');
    const style = toggle.props.style;
    // Style may be array or object; flatten to check minHeight
    const flatStyle = Array.isArray(style)
      ? Object.assign({}, ...style.flat(Infinity).filter(Boolean))
      : style;
    expect(flatStyle.minHeight).toBeGreaterThanOrEqual(48);
  });
});
