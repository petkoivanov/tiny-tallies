/**
 * Animated skill node for the skill map visualization.
 *
 * Each node is an absolute-positioned Animated.View containing a small Svg
 * element. This approach avoids unreliable useAnimatedProps+SVGAdapter
 * combination and keeps animations (entrance scale/opacity, outer fringe
 * breathing pulse) on the View layer where Reanimated is well-tested.
 *
 * The parent SkillMapGraph positions each node via absolute coordinates.
 */
import React, { useEffect } from 'react';
import Svg, { Circle, G, Text as SvgText } from 'react-native-svg';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import type { Operation } from '@/services/mathEngine/types';
import type { NodeState } from './skillMapTypes';
import { getNodeColor, skillMapColors } from './skillMapColors';

export interface SkillMapNodeProps {
  skillId: string;
  name: string;
  operation: Operation;
  cx: number;
  cy: number;
  state: NodeState;
  masteryProbability: number;
  isOuterFringe: boolean;
  nodeRadius: number;
  entranceDelay: number;
  onPress?: (skillId: string) => void;
}

/** Abbreviates skill name for the label below the node. */
function abbreviateName(name: string): string {
  return name
    .replace('Add ', '+')
    .replace('Subtract ', '\u2212')
    .replace(' (no carry)', '')
    .replace(' (with carry)', ' +carry')
    .replace(' (no borrow)', '')
    .replace(' (with borrow)', ' +borr')
    .trim();
}

const TWO_PI = 2 * Math.PI;
const LABEL_OFFSET = 14;
const SVG_PADDING = 8;

export function SkillMapNode({
  name,
  operation,
  cx,
  cy,
  state,
  masteryProbability,
  isOuterFringe,
  nodeRadius,
  entranceDelay,
}: SkillMapNodeProps) {
  const { fill, ring } = getNodeColor(operation, state);
  const circumference = TWO_PI * nodeRadius;

  // Local SVG coordinate system: node centered at (r+pad, r+pad)
  const localR = nodeRadius;
  const localCx = localR + SVG_PADDING;
  const localCy = localR + SVG_PADDING;
  const svgWidth = (localR + SVG_PADDING) * 2;
  const svgHeight = (localR + SVG_PADDING) * 2 + LABEL_OFFSET;

  // -- Entrance animation --
  const entranceProgress = useSharedValue(0);
  useEffect(() => {
    entranceProgress.value = withDelay(
      entranceDelay,
      withSpring(1, { damping: 12, stiffness: 180 }),
    );
  }, [entranceDelay, entranceProgress]);

  // -- Outer fringe breathing pulse (unlocked nodes only) --
  const pulseScale = useSharedValue(1);
  useEffect(() => {
    if (isOuterFringe && state === 'unlocked') {
      pulseScale.value = withRepeat(
        withTiming(1.08, {
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true,
      );
    }
  }, [isOuterFringe, state, pulseScale]);

  const animatedStyle = useAnimatedStyle(() => ({
    position: 'absolute' as const,
    left: cx - localCx,
    top: cy - localCy,
    width: svgWidth,
    height: svgHeight,
    opacity: entranceProgress.value,
    transform: [{ scale: entranceProgress.value * pulseScale.value }],
  }));

  const opSymbol = operation === 'addition' ? '+' : '\u2212';

  // Icon overlay position (top-right of circle)
  const iconX = localCx + localR * 0.55;
  const iconY = localCy - localR * 0.45;

  return (
    <Animated.View style={animatedStyle}>
      <Svg width={svgWidth} height={svgHeight}>
        <G>
          {/* Background circle */}
          <Circle cx={localCx} cy={localCy} r={localR} fill={fill} />

          {/* State ring */}
          {state === 'in-progress' ? (
            <Circle
              cx={localCx}
              cy={localCy}
              r={localR}
              fill="none"
              stroke={ring}
              strokeWidth={3}
              strokeDasharray={`${circumference}`}
              strokeDashoffset={`${circumference * (1 - masteryProbability)}`}
              strokeLinecap="round"
              transform={`rotate(-90, ${localCx}, ${localCy})`}
            />
          ) : state === 'mastered' ? (
            <Circle
              cx={localCx}
              cy={localCy}
              r={localR}
              fill={`${skillMapColors.state.masteredGold}33`}
              stroke={skillMapColors.state.masteredGold}
              strokeWidth={3}
            />
          ) : (
            <Circle
              cx={localCx}
              cy={localCy}
              r={localR}
              fill="none"
              stroke={ring}
              strokeWidth={3}
            />
          )}

          {/* State icon overlay */}
          {state === 'locked' && (
            <SvgText
              x={iconX}
              y={iconY}
              fontSize={10}
              textAnchor="middle"
              fill={skillMapColors.state.lockedRing}
            >
              {'\uD83D\uDD12'}
            </SvgText>
          )}
          {state === 'mastered' && (
            <SvgText
              x={iconX}
              y={iconY}
              fontSize={10}
              textAnchor="middle"
              fill={skillMapColors.state.masteredGold}
            >
              {'\u2713'}
            </SvgText>
          )}

          {/* Operation emoji */}
          <SvgText
            x={localCx}
            y={localCy + 5}
            fontSize={16}
            fontWeight="bold"
            textAnchor="middle"
            fill="#ffffff"
          >
            {opSymbol}
          </SvgText>

          {/* Skill label */}
          <SvgText
            x={localCx}
            y={localCy + localR + LABEL_OFFSET}
            fontSize={9}
            textAnchor="middle"
            fill={
              state === 'locked'
                ? skillMapColors.state.lockedRing
                : '#cbd5e1'
            }
          >
            {abbreviateName(name)}
          </SvgText>
        </G>
      </Svg>
    </Animated.View>
  );
}

export default SkillMapNode;
