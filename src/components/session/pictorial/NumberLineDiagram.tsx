/**
 * Static SVG pictorial diagram for number line manipulative.
 *
 * Renders a horizontal number line with tick marks, labels,
 * and a hop arrow from the first operand to the answer.
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Line, Text as SvgText, Path } from 'react-native-svg';

import { useTheme } from '@/theme';
import { answerNumericValue } from '@/services/mathEngine/types';
import type { Problem } from '@/services/mathEngine/types';

const SVG_WIDTH = 260;
const SVG_HEIGHT = 70;
const LINE_Y = 45;
const PAD = 20;
const TICK_H = 8;
const LABEL_SIZE = 10;

interface NumberLineDiagramProps {
  problem: Problem;
}

/** Map a value to an X pixel coordinate. */
function valueToX(value: number, rangeMax: number): number {
  if (rangeMax === 0) return PAD;
  return PAD + ((value / rangeMax) * (SVG_WIDTH - PAD * 2));
}

export function NumberLineDiagram({ problem }: NumberLineDiagramProps) {
  const { colors } = useTheme();
  const arcColor = colors.correct;

  const [a, b] = problem.operands;
  const answer = answerNumericValue(problem.correctAnswer);
  const rangeMax = Math.ceil(Math.max(a, b, answer) / 10) * 10 || 10;

  // Determine tick interval: every 1 for small ranges, every 5 or 10 for larger
  let tickInterval = 1;
  if (rangeMax > 20) tickInterval = 10;
  else if (rangeMax > 10) tickInterval = 5;

  const ticks: number[] = [];
  for (let v = 0; v <= rangeMax; v += tickInterval) {
    ticks.push(v);
  }

  // Ensure key values are in ticks
  const keyValues = [a, answer];
  for (const kv of keyValues) {
    if (kv >= 0 && kv <= rangeMax && !ticks.includes(kv)) {
      ticks.push(kv);
    }
  }
  ticks.sort((x, y) => x - y);

  // Hop arrow from start to answer
  const isAddition = problem.operation === 'addition';
  const hopFrom = isAddition ? a : a;
  const hopTo = answer;
  const fromX = valueToX(hopFrom, rangeMax);
  const toX = valueToX(hopTo, rangeMax);
  const midX = (fromX + toX) / 2;
  const arcHeight = Math.min(20, Math.abs(toX - fromX) * 0.35);
  const peakY = LINE_Y - arcHeight - 10;
  const arcPath = `M ${fromX} ${LINE_Y} Q ${midX} ${peakY} ${toX} ${LINE_Y}`;

  // Arrow head
  const arrowSize = 4;
  const angle = Math.atan2(LINE_Y - peakY, toX - midX);
  const a1x = toX - arrowSize * Math.cos(angle - 0.5);
  const a1y = LINE_Y - arrowSize * Math.sin(angle - 0.5);
  const a2x = toX - arrowSize * Math.cos(angle + 0.5);
  const a2y = LINE_Y - arrowSize * Math.sin(angle + 0.5);
  const arrowPath = `M ${a1x} ${a1y} L ${toX} ${LINE_Y} L ${a2x} ${a2y}`;

  // Hop label
  const hopLabel = isAddition ? `+${b}` : `\u2212${b}`;

  return (
    <View style={styles.container} testID="pictorial-diagram-number_line">
      <Svg width={SVG_WIDTH} height={SVG_HEIGHT}>
        {/* Base line */}
        <Line
          x1={PAD}
          y1={LINE_Y}
          x2={SVG_WIDTH - PAD}
          y2={LINE_Y}
          stroke={colors.textSecondary}
          strokeWidth={2}
        />

        {/* Ticks and labels */}
        {ticks.map((v) => {
          const x = valueToX(v, rangeMax);
          const isKey = v === a || v === answer || v === 0;
          return (
            <React.Fragment key={`tick-${v}`}>
              <Line
                x1={x}
                y1={LINE_Y - TICK_H / 2}
                x2={x}
                y2={LINE_Y + TICK_H / 2}
                stroke={colors.textSecondary}
                strokeWidth={isKey ? 2 : 1}
              />
              <SvgText
                x={x}
                y={LINE_Y + TICK_H / 2 + LABEL_SIZE + 2}
                fill={isKey ? colors.textPrimary : colors.textMuted}
                fontSize={LABEL_SIZE}
                fontWeight={isKey ? 'bold' : 'normal'}
                textAnchor="middle"
              >
                {String(v)}
              </SvgText>
            </React.Fragment>
          );
        })}

        {/* Hop arc */}
        <Path d={arcPath} stroke={arcColor} strokeWidth={2} fill="none" />
        <Path d={arrowPath} stroke={arcColor} strokeWidth={2} fill="none" />
        <SvgText
          x={midX}
          y={peakY - 3}
          fill={arcColor}
          fontSize={10}
          fontWeight="bold"
          textAnchor="middle"
        >
          {hopLabel}
        </SvgText>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
});
