/**
 * SkillMapGraph: SVG container assembling all 14 nodes and 18 edges.
 *
 * Computes layout positions from container dimensions, derives node states
 * from BKT data, and renders SkillMapNode/SkillMapEdge components with
 * staggered entrance animations. Tap targets are 48dp minimum Pressable
 * components positioned over each node (avoids unreliable SVG touch events).
 */
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Text as SvgText } from 'react-native-svg';

import { SKILLS } from '@/services/mathEngine/skills';
import { getOrCreateSkillState } from '@/store/helpers/skillStateHelpers';
import type { SkillState } from '@/store/slices/skillStatesSlice';
import { layout } from '@/theme';

import { SkillMapNode } from './SkillMapNode';
import { SkillMapEdge } from './SkillMapEdge';
import { computeNodePositions, computeEdgePaths, getNodeState, NODE_RADIUS } from './skillMapLayout';
import { skillMapColors } from './skillMapColors';
import type { SkillNodeData, EdgeData } from './skillMapTypes';

/** Height reserved for column headers and grade labels above the graph. */
const HEADER_HEIGHT = 65;

/** Base entrance delay for edges (after node rows have revealed). */
const EDGE_BASE_DELAY = 10 * 50 + 100; // 600ms

/** Stagger per node row. */
const ROW_STAGGER_MS = 50;

export interface SkillMapGraphProps {
  width: number;
  height: number;
  skillStates: Record<string, SkillState>;
  outerFringeIds: string[];
  onNodePress: (skillId: string) => void;
}

