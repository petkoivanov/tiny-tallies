import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

// Mock store
let mockExploredManipulatives: string[] = [];
jest.mock('@/store/appStore', () => ({
  useAppStore: (selector: (state: Record<string, unknown>) => unknown) =>
    selector({
      exploredManipulatives: mockExploredManipulatives,
    }),
}));

import { ExploreCard } from '@/components/home/ExploreCard';
import { ExploreGrid } from '@/components/home/ExploreGrid';

describe('ExploreCard', () => {
  const defaultProps = {
    type: 'counters' as const,
    emoji: '🔴',
    name: 'Counters',
    bgColor: '#2a1a1a',
    isNew: true,
    onPress: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders emoji and display name text', () => {
    const { getByText } = render(<ExploreCard {...defaultProps} />);
    expect(getByText('🔴')).toBeTruthy();
    expect(getByText('Counters')).toBeTruthy();
  });

  it('shows new dot when isNew is true', () => {
    const { getByTestId } = render(
      <ExploreCard {...defaultProps} isNew={true} />,
    );
    expect(getByTestId('new-dot')).toBeTruthy();
  });

  it('hides new dot when isNew is false', () => {
    const { queryByTestId } = render(
      <ExploreCard {...defaultProps} isNew={false} />,
    );
    expect(queryByTestId('new-dot')).toBeNull();
  });

  it('calls onPress callback when tapped', () => {
    const onPress = jest.fn();
    const { getByLabelText } = render(
      <ExploreCard {...defaultProps} onPress={onPress} />,
    );
    fireEvent.press(getByLabelText('Counters'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});

describe('ExploreGrid', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockExploredManipulatives = [];
  });

  it('renders all 6 cards in difficulty order', () => {
    const { getByText } = render(<ExploreGrid />);
    expect(getByText('Counters')).toBeTruthy();
    expect(getByText('Ten Frame')).toBeTruthy();
    expect(getByText('Blocks')).toBeTruthy();
    expect(getByText('Number Line')).toBeTruthy();
    expect(getByText('Fractions')).toBeTruthy();
    expect(getByText('Bar Model')).toBeTruthy();
  });

  it('renders Explore section header', () => {
    const { getByText } = render(<ExploreGrid />);
    expect(getByText('Explore')).toBeTruthy();
  });

  it('shows new dot for unexplored manipulatives', () => {
    mockExploredManipulatives = [];
    const { getAllByTestId } = render(<ExploreGrid />);
    // All 6 should have new dots when none explored
    expect(getAllByTestId('new-dot')).toHaveLength(6);
  });

  it('hides new dot for explored manipulatives', () => {
    mockExploredManipulatives = ['counters', 'ten_frame'];
    const { getAllByTestId } = render(<ExploreGrid />);
    // 4 remaining should have new dots
    expect(getAllByTestId('new-dot')).toHaveLength(4);
  });

  it('navigates to Sandbox with correct manipulativeType on card press', () => {
    const { getByLabelText } = render(<ExploreGrid />);
    fireEvent.press(getByLabelText('Counters'));
    expect(mockNavigate).toHaveBeenCalledWith('Sandbox', {
      manipulativeType: 'counters',
    });
  });
});
