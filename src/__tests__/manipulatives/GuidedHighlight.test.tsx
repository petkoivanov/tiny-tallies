import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';

import { GuidedHighlight } from '@/components/manipulatives/shared/GuidedHighlight';

describe('GuidedHighlight', () => {
  it('renders children when active is false', () => {
    const { getByText } = render(
      <GuidedHighlight active={false}>
        <Text>child content</Text>
      </GuidedHighlight>,
    );
    expect(getByText('child content')).toBeTruthy();
  });

  it('renders children when active is true', () => {
    const { getByText } = render(
      <GuidedHighlight active={true}>
        <Text>highlighted content</Text>
      </GuidedHighlight>,
    );
    expect(getByText('highlighted content')).toBeTruthy();
  });

  it('applies testID to container', () => {
    const { getByTestId } = render(
      <GuidedHighlight active={false} testID="guided-wrapper">
        <Text>content</Text>
      </GuidedHighlight>,
    );
    expect(getByTestId('guided-wrapper')).toBeTruthy();
  });

  it('does not crash when toggling active rapidly', () => {
    const { rerender } = render(
      <GuidedHighlight active={false}>
        <Text>content</Text>
      </GuidedHighlight>,
    );

    // Toggle active rapidly without errors
    expect(() => {
      rerender(
        <GuidedHighlight active={true}>
          <Text>content</Text>
        </GuidedHighlight>,
      );
      rerender(
        <GuidedHighlight active={false}>
          <Text>content</Text>
        </GuidedHighlight>,
      );
      rerender(
        <GuidedHighlight active={true}>
          <Text>content</Text>
        </GuidedHighlight>,
      );
    }).not.toThrow();
  });
});
