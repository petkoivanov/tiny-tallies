import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { PrivacyDisclosure } from '@/components/profile/PrivacyDisclosure';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('@/theme', () => ({
  useTheme: () => ({
    colors: {
      background: '#1a1a2e',
      surface: '#2a2a3e',
      primary: '#6366f1',
      textPrimary: '#ffffff',
      textSecondary: '#aaaaaa',
    },
  }),
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 },
  typography: {
    fontFamily: {
      regular: 'System',
      medium: 'System',
      semiBold: 'System',
      bold: 'System',
    },
    fontSize: { xs: 12, sm: 14, md: 16, lg: 20, xl: 24 },
  },
  layout: {
    borderRadius: { sm: 8, md: 12, lg: 16, xl: 24, round: 9999 },
    minTouchTarget: 48,
  },
}));

describe('PrivacyDisclosure', () => {
  const mockOnAccept = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the privacy disclosure screen', () => {
    const { getByText } = render(
      <PrivacyDisclosure onAccept={mockOnAccept} />,
    );
    expect(getByText('Privacy & Data')).toBeTruthy();
    expect(getByText('I Understand')).toBeTruthy();
  });

  it('displays all data sections', () => {
    const { getByText } = render(
      <PrivacyDisclosure onAccept={mockOnAccept} />,
    );
    expect(getByText('What we store locally')).toBeTruthy();
    expect(getByText('Cloud sync (when signed in)')).toBeTruthy();
    expect(getByText('AI Helper (optional)')).toBeTruthy();
    expect(getByText('Error tracking')).toBeTruthy();
  });

  it('mentions key privacy details', () => {
    const { getByText } = render(
      <PrivacyDisclosure onAccept={mockOnAccept} />,
    );
    expect(
      getByText('No personal information is sent to the AI'),
    ).toBeTruthy();
    expect(
      getByText('You can opt out anytime from Parental Controls'),
    ).toBeTruthy();
  });

  it('calls onAccept when button pressed', () => {
    const { getByTestId } = render(
      <PrivacyDisclosure onAccept={mockOnAccept} />,
    );
    fireEvent.press(getByTestId('privacy-accept-button'));
    expect(mockOnAccept).toHaveBeenCalledTimes(1);
  });

  it('has correct accessibility label on accept button', () => {
    const { getByTestId } = render(
      <PrivacyDisclosure onAccept={mockOnAccept} />,
    );
    const btn = getByTestId('privacy-accept-button');
    expect(btn.props.accessibilityLabel).toBe(
      'I understand, continue to profile setup',
    );
  });
});
