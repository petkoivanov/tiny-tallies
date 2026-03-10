import React from 'react';
import { render } from '@testing-library/react-native';

// Mock react-native-svg
jest.mock('react-native-svg', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: (props: any) => <View testID="svg" {...props} />,
    Circle: (props: any) => <View testID="svg-circle" {...props} />,
  };
});

// Mock theme
jest.mock('@/theme', () => ({
  useTheme: () => ({
    colors: {
      correct: '#22c55e',
      primary: '#6366f1',
      backgroundLight: '#333',
      textPrimary: '#ffffff',
      textMuted: '#777777',
    },
  }),
  spacing: { xs: 4, sm: 8, md: 16, lg: 24 },
  typography: {
    fontFamily: { regular: 'System', bold: 'System' },
    fontSize: { xs: 12, xxl: 28 },
  },
}));

import { MasteryDonutChart } from '@/components/reports/MasteryDonutChart';

describe('MasteryDonutChart', () => {
  it('renders with testID', () => {
    const { getByTestId } = render(
      <MasteryDonutChart mastered={5} inProgress={3} notStarted={2} />,
    );
    expect(getByTestId('mastery-donut-chart')).toBeTruthy();
  });

  it('displays mastered count in center', () => {
    const { getByText } = render(
      <MasteryDonutChart mastered={12} inProgress={5} notStarted={3} />,
    );
    expect(getByText('12')).toBeTruthy();
    expect(getByText('mastered')).toBeTruthy();
  });

  it('renders SVG circles for each non-zero segment', () => {
    const { getAllByTestId } = render(
      <MasteryDonutChart mastered={5} inProgress={3} notStarted={2} />,
    );
    // 3 segments: mastered, inProgress, notStarted
    expect(getAllByTestId('svg-circle')).toHaveLength(3);
  });

  it('renders only 2 circles when one segment is zero', () => {
    const { getAllByTestId } = render(
      <MasteryDonutChart mastered={5} inProgress={5} notStarted={0} />,
    );
    expect(getAllByTestId('svg-circle')).toHaveLength(2);
  });

  it('renders no circles when all counts are zero', () => {
    const { queryAllByTestId } = render(
      <MasteryDonutChart mastered={0} inProgress={0} notStarted={0} />,
    );
    expect(queryAllByTestId('svg-circle')).toHaveLength(0);
  });

  it('displays zero mastered count', () => {
    const { getByText } = render(
      <MasteryDonutChart mastered={0} inProgress={3} notStarted={7} />,
    );
    expect(getByText('0')).toBeTruthy();
  });
});
