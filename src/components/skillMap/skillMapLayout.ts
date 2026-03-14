import { SKILLS } from '@/services/mathEngine/skills';
import { isSkillUnlocked } from '@/services/adaptive/prerequisiteGating';
import { getOrCreateSkillState } from '@/store/helpers/skillStateHelpers';
import type { SkillState } from '@/store/slices/skillStatesSlice';
import type { NodePosition, NodeState, EdgeData } from './skillMapTypes';

/** Radius of each skill node circle in the SVG. */
export const NODE_RADIUS = 24;

/** Minimum horizontal spacing between column centers (2 * NODE_RADIUS + 16px gap). */
export const MIN_COLUMN_SPACING = 64;

/** All unique operations present in the SKILLS array, in display order. */
const OPERATIONS = (() => {
  const seen = new Set<string>();
  const ops: string[] = [];
  for (const skill of SKILLS) {
    if (!seen.has(skill.operation)) {
      seen.add(skill.operation);
      ops.push(skill.operation);
    }
  }
  return ops;
})();

/**
 * Derives the visual state of a skill node from BKT mastery data.
 *
 * Priority: mastered > in-progress > unlocked > locked
 */
export function getNodeState(
  skillId: string,
  skillStates: Record<string, SkillState>,
): NodeState {
  const state = getOrCreateSkillState(skillStates, skillId);

  if (state.masteryLocked) return 'mastered';
  if (state.attempts > 0) return 'in-progress';
  if (isSkillUnlocked(skillId, skillStates)) return 'unlocked';
  return 'locked';
}

/**
 * Computes x/y positions for all skill nodes in a multi-column layout.
 *
 * Each operation gets its own column, evenly distributed across the width.
 * Within each column, skills are arranged vertically by their order in the
 * SKILLS array.
 */
export interface LayoutResult {
  nodes: NodePosition[];
  contentWidth: number;
}

export function computeNodePositions(
  width: number,
  height: number,
  headerHeight: number,
): LayoutResult {
  const positions: NodePosition[] = [];
  const numColumns = OPERATIONS.length;
  const contentWidth = Math.max(width, (numColumns + 1) * MIN_COLUMN_SPACING);

  for (let colIdx = 0; colIdx < numColumns; colIdx++) {
    const operation = OPERATIONS[colIdx];
    const columnSkills = SKILLS.filter((s) => s.operation === operation);
    const colX = (contentWidth * (colIdx + 1)) / (numColumns + 1);
    const availableHeight = height - headerHeight;
    const rowSpacing = availableHeight / (columnSkills.length + 1);
    const startY = headerHeight + rowSpacing;

    columnSkills.forEach((skill, rowIdx) => {
      positions.push({
        skillId: skill.id,
        x: colX,
        y: startY + rowIdx * rowSpacing,
        column: operation,
        row: rowIdx,
        grade: skill.grade,
      });
    });
  }

  return { nodes: positions, contentWidth };
}

/**
 * Computes SVG edge paths between prerequisite-linked nodes.
 *
 * Same-column edges: straight vertical lines.
 * Cross-column edges: quadratic bezier curves.
 */
export function computeEdgePaths(
  nodes: NodePosition[],
  nodeRadius: number,
): EdgeData[] {
  const nodeMap = new Map<string, NodePosition>();
  nodes.forEach((node) => nodeMap.set(node.skillId, node));

  const edges: EdgeData[] = [];

  SKILLS.forEach((skill) => {
    skill.prerequisites.forEach((prereqId) => {
      const fromNode = nodeMap.get(prereqId);
      const toNode = nodeMap.get(skill.id);

      if (!fromNode || !toNode) return;

      const isCrossColumn = fromNode.column !== toNode.column;

      const fromPos = { x: fromNode.x, y: fromNode.y + nodeRadius };
      const toPos = { x: toNode.x, y: toNode.y - nodeRadius };

      let path: string;
      if (isCrossColumn) {
        // Quadratic bezier for cross-column edges
        const midX = (fromPos.x + toPos.x) / 2;
        const midY = (fromPos.y + toPos.y) / 2;
        path = `M ${fromPos.x} ${fromPos.y} Q ${midX} ${midY} ${toPos.x} ${toPos.y}`;
      } else {
        // Straight vertical line for same-column edges
        path = `M ${fromPos.x} ${fromPos.y} L ${toPos.x} ${toPos.y}`;
      }

      edges.push({
        fromId: prereqId,
        toId: skill.id,
        fromPos,
        toPos,
        isCrossColumn,
        path,
      });
    });
  });

  return edges;
}
