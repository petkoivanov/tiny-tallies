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

    it('returns 14 NodePosition objects', () => {
      const nodes = computeNodePositions(WIDTH, HEIGHT, HEADER_HEIGHT);
      expect(nodes).toHaveLength(14);
    });

    it('places addition nodes at ~30% width', () => {
      const nodes = computeNodePositions(WIDTH, HEIGHT, HEADER_HEIGHT);
      const additionNodes = nodes.filter((n) => n.column === 'addition');
      expect(additionNodes).toHaveLength(7);
      additionNodes.forEach((node) => {
        expect(node.x).toBeCloseTo(WIDTH * 0.3, 0);
      });
    });

    it('places subtraction nodes at ~70% width', () => {
      const nodes = computeNodePositions(WIDTH, HEIGHT, HEADER_HEIGHT);
      const subtractionNodes = nodes.filter(
        (n) => n.column === 'subtraction',
      );
      expect(subtractionNodes).toHaveLength(7);
      subtractionNodes.forEach((node) => {
        expect(node.x).toBeCloseTo(WIDTH * 0.7, 0);
      });
    });

    it('assigns correct column, row, and grade to each node', () => {
      const nodes = computeNodePositions(WIDTH, HEIGHT, HEADER_HEIGHT);

      // Addition nodes should have rows 0-6
      const additionNodes = nodes
        .filter((n) => n.column === 'addition')
        .sort((a, b) => a.row - b.row);
      expect(additionNodes.map((n) => n.row)).toEqual([0, 1, 2, 3, 4, 5, 6]);
      // Grade 1: rows 0-2, Grade 2: rows 3-4, Grade 3: rows 5-6
      expect(additionNodes[0].grade).toBe(1);
      expect(additionNodes[1].grade).toBe(1);
      expect(additionNodes[2].grade).toBe(1);
      expect(additionNodes[3].grade).toBe(2);
      expect(additionNodes[4].grade).toBe(2);
      expect(additionNodes[5].grade).toBe(3);
      expect(additionNodes[6].grade).toBe(3);
    });

    it('spaces nodes evenly vertically with 7 rows', () => {
      const nodes = computeNodePositions(WIDTH, HEIGHT, HEADER_HEIGHT);
      const additionNodes = nodes
        .filter((n) => n.column === 'addition')
        .sort((a, b) => a.row - b.row);

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

    it('returns 18 EdgeData objects', () => {
      const nodes = computeNodePositions(WIDTH, HEIGHT, HEADER_HEIGHT);
      const edges = computeEdgePaths(nodes, NODE_RADIUS);
      expect(edges).toHaveLength(18);
    });

    it('has 12 same-column edges and 6 cross-column edges', () => {
      const nodes = computeNodePositions(WIDTH, HEIGHT, HEADER_HEIGHT);
      const edges = computeEdgePaths(nodes, NODE_RADIUS);
      const sameColumn = edges.filter((e) => !e.isCrossColumn);
      const crossColumn = edges.filter((e) => e.isCrossColumn);
      expect(sameColumn).toHaveLength(12);
      expect(crossColumn).toHaveLength(6);
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
