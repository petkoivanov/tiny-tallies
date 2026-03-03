import {
  getUnlockedSkills,
  getOuterFringe,
  selectSkill,
  selectTemplateForSkill,
  calculateEloUpdate,
  expectedScore,
  createFrustrationState,
  updateFrustrationState,
  shouldTriggerGuard,
  calculateXp,
  BASE_XP,
} from '@/services/adaptive';
import { generateProblem } from '@/services/mathEngine';
import { createRng } from '@/services/mathEngine/seededRng';
import type { SkillState } from '@/store/slices/skillStatesSlice';

/** Helper to create a SkillState with sensible defaults */
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
    ...overrides,
  };
}

describe('adaptive difficulty integration', () => {
  it('full adaptive flow: select skill, template, generate problem, update Elo', () => {
    const skillStates: Record<string, SkillState> = {};

    // Step 1: Get unlocked skills (root skills should be unlocked with empty state)
    const unlocked = getUnlockedSkills(skillStates);
    expect(unlocked.length).toBeGreaterThan(0);

    // Step 2: Select a skill via weakness-weighted random
    const rng = createRng(42);
    const skillId = selectSkill(unlocked, skillStates, rng);
    expect(unlocked).toContain(skillId);

    // Step 3: Select a template for the skill
    const template = selectTemplateForSkill(skillId, 1000, rng);
    expect(template).toBeDefined();
    expect(template.skillId).toBe(skillId);

    // Step 4: Generate a problem from the template
    const problem = generateProblem({ templateId: template.id, seed: 123 });
    expect(problem).toBeDefined();
    expect(problem.templateId).toBe(template.id);
    expect(typeof problem.correctAnswer).toBe('number');

    // Step 5: Simulate correct answer and update Elo
    const result = calculateEloUpdate(1000, template.baseElo, true, 0);
    expect(result.newElo).toBeGreaterThan(1000);
    expect(result.expectedScore).toBeGreaterThan(0);
    expect(result.expectedScore).toBeLessThan(1);
  });

  it('frustration guard triggers after 3 wrong and selects easier template', () => {
    let frustration = createFrustrationState();

    // Simulate 3 wrong answers
    for (let i = 0; i < 3; i++) {
      frustration = updateFrustrationState(
        frustration,
        'addition.single-digit.no-carry',
        false,
      );
    }

    // Verify frustration is triggered
    expect(
      shouldTriggerGuard(frustration, 'addition.single-digit.no-carry'),
    ).toBe(true);

    // Select template with frustration active
    const rng = createRng(99);
    const template = selectTemplateForSkill(
      'addition.single-digit.no-carry',
      1000,
      rng,
      true,
    );

    // For this skill, baseElo is 800 which is < 1000
    expect(template.baseElo).toBeLessThanOrEqual(1000);
  });

  it('XP scales with difficulty', () => {
    const lowXp = calculateXp(800);
    const highXp = calculateXp(1250);

    expect(lowXp).toBe(BASE_XP);
    expect(highXp).toBeGreaterThan(BASE_XP);
    expect(highXp).toBeGreaterThan(lowXp);
  });

  it('Elo convergence simulation: 50 problems approach 85% target', () => {
    let currentElo = 1000;
    const skillId = 'addition.single-digit.no-carry';
    const rng = createRng(7777);
    const expectedScores: number[] = [];

    for (let round = 0; round < 50; round++) {
      // Select template targeting 85%
      const template = selectTemplateForSkill(skillId, currentElo, rng);

      // Record expected success for this template at current Elo
      const expected = expectedScore(currentElo, template.baseElo);
      expectedScores.push(expected);

      // Simulate answer: correct if rng.next() < expected success
      const correct = rng.next() < expected;

      // Update Elo
      const update = calculateEloUpdate(
        currentElo,
        template.baseElo,
        correct,
        round,
      );
      currentElo = update.newElo;
    }

    // Average expected success across last 10 problems should trend toward 85%
    const last10 = expectedScores.slice(-10);
    const avgExpected =
      last10.reduce((sum, v) => sum + v, 0) / last10.length;

    // Wide tolerance: 50 rounds is few for convergence, but trend should be right
    expect(avgExpected).toBeGreaterThan(0.7);
    expect(avgExpected).toBeLessThan(0.95);
  });

  it('multi-skill Elo updates are independent', () => {
    const skillABaseElo = 800; // addition.single-digit.no-carry
    const skillBBaseElo = 800; // subtraction.single-digit.no-borrow

    // Skill A: correct answer -> Elo increases
    const resultA = calculateEloUpdate(1000, skillABaseElo, true, 0);
    expect(resultA.newElo).toBeGreaterThan(1000);

    // Skill B: wrong answer -> Elo decreases
    const resultB = calculateEloUpdate(1000, skillBBaseElo, false, 0);
    expect(resultB.newElo).toBeLessThan(1000);

    // They don't share state -- independent calculations
    expect(resultA.newElo).not.toBe(resultB.newElo);
    expect(resultA.eloDelta).toBeGreaterThan(0);
    expect(resultB.eloDelta).toBeLessThan(0);
  });

  it('BKT-mastery gating: skill unlocks when prerequisite masteryLocked=true', () => {
    // Create state where addition.single-digit.no-carry is mastered
    const skillStates: Record<string, SkillState> = {
      'addition.single-digit.no-carry': makeSkillState({
        masteryLocked: true,
        masteryProbability: 0.96,
        attempts: 50,
        correct: 45,
      }),
    };
    const unlocked = getUnlockedSkills(skillStates);
    // Next addition skill should be unlocked (prereq mastered)
    expect(unlocked).toContain('addition.within-20.no-carry');
    // subtraction.within-20.no-borrow requires BOTH subtraction root + addition.within-20.no-carry
    // addition.within-20.no-carry is not mastered -> subtraction.within-20.no-borrow NOT unlocked
    expect(unlocked).not.toContain('subtraction.within-20.no-borrow');
  });

  it('outer fringe returns ready-to-learn skills', () => {
    const skillStates: Record<string, SkillState> = {
      'addition.single-digit.no-carry': makeSkillState({
        masteryLocked: true,
        masteryProbability: 0.96,
        attempts: 50,
        correct: 45,
      }),
      'subtraction.single-digit.no-borrow': makeSkillState({
        masteryLocked: true,
        masteryProbability: 0.95,
        attempts: 40,
        correct: 35,
      }),
    };
    const fringe = getOuterFringe(skillStates);
    // addition.within-20.no-carry should be in fringe (prereq mastered, not practiced)
    expect(fringe).toContain('addition.within-20.no-carry');
    // subtraction.within-20.no-borrow needs BOTH prereqs mastered
    // (subtraction.single-digit.no-borrow + addition.within-20.no-carry)
    // addition.within-20.no-carry is NOT mastered -> NOT in fringe
    expect(fringe).not.toContain('subtraction.within-20.no-borrow');
  });
});
