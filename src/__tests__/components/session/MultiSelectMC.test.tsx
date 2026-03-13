// Wave 0 stubs for FOUND-07 (MultiSelectMC component) — PLAN 080-01
// These tests FAIL in RED state because MultiSelectMC does not exist yet.

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

// Mock react-native-reanimated
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

// Mock lucide-react-native — MultiSelectMC likely uses checkmark icons
jest.mock('lucide-react-native', () => {
  const { View } = require('react-native');
  return {
    Check: (props: any) => <View testID="check-icon" {...props} />,
    CheckSquare: (props: any) => <View testID="check-square-icon" {...props} />,
    Square: (props: any) => <View testID="square-icon" {...props} />,
  };
});

// Mock store — component may use useTheme which reads from store
let mockStoreState: Record<string, unknown> = { themeId: 'dark' };
jest.mock('@/store/appStore', () => ({
  useAppStore: (selector: (state: Record<string, unknown>) => unknown) =>
    selector(mockStoreState),
}));

// Import after mocks — will fail with module resolution error until Plan 04
import { MultiSelectMC } from '@/components/session/MultiSelectMC';

// ChoiceOption type used in MultiSelectMCProps (mirrors the interface in Plan 04)
interface ChoiceOption {
  value: number;
  label?: string;
}

const defaultOptions: ChoiceOption[] = [
  { value: 3, label: '3' },
  { value: -3, label: '-3' },
  { value: 0, label: '0' },
  { value: 6, label: '6' },
];
const correctIndices = [0, 1]; // values 3 and -3 are correct

describe('MultiSelectMC', () => {
  const onAnswer = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockStoreState = { themeId: 'dark' };
  });

  it('renders all option labels', () => {
    const { getByText } = render(
      <MultiSelectMC
        options={defaultOptions}
        correctIndices={correctIndices}
        onAnswer={onAnswer}
      />,
    );
    expect(getByText('3')).toBeTruthy();
    expect(getByText('-3')).toBeTruthy();
    expect(getByText('0')).toBeTruthy();
    expect(getByText('6')).toBeTruthy();
  });

  it('Check button is disabled when no options are selected', () => {
    const { getByTestId } = render(
      <MultiSelectMC
        options={defaultOptions}
        correctIndices={correctIndices}
        onAnswer={onAnswer}
      />,
    );
    expect(getByTestId('multiselectmc-check-button').props.accessibilityState?.disabled).toBe(true);
  });

  it('Check button is enabled after tapping one option', () => {
    const { getByText, getByTestId } = render(
      <MultiSelectMC
        options={defaultOptions}
        correctIndices={correctIndices}
        onAnswer={onAnswer}
      />,
    );
    fireEvent.press(getByText('3'));
    expect(getByTestId('multiselectmc-check-button').props.accessibilityState?.disabled).toBe(false);
  });

  it('tapping an option marks it selected via testID', () => {
    const { getByText, getByTestId } = render(
      <MultiSelectMC
        options={defaultOptions}
        correctIndices={correctIndices}
        onAnswer={onAnswer}
      />,
    );
    fireEvent.press(getByText('3'));
    // Option at index 0 should show selected state
    expect(getByTestId('multiselectmc-option-0-selected')).toBeTruthy();
  });

  it('tapping a selected option deselects it', () => {
    const { getByText, queryByTestId } = render(
      <MultiSelectMC
        options={defaultOptions}
        correctIndices={correctIndices}
        onAnswer={onAnswer}
      />,
    );
    // Select then deselect
    fireEvent.press(getByText('3'));
    fireEvent.press(getByText('3'));
    expect(queryByTestId('multiselectmc-option-0-selected')).toBeNull();
  });

  it('selecting all correct options and pressing Check calls onAnswer(true)', () => {
    const { getByText, getByTestId } = render(
      <MultiSelectMC
        options={defaultOptions}
        correctIndices={correctIndices}
        onAnswer={onAnswer}
      />,
    );
    fireEvent.press(getByText('3'));
    fireEvent.press(getByText('-3'));
    fireEvent.press(getByTestId('multiselectmc-check-button'));
    expect(onAnswer).toHaveBeenCalledWith(true);
  });

  it('selecting only one of two correct options and pressing Check calls onAnswer(false)', () => {
    const { getByText, getByTestId } = render(
      <MultiSelectMC
        options={defaultOptions}
        correctIndices={correctIndices}
        onAnswer={onAnswer}
      />,
    );
    fireEvent.press(getByText('3')); // only one correct option
    fireEvent.press(getByTestId('multiselectmc-check-button'));
    expect(onAnswer).toHaveBeenCalledWith(false);
  });

  it('after Check is pressed, options show green/red feedback via testIDs', () => {
    const { getByText, getByTestId } = render(
      <MultiSelectMC
        options={defaultOptions}
        correctIndices={correctIndices}
        onAnswer={onAnswer}
      />,
    );
    fireEvent.press(getByText('3'));
    fireEvent.press(getByText('-3'));
    fireEvent.press(getByTestId('multiselectmc-check-button'));
    // Correct selections show green feedback
    expect(getByTestId('multiselectmc-option-0-correct')).toBeTruthy();
    expect(getByTestId('multiselectmc-option-1-correct')).toBeTruthy();
    // Unselected incorrect options show no red feedback (not selected)
    // Incorrect option that was selected would show 'incorrect' testID
  });
});
