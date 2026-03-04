import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { HelpButton } from '../HelpButton';

describe('HelpButton', () => {
  it('renders with help-button testID when visible', () => {
    const { getByTestId } = render(
      <HelpButton visible={true} onPress={jest.fn()} pulsing={false} />,
    );
    expect(getByTestId('help-button')).toBeTruthy();
  });

  it('returns null when visible is false', () => {
    const { queryByTestId } = render(
      <HelpButton visible={false} onPress={jest.fn()} pulsing={false} />,
    );
    expect(queryByTestId('help-button')).toBeNull();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <HelpButton visible={true} onPress={onPress} pulsing={false} />,
    );
    fireEvent.press(getByTestId('help-button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('has correct accessibility attributes', () => {
    const { getByTestId } = render(
      <HelpButton visible={true} onPress={jest.fn()} pulsing={false} />,
    );
    const button = getByTestId('help-button');
    expect(button.props.accessibilityRole).toBe('button');
    expect(button.props.accessibilityLabel).toBe('Help');
  });

  it('renders Help text label', () => {
    const { getByText } = render(
      <HelpButton visible={true} onPress={jest.fn()} pulsing={false} />,
    );
    expect(getByText('Help')).toBeTruthy();
  });
});
