import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Text, View } from 'react-native';

import { ManipulativeShell } from './ManipulativeShell';

describe('ManipulativeShell', () => {
  const defaultProps = {
    count: 5,
    onReset: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders reset button with correct accessibility label', () => {
    const { getByLabelText } = render(
      <ManipulativeShell {...defaultProps}>
        <Text>workspace</Text>
      </ManipulativeShell>,
    );
    expect(getByLabelText('Reset manipulative')).toBeTruthy();
  });

  it('calls onReset when reset button is pressed', () => {
    const onReset = jest.fn();
    const { getByTestId } = render(
      <ManipulativeShell {...defaultProps} onReset={onReset}>
        <Text>workspace</Text>
      </ManipulativeShell>,
    );
    fireEvent.press(getByTestId('reset-button'));
    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it('renders AnimatedCounter with provided count value', () => {
    const { getByTestId } = render(
      <ManipulativeShell {...defaultProps} count={12}>
        <Text>workspace</Text>
      </ManipulativeShell>,
    );
    // AnimatedCounter renders with testID "animated-counter"
    expect(getByTestId('animated-counter')).toBeTruthy();
  });

  it('renders custom counter when renderCounter is provided', () => {
    const customCounter = () => (
      <View testID="custom-counter">
        <Text>Red: 3 | Yellow: 2</Text>
      </View>
    );
    const { getByTestId, queryByTestId } = render(
      <ManipulativeShell {...defaultProps} renderCounter={customCounter}>
        <Text>workspace</Text>
      </ManipulativeShell>,
    );
    expect(getByTestId('custom-counter')).toBeTruthy();
    // Default AnimatedCounter should not render
    expect(queryByTestId('animated-counter')).toBeNull();
  });

  it('renders children in workspace area', () => {
    const { getByText } = render(
      <ManipulativeShell {...defaultProps}>
        <Text>My manipulative content</Text>
      </ManipulativeShell>,
    );
    expect(getByText('My manipulative content')).toBeTruthy();
  });

  it('passes testID to container', () => {
    const { getByTestId } = render(
      <ManipulativeShell {...defaultProps} testID="test-shell">
        <Text>workspace</Text>
      </ManipulativeShell>,
    );
    expect(getByTestId('test-shell')).toBeTruthy();
  });

  it('passes countLabel to AnimatedCounter', () => {
    const { getByLabelText } = render(
      <ManipulativeShell {...defaultProps} count={7} countLabel="Total">
        <Text>workspace</Text>
      </ManipulativeShell>,
    );
    // AnimatedCounter sets accessibilityLabel to "Total: 7"
    expect(getByLabelText('Total: 7')).toBeTruthy();
  });

  // --- Undo button tests ---

  it('renders undo button when onUndo is provided', () => {
    const { getByTestId } = render(
      <ManipulativeShell {...defaultProps} onUndo={jest.fn()} canUndo={true}>
        <Text>workspace</Text>
      </ManipulativeShell>,
    );
    expect(getByTestId('undo-button')).toBeTruthy();
  });

  it('does not render undo button when onUndo is not provided', () => {
    const { queryByTestId } = render(
      <ManipulativeShell {...defaultProps}>
        <Text>workspace</Text>
      </ManipulativeShell>,
    );
    expect(queryByTestId('undo-button')).toBeNull();
  });

  it('calls onUndo when undo button is pressed', () => {
    const onUndo = jest.fn();
    const { getByTestId } = render(
      <ManipulativeShell {...defaultProps} onUndo={onUndo} canUndo={true}>
        <Text>workspace</Text>
      </ManipulativeShell>,
    );
    fireEvent.press(getByTestId('undo-button'));
    expect(onUndo).toHaveBeenCalledTimes(1);
  });

  it('disables undo button when canUndo is false', () => {
    const onUndo = jest.fn();
    const { getByTestId } = render(
      <ManipulativeShell {...defaultProps} onUndo={onUndo} canUndo={false}>
        <Text>workspace</Text>
      </ManipulativeShell>,
    );
    const undoButton = getByTestId('undo-button');
    expect(undoButton.props.accessibilityState?.disabled).toBe(true);
  });

  // --- Grid toggle button tests ---

  it('renders grid toggle button when onGridToggle is provided', () => {
    const { getByTestId } = render(
      <ManipulativeShell {...defaultProps} onGridToggle={jest.fn()}>
        <Text>workspace</Text>
      </ManipulativeShell>,
    );
    expect(getByTestId('grid-toggle-button')).toBeTruthy();
  });

  it('does not render grid toggle button when onGridToggle is not provided', () => {
    const { queryByTestId } = render(
      <ManipulativeShell {...defaultProps}>
        <Text>workspace</Text>
      </ManipulativeShell>,
    );
    expect(queryByTestId('grid-toggle-button')).toBeNull();
  });

  it('calls onGridToggle when grid toggle button is pressed', () => {
    const onGridToggle = jest.fn();
    const { getByTestId } = render(
      <ManipulativeShell {...defaultProps} onGridToggle={onGridToggle}>
        <Text>workspace</Text>
      </ManipulativeShell>,
    );
    fireEvent.press(getByTestId('grid-toggle-button'));
    expect(onGridToggle).toHaveBeenCalledTimes(1);
  });
});
