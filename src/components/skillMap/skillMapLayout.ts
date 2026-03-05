import { SKILLS } from '@/services/mathEngine/skills';
import { isSkillUnlocked } from '@/services/adaptive/prerequisiteGating';
import { getOrCreateSkillState } from '@/store/helpers/skillStateHelpers';
import type { SkillState } from '@/store/slices/skillStatesSlice';
import type { NodePosition, NodeState, EdgeData } from './skillMapTypes';

/** Radius of each skill node circle in the SVG. */
export const NODE_RADIUS = 24;

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
 * Computes x/y positions for all 14 skill nodes in a 2-column layout.
 *
 * Addition skills at x = 30% width, subtraction at x = 70% width.
 * 7 rows evenly spaced vertically below the header.
 */
export function computeNodePositions(
  width: number,
  height: number,
  headerHeight: number,
): NodePosition[] {
  const additionSkills = SKILLS.filter((s) => s.operation === 'addition');
  const subtractionSkills = SKILLS.filter(
    (s) => s.operation === 'subtraction',
  );

  const availableHeight = height - headerHeight;
  const rowSpacing = availableHeight / 8;
  const startY = headerHeight + rowSpacing;

  const additionX = width * 0.3;
  const subtractionX = width * 0.7;

  const positions: NodePosition[] = [];

  additionSkills.forEach((skill, index) => {
    positions.push({
      skillId: skill.id,
      x: additionX,
      y: startY + index * rowSpacing,
      column: 'addition',
      row: index,
      grade: skill.grade,
    });
  });

  subtractionSkills.forEach((skill, index) => {
    positions.push({
      skillId: skill.id,
      x: subtractionX,
      y: startY + index * rowSpacing,
      column: 'subtraction',
      row: index,
      grade: skill.grade,
    });
  });

  return positions;
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
