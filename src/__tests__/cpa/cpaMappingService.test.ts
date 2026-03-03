import { deriveCpaStage, advanceCpaStage } from '@/services/cpa/cpaMappingService';
import type { CpaStage } from '@/services/cpa/cpaTypes';
import {
  CPA_CONCRETE_THRESHOLD,
  CPA_ABSTRACT_THRESHOLD,
} from '@/services/cpa/cpaTypes';

describe('CPA Mapping Service', () => {
  describe('deriveCpaStage', () => {
    it('returns concrete for P(L) = 0.0', () => {
      expect(deriveCpaStage(0.0)).toBe('concrete');
    });

    it('returns concrete for P(L) = 0.39 (just below threshold)', () => {
      expect(deriveCpaStage(0.39)).toBe('concrete');
    });

    it('returns pictorial for P(L) = 0.40 (at concrete threshold)', () => {
      expect(deriveCpaStage(0.4)).toBe('pictorial');
    });

    it('returns pictorial for P(L) = 0.84 (just below abstract threshold)', () => {
      expect(deriveCpaStage(0.84)).toBe('pictorial');
    });

    it('returns abstract for P(L) = 0.85 (at abstract threshold)', () => {
      expect(deriveCpaStage(0.85)).toBe('abstract');
    });

    it('returns abstract for P(L) = 1.0', () => {
      expect(deriveCpaStage(1.0)).toBe('abstract');
    });
  });

  describe('advanceCpaStage', () => {
    it('advances from concrete to pictorial when P(L) is in pictorial range', () => {
      expect(advanceCpaStage('concrete', 0.5)).toBe('pictorial');
    });

    it('does NOT regress from pictorial even when P(L) < 0.40', () => {
      expect(advanceCpaStage('pictorial', 0.3)).toBe('pictorial');
    });

    it('does NOT regress from abstract even when P(L) is very low', () => {
      expect(advanceCpaStage('abstract', 0.1)).toBe('abstract');
    });

    it('advances from concrete to abstract when P(L) >= 0.85 (skip pictorial)', () => {
      expect(advanceCpaStage('concrete', 0.9)).toBe('abstract');
    });

    it('advances from pictorial to abstract when P(L) >= 0.85', () => {
      expect(advanceCpaStage('pictorial', 0.9)).toBe('abstract');
    });

    it('stays at concrete when P(L) < 0.40', () => {
      expect(advanceCpaStage('concrete', 0.1)).toBe('concrete');
    });
  });

  describe('threshold constants', () => {
    it('has CPA_CONCRETE_THRESHOLD = 0.40', () => {
      expect(CPA_CONCRETE_THRESHOLD).toBe(0.4);
    });

    it('has CPA_ABSTRACT_THRESHOLD = 0.85', () => {
      expect(CPA_ABSTRACT_THRESHOLD).toBe(0.85);
    });
  });
});
