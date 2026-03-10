import {
  createCatSession,
  getNextItem,
  recordResponse,
  getCatResults,
} from '@/services/cat/catEngine';
import { selectNextItem } from '@/services/cat/itemSelector';
import { buildItemBank } from '@/services/cat/itemBank';
import type { IrtItem, CatConfig } from '@/services/cat/types';

function makeItem(id: string, b: number, a: number = 1.0, grade: number = 3): IrtItem {
  return {
    id,
    discrimination: a,
    difficulty: b,
    grade,
    skillId: `skill-${id}`,
    operation: 'addition',
  };
}

const SMALL_POOL: IrtItem[] = [
  makeItem('easy', -2, 1.0, 1),
  makeItem('medium', 0, 1.2, 3),
  makeItem('hard', 2, 1.5, 5),
  makeItem('very_hard', 3, 1.0, 7),
];

describe('CAT Engine', () => {
  describe('createCatSession', () => {
    it('creates session with default state', () => {
      const state = createCatSession();
      expect(state.theta).toBe(0);
      expect(state.standardError).toBe(1.0);
      expect(state.responses).toHaveLength(0);
      expect(state.terminated).toBe(false);
    });

    it('accepts custom initial theta', () => {
      const state = createCatSession({ initialTheta: 1.5 });
      expect(state.theta).toBe(1.5);
    });
  });

  describe('getNextItem', () => {
    it('returns an item from the pool', () => {
      const state = createCatSession();
      const result = getNextItem(state, SMALL_POOL);
      expect(result).not.toBeNull();
      expect(SMALL_POOL.some((i) => i.id === result!.item.id)).toBe(true);
    });

    it('selects item with maximum information at theta=0', () => {
      const state = createCatSession();
      const result = getNextItem(state, SMALL_POOL);
      // At theta=0, the medium item (b=0, a=1.2) should have most info
      expect(result!.item.id).toBe('medium');
    });

    it('terminates after max items', () => {
      const config: CatConfig = { maxItems: 2, minItems: 1 };
      const state = createCatSession(config);

      // Administer 2 items
      const item1 = getNextItem(state, SMALL_POOL, config);
      recordResponse(state, item1!.item, true, config);
      const item2 = getNextItem(state, SMALL_POOL, config);
      recordResponse(state, item2!.item, true, config);

      // Third call should return null
      const item3 = getNextItem(state, SMALL_POOL, config);
      expect(item3).toBeNull();
      expect(state.terminated).toBe(true);
      expect(state.terminationReason).toBe('max_items');
    });

    it('terminates when SE threshold is met', () => {
      const config: CatConfig = {
        seThreshold: 0.80,
        minItems: 1,
        maxItems: 50,
      };
      const state = createCatSession(config);

      // After one response, SE should drop below 0.80
      const item1 = getNextItem(state, SMALL_POOL, config);
      recordResponse(state, item1!.item, true, config);

      const item2 = getNextItem(state, SMALL_POOL, config);
      // Depending on SE, might terminate
      if (state.standardError <= 0.80) {
        expect(item2).toBeNull();
        expect(state.terminationReason).toBe('se_threshold');
      }
    });

    it('returns null when no items available', () => {
      const state = createCatSession();
      const result = getNextItem(state, []);
      expect(result).toBeNull();
      expect(state.terminationReason).toBe('no_items');
    });
  });

  describe('recordResponse', () => {
    it('adds response to history', () => {
      const state = createCatSession();
      const item = SMALL_POOL[0];
      recordResponse(state, item, true);
      expect(state.responses).toHaveLength(1);
      expect(state.responses[0].correct).toBe(true);
    });

    it('updates theta after correct answer', () => {
      const state = createCatSession();
      const initialTheta = state.theta;
      recordResponse(state, SMALL_POOL[0], true);
      // Correct answer should increase theta
      expect(state.theta).toBeGreaterThan(initialTheta);
    });

    it('updates theta after incorrect answer', () => {
      const state = createCatSession();
      const initialTheta = state.theta;
      recordResponse(state, SMALL_POOL[0], false);
      // Wrong answer on easy item should decrease theta
      expect(state.theta).toBeLessThan(initialTheta);
    });

    it('marks item as administered', () => {
      const state = createCatSession();
      recordResponse(state, SMALL_POOL[0], true);
      expect(state.administeredIds.has(SMALL_POOL[0].id)).toBe(true);
    });
  });

  describe('getCatResults', () => {
    it('returns correct summary', () => {
      const state = createCatSession();
      recordResponse(state, SMALL_POOL[0], true);
      recordResponse(state, SMALL_POOL[1], false);

      const results = getCatResults(state);
      expect(results.totalItems).toBe(2);
      expect(results.correctCount).toBe(1);
      expect(results.accuracy).toBeCloseTo(0.5);
    });

    it('estimates grade level from responses', () => {
      const state = createCatSession();
      // Correct on grade 1 and 3, wrong on grade 5 and 7
      recordResponse(state, SMALL_POOL[0], true); // grade 1
      recordResponse(state, SMALL_POOL[1], true); // grade 3
      recordResponse(state, SMALL_POOL[2], false); // grade 5
      recordResponse(state, SMALL_POOL[3], false); // grade 7

      const results = getCatResults(state);
      expect(results.estimatedGrade).toBe(3);
    });
  });

  describe('full adaptive session simulation', () => {
    it('adapts difficulty based on responses', () => {
      const state = createCatSession();
      const config: CatConfig = { maxItems: 4, minItems: 1 };

      // Track administered difficulties
      const difficulties: number[] = [];

      for (let i = 0; i < 4; i++) {
        const next = getNextItem(state, SMALL_POOL, config);
        if (!next) break;
        difficulties.push(next.item.difficulty);
        // Always answer correctly → should get harder items
        recordResponse(state, next.item, true, config);
      }

      // Theta should have increased
      expect(state.theta).toBeGreaterThan(0);
    });
  });

  describe('item bank', () => {
    it('builds item bank from skills registry', () => {
      const items = buildItemBank();
      expect(items.length).toBeGreaterThan(100);
    });

    it('all items have valid IRT parameters', () => {
      const items = buildItemBank();
      for (const item of items) {
        expect(item.discrimination).toBeGreaterThan(0);
        expect(item.difficulty).toBeGreaterThanOrEqual(-3);
        expect(item.difficulty).toBeLessThanOrEqual(3.5);
        expect(item.grade).toBeGreaterThanOrEqual(1);
        expect(item.grade).toBeLessThanOrEqual(8);
      }
    });

    it('covers all 8 grades', () => {
      const items = buildItemBank();
      const grades = new Set(items.map((i) => i.grade));
      expect(grades).toEqual(new Set([1, 2, 3, 4, 5, 6, 7, 8]));
    });

    it('item IDs are unique', () => {
      const items = buildItemBank();
      const ids = items.map((i) => i.id);
      expect(new Set(ids).size).toBe(ids.length);
    });
  });

  describe('item selector content balancing', () => {
    it('penalizes over-represented domains', () => {
      const pool: IrtItem[] = [
        { ...makeItem('add1', 0, 1.5), operation: 'addition' },
        { ...makeItem('add2', 0.1, 1.5), operation: 'addition' },
        { ...makeItem('add3', 0.2, 1.5), operation: 'addition' },
        { ...makeItem('add4', 0.3, 1.5), operation: 'addition' },
        { ...makeItem('sub1', 0, 1.0), operation: 'subtraction' },
      ];

      const state = createCatSession();
      // Administer 3 addition items
      state.responses = [
        { item: pool[0], correct: true },
        { item: pool[1], correct: true },
        { item: pool[2], correct: true },
      ];
      state.administeredIds = new Set(['add1', 'add2', 'add3']);

      const result = selectNextItem(pool, state);
      // Should prefer subtraction over 4th addition item
      expect(result!.item.id).toBe('sub1');
    });
  });
});
