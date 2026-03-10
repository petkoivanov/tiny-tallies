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
    Line: createMock('Line'),
    Text: ({ children, ...props }: any) =>
      React.createElement(Text, props, children),
    G: createMock('G'),
  };
});

import { AnalogClock, clockDetailForSkill } from '@/components/session/AnalogClock';

describe('AnalogClock', () => {
  it('renders with testID', () => {
    const { getByTestId } = render(
      <AnalogClock hours={3} minutes={0} />,
    );
    expect(getByTestId('analog-clock')).toBeTruthy();
  });

  it('sets accessibility label with time', () => {
    const { getByTestId } = render(
      <AnalogClock hours={9} minutes={45} />,
    );
    const clock = getByTestId('analog-clock');
    expect(clock.props.accessibilityLabel).toBe('Analog clock showing 9:45');
  });

  it('pads single-digit minutes in accessibility label', () => {
    const { getByTestId } = render(
      <AnalogClock hours={12} minutes={5} />,
    );
    expect(getByTestId('analog-clock').props.accessibilityLabel).toBe(
      'Analog clock showing 12:05',
    );
  });

  it('renders all 12 numbers in full detail mode', () => {
    const { getByText } = render(
      <AnalogClock hours={3} minutes={0} detail="full" />,
    );
    for (let n = 1; n <= 12; n++) {
      expect(getByText(String(n))).toBeTruthy();
    }
  });

  it('renders only 12/3/6/9 in quarters detail mode', () => {
    const { getByText, queryByText } = render(
      <AnalogClock hours={3} minutes={0} detail="quarters" />,
    );
    expect(getByText('12')).toBeTruthy();
    expect(getByText('3')).toBeTruthy();
    expect(getByText('6')).toBeTruthy();
    expect(getByText('9')).toBeTruthy();
    expect(queryByText('1')).toBeNull();
    expect(queryByText('2')).toBeNull();
    expect(queryByText('5')).toBeNull();
  });

  it('renders only 12 in minimal detail mode', () => {
    const { getByText, queryByText } = render(
      <AnalogClock hours={3} minutes={0} detail="minimal" />,
    );
    expect(getByText('12')).toBeTruthy();
    expect(queryByText('3')).toBeNull();
    expect(queryByText('6')).toBeNull();
  });

  it('accepts custom size prop', () => {
    const { getByTestId } = render(
      <AnalogClock hours={1} minutes={30} size={240} />,
    );
    expect(getByTestId('analog-clock')).toBeTruthy();
  });
});

describe('clockDetailForSkill', () => {
  it('returns full for hour-reading skills', () => {
    expect(clockDetailForSkill('time.read.hours')).toBe('full');
    expect(clockDetailForSkill('time.read.half-hours')).toBe('full');
  });

  it('returns quarters for quarter/five-minute skills', () => {
    expect(clockDetailForSkill('time.read.quarter-hours')).toBe('quarters');
    expect(clockDetailForSkill('time.read.five-minutes')).toBe('quarters');
  });

  it('returns minimal for advanced time skills', () => {
    expect(clockDetailForSkill('time.read.one-minute')).toBe('minimal');
    expect(clockDetailForSkill('time.elapsed')).toBe('minimal');
    expect(clockDetailForSkill('time.am-pm')).toBe('minimal');
  });
});
