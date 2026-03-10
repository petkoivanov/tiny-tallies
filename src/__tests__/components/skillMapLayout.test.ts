// Mock prerequisiteGating
const mockIsSkillUnlocked = jest.fn();
jest.mock('@/services/adaptive/prerequisiteGating', () => ({
  isSkillUnlocked: (...args: unknown[]) => mockIsSkillUnlocked(...args),
}));

// Mock skillStateHelpers
jest.mock('@/store/helpers/skillStateHelpers', () => ({
  getOrCreateSkillState: (
    skillStates: Record<string, unknown>,
    skillId: string,
  ) =>
    skillStates[skillId] ?? {
      eloRating: 1000,
      attempts: 0,
      correct: 0,
      masteryProbability: 0.1,
      consecutiveWrong: 0,
      masteryLocked: false,
      leitnerBox: 1,
      nextReviewDue: null,
      consecutiveCorrectInBox6: 0,
      cpaLevel: 'concrete',
    },
}));

import {
  getNodeState,
  computeNodePositions,
  computeEdgePaths,
  NODE_RADIUS,
} from '@/components/skillMap/skillMapLayout';
import { SKILLS } from '@/services/mathEngine/skills';
import type { SkillState } from '@/store/slices/skillStatesSlice';

// Helper to create a minimal SkillState
function makeSkillState(overrides: Partial<SkillState> = {}): SkillState {
  return {
    eloRating: 1000,
    attempts: 0,
    correct: 0,
    masteryProbability: 0.1,
    consecutiveWrong: 0,
    masteryLocked: false,
    leitnerBox: 1 as const,
    nextReviewDue: null,
    consecutiveCorrectInBox6: 0,
    cpaLevel: 'concrete' as const,
    ...overrides,
  };
}

// Count total prerequisite edges (cross-column and same-column)
function countPrerequisiteEdges() {
  let sameColumn = 0;
  let crossColumn = 0;
  for (const skill of SKILLS) {
    for (const prereqId of skill.prerequisites) {
      const prereq = SKILLS.find((s) => s.id === prereqId);
      if (!prereq) continue;
      if (prereq.operation === skill.operation) {
        sameColumn++;
      } else {
        crossColumn++;
      }
    }
  }
  return { sameColumn, crossColumn, total: sameColumn + crossColumn };
}

