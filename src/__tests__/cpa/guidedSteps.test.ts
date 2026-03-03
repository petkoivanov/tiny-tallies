import { getNextGuidedStep } from '@/services/cpa/guidedSteps';

describe('guidedSteps', () => {
  describe('getNextGuidedStep', () => {
    it('returns correct target for ten_frame + addition at start', () => {
      const step = getNextGuidedStep('addition', 'ten_frame', [3, 4], 0);
      expect(step).not.toBeNull();
      expect(step!.targetId).toBe('cell-0');
    });

    it('returns correct target for ten_frame + addition mid-progress', () => {
      const step = getNextGuidedStep('addition', 'ten_frame', [3, 4], 5);
      expect(step).not.toBeNull();
      expect(step!.targetId).toBe('cell-5');
    });

    it('returns null for ten_frame + addition when sum reached', () => {
      const step = getNextGuidedStep('addition', 'ten_frame', [3, 4], 7);
      expect(step).toBeNull();
    });

    it('returns correct target for counters + addition', () => {
      const step = getNextGuidedStep('addition', 'counters', [5, 3], 2);
      expect(step).not.toBeNull();
      expect(step!.targetId).toBe('add-counter-button');
    });

    it('returns null for counters + addition when sum reached', () => {
      const step = getNextGuidedStep('addition', 'counters', [5, 3], 8);
      expect(step).toBeNull();
    });

    it('returns correct target for base_ten_blocks + addition', () => {
      const step = getNextGuidedStep('addition', 'base_ten_blocks', [23, 14], 0);
      expect(step).not.toBeNull();
      // Should target tens or ones column
      expect(step!.targetId).toMatch(/^(tens-column|ones-column)$/);
    });

    it('returns correct target for counters + subtraction', () => {
      // At start (0 counters), need to add first operand first
      const step = getNextGuidedStep('subtraction', 'counters', [7, 3], 0);
      expect(step).not.toBeNull();
      expect(step!.targetId).toBe('add-counter-button');
    });

    it('returns correct target for counters + subtraction when removing', () => {
      // At 7 counters (first operand placed), now need to remove
      const step = getNextGuidedStep('subtraction', 'counters', [7, 3], 7);
      expect(step).not.toBeNull();
      expect(step!.targetId).toBe('counter-to-remove');
    });

    it('returns null for counters + subtraction when done', () => {
      // 7 - 3 = 4, at 4 we're done removing
      const step = getNextGuidedStep('subtraction', 'counters', [7, 3], 4);
      expect(step).toBeNull();
    });

    it('returns correct target for ten_frame + subtraction', () => {
      // At start, need to fill first operand cells
      const step = getNextGuidedStep('subtraction', 'ten_frame', [8, 3], 0);
      expect(step).not.toBeNull();
      expect(step!.targetId).toBe('cell-0');
    });

    it('returns target for ten_frame + subtraction when removing', () => {
      // At 8 cells filled, need to remove
      const step = getNextGuidedStep('subtraction', 'ten_frame', [8, 3], 8);
      expect(step).not.toBeNull();
      expect(step!.targetId).toBe('cell-to-remove');
    });

    it('returns null when all steps complete for ten_frame subtraction', () => {
      // 8 - 3 = 5, at 5 we're done
      const step = getNextGuidedStep('subtraction', 'ten_frame', [8, 3], 5);
      expect(step).toBeNull();
    });

    it('returns correct target for number_line + addition', () => {
      const step = getNextGuidedStep('addition', 'number_line', [4, 3], 0);
      expect(step).not.toBeNull();
      expect(step!.targetId).toBe('marker');
    });

    it('returns correct target for bar_model + addition', () => {
      const step = getNextGuidedStep('addition', 'bar_model', [5, 4], 0);
      expect(step).not.toBeNull();
      expect(step!.targetId).toBe('whole-label');
    });

    it('returns null for unmapped manipulative types', () => {
      const step = getNextGuidedStep('addition', 'fraction_strips', [1, 2], 0);
      expect(step).toBeNull();
    });
  });
});
