/**
 * Dispatcher component for pictorial diagrams.
 *
 * Maps ManipulativeType to the correct per-type static SVG renderer.
 * Shown inline between problem text and answer buttons in pictorial CPA mode.
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { spacing } from '@/theme';
import type { ManipulativeType } from '@/services/cpa/cpaTypes';
import type { Problem } from '@/services/mathEngine/types';

import { CountersDiagram } from './CountersDiagram';
import { TenFrameDiagram } from './TenFrameDiagram';
import { BaseTenBlocksDiagram } from './BaseTenBlocksDiagram';
import { NumberLineDiagram } from './NumberLineDiagram';
import { BarModelDiagram } from './BarModelDiagram';
import { FractionStripsDiagram } from './FractionStripsDiagram';

interface PictorialDiagramProps {
  type: ManipulativeType;
  problem: Problem;
  testID?: string;
}

export function PictorialDiagram({ type, problem, testID }: PictorialDiagramProps) {
  let diagram: React.ReactNode;

  switch (type) {
    case 'counters':
      diagram = <CountersDiagram problem={problem} />;
      break;
    case 'ten_frame':
      diagram = <TenFrameDiagram problem={problem} />;
      break;
    case 'base_ten_blocks':
      diagram = <BaseTenBlocksDiagram problem={problem} />;
      break;
    case 'number_line':
      diagram = <NumberLineDiagram problem={problem} />;
      break;
    case 'bar_model':
      diagram = <BarModelDiagram problem={problem} />;
      break;
    case 'fraction_strips':
      diagram = <FractionStripsDiagram problem={problem} />;
      break;
    default:
      return null;
  }

  return (
    <View style={styles.container} testID={testID}>
      {diagram}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    maxHeight: 120,
    alignItems: 'center',
    marginVertical: spacing.md,
  },
});
