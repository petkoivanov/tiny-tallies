import { estimateAbility } from '@/services/cat/eapEstimator';
import type { CatResponse, IrtItem } from '@/services/cat/types';

function makeItem(b: number, a: number = 1.0): IrtItem {
  return {
    id: `item_${b}`,
    discrimination: a,
    difficulty: b,
    grade: 3,
    skillId: 'test-skill',
    operation: 'addition',
  };
}

function makeResponse(b: number, correct: boolean, a: number = 1.0): CatResponse {
  return { item: makeItem(b, a), correct };
}

describe('EAP Estimator', () => {
  it('returns theta=0 and SE=prior for empty responses', () => {
    const result = estimateAbility([]);
    expect(result.theta).toBe(0);
    expect(result.standardError).toBe(1.0);
  });

  it('theta increases with correct answers on easy items', () => {
    const responses: CatResponse[] = [
      makeResponse(-1, true),
      makeResponse(0, true),
      makeResponse(1, true),
    ];
    const result = estimateAbility(responses);
    expect(result.theta).toBeGreaterThan(0);
  });

  it('theta decreases with wrong answers on hard items', () => {
    const responses: CatResponse[] = [
      makeResponse(1, false),
      makeResponse(0, false),
      makeResponse(-1, false),
    ];
    const result = estimateAbility(responses);
    expect(result.theta).toBeLessThan(0);
  });

  it('SE decreases with more responses', () => {
    const r1: CatResponse[] = [makeResponse(0, true)];
    const r2: CatResponse[] = [
      makeResponse(0, true),
      makeResponse(0.5, true),
      makeResponse(-0.5, false),
    ];

    const se1 = estimateAbility(r1).standardError;
    const se2 = estimateAbility(r2).standardError;
    expect(se2).toBeLessThan(se1);
  });

  it('mixed responses converge to reasonable theta', () => {
    // Answering correctly on easy, wrong on hard → moderate ability
    const responses: CatResponse[] = [
      makeResponse(-2, true),
      makeResponse(-1, true),
      makeResponse(0, true),
      makeResponse(1, false),
      makeResponse(2, false),
    ];
    const result = estimateAbility(responses);
    // Should estimate around 0 (transitioning from correct to incorrect)
    expect(result.theta).toBeGreaterThan(-1);
    expect(result.theta).toBeLessThan(1.5);
  });

  it('all correct → high theta', () => {
    const responses: CatResponse[] = [
      makeResponse(-2, true),
      makeResponse(-1, true),
      makeResponse(0, true),
      makeResponse(1, true),
      makeResponse(2, true),
    ];
    const result = estimateAbility(responses);
    expect(result.theta).toBeGreaterThan(1.0);
  });

  it('all wrong → low theta', () => {
    const responses: CatResponse[] = [
      makeResponse(-2, false),
      makeResponse(-1, false),
      makeResponse(0, false),
      makeResponse(1, false),
      makeResponse(2, false),
    ];
    const result = estimateAbility(responses);
    expect(result.theta).toBeLessThan(-1.0);
  });

  it('higher discrimination items produce smaller SE', () => {
    const lowA: CatResponse[] = [
      makeResponse(-1, true, 0.5),
      makeResponse(0, true, 0.5),
      makeResponse(0.5, false, 0.5),
      makeResponse(1, false, 0.5),
    ];
    const highA: CatResponse[] = [
      makeResponse(-1, true, 2.0),
      makeResponse(0, true, 2.0),
      makeResponse(0.5, false, 2.0),
      makeResponse(1, false, 2.0),
    ];

    const seLow = estimateAbility(lowA).standardError;
    const seHigh = estimateAbility(highA).standardError;
    expect(seHigh).toBeLessThan(seLow);
  });

  it('respects custom prior SD', () => {
    const narrowPrior = estimateAbility([], 0.5);
    const widePrior = estimateAbility([], 2.0);
    expect(narrowPrior.standardError).toBe(0.5);
    expect(widePrior.standardError).toBe(2.0);
  });
});
