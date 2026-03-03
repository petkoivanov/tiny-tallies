import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

// Mock navigation
const mockGoBack = jest.fn();
let mockRouteParams = { manipulativeType: 'counters' as string };
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    goBack: mockGoBack,
  }),
  useRoute: () => ({
    params: mockRouteParams,
  }),
}));

// Mock safe area
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

// Mock lucide icons
jest.mock('lucide-react-native', () => {
  const { View } = require('react-native');
  return {
    ArrowLeft: (props: any) => <View testID="arrow-left-icon" {...props} />,
  };
});

// Mock manipulative components - they receive testID from SandboxScreen
jest.mock('@/components/manipulatives', () => {
  const { View } = require('react-native');
  return {
    Counters: (props: any) => <View {...props} />,
    TenFrame: (props: any) => <View {...props} />,
    BaseTenBlocks: (props: any) => <View {...props} />,
    NumberLine: (props: any) => <View {...props} />,
    FractionStrips: (props: any) => <View {...props} />,
    BarModel: (props: any) => <View {...props} />,
  };
});

// Mock SandboxTooltip
jest.mock('@/components/home/SandboxTooltip', () => {
  const { Text } = require('react-native');
  return {
    SandboxTooltip: ({ message }: { message: string }) => (
      <Text testID="sandbox-tooltip">{message}</Text>
    ),
  };
});

// Mock store
const mockMarkExplored = jest.fn();
let mockExploredManipulatives: string[] = [];
jest.mock('@/store/appStore', () => ({
  useAppStore: (selector: (state: Record<string, unknown>) => unknown) =>
    selector({
      exploredManipulatives: mockExploredManipulatives,
      markExplored: mockMarkExplored,
    }),
}));

import SandboxScreen from '@/screens/SandboxScreen';

describe('SandboxScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockExploredManipulatives = [];
    mockRouteParams = { manipulativeType: 'counters' };
  });

  it('renders Counters component when manipulativeType is counters', () => {
    mockRouteParams = { manipulativeType: 'counters' };
    const { getByTestId } = render(<SandboxScreen />);
    expect(getByTestId('sandbox-counters')).toBeTruthy();
  });

  it('renders correct display name in header for counters', () => {
    mockRouteParams = { manipulativeType: 'counters' };
    const { getByText } = render(<SandboxScreen />);
    expect(getByText('Counters')).toBeTruthy();
  });

  it('renders TenFrame component for ten_frame param', () => {
    mockRouteParams = { manipulativeType: 'ten_frame' };
    const { getByTestId } = render(<SandboxScreen />);
    expect(getByTestId('sandbox-ten_frame')).toBeTruthy();
  });

  it('renders BaseTenBlocks component for base_ten_blocks param', () => {
    mockRouteParams = { manipulativeType: 'base_ten_blocks' };
    const { getByTestId } = render(<SandboxScreen />);
    expect(getByTestId('sandbox-base_ten_blocks')).toBeTruthy();
  });

  it('renders NumberLine component for number_line param', () => {
    mockRouteParams = { manipulativeType: 'number_line' };
    const { getByTestId } = render(<SandboxScreen />);
    expect(getByTestId('sandbox-number_line')).toBeTruthy();
  });

  it('renders FractionStrips component for fraction_strips param', () => {
    mockRouteParams = { manipulativeType: 'fraction_strips' };
    const { getByTestId } = render(<SandboxScreen />);
    expect(getByTestId('sandbox-fraction_strips')).toBeTruthy();
  });

  it('renders BarModel component for bar_model param', () => {
    mockRouteParams = { manipulativeType: 'bar_model' };
    const { getByTestId } = render(<SandboxScreen />);
    expect(getByTestId('sandbox-bar_model')).toBeTruthy();
  });

  it('calls markExplored with manipulativeType on mount', () => {
    mockRouteParams = { manipulativeType: 'counters' };
    render(<SandboxScreen />);
    expect(mockMarkExplored).toHaveBeenCalledWith('counters');
  });

  it('shows tooltip on first visit when type not yet explored', () => {
    mockExploredManipulatives = [];
    mockRouteParams = { manipulativeType: 'counters' };
    const { getByTestId } = render(<SandboxScreen />);
    expect(getByTestId('sandbox-tooltip')).toBeTruthy();
  });

  it('does NOT show tooltip on revisit when type already explored', () => {
    mockExploredManipulatives = ['counters'];
    mockRouteParams = { manipulativeType: 'counters' };
    const { queryByTestId } = render(<SandboxScreen />);
    expect(queryByTestId('sandbox-tooltip')).toBeNull();
  });

  it('back button calls goBack on press', () => {
    const { getByLabelText } = render(<SandboxScreen />);
    fireEvent.press(getByLabelText('Go back'));
    expect(mockGoBack).toHaveBeenCalled();
  });
});
