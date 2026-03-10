import React from 'react';
import { render } from '@testing-library/react-native';

jest.mock('react-native-svg', () => {
  const React = require('react');
  const { View, Text } = require('react-native');

  const createMock = (name: string) =>
    React.forwardRef(({ children, testID, ...props }: any, ref: any) =>
      React.createElement(
        View,
        { ...props, testID: testID || name, ref },
        children,
      ),
    );

  return {
    __esModule: true,
    default: createMock('Svg'),
    Svg: createMock('Svg'),
    Circle: createMock('Circle'),
    Line: createMock('Line'),
    Rect: createMock('Rect'),
    Text: ({ children, ...props }: any) =>
      React.createElement(Text, props, children),
    G: createMock('G'),
    Path: createMock('Path'),
  };
});

import { PictureGraph } from '@/components/session/graphs/PictureGraph';
import { BarGraph } from '@/components/session/graphs/BarGraph';
import { TallyChart } from '@/components/session/graphs/TallyChart';
import { DotPlot } from '@/components/session/graphs/DotPlot';
import { BoxPlot } from '@/components/session/graphs/BoxPlot';
import { ScatterPlot } from '@/components/session/graphs/ScatterPlot';
import { Histogram } from '@/components/session/graphs/Histogram';
import { GraphDisplay } from '@/components/session/graphs/GraphDisplay';
import type {
  PictureGraphData,
  BarGraphData,
  TallyChartData,
  DotPlotData,
  BoxPlotData,
  ScatterPlotData,
  HistogramData,
} from '@/components/session/graphs/types';

// ─── PictureGraph ───────────────────────────────────────────────────────────

describe('PictureGraph', () => {
  const sampleData: PictureGraphData = {
    type: 'picture_graph',
    categories: [
      { label: 'Cats', value: 3 },
      { label: 'Dogs', value: 5 },
      { label: 'Fish', value: 2 },
    ],
    icon: '⭐',
    scale: 1,
    title: 'Favorite Pets',
  };

  it('renders with testID', () => {
    const { getByTestId } = render(<PictureGraph data={sampleData} />);
    expect(getByTestId('picture-graph')).toBeTruthy();
  });

  it('renders category labels', () => {
    const { getByText } = render(<PictureGraph data={sampleData} />);
    expect(getByText('Cats')).toBeTruthy();
    expect(getByText('Dogs')).toBeTruthy();
    expect(getByText('Fish')).toBeTruthy();
  });

  it('renders title', () => {
    const { getByText } = render(<PictureGraph data={sampleData} />);
    expect(getByText('Favorite Pets')).toBeTruthy();
  });

  it('renders icons for each count', () => {
    const { getAllByText } = render(<PictureGraph data={sampleData} />);
    // 3 + 5 + 2 = 10 star icons
    const stars = getAllByText('⭐');
    expect(stars.length).toBe(10);
  });

  it('shows scale key when scale > 1', () => {
    const scaledData: PictureGraphData = {
      ...sampleData,
      scale: 2,
    };
    const { getByText } = render(<PictureGraph data={scaledData} />);
    expect(getByText('Each ⭐ = 2')).toBeTruthy();
  });

  it('does not show scale key when scale is 1', () => {
    const { queryByText } = render(<PictureGraph data={sampleData} />);
    expect(queryByText(/Each/)).toBeNull();
  });

  it('sets accessibility label from title', () => {
    const { getByTestId } = render(<PictureGraph data={sampleData} />);
    expect(getByTestId('picture-graph').props.accessibilityLabel).toBe(
      'Favorite Pets',
    );
  });

  it('accepts custom testID', () => {
    const { getByTestId } = render(
      <PictureGraph data={sampleData} testID="custom-pg" />,
    );
    expect(getByTestId('custom-pg')).toBeTruthy();
  });
});

// ─── BarGraph ───────────────────────────────────────────────────────────────