describe('skillMapLayout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('NODE_RADIUS', () => {
    it('exports NODE_RADIUS as 24', () => {
      expect(NODE_RADIUS).toBe(24);
    });
  });

  describe('getNodeState', () => {
    it('returns unlocked for root skill with no attempts', () => {
      mockIsSkillUnlocked.mockReturnValue(true);
      const result = getNodeState('addition.single-digit.no-carry', {});
      expect(result).toBe('unlocked');
    });

    it('returns mastered when masteryLocked is true', () => {
      mockIsSkillUnlocked.mockReturnValue(true);
      const skillStates: Record<string, SkillState> = {
        'some-skill': makeSkillState({ masteryLocked: true, attempts: 10 }),
      };
      const result = getNodeState('some-skill', skillStates);
      expect(result).toBe('mastered');
    });

    it('returns in-progress when attempts > 0 and not mastered', () => {
      mockIsSkillUnlocked.mockReturnValue(true);
      const skillStates: Record<string, SkillState> = {
        'some-skill': makeSkillState({
          attempts: 5,
          masteryLocked: false,
        }),
      };
      const result = getNodeState('some-skill', skillStates);
      expect(result).toBe('in-progress');
    });

    it('returns locked when skill has unmastered prerequisites', () => {
      mockIsSkillUnlocked.mockReturnValue(false);
      const result = getNodeState(
        'subtraction.within-20.no-borrow',
        {},
      );
      expect(result).toBe('locked');
    });
  });

  describe('computeNodePositions', () => {
    const WIDTH = 400;
    const HEIGHT = 800;
    const HEADER_HEIGHT = 80;

    it('returns one NodePosition per skill', () => {
      const nodes = computeNodePositions(WIDTH, HEIGHT, HEADER_HEIGHT);
      expect(nodes).toHaveLength(SKILLS.length);
    });

    it('places addition nodes in a column', () => {
      const nodes = computeNodePositions(WIDTH, HEIGHT, HEADER_HEIGHT);
      const additionSkillCount = SKILLS.filter((s) => s.operation === 'addition').length;
      const additionNodes = nodes.filter((n) => n.column === 'addition');
      expect(additionNodes).toHaveLength(additionSkillCount);
      // All addition nodes should share the same X coordinate
      const xValues = new Set(additionNodes.map((n) => n.x));
      expect(xValues.size).toBe(1);
    });

    it('places subtraction nodes in a column', () => {
      const nodes = computeNodePositions(WIDTH, HEIGHT, HEADER_HEIGHT);
      const subSkillCount = SKILLS.filter((s) => s.operation === 'subtraction').length;
      const subtractionNodes = nodes.filter(
        (n) => n.column === 'subtraction',
      );
      expect(subtractionNodes).toHaveLength(subSkillCount);
      // All subtraction nodes should share the same X coordinate
      const xValues = new Set(subtractionNodes.map((n) => n.x));
      expect(xValues.size).toBe(1);
    });

    it('assigns correct row indices to each column', () => {
      const nodes = computeNodePositions(WIDTH, HEIGHT, HEADER_HEIGHT);

      // Addition nodes should have sequential rows
      const additionNodes = nodes
        .filter((n) => n.column === 'addition')
        .sort((a, b) => a.row - b.row);
      const additionRows = additionNodes.map((n) => n.row);
      expect(additionRows).toEqual(additionRows.map((_, i) => i));
    });

    it('spaces nodes evenly vertically within each column', () => {
      const nodes = computeNodePositions(WIDTH, HEIGHT, HEADER_HEIGHT);
      const additionNodes = nodes
        .filter((n) => n.column === 'addition')
        .sort((a, b) => a.row - b.row);

      if (additionNodes.length < 3) return;

      // Check that vertical spacing is consistent
      const spacing = additionNodes[1].y - additionNodes[0].y;
      for (let i = 2; i < additionNodes.length; i++) {
        expect(additionNodes[i].y - additionNodes[i - 1].y).toBeCloseTo(
          spacing,
          0,
        );
      }
    });
  });

  describe('computeEdgePaths', () => {
    const WIDTH = 400;
    const HEIGHT = 800;
    const HEADER_HEIGHT = 80;

    it('returns correct total number of edges', () => {
      const nodes = computeNodePositions(WIDTH, HEIGHT, HEADER_HEIGHT);
      const edges = computeEdgePaths(nodes, NODE_RADIUS);
      const expected = countPrerequisiteEdges();
      expect(edges).toHaveLength(expected.total);
    });

    it('has correct same-column and cross-column edge counts', () => {
      const nodes = computeNodePositions(WIDTH, HEIGHT, HEADER_HEIGHT);
      const edges = computeEdgePaths(nodes, NODE_RADIUS);
      const sameColumn = edges.filter((e) => !e.isCrossColumn);
      const crossColumn = edges.filter((e) => e.isCrossColumn);
      const expected = countPrerequisiteEdges();
      expect(sameColumn).toHaveLength(expected.sameColumn);
      expect(crossColumn).toHaveLength(expected.crossColumn);
    });

    it('each edge has valid fromPos/toPos and SVG path string', () => {
      const nodes = computeNodePositions(WIDTH, HEIGHT, HEADER_HEIGHT);
      const edges = computeEdgePaths(nodes, NODE_RADIUS);
      edges.forEach((edge) => {
        expect(edge.fromPos).toHaveProperty('x');
        expect(edge.fromPos).toHaveProperty('y');
        expect(edge.toPos).toHaveProperty('x');
        expect(edge.toPos).toHaveProperty('y');
        expect(typeof edge.path).toBe('string');
        expect(edge.path.length).toBeGreaterThan(0);
        expect(edge.path).toMatch(/^M /);
      });
    });

    it('same-column edges use straight lines (L command)', () => {
      const nodes = computeNodePositions(WIDTH, HEIGHT, HEADER_HEIGHT);
      const edges = computeEdgePaths(nodes, NODE_RADIUS);
      const sameColumn = edges.filter((e) => !e.isCrossColumn);
      sameColumn.forEach((edge) => {
        expect(edge.path).toMatch(/L /);
      });
    });

    it('cross-column edges use quadratic bezier (Q command)', () => {
      const nodes = computeNodePositions(WIDTH, HEIGHT, HEADER_HEIGHT);
      const edges = computeEdgePaths(nodes, NODE_RADIUS);
      const crossColumn = edges.filter((e) => e.isCrossColumn);
      crossColumn.forEach((edge) => {
        expect(edge.path).toMatch(/Q /);
      });
    });
  });
});
