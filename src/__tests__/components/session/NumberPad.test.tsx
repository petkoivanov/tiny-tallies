// Wave 0 stubs for FOUND-05 (NumberPad allowNegative prop) — PLAN 080-01
// These tests FAIL in RED state because allowNegative prop does not exist yet.

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

// Mock react-native-reanimated before imports
jest.mock('react-native-reanimated', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: {
      View,
      Text: require('react-native').Text,
      createAnimatedComponent: (c: any) => c,
      call: jest.fn(),
    },
    useSharedValue: (init: any) => ({ value: init }),
    useAnimatedStyle: (fn: () => any) => fn(),
    withTiming: (v: any) => v,
    withRepeat: (_v: any) => _v,
    withSequence: (...args: any[]) => args[args.length - 1],
    Easing: { linear: (v: any) => v, inOut: () => (v: any) => v, quad: (v: any) => v },
  };
});

// Mock lucide icons used by NumberPad (Check, Lightbulb)
jest.mock('lucide-react-native', () => {
  const { View } = require('react-native');
  return {
    Check: (props: any) => <View testID="check-icon" {...props} />,
    Lightbulb: (props: any) => <View testID="lightbulb-icon" {...props} />,
  };
});

// Mock store — useTheme reads themeId from store
let mockStoreState: Record<string, unknown> = { themeId: 'dark' };
jest.mock('@/store/appStore', () => ({
  useAppStore: (selector: (state: Record<string, unknown>) => unknown) =>
    selector(mockStoreState),
}));

import { NumberPad } from '@/components/session/NumberPad';

function setMockState(overrides: Record<string, unknown> = {}) {
  mockStoreState = { themeId: 'dark', ...overrides };
}

describe('NumberPad allowNegative', () => {
  const onSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    setMockState();
  });

  it('renders ± key when allowNegative={true}', () => {
    const { getByText } = render(
      <NumberPad onSubmit={onSubmit} allowNegative={true} />,
    );
    expect(getByText('±')).toBeTruthy();
  });

  it('does NOT render ± key when allowNegative is absent', () => {
    const { queryByText } = render(<NumberPad onSubmit={onSubmit} />);
    expect(queryByText('±')).toBeNull();
  });

  it('pressing ± on value "5" changes display to "-5"', () => {
    const { getByText, getByTestId } = render(
      <NumberPad onSubmit={onSubmit} allowNegative={true} />,
    );
    fireEvent.press(getByText('5'));
    fireEvent.press(getByText('±'));
    expect(getByTestId('numberpad-display').props.children).toBe('-5');
  });

  it('pressing ± on value "-5" changes display to "5"', () => {
    const { getByText, getByTestId } = render(
      <NumberPad onSubmit={onSubmit} allowNegative={true} />,
    );
    fireEvent.press(getByText('5'));
    fireEvent.press(getByText('±'));
    fireEvent.press(getByText('±'));
    expect(getByTestId('numberpad-display').props.children).toBe('5');
  });

  it('pressing ± on empty value is a no-op', () => {
    const { getByText, getByTestId } = render(
      <NumberPad onSubmit={onSubmit} allowNegative={true} />,
    );
    fireEvent.press(getByText('±'));
    // Display should remain the placeholder '?'
    expect(getByTestId('numberpad-display').props.children).toBe('?');
  });

  it('maxDigits={2} with allowNegative={true}: can type "-99" (2 significant digits)', () => {
    const { getByText, getByTestId } = render(
      <NumberPad onSubmit={onSubmit} allowNegative={true} maxDigits={2} />,
    );
    fireEvent.press(getByText('9'));
    fireEvent.press(getByText('9'));
    fireEvent.press(getByText('±'));
    expect(getByTestId('numberpad-display').props.children).toBe('-99');
  });

  it('maxDigits={2} with allowNegative={true}: cannot append 3rd digit to "-99"', () => {
    const { getByText, getByTestId } = render(
      <NumberPad onSubmit={onSubmit} allowNegative={true} maxDigits={2} />,
    );
    fireEvent.press(getByText('9'));
    fireEvent.press(getByText('9'));
    fireEvent.press(getByText('±'));
    // Try to append another digit
    fireEvent.press(getByText('1'));
    expect(getByTestId('numberpad-display').props.children).toBe('-99');
  });
});
