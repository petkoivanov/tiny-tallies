/**
 * Consolidated edge layer for the skill map.
 *
 * Renders ALL edge paths in a single SVG instead of one full-screen SVG per
 * edge. This is critical for performance — the old approach created 18+
 * full-graph-sized SVG canvases which ate GPU memory and caused crashes.
 *
 * Two layers: static edges (one SVG) + animated fringe glow (one Animated.View).
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
import type { EdgeData } from './skillMapTypes';

interface SkillMapEdgesProps {
  edges: (EdgeData & { isOuterFringeEdge: boolean })[];
  graphWidth: number;
  graphHeight: number;
  entranceDelay: number;
}

export const SkillMapEdges = React.memo(function SkillMapEdges({
  edges,
  graphWidth,
  graphHeight,
  entranceDelay,
}: SkillMapEdgesProps) {
  // Single entrance fade for all edges
  const entranceOpacity = useSharedValue(0);
  useEffect(() => {
    entranceOpacity.value = withDelay(
      entranceDelay,
      withTiming(1, { duration: 400 }),
    );
  }, [entranceDelay, entranceOpacity]);

  // Single glow pulse for all fringe edges
  const glowOpacity = useSharedValue(0);
  const hasFringeEdges = edges.some((e) => e.isOuterFringeEdge);
  useEffect(() => {
    if (hasFringeEdges) {
      glowOpacity.value = withRepeat(
        withTiming(0.4, {
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true,
      );
    }
  }, [hasFringeEdges, glowOpacity]);

  const entranceStyle = useAnimatedStyle(() => ({
    opacity: entranceOpacity.value,
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const fringeEdges = edges.filter((e) => e.isOuterFringeEdge);

  return (
    <>
      {/* All edges in one SVG */}
      <Animated.View style={[styles.layer, entranceStyle]}>
        <Svg width={graphWidth} height={graphHeight} style={styles.svg}>
          {edges.map((edge) => (
            <Path
              key={`${edge.fromId}-${edge.toId}`}
              d={edge.path}
              stroke={skillMapColors.edge.normal}
              strokeWidth={2}
              fill="none"
            />
          ))}
        </Svg>
      </Animated.View>

      {/* Fringe glow edges in one SVG */}
      {fringeEdges.length > 0 && (
        <Animated.View style={[styles.layer, glowStyle]}>
          <Svg width={graphWidth} height={graphHeight} style={styles.svg}>
            {fringeEdges.map((edge) => (
              <Path
                key={`glow-${edge.fromId}-${edge.toId}`}
                d={edge.path}
                stroke={skillMapColors.edge.glow}
                strokeWidth={4}
                fill="none"
              />
            ))}
          </Svg>
        </Animated.View>
      )}
    </>
  );
});

const styles = StyleSheet.create({
  layer: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  svg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
});

export default SkillMapEdges;
