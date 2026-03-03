/**
 * SVG rendering sub-component for the NumberLine manipulative.
 *
 * Renders tick marks, labels, base line, and hop arrow arcs.
 * Does NOT handle marker drag -- that is managed by the parent NumberLine component.
 */
import React from 'react';
import Svg, { Line, Text as SvgText, Path } from 'react-native-svg';

import {
  NUMBER_LINE_COLOR,
  TICK_HEIGHT,
  MAJOR_TICK_HEIGHT,
  LABEL_FONT_SIZE,
  ARC_COLOR,
  SVG_PADDING,
  type NumberLineSvgProps,
  type HopArrow,
} from './NumberLineTypes';

// ---------- Helpers ----------

/**
 * Map a numeric value to an X pixel coordinate on the SVG.
 * Linear mapping within the drawable area (padded).
 */
export function valueToX(
  value: number,
  range: [number, number],
  width: number,
): number {
  const drawWidth = width - SVG_PADDING * 2;
  if (range[1] === range[0]) return SVG_PADDING;
  return SVG_PADDING + ((value - range[0]) / (range[1] - range[0])) * drawWidth;
}

/**
 * Inverse of valueToX -- map a pixel X coordinate back to a numeric value.
 */
export function xToValue(
  x: number,
  range: [number, number],
  width: number,
): number {
  const drawWidth = width - SVG_PADDING * 2;
  if (drawWidth === 0) return range[0];
  return range[0] + ((x - SVG_PADDING) / drawWidth) * (range[1] - range[0]);
}

// ---------- Internal helpers ----------

/** Determine which tick values to render given range and expanded decade. */
function getTickValues(
  range: [number, number],
  expandedDecade: number | null,
): number[] {
  const [min, max] = range;
  const span = max - min;

  // For 0-100 overview: ticks at multiples of 10
  if (span > 20 && expandedDecade === null) {
    const ticks: number[] = [];
    for (let v = min; v <= max; v += 10) {
      ticks.push(v);
    }
    return ticks;
  }

  // For 0-100 with expanded decade: show individual ticks in the decade
  if (span > 20 && expandedDecade !== null) {
    const ticks: number[] = [];
    const decadeEnd = Math.min(expandedDecade + 10, max);
    for (let v = expandedDecade; v <= decadeEnd; v++) {
      ticks.push(v);
    }
    return ticks;
  }

  // For 0-10 or 0-20: every integer
  const ticks: number[] = [];
  for (let v = min; v <= max; v++) {
    ticks.push(v);
  }
  return ticks;
}

/** Check if a tick value is a major tick. */
function isMajorTick(
  value: number,
  range: [number, number],
  expandedDecade: number | null,
): boolean {
  const span = range[1] - range[0];
  if (span > 20 && expandedDecade !== null) {
    // Within expanded decade: multiples of 5 are major
    return value % 5 === 0;
  }
  if (span > 20) {
    // Overview: all are major (they're at 10s)
    return true;
  }
  // 0-10, 0-20: multiples of 5 are major
  return value % 5 === 0;
}

/** Render hop arrow arcs above the line. */
function renderHopArrows(
  hops: HopArrow[],
  range: [number, number],
  width: number,
  lineY: number,
): React.ReactNode[] {
  return hops.map((hop, i) => {
    const fromX = valueToX(hop.fromValue, range, width);
    const toX = valueToX(hop.toValue, range, width);
    const midX = (fromX + toX) / 2;
    const arcHeight = Math.min(30, Math.abs(toX - fromX) * 0.4);
    const peakY = lineY - arcHeight - 10;

    // Quadratic bezier arc
    const pathD = `M ${fromX} ${lineY} Q ${midX} ${peakY} ${toX} ${lineY}`;

    // Arrowhead at the end (V shape)
    const arrowSize = 5;
    const angle = Math.atan2(lineY - peakY, toX - midX);
    const a1x = toX - arrowSize * Math.cos(angle - 0.5);
    const a1y = lineY - arrowSize * Math.sin(angle - 0.5);
    const a2x = toX - arrowSize * Math.cos(angle + 0.5);
    const a2y = lineY - arrowSize * Math.sin(angle + 0.5);
    const arrowD = `M ${a1x} ${a1y} L ${toX} ${lineY} L ${a2x} ${a2y}`;

    // Hop label
    const hopDelta = hop.toValue - hop.fromValue;
    const label = hopDelta === 1 ? '+1' : `+${hopDelta}`;

    return (
      <React.Fragment key={`hop-${i}`}>
        <Path
          d={pathD}
          stroke={ARC_COLOR}
          strokeWidth={2}
          fill="none"
        />
        <Path
          d={arrowD}
          stroke={ARC_COLOR}
          strokeWidth={2}
          fill="none"
        />
        <SvgText
          x={midX}
          y={peakY - 4}
          fill={ARC_COLOR}
          fontSize={11}
          fontWeight="bold"
          textAnchor="middle"
        >
          {label}
        </SvgText>
      </React.Fragment>
    );
  });
}

// ---------- Component ----------

export function NumberLineSvg({
  range,
  width,
  lineY,
  hops,
  expandedDecade,
}: NumberLineSvgProps) {
  if (width <= 0) return null;

  const tickValues = getTickValues(range, expandedDecade);
  const effectiveRange: [number, number] =
    expandedDecade !== null && range[1] - range[0] > 20
      ? [expandedDecade, Math.min(expandedDecade + 10, range[1])]
      : range;

  return (
    <>
      {/* Base line */}
      <Line
        x1={SVG_PADDING}
        y1={lineY}
        x2={width - SVG_PADDING}
        y2={lineY}
        stroke={NUMBER_LINE_COLOR}
        strokeWidth={2}
      />

      {/* Tick marks and labels */}
      {tickValues.map((value) => {
        const x = valueToX(value, effectiveRange, width);
        const major = isMajorTick(value, range, expandedDecade);
        const tickH = major ? MAJOR_TICK_HEIGHT : TICK_HEIGHT;

        return (
          <React.Fragment key={`tick-${value}`}>
            <Line
              x1={x}
              y1={lineY - tickH / 2}
              x2={x}
              y2={lineY + tickH / 2}
              stroke={NUMBER_LINE_COLOR}
              strokeWidth={major ? 2 : 1.5}
            />
            <SvgText
              x={x}
              y={lineY + tickH / 2 + LABEL_FONT_SIZE + 2}
              fill="#ffffff"
              fontSize={LABEL_FONT_SIZE}
              fontWeight={major ? 'bold' : 'normal'}
              textAnchor="middle"
            >
              {String(value)}
            </SvgText>
          </React.Fragment>
        );
      })}

      {/* Hop arrows */}
      {renderHopArrows(hops, effectiveRange, width, lineY)}
    </>
  );
}
