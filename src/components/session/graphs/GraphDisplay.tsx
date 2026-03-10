/**
 * GraphDisplay — dispatcher component that renders the appropriate graph
 * based on the GraphData discriminated union type.
 *
 * Used by CpaSessionContent to render graph visuals alongside
 * Data & Statistics domain questions.
 */
import React from 'react';
import type { GraphData } from './types';
import { PictureGraph } from './PictureGraph';
import { BarGraph } from './BarGraph';
import { TallyChart } from './TallyChart';
import { DotPlot } from './DotPlot';
import { BoxPlot } from './BoxPlot';
import { ScatterPlot } from './ScatterPlot';
import { Histogram } from './Histogram';

interface GraphDisplayProps {
  data: GraphData;
  width?: number;
  testID?: string;
}

export function GraphDisplay({ data, width, testID }: GraphDisplayProps) {
  switch (data.type) {
    case 'picture_graph':
      return <PictureGraph data={data} width={width} testID={testID} />;
    case 'bar_graph':
      return <BarGraph data={data} width={width} testID={testID} />;
    case 'tally_chart':
      return <TallyChart data={data} width={width} testID={testID} />;
    case 'dot_plot':
      return <DotPlot data={data} width={width} testID={testID} />;
    case 'box_plot':
      return <BoxPlot data={data} width={width} testID={testID} />;
    case 'scatter_plot':
      return <ScatterPlot data={data} width={width} testID={testID} />;
    case 'histogram':
      return <Histogram data={data} width={width} testID={testID} />;
  }
}
