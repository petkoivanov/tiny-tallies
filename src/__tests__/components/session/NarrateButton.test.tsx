import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';

// Mock lucide icons
jest.mock('lucide-react-native', () => {
  const { View } = require('react-native');
  return {
    Volume2: (props: any) => <View testID="volume2-icon" {...props} />,
    VolumeX: (props: any) => <View testID="volumex-icon" {...props} />,
  };
});

// Mock narration service
const mockNarrate = jest.fn().mockResolvedValue(undefined);
const mockStop = jest.fn().mockResolvedValue(undefined);
jest.mock('@/services/narration', () => ({
  narrate: (...args: any[]) => mockNarrate(...args),
  stop: (...args: any[]) => mockStop(...args),
}));

// Mock store
jest.mock('@/store/appStore', () => ({
  useAppStore: (selector: any) => selector({ childAge: 7 }),
}));

import { NarrateButton } from '@/components/session/NarrateButton';

describe('NarrateButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const defaultProps = {
    text: 'Sam has 5 apples.',
    resetKey: 0,
    primaryColor: '#6366f1',
    primaryLightColor: '#818cf8',
  };

  it('renders with volume icon', () => {
    const { getByTestId } = render(<NarrateButton {...defaultProps} />);
    expect(getByTestId('narrate-button')).toBeTruthy();
    expect(getByTestId('volume2-icon')).toBeTruthy();
  });

  it('calls narrate on press', async () => {
    const { getByTestId } = render(<NarrateButton {...defaultProps} />);
    fireEvent.press(getByTestId('narrate-button'));

    await waitFor(() => {
      expect(mockNarrate).toHaveBeenCalledWith('Sam has 5 apples.', 7);
    });
  });

  it('has accessible label "Read aloud"', () => {
    const { getByTestId } = render(<NarrateButton {...defaultProps} />);
    expect(getByTestId('narrate-button').props.accessibilityLabel).toBe(
      'Read aloud',
    );
  });

  it('stops narration when resetKey changes', () => {
    const { rerender } = render(<NarrateButton {...defaultProps} />);
    rerender(<NarrateButton {...defaultProps} resetKey={1} />);

    expect(mockStop).toHaveBeenCalled();
  });

  it('stops narration on unmount', () => {
    const { unmount } = render(<NarrateButton {...defaultProps} />);
    unmount();
    expect(mockStop).toHaveBeenCalled();
  });
});
