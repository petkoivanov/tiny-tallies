import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';

import { SnapZone } from '@/components/manipulatives/shared/SnapZone';

describe('SnapZone', () => {
  const onMeasured = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders children', () => {
    const { getByText } = render(
      <SnapZone
        id="zone-1"
        onMeasured={onMeasured}
        accessibilityLabel="Drop zone 1"
      >
        <Text>drop here</Text>
      </SnapZone>,
    );
    expect(getByText('drop here')).toBeTruthy();
  });

  it('renders with correct accessibilityLabel', () => {
    const { getByLabelText } = render(
      <SnapZone
        id="zone-2"
        onMeasured={onMeasured}
        accessibilityLabel="Ones place"
      >
        <Text>zone</Text>
      </SnapZone>,
    );
    expect(getByLabelText('Ones place')).toBeTruthy();
  });

  it('renders with correct testID', () => {
    const { getByTestId } = render(
      <SnapZone
        id="zone-3"
        onMeasured={onMeasured}
        accessibilityLabel="Zone 3"
      />,
    );
    expect(getByTestId('snap-zone-zone-3')).toBeTruthy();
  });

  it('applies occupied style when isOccupied is true', () => {
    const { getByTestId } = render(
      <SnapZone
        id="zone-occ"
        onMeasured={onMeasured}
        isOccupied
        accessibilityLabel="Occupied zone"
      />,
    );
    const zone = getByTestId('snap-zone-zone-occ');
    const flatStyle = Array.isArray(zone.props.style)
      ? Object.assign({}, ...zone.props.style.flat(Infinity).filter(Boolean))
      : zone.props.style;
    expect(flatStyle.borderStyle).toBe('solid');
    expect(flatStyle.borderColor).toBe('#5A7FFF');
  });

  it('applies active style when isActive is true', () => {
    const { getByTestId } = render(
      <SnapZone
        id="zone-act"
        onMeasured={onMeasured}
        isActive
        accessibilityLabel="Active zone"
      />,
    );
    const zone = getByTestId('snap-zone-zone-act');
    const flatStyle = Array.isArray(zone.props.style)
      ? Object.assign({}, ...zone.props.style.flat(Infinity).filter(Boolean))
      : zone.props.style;
    expect(flatStyle.borderColor).toBe('#7C9CFF');
  });

  it('applies custom style', () => {
    const { getByTestId } = render(
      <SnapZone
        id="zone-styled"
        onMeasured={onMeasured}
        accessibilityLabel="Custom zone"
        style={{ width: 120, height: 120 }}
      />,
    );
    const zone = getByTestId('snap-zone-zone-styled');
    const flatStyle = Array.isArray(zone.props.style)
      ? Object.assign({}, ...zone.props.style.flat(Infinity).filter(Boolean))
      : zone.props.style;
    expect(flatStyle).toMatchObject({ width: 120, height: 120 });
  });
});
