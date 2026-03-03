/**
 * Static SVG pictorial diagram for ten-frame manipulative.
 *
 * Renders a 2x5 grid of cells representing a ten frame.
 * Addition: fill first `a` cells in primary color, next `b` in yellow.
 * Subtraction: fill `a` cells, X-mark last `b` cells.
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Rect, Line } from 'react-native-svg';

import { colors } from '@/theme';
import type { Problem } from '@/services/mathEngine/types';

const CELL_SIZE = 20;
const GAP = 4;
const COLS = 5;
const ROWS = 2;
const PADDING = 8;
const COLOR_A = colors.primary;
const COLOR_B = '#FACC15';

interface TenFrameDiagramProps {
  problem: Problem;
}

export function TenFrameDiagram({ problem }: TenFrameDiagramProps) {
  const [a, b] = problem.operands;
  const isSubtraction = problem.operation === 'subtraction';
  const totalCells = 10;
  const filledCount = isSubtraction ? a : Math.min(a + b, totalCells);

  const svgWidth = COLS * (CELL_SIZE + GAP) - GAP + PADDING * 2;
  const svgHeight = ROWS * (CELL_SIZE + GAP) - GAP + PADDING * 2;

  const cells: React.ReactNode[] = [];
  for (let i = 0; i < totalCells; i++) {
    const row = Math.floor(i / COLS);
    const col = i % COLS;
    const x = PADDING + col * (CELL_SIZE + GAP);
    const y = PADDING + row * (CELL_SIZE + GAP);

    let fill: string = colors.surface;
    if (i < filledCount) {
      if (isSubtraction) {
        fill = COLOR_A;
      } else {
        fill = i < a ? COLOR_A : COLOR_B;
      }
    }

    cells.push(
      <Rect
        key={`cell-${i}`}
        x={x}
        y={y}
        width={CELL_SIZE}
        height={CELL_SIZE}
        rx={3}
        fill={fill}
        stroke={colors.textSecondary}
        strokeWidth={1}
      />,
    );

    // X-mark subtracted cells
    if (isSubtraction && i >= a - b && i < a) {
      const margin = 4;
      cells.push(
        <React.Fragment key={`x-${i}`}>
          <Line
            x1={x + margin}
            y1={y + margin}
            x2={x + CELL_SIZE - margin}
            y2={y + CELL_SIZE - margin}
            stroke={colors.incorrect}
            strokeWidth={2}
          />
          <Line
            x1={x + CELL_SIZE - margin}
            y1={y + margin}
            x2={x + margin}
            y2={y + CELL_SIZE - margin}
            stroke={colors.incorrect}
            strokeWidth={2}
          />
        </React.Fragment>,
      );
    }
  }

  return (
    <View style={styles.container} testID="pictorial-diagram-ten_frame">
      <Svg width={svgWidth} height={svgHeight}>
        {cells}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
});
