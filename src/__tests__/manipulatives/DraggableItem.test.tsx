import React from 'react';
import { render } from '@testing-library/react-native';
import { View, Text } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';

import { DraggableItem } from '@/components/manipulatives/shared/DraggableItem';
import type { SnapTarget } from '@/components/manipulatives/shared/types';

// Wrapper that provides snapTargets as SharedValue
function TestWrapper({
  children,
  ...props
}: Omit<
  React.ComponentProps<typeof DraggableItem>,
  'snapTargets' | 'children'
> & { children?: React.ReactNode }) {
  const snapTargets = useSharedValue<SnapTarget[]>([]);
  return (
    <DraggableItem snapTargets={snapTargets} {...props}>
      {children ?? <Text>drag me</Text>}
    </DraggableItem>
  );
}

describe('DraggableItem', () => {
  it('renders children', () => {
    const { getByText } = render(
      <TestWrapper id="item-1" accessibilityLabel="Block 1">
        <Text>child content</Text>
      </TestWrapper>,
    );
    expect(getByText('child content')).toBeTruthy();
  });

  it('renders with correct accessibilityLabel', () => {
    const { getByLabelText } = render(
      <TestWrapper id="item-2" accessibilityLabel="Red block">
        <Text>block</Text>
      </TestWrapper>,
    );
    expect(getByLabelText('Red block')).toBeTruthy();
  });

  it('renders with correct testID from id prop', () => {
    const { getByTestId } = render(
      <TestWrapper id="block-3" accessibilityLabel="Block 3">
        <Text>block</Text>
      </TestWrapper>,
    );
    expect(getByTestId('block-3')).toBeTruthy();
  });

  it('applies custom style', () => {
    const { getByTestId } = render(
      <TestWrapper
        id="styled-item"
        accessibilityLabel="Styled block"
        style={{ backgroundColor: '#ff0000' }}
      >
        <Text>styled</Text>
      </TestWrapper>,
    );
    const item = getByTestId('styled-item');
    // StyleSheet.flatten the style array -- the custom style should be present
    const flatStyle = Array.isArray(item.props.style)
      ? Object.assign({}, ...item.props.style.flat(Infinity).filter(Boolean))
      : item.props.style;
    expect(flatStyle).toMatchObject({ backgroundColor: '#ff0000' });
  });

  it('calls onRegister with id and offsets on mount', () => {
    const onRegister = jest.fn();
    render(
      <TestWrapper
        id="reg-item"
        accessibilityLabel="Registered block"
        onRegister={onRegister}
      >
        <Text>reg</Text>
      </TestWrapper>,
    );
    expect(onRegister).toHaveBeenCalledWith('reg-item', {
      offsetX: expect.objectContaining({ value: 0 }),
      offsetY: expect.objectContaining({ value: 0 }),
    });
  });

  it('renders with minimum touch target dimensions', () => {
    const { getByTestId } = render(
      <TestWrapper id="touch-item" accessibilityLabel="Touch target">
        <View style={{ width: 10, height: 10 }} />
      </TestWrapper>,
    );
    const item = getByTestId('touch-item');
    const flatStyle = Array.isArray(item.props.style)
      ? Object.assign({}, ...item.props.style.flat(Infinity).filter(Boolean))
      : item.props.style;
    expect(flatStyle.minWidth).toBe(48);
    expect(flatStyle.minHeight).toBe(48);
  });
});
