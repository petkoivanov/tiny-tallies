import {
  getBktParams,
  updateBktMastery,
  DEFAULT_BKT_PARAMS,
  BKT_MASTERY_THRESHOLD,
  BKT_RETEACH_THRESHOLD,
  applySoftMasteryLock,
  MASTERY_LOCK_BREAK_COUNT,
} from '@/services/adaptive/bktCalculator';

describe('getBktParams', () => {
  it('returns age 6-7 bracket params for age 6', () => {
    const params = getBktParams(6);
    expect(params).toEqual({ pL0: 0.1, pT: 0.25, pS: 0.15, pG: 0.30 });
  });

  it('returns age 6-7 bracket params for age 7', () => {
    const params = getBktParams(7);
    expect(params).toEqual({ pL0: 0.1, pT: 0.25, pS: 0.15, pG: 0.30 });
  });

  it('returns age 7-8 bracket params for age 8', () => {
    const params = getBktParams(8);
    expect(params).toEqual({ pL0: 0.1, pT: 0.30, pS: 0.10, pG: 0.25 });
  });

  it('returns age 8-9 bracket params for age 9', () => {
    const params = getBktParams(9);
    expect(params).toEqual({ pL0: 0.1, pT: 0.35, pS: 0.08, pG: 0.20 });
  });

  it('returns research defaults for null age', () => {
    const params = getBktParams(null);
    expect(params).toEqual({ pL0: 0.1, pT: 0.30, pS: 0.10, pG: 0.25 });
  });
});

describe('updateBktMastery', () => {
  it('increases P(L) after correct answer', () => {
    const result = updateBktMastery(0.5, true, DEFAULT_BKT_PARAMS);
    expect(result.newPL).toBeGreaterThan(0.5);
  });

  it('decreases P(L) after incorrect answer', () => {
    const result = updateBktMastery(0.5, false, DEFAULT_BKT_PARAMS);
    expect(result.newPL).toBeLessThan(0.5);
  });

  it('computes expected value from P(L0) after first correct', () => {
    const params = DEFAULT_BKT_PARAMS;
    // Manual calculation:
    // P(L|correct) = P(L)*(1-P(S)) / (P(L)*(1-P(S)) + (1-P(L))*P(G))
    //              = 0.1*0.9 / (0.1*0.9 + 0.9*0.25) = 0.09 / (0.09+0.225) = 0.09/0.315 = 2/7
    // P(L_new) = P(L|correct) + (1-P(L|correct))*P(T) = 2/7 + 5/7*0.3 = 2/7 + 1.5/7 = 3.5/7 = 0.5
    const result = updateBktMastery(0.1, true, params);
    expect(result.newPL).toBeCloseTo(0.5, 5);
  });

  it('flags isMastered when newPL >= 0.95', () => {
    const result = updateBktMastery(0.96, true, DEFAULT_BKT_PARAMS);
    expect(result.isMastered).toBe(true);
  });

  it('flags needsReteaching when newPL < 0.40', () => {
    const result = updateBktMastery(0.1, false, DEFAULT_BKT_PARAMS);
    expect(result.needsReteaching).toBe(true);
  });

  it('reaches mastery from P(L0)=0.1 with consecutive correct answers', () => {
    let pL = 0.1;
    for (let i = 0; i < 50; i++) {
      const result = updateBktMastery(pL, true, DEFAULT_BKT_PARAMS);
      pL = result.newPL;
      if (result.isMastered) break;
    }
    expect(pL).toBeGreaterThanOrEqual(0.95);
  });

  it('drops below reteach threshold from P(L)=0.95 with consecutive wrong answers', () => {
    let pL = 0.95;
    for (let i = 0; i < 50; i++) {
      const result = updateBktMastery(pL, false, DEFAULT_BKT_PARAMS);
      pL = result.newPL;
      if (result.needsReteaching) break;
    }
    expect(pL).toBeLessThan(0.40);
  });
});

describe('BKT constants', () => {
  it('BKT_MASTERY_THRESHOLD equals 0.95', () => {
    expect(BKT_MASTERY_THRESHOLD).toBe(0.95);
  });

  it('BKT_RETEACH_THRESHOLD equals 0.40', () => {
    expect(BKT_RETEACH_THRESHOLD).toBe(0.40);
  });

  it('MASTERY_LOCK_BREAK_COUNT equals 3', () => {
    expect(MASTERY_LOCK_BREAK_COUNT).toBe(3);
  });
});

describe('applySoftMasteryLock', () => {
  it('protects mastery when locked and fewer than 3 consecutive wrong', () => {
    const bktResult = { newPL: 0.80, isMastered: false, needsReteaching: false };
    const result = applySoftMasteryLock(bktResult, true, 1, false);
    expect(result.masteryProbability).toBeCloseTo(BKT_MASTERY_THRESHOLD);
    expect(result.consecutiveWrong).toBe(2);
    expect(result.masteryLocked).toBe(true);
  });

  it('breaks lock after 3 consecutive wrong answers', () => {
    const bktResult = { newPL: 0.80, isMastered: false, needsReteaching: false };
    const result = applySoftMasteryLock(bktResult, true, 2, false);
    expect(result.masteryProbability).toBe(0.80);
    expect(result.consecutiveWrong).toBe(3);
    expect(result.masteryLocked).toBe(false);
  });

  it('achieves mastery lock on first mastery', () => {
    const bktResult = { newPL: 0.96, isMastered: true, needsReteaching: false };
    const result = applySoftMasteryLock(bktResult, false, 0, true);
    expect(result.masteryProbability).toBe(0.96);
    expect(result.consecutiveWrong).toBe(0);
    expect(result.masteryLocked).toBe(true);
  });

  it('resets consecutiveWrong to 0 on correct answer', () => {
    const bktResult = { newPL: 0.60, isMastered: false, needsReteaching: false };
    const result = applySoftMasteryLock(bktResult, false, 2, true);
    expect(result.consecutiveWrong).toBe(0);
  });

  it('keeps lock and resets consecutiveWrong on correct when locked', () => {
    const bktResult = { newPL: 0.93, isMastered: false, needsReteaching: false };
    const result = applySoftMasteryLock(bktResult, true, 1, true);
    expect(result.masteryProbability).toBe(0.93);
    expect(result.consecutiveWrong).toBe(0);
    expect(result.masteryLocked).toBe(true);
  });

  it('does not lock when not mastered and not previously locked on wrong answer', () => {
    const bktResult = { newPL: 0.50, isMastered: false, needsReteaching: false };
    const result = applySoftMasteryLock(bktResult, false, 0, false);
    expect(result.masteryProbability).toBe(0.50);
    expect(result.consecutiveWrong).toBe(1);
    expect(result.masteryLocked).toBe(false);
  });
});
