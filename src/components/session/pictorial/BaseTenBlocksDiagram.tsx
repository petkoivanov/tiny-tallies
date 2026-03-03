/**
 * Static SVG pictorial diagram for base-ten blocks manipulative.
 *
 * Breaks each operand into hundreds (large square), tens (tall rectangle),
 * and ones (small square). Groups operands with a "+" or "-" symbol.
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';

import { colors } from '@/theme';
import type { Problem } from '@/services/mathEngine/types';

const HUNDRED_SIZE = 30;
const TEN_WIDTH = 8;
const TEN_HEIGHT = 30;
const ONE_SIZE = 8;
const BLOCK_GAP = 3;
const GROUP_GAP = 16;
const PADDING = 8;
const COLOR_A = colors.primary;
const COLOR_B = '#FACC15';

interface BaseTenBlocksDiagramProps {
  problem: Problem;
}

/** Break a number into [hundreds, tens, ones] place-value parts. */
function decompose(n: number): [number, number, number] {
  const hundreds = Math.floor(n / 100);
  const tens = Math.floor((n % 100) / 10);
  const ones = n % 10;
  return [hundreds, tens, ones];
}

/** Render blocks for a single operand, returning elements and total width used. */
function renderOperandBlocks(
  value: number,
  startX: number,
  baseY: number,
  fill: string,
): { elements: React.ReactNode[]; width: number } {
  const [hundreds, tens, ones] = decompose(value);
  const elements: React.ReactNode[] = [];
  let x = startX;
  const key = `${value}-${startX}`;

  // Hundreds blocks
  for (let i = 0; i < hundreds; i++) {
    elements.push(
      <Rect
        key={`h-${key}-${i}`}
        x={x}
        y={baseY - HUNDRED_SIZE}
        width={HUNDRED_SIZE}
        height={HUNDRED_SIZE}
        rx={2}
        fill={fill}
        stroke={colors.textSecondary}
        strokeWidth={0.5}
      />,
    );
    x += HUNDRED_SIZE + BLOCK_GAP;
  }

  // Tens rods
  for (let i = 0; i < tens; i++) {
    elements.push(
      <Rect
        key={`t-${key}-${i}`}
        x={x}
        y={baseY - TEN_HEIGHT}
        width={TEN_WIDTH}
        height={TEN_HEIGHT}
        rx={1}
        fill={fill}
        stroke={colors.textSecondary}
        strokeWidth={0.5}
      />,
    );
    x += TEN_WIDTH + BLOCK_GAP;
  }

  // Ones cubes
  for (let i = 0; i < ones; i++) {
    elements.push(
      <Rect
        key={`o-${key}-${i}`}
        x={x}
        y={baseY - ONE_SIZE}
        width={ONE_SIZE}
        height={ONE_SIZE}
        rx={1}
        fill={fill}
        stroke={colors.textSecondary}
        strokeWidth={0.5}
      />,
    );
    x += ONE_SIZE + BLOCK_GAP;
  }

  return { elements, width: x - startX };
}

export function BaseTenBlocksDiagram({ problem }: BaseTenBlocksDiagramProps) {
  const [a, b] = problem.operands;
  const symbol = problem.operation === 'addition' ? '+' : '\u2212';
  const baseY = PADDING + TEN_HEIGHT;

  const groupA = renderOperandBlocks(a, PADDING, baseY, COLOR_A);
  const symbolX = PADDING + groupA.width + GROUP_GAP / 2;
  const groupBStartX = symbolX + GROUP_GAP / 2 + 8;
  const groupB = renderOperandBlocks(b, groupBStartX, baseY, COLOR_B);

  const svgWidth = groupBStartX + groupB.width + PADDING;
  const svgHeight = baseY + PADDING + 14;

  return (
    <View style={styles.container} testID="pictorial-diagram-base_ten_blocks">
      <Svg width={svgWidth} height={svgHeight}>
        {groupA.elements}
        <SvgText
          x={symbolX}
          y={baseY - TEN_HEIGHT / 2 + 5}
          fill={colors.textPrimary}
          fontSize={16}
          fontWeight="bold"
          textAnchor="middle"
        >
          {symbol}
        </SvgText>
        {groupB.elements}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
});
