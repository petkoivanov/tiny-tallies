/**
 * Animated SVG edge for the skill map visualization.
 *
 * Each edge is rendered as an absolutely-positioned Animated.View
 * spanning the full graph area, containing an Svg with the edge Path.
 * Entrance opacity fades in after all nodes have revealed.
 * Outer fringe edges (both endpoints in fringe) get a glow halo
 * with a breathing pulse animation.
 *
 * Static edges (not outer fringe) create no animation overhead after
 * the entrance fade completes.
 */
import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { skillMapColors } from './skillMapColors';

export interface SkillMapEdgeProps {
  path: string;
  isCrossColumn: boolean;
  isOuterFringeEdge: boolean;
  entranceDelay: number;
  graphWidth: number;
  graphHeight: number;
}

export function SkillMapEdge({
  path,
  isOuterFringeEdge,
  entranceDelay,
  graphWidth,
  graphHeight,
}: SkillMapEdgeProps) {
  // -- Entrance animation --
  const entranceOpacity = useSharedValue(0);
  useEffect(() => {
    entranceOpacity.value = withDelay(
      entranceDelay,
      withTiming(1, { duration: 300 }),
    );
  }, [entranceDelay, entranceOpacity]);

  // -- Glow pulse for outer fringe edges --
  const glowOpacity = useSharedValue(0);
  useEffect(() => {
    if (isOuterFringeEdge) {
      glowOpacity.value = withRepeat(
        withTiming(0.4, {
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true,
      );
    }
  }, [isOuterFringeEdge, glowOpacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: entranceOpacity.value,
  }));

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  return (
    <Animated.View style={[styles.edgeWrapper, animatedStyle]}>
      {/* Glow halo behind main edge (outer fringe only) */}
      {isOuterFringeEdge && (
        <Animated.View style={[styles.edgeWrapper, glowAnimatedStyle]}>
          <Svg
            width={graphWidth}
            height={graphHeight}
            style={styles.svgLayer}
          >
            <Path
              d={path}
              stroke={skillMapColors.edge.glow}
              strokeWidth={4}
              fill="none"
            />
          </Svg>
        </Animated.View>
      )}

      {/* Main edge path */}
      <Svg width={graphWidth} height={graphHeight} style={styles.svgLayer}>
        <Path
          d={path}
          stroke={skillMapColors.edge.normal}
          strokeWidth={2}
          fill="none"
        />
      </Svg>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  edgeWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  svgLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
});

export default SkillMapEdge;