describe('BarGraph', () => {
  const sampleData: BarGraphData = {
    type: 'bar_graph',
    categories: [
      { label: 'Red', value: 4 },
      { label: 'Blue', value: 7 },
      { label: 'Green', value: 3 },
    ],
    yLabel: 'Count',
    title: 'Favorite Colors',
  };

  it('renders with testID', () => {
    const { getByTestId } = render(<BarGraph data={sampleData} />);
    expect(getByTestId('bar-graph')).toBeTruthy();
  });

  it('renders category labels', () => {
    const { getByText } = render(<BarGraph data={sampleData} />);
    expect(getByText('Red')).toBeTruthy();
    expect(getByText('Blue')).toBeTruthy();
    expect(getByText('Green')).toBeTruthy();
  });

  it('renders title', () => {
    const { getByText } = render(<BarGraph data={sampleData} />);
    expect(getByText('Favorite Colors')).toBeTruthy();
  });

  it('renders y-axis label', () => {
    const { getByText } = render(<BarGraph data={sampleData} />);
    expect(getByText('Count')).toBeTruthy();
  });

  it('renders y-axis tick values', () => {
    const { getByText } = render(<BarGraph data={sampleData} />);
    // maxVal = 10 (niceMax of 7), step = 2
    expect(getByText('0')).toBeTruthy();
    expect(getByText('2')).toBeTruthy();
    expect(getByText('4')).toBeTruthy();
  });

  it('sets accessibility label', () => {
    const { getByTestId } = render(<BarGraph data={sampleData} />);
    expect(getByTestId('bar-graph').props.accessibilityLabel).toBe(
      'Favorite Colors',
    );
  });
});

// ─── TallyChart ─────────────────────────────────────────────────────────────

describe('TallyChart', () => {
  const sampleData: TallyChartData = {
    type: 'tally_chart',
    categories: [
      { label: 'Apples', value: 7 },
      { label: 'Bananas', value: 3 },
      { label: 'Oranges', value: 12 },
    ],
    title: 'Fruit Count',
  };

  it('renders with testID', () => {
    const { getByTestId } = render(<TallyChart data={sampleData} />);
    expect(getByTestId('tally-chart')).toBeTruthy();
  });

  it('renders category labels', () => {
    const { getByText } = render(<TallyChart data={sampleData} />);
    expect(getByText('Apples')).toBeTruthy();
    expect(getByText('Bananas')).toBeTruthy();
    expect(getByText('Oranges')).toBeTruthy();
  });

  it('renders numeric totals', () => {
    const { getByText } = render(<TallyChart data={sampleData} />);
    expect(getByText('7')).toBeTruthy();
    expect(getByText('3')).toBeTruthy();
    expect(getByText('12')).toBeTruthy();
  });

  it('renders title', () => {
    const { getByText } = render(<TallyChart data={sampleData} />);
    expect(getByText('Fruit Count')).toBeTruthy();
  });

  it('renders column headers', () => {
    const { getByText } = render(<TallyChart data={sampleData} />);
    expect(getByText('Item')).toBeTruthy();
    expect(getByText('Tally')).toBeTruthy();
    expect(getByText('Total')).toBeTruthy();
  });
});

// ─── DotPlot ────────────────────────────────────────────────────────────────

describe('DotPlot', () => {
  const sampleData: DotPlotData = {
    type: 'dot_plot',
    values: [1, 2, 2, 3, 3, 3, 4, 4, 5],
    min: 1,
    max: 5,
    step: 1,
    label: 'Number of Siblings',
    title: 'Siblings Survey',
  };

  it('renders with testID', () => {
    const { getByTestId } = render(<DotPlot data={sampleData} />);
    expect(getByTestId('dot-plot')).toBeTruthy();
  });

  it('renders title', () => {
    const { getByText } = render(<DotPlot data={sampleData} />);
    expect(getByText('Siblings Survey')).toBeTruthy();
  });

  it('renders tick labels for each value', () => {
    const { getByText } = render(<DotPlot data={sampleData} />);
    for (let v = 1; v <= 5; v++) {
      expect(getByText(String(v))).toBeTruthy();
    }
  });

  it('renders x-axis label', () => {
    const { getByText } = render(<DotPlot data={sampleData} />);
    expect(getByText('Number of Siblings')).toBeTruthy();
  });

  it('sets accessibility label', () => {
    const { getByTestId } = render(<DotPlot data={sampleData} />);
    expect(getByTestId('dot-plot').props.accessibilityLabel).toBe(
      'Siblings Survey',
    );
  });
});

