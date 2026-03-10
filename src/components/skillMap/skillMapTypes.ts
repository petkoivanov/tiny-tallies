import type { Grade, Operation } from '@/services/mathEngine/types';

/** Visual state of a skill node on the map. */
export type NodeState = 'locked' | 'unlocked' | 'in-progress' | 'mastered';

/** Computed position and metadata for a skill node. */
export interface NodePosition {
  skillId: string;
  x: number;
  y: number;
  column: string;
  row: number;
  grade: Grade;
}

/** Edge connecting two skill nodes with SVG path data. */
export interface EdgeData {
  fromId: string;
  toId: string;
  fromPos: { x: number; y: number };
  toPos: { x: number; y: number };
  isCrossColumn: boolean;
  path: string;
}

/** Full skill node data for rendering. */
export interface SkillNodeData {
  skillId: string;
  name: string;
  operation: Operation;
  grade: Grade;
  position: NodePosition;
  state: NodeState;
  masteryProbability: number;
  isOuterFringe: boolean;
}
