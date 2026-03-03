import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

// Mock SnapZone to render as a simple View with testID
jest.mock('@/components/manipulatives/shared/SnapZone', () => {
  const { View } = require('react-native');
  return {
    SnapZone: ({ children, id, onMeasured, isOccupied, style, ...rest }: any) => (
      <View testID={id} style={style} {...rest}>
        {children}
      </View>
    ),
  };
});

// Mock DraggableItem
jest.mock('@/components/manipulatives/shared/DraggableItem', () => {
  const { View } = require('react-native');
  return {
    DraggableItem: ({ children, ...props }: any) => (
      <View testID="draggable-item" {...props}>
        {children}
      </View>
    ),
  };
});

// Mock haptics
jest.mock('@/components/manipulatives/shared/haptics', () => ({
  triggerSnapHaptic: jest.fn(),
  triggerGroupHaptic: jest.fn(),
}));

// Mock ManipulativeShell to just render children
jest.mock('@/components/manipulatives/ManipulativeShell', () => {
  const { View, Text } = require('react-native');
  return {
    ManipulativeShell: ({ children, count, testID, onReset }: any) => (
      <View testID={testID ?? 'manipulative-shell'}>
        <Text testID="shell-count">{count}</Text>
        <View testID="reset-trigger" onTouchEnd={onReset} />
        {children}
      </View>
    ),
  };
});

import { TenFrame } from '@/components/manipulatives/TenFrame/TenFrame';

describe('TenFrame initialFrames prop', () => {
  it('renders one frame by default (initialFrames not provided)', () => {
    const { getByTestId, queryByTestId } = render(
      <TenFrame testID="ten-frame" />,
    );

    expect(getByTestId('ten-frame-1')).toBeTruthy();
    expect(queryByTestId('ten-frame-2')).toBeNull();
  });

  it('renders one frame with initialFrames=1', () => {
    const { getByTestId, queryByTestId } = render(
      <TenFrame testID="ten-frame" initialFrames={1} />,
    );

    expect(getByTestId('ten-frame-1')).toBeTruthy();
    expect(queryByTestId('ten-frame-2')).toBeNull();
  });

  it('renders two frames with initialFrames=2', () => {
    const { getByTestId } = render(
      <TenFrame testID="ten-frame" initialFrames={2} />,
    );

    expect(getByTestId('ten-frame-1')).toBeTruthy();
    expect(getByTestId('ten-frame-2')).toBeTruthy();
  });

  it('reset with initialFrames=2 restores two frames (not one)', () => {
    const { getByTestId, queryByTestId } = render(
      <TenFrame testID="ten-frame" initialFrames={2} />,
    );

    // Both frames present
    expect(getByTestId('ten-frame-1')).toBeTruthy();
    expect(getByTestId('ten-frame-2')).toBeTruthy();

    // Trigger reset
    fireEvent(getByTestId('reset-trigger'), 'touchEnd');

    // After reset, two frames should still be present
    expect(getByTestId('ten-frame-1')).toBeTruthy();
    expect(getByTestId('ten-frame-2')).toBeTruthy();
  });
});