// ─── BoxPlot ────────────────────────────────────────────────────────────────

describe('BoxPlot', () => {
  const sampleData: BoxPlotData = {
    type: 'box_plot',
    min: 10,
    q1: 25,
    median: 35,
    q3: 45,
    max: 60,
    label: 'Test Scores',
    title: 'Math Test Results',
  };

  it('renders with testID', () => {
    const { getByTestId } = render(<BoxPlot data={sampleData} />);
    expect(getByTestId('box-plot')).toBeTruthy();
  });

  it('renders title', () => {
    const { getByText } = render(<BoxPlot data={sampleData} />);
    expect(getByText('Math Test Results')).toBeTruthy();
  });

  it('renders axis label', () => {
    const { getByText } = render(<BoxPlot data={sampleData} />);
    expect(getByText('Test Scores')).toBeTruthy();
  });

  it('renders tick marks along axis', () => {
    const { getByText } = render(<BoxPlot data={sampleData} />);
    // With range 50, step 10: 10, 20, 30, 40, 50, 60
    expect(getByText('10')).toBeTruthy();
    expect(getByText('20')).toBeTruthy();
    expect(getByText('30')).toBeTruthy();
  });

  it('sets accessibility label', () => {
    const { getByTestId } = render(<BoxPlot data={sampleData} />);
    expect(getByTestId('box-plot').props.accessibilityLabel).toBe(
      'Math Test Results',
    );
  });
});

// ─── ScatterPlot ────────────────────────────────────────────────────────────

describe('ScatterPlot', () => {
  const sampleData: ScatterPlotData = {
    type: 'scatter_plot',
    points: [
      { x: 1, y: 2 },
      { x: 2, y: 4 },
      { x: 3, y: 5 },
      { x: 4, y: 8 },
      { x: 5, y: 9 },
    ],
    xLabel: 'Hours Studied',
    yLabel: 'Score',
    title: 'Study Time vs Score',
  };

  it('renders with testID', () => {
    const { getByTestId } = render(<ScatterPlot data={sampleData} />);
    expect(getByTestId('scatter-plot')).toBeTruthy();
  });

  it('renders title', () => {
    const { getByText } = render(<ScatterPlot data={sampleData} />);
    expect(getByText('Study Time vs Score')).toBeTruthy();
  });

  it('renders axis labels', () => {
    const { getByText } = render(<ScatterPlot data={sampleData} />);
    expect(getByText('Hours Studied')).toBeTruthy();
    expect(getByText('Score')).toBeTruthy();
  });

  it('renders without trend line by default', () => {
    const { getByTestId } = render(<ScatterPlot data={sampleData} />);
    expect(getByTestId('scatter-plot')).toBeTruthy();
  });

  it('renders with trend line', () => {
    const withTrend: ScatterPlotData = {
      ...sampleData,
      trendLine: { slope: 1.8, intercept: 0.2 },
    };
    const { getByTestId } = render(<ScatterPlot data={withTrend} />);
    expect(getByTestId('scatter-plot')).toBeTruthy();
  });

  it('sets accessibility label', () => {
    const { getByTestId } = render(<ScatterPlot data={sampleData} />);
    expect(getByTestId('scatter-plot').props.accessibilityLabel).toBe(
      'Study Time vs Score',
    );
  });
});

// ─── Histogram ──────────────────────────────────────────────────────────────

