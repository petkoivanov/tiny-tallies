import React from 'react';
import { render } from '@testing-library/react-native';

jest.mock('react-native-svg', () => {
  const React = require('react');
  const { View, Text } = require('react-native');

  const createMock = (name: string) =>
    React.forwardRef(({ children, testID, ...props }: any, ref: any) =>
      React.createElement(View, { ...props, testID: testID || name, ref }, children),
    );

  return {
    __esModule: true,
    default: createMock('Svg'),
    Svg: createMock('Svg'),
    Circle: createMock('Circle'),
    Text: ({ children, ...props }: any) =>
      React.createElement(Text, props, children),
  };
});

import { CoinDisplay, shouldShowCoins } from '@/components/session/CoinDisplay';

describe('CoinDisplay', () => {
  it('renders with testID', () => {
    const { getByTestId } = render(
      <CoinDisplay coinSet={[{ coin: 'penny', count: 1 }]} />,
    );
    expect(getByTestId('coin-display')).toBeTruthy();
  });

  it('renders value labels for each coin', () => {
    const { getAllByText } = render(
      <CoinDisplay coinSet={[{ coin: 'quarter', count: 2 }]} />,
    );
    const labels = getAllByText('25¢');
    expect(labels).toHaveLength(2);
  });

  it('renders mixed coin types', () => {
    const { getAllByText } = render(
      <CoinDisplay
        coinSet={[
          { coin: 'dime', count: 3 },
          { coin: 'penny', count: 2 },
        ]}
      />,
    );
    expect(getAllByText('10¢')).toHaveLength(3);
    expect(getAllByText('1¢')).toHaveLength(2);
  });

  it('returns null for empty coinSet', () => {
    const { toJSON } = render(<CoinDisplay coinSet={[]} />);
    expect(toJSON()).toBeNull();
  });

  it('returns null for unknown coin type', () => {
    const { toJSON } = render(
      <CoinDisplay coinSet={[{ coin: 'doubloon', count: 1 }]} />,
    );
    expect(toJSON()).toBeNull();
  });

  it('sets accessibility label describing coins', () => {
    const { getByTestId } = render(
      <CoinDisplay
        coinSet={[
          { coin: 'nickel', count: 3 },
          { coin: 'quarter', count: 1 },
        ]}
      />,
    );
    const display = getByTestId('coin-display');
    expect(display.props.accessibilityLabel).toBe('3 nickels, 1 quarter');
  });

  it('renders all four coin types', () => {
    const { getByText } = render(
      <CoinDisplay
        coinSet={[
          { coin: 'penny', count: 1 },
          { coin: 'nickel', count: 1 },
          { coin: 'dime', count: 1 },
          { coin: 'quarter', count: 1 },
        ]}
      />,
    );
    expect(getByText('1¢')).toBeTruthy();
    expect(getByText('5¢')).toBeTruthy();
    expect(getByText('10¢')).toBeTruthy();
    expect(getByText('25¢')).toBeTruthy();
  });
});

describe('shouldShowCoins', () => {
  it('returns true for visual money skills', () => {
    expect(shouldShowCoins('money.coin-id')).toBe(true);
    expect(shouldShowCoins('money.count.same-type')).toBe(true);
    expect(shouldShowCoins('money.count.mixed')).toBe(true);
  });

  it('returns false for non-visual money skills', () => {
    expect(shouldShowCoins('money.notation')).toBe(false);
    expect(shouldShowCoins('money.change.simple')).toBe(false);
    expect(shouldShowCoins('money.multi-step')).toBe(false);
    expect(shouldShowCoins('money.unit-price')).toBe(false);
  });

  it('returns false for non-money skills', () => {
    expect(shouldShowCoins('addition.single')).toBe(false);
  });
});
