/**
 * PictureGraph — SVG picture graph with rows of icons per category.
 *
 * Each icon represents `scale` units. Categories displayed as rows
 * with labels on the left and repeated icons to the right.
 * Designed for grades 1-2 with large, readable symbols.
 */
import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Text as SvgText, Rect } from 'react-native-svg';
import { useTheme } from '@/theme';
import type { PictureGraphData } from './types';

interface PictureGraphProps {
  data: PictureGraphData;
  width?: number;
  testID?: string;
}

const LABEL_WIDTH = 60;
const ICON_SIZE = 24;
const ICON_GAP = 4;
const ROW_HEIGHT = 32;
const TITLE_HEIGHT = 24;
const SCALE_LABEL_HEIGHT = 20;

export function PictureGraph({
  data,
  width = 280,
  testID = 'picture-graph',
}: PictureGraphProps) {
  const { colors } = useTheme();

  const maxValue = useMemo(
    () => Math.max(...data.categories.map((c) => c.value), 1),
    [data.categories],
  );

  const maxIcons = Math.ceil(maxValue / data.scale);
  const chartWidth = LABEL_WIDTH + maxIcons * (ICON_SIZE + ICON_GAP) + 8;
  const svgWidth = Math.min(chartWidth, width);
  const hasTitle = !!data.title;
  const topOffset = hasTitle ? TITLE_HEIGHT : 0;
  const svgHeight =
    topOffset +
    data.categories.length * ROW_HEIGHT +
    (data.scale > 1 ? SCALE_LABEL_HEIGHT : 0);

  return (
    <View
      style={styles.container}
      testID={testID}
      accessibilityRole="image"
      accessibilityLabel={
        data.title ?? `Picture graph with ${data.categories.length} categories`
      }
    >
      <Svg width={svgWidth} height={svgHeight}>
        {hasTitle && (
          <SvgText
            x={svgWidth / 2}
            y={16}
            textAnchor="middle"
            fontSize={14}
            fontWeight="600"
            fill={colors.textPrimary}
          >
            {data.title}
          </SvgText>
        )}

        {data.categories.map((cat, i) => {
          const y = topOffset + i * ROW_HEIGHT;
          const iconCount = Math.round(cat.value / data.scale);

          return (
            <React.Fragment key={cat.label}>
              {/* Row background */}
              {i % 2 === 0 && (
                <Rect
                  x={0}
                  y={y}
                  width={svgWidth}
                  height={ROW_HEIGHT}
                  fill={colors.backgroundLight}
                  opacity={0.3}
                />
              )}

              {/* Category label */}
              <SvgText
                x={LABEL_WIDTH - 8}
                y={y + ROW_HEIGHT / 2 + 1}
                textAnchor="end"
                alignmentBaseline="central"
                fontSize={12}
                fill={colors.textPrimary}
              >
                {cat.label}
              </SvgText>

              {/* Icons */}
              {Array.from({ length: iconCount }).map((_, j) => (
                <SvgText
                  key={j}
                  x={LABEL_WIDTH + j * (ICON_SIZE + ICON_GAP) + ICON_SIZE / 2}
                  y={y + ROW_HEIGHT / 2 + 1}
                  textAnchor="middle"
                  alignmentBaseline="central"
                  fontSize={18}
                >
                  {data.icon}
                </SvgText>
              ))}
            </React.Fragment>
          );
        })}

        {/* Scale key */}
        {data.scale > 1 && (
          <SvgText
            x={svgWidth / 2}
            y={svgHeight - 4}
            textAnchor="middle"
            fontSize={10}
            fill={colors.textMuted}
          >
            Each {data.icon} = {data.scale}
          </SvgText>
        )}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
});