describe('Histogram', () => {
  const sampleData: HistogramData = {
    type: 'histogram',
    bins: [
      { range: '0-9', count: 2 },
      { range: '10-19', count: 5 },
      { range: '20-29', count: 8 },
      { range: '30-39', count: 3 },
    ],
    xLabel: 'Score Range',
    yLabel: 'Frequency',
    title: 'Test Score Distribution',
  };

  it('renders with testID', () => {
    const { getByTestId } = render(<Histogram data={sampleData} />);
    expect(getByTestId('histogram')).toBeTruthy();
  });

  it('renders title', () => {
    const { getByText } = render(<Histogram data={sampleData} />);
    expect(getByText('Test Score Distribution')).toBeTruthy();
  });

  it('renders bin range labels', () => {
    const { getByText } = render(<Histogram data={sampleData} />);
    expect(getByText('0-9')).toBeTruthy();
    expect(getByText('10-19')).toBeTruthy();
    expect(getByText('20-29')).toBeTruthy();
    expect(getByText('30-39')).toBeTruthy();
  });

  it('renders axis labels', () => {
    const { getByText } = render(<Histogram data={sampleData} />);
    expect(getByText('Score Range')).toBeTruthy();
    expect(getByText('Frequency')).toBeTruthy();
  });

  it('sets accessibility label', () => {
    const { getByTestId } = render(<Histogram data={sampleData} />);
    expect(getByTestId('histogram').props.accessibilityLabel).toBe(
      'Test Score Distribution',
    );
  });
});

// ─── GraphDisplay (dispatcher) ──────────────────────────────────────────────

describe('GraphDisplay', () => {
  it('dispatches to PictureGraph', () => {
    const data: PictureGraphData = {
      type: 'picture_graph',
      categories: [{ label: 'A', value: 2 }],
      icon: '🍎',
      scale: 1,
    };
    const { getByTestId } = render(<GraphDisplay data={data} />);
    expect(getByTestId('picture-graph')).toBeTruthy();
  });

  it('dispatches to BarGraph', () => {
    const data: BarGraphData = {
      type: 'bar_graph',
      categories: [{ label: 'X', value: 5 }],
    };
    const { getByTestId } = render(<GraphDisplay data={data} />);
    expect(getByTestId('bar-graph')).toBeTruthy();
  });

  it('dispatches to TallyChart', () => {
    const data: TallyChartData = {
      type: 'tally_chart',
      categories: [{ label: 'Y', value: 3 }],
    };
    const { getByTestId } = render(<GraphDisplay data={data} />);
    expect(getByTestId('tally-chart')).toBeTruthy();
  });

  it('dispatches to DotPlot', () => {
    const data: DotPlotData = {
      type: 'dot_plot',
      values: [1, 2, 3],
      min: 1,
      max: 3,
      step: 1,
    };
    const { getByTestId } = render(<GraphDisplay data={data} />);
    expect(getByTestId('dot-plot')).toBeTruthy();
  });

  it('dispatches to BoxPlot', () => {
    const data: BoxPlotData = {
      type: 'box_plot',
      min: 1,
      q1: 3,
      median: 5,
      q3: 7,
      max: 10,
    };
    const { getByTestId } = render(<GraphDisplay data={data} />);
    expect(getByTestId('box-plot')).toBeTruthy();
  });

  it('dispatches to ScatterPlot', () => {
    const data: ScatterPlotData = {
      type: 'scatter_plot',
      points: [{ x: 1, y: 2 }],
      xLabel: 'X',
      yLabel: 'Y',
    };
    const { getByTestId } = render(<GraphDisplay data={data} />);
    expect(getByTestId('scatter-plot')).toBeTruthy();
  });

  it('dispatches to Histogram', () => {
    const data: HistogramData = {
      type: 'histogram',
      bins: [{ range: '0-5', count: 3 }],
    };
    const { getByTestId } = render(<GraphDisplay data={data} />);
    expect(getByTestId('histogram')).toBeTruthy();
  });

  it('passes custom testID through', () => {
    const data: BarGraphData = {
      type: 'bar_graph',
      categories: [{ label: 'Z', value: 1 }],
    };
    const { getByTestId } = render(
      <GraphDisplay data={data} testID="custom-graph" />,
    );
    expect(getByTestId('custom-graph')).toBeTruthy();
  });
});