export function SkillMapGraph({
  width,
  height,
  skillStates,
  outerFringeIds,
  onNodePress,
}: SkillMapGraphProps) {
  const outerFringeSet = useMemo(
    () => new Set(outerFringeIds),
    [outerFringeIds],
  );

  // Compute node positions
  const nodePositions = useMemo(
    () => computeNodePositions(width, height, HEADER_HEIGHT),
    [width, height],
  );

  // Compute edge paths
  const edgePaths = useMemo(
    () => computeEdgePaths(nodePositions, NODE_RADIUS),
    [nodePositions],
  );

  // Build full SkillNodeData array
  const skillNodes: SkillNodeData[] = useMemo(() => {
    return nodePositions.map((pos) => {
      const skill = SKILLS.find((s) => s.id === pos.skillId);
      const state = getNodeState(pos.skillId, skillStates);
      const skillState = getOrCreateSkillState(skillStates, pos.skillId);

      return {
        skillId: pos.skillId,
        name: skill?.name ?? pos.skillId,
        operation: skill?.operation ?? 'addition',
        grade: pos.grade,
        position: pos,
        state,
        masteryProbability: skillState.masteryProbability,
        isOuterFringe: outerFringeSet.has(pos.skillId),
      };
    });
  }, [nodePositions, skillStates, outerFringeSet]);

  // Determine outer fringe edges (both endpoints in fringe)
  const edgesWithFringe: (EdgeData & { isOuterFringeEdge: boolean })[] =
    useMemo(() => {
      return edgePaths.map((edge) => ({
        ...edge,
        isOuterFringeEdge:
          outerFringeSet.has(edge.fromId) && outerFringeSet.has(edge.toId),
      }));
    }, [edgePaths, outerFringeSet]);

  // Compute unique columns and their X positions from node positions
  const columnInfo = useMemo(() => {
    const cols = new Map<string, number>();
    nodePositions.forEach((pos) => {
      if (!cols.has(pos.column)) {
        cols.set(pos.column, pos.x);
      }
    });
    return cols;
  }, [nodePositions]);

  // Compute grade label Y positions from node positions
  const gradeYPositions = useMemo(() => {
    const gradeNodes: Record<number, number[]> = { 1: [], 2: [], 3: [], 4: [] };
    nodePositions.forEach((pos) => {
      gradeNodes[pos.grade]?.push(pos.y);
    });
    return {
      1: gradeNodes[1].length > 0 ? Math.min(...gradeNodes[1]) : HEADER_HEIGHT,
      2: gradeNodes[2].length > 0 ? Math.min(...gradeNodes[2]) : height * 0.3,
      3: gradeNodes[3].length > 0 ? Math.min(...gradeNodes[3]) : height * 0.6,
      4: gradeNodes[4].length > 0 ? Math.min(...gradeNodes[4]) : height * 0.85,
    };
  }, [nodePositions, height]);

  // Minimum tap target size (48dp per design)
  const tapSize = Math.max(layout.minTouchTarget, NODE_RADIUS * 2 + 8);

  return (
    <View style={styles.container}>
      {/* Background SVG for column headers and grade labels */}
      <Svg width={width} height={height} style={styles.svgBackground}>
        {/* Column headers */}
        {Array.from(columnInfo.entries()).map(([col, colX]) => {
          const colColors = (skillMapColors as unknown as Record<string, { light: string }>)[col];
          const label = col.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
          return (
            <SvgText
              key={`header-${col}`}
              x={colX}
              y={20}
              fontSize={10}
              fontWeight="600"
              textAnchor="middle"
              fill={colColors?.light ?? '#64748b'}
            >
              {label}
            </SvgText>
          );
        })}

        {/* Grade labels along left edge */}
        <SvgText
          x={12}
          y={gradeYPositions[1]}
          fontSize={9}
          fill="#64748b"
          textAnchor="start"
        >
          Grade 1
        </SvgText>
        <SvgText
          x={12}
          y={gradeYPositions[2]}
          fontSize={9}
          fill="#64748b"
          textAnchor="start"
        >
          Grade 2
        </SvgText>
        <SvgText
          x={12}
          y={gradeYPositions[3]}
          fontSize={9}
          fill="#64748b"
          textAnchor="start"
        >
          Grade 3
        </SvgText>
        <SvgText
          x={12}
          y={gradeYPositions[4]}
          fontSize={9}
          fill="#64748b"
          textAnchor="start"
        >
          Grade 4
        </SvgText>
      </Svg>

      {/* Edges layer (rendered before nodes so edges appear behind) */}
      {edgesWithFringe.map((edge, index) => (
        <SkillMapEdge
          key={`edge-${edge.fromId}-${edge.toId}`}
          path={edge.path}
          isCrossColumn={edge.isCrossColumn}
          isOuterFringeEdge={edge.isOuterFringeEdge}
          entranceDelay={EDGE_BASE_DELAY + index * 15}
          graphWidth={width}
          graphHeight={height}
        />
      ))}

      {/* Nodes layer */}
      {skillNodes.map((node) => (
        <SkillMapNode
          key={`node-${node.skillId}`}
          skillId={node.skillId}
          name={node.name}
          operation={node.operation}
          cx={node.position.x}
          cy={node.position.y}
          state={node.state}
          masteryProbability={node.masteryProbability}
          isOuterFringe={node.isOuterFringe}
          nodeRadius={NODE_RADIUS}
          entranceDelay={node.position.row * ROW_STAGGER_MS}
          onPress={onNodePress}
        />
      ))}

      {/* Tap targets (absolute-positioned Pressables over each node) */}
      {skillNodes.map((node) => (
        <Pressable
          key={`tap-${node.skillId}`}
          testID={`node-tap-${node.skillId}`}
          style={[
            styles.tapTarget,
            {
              left: node.position.x - tapSize / 2,
              top: node.position.y - tapSize / 2,
              width: tapSize,
              height: tapSize,
              borderRadius: tapSize / 2,
            },
          ]}
          onPress={() => onNodePress(node.skillId)}
          accessibilityRole="button"
          accessibilityLabel={`${node.name} - ${node.state}`}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  svgBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  tapTarget: {
    position: 'absolute',
    zIndex: 10,
  },
});

export default SkillMapGraph;
