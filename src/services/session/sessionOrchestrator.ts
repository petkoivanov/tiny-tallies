import type { SkillState } from '../../store/slices/skillStatesSlice';
import type { SeededRng } from '../mathEngine/seededRng';
import type { PendingSkillUpdate, SessionConfig, SessionFeedback, SessionPhase, SessionProblem } from './sessionTypes';
import { DEFAULT_SESSION_CONFIG } from './sessionTypes';
import { selectTemplateForSkill, weightBySuccessProbability, weightedRandomSelect } from '../adaptive/problemSelector';
import { getUnlockedSkills } from '../adaptive/prerequisiteGating';
import { getOrCreateSkillState } from '../../store/helpers/skillStateHelpers';
import { generateProblem, createRng, getTemplatesBySkill } from '../mathEngine';
import { selectAndFormatAnswer } from '../mathEngine/answerFormats';
import { generatePracticeMix, constrainedShuffle, selectRemediationSkillIds } from './practiceMix';
import type { PracticeMixItem } from './practiceMix';
import { detectLevelUp, computeStreakUpdate } from '../gamification';

/**
 * Baseline floor weight added to all skills in strength-weighted selection,
 * ensuring even the weakest skill has a non-zero probability.
 */
export const STRENGTH_BASELINE = 50;

/**
 * Returns the session phase for a given problem index.
 *
 * - 0 to warmupCount-1: 'warmup'
 * - warmupCount to warmupCount+practiceCount-1: 'practice'
 * - warmupCount+practiceCount to total-1: 'cooldown'
 * - total or beyond: 'complete'
 */
export function getSessionPhase(
  index: number,
  config: SessionConfig = DEFAULT_SESSION_CONFIG,
): SessionPhase {
  const { warmupCount, practiceCount, cooldownCount } = config;
  const total = warmupCount + practiceCount + cooldownCount;

  if (index < warmupCount) return 'warmup';
  if (index < warmupCount + practiceCount) return 'practice';
  if (index < total) return 'cooldown';
  return 'complete';
}

/**
 * Selects a skill weighted toward the strongest (highest Elo) skills.
 * Inverts the weakness-weighting from selectSkill for confidence-building
 * in warmup and cooldown phases.
 *
 * Weight formula: (skillElo - minElo) + STRENGTH_BASELINE
 * This ensures all skills get at least STRENGTH_BASELINE weight.
 * Uses cumulative distribution sampling with the provided rng.
 *
 * @param unlockedSkillIds - Array of skill IDs available for selection
 * @param skillStates      - Map of skillId -> SkillState with Elo ratings
 * @param rng              - Seeded random number generator
 * @param defaultElo       - Elo to assume for skills not in skillStates (default 1000)
 * @returns The selected skill ID
 */
export function selectStrongestSkill(
  unlockedSkillIds: readonly string[],
  skillStates: Record<string, SkillState>,
  rng: SeededRng,
  defaultElo: number = 1000,
): string {
  const elos = unlockedSkillIds.map((id) => ({
    skillId: id,
    elo: skillStates[id]?.eloRating ?? defaultElo,
  }));

  const minElo = Math.min(...elos.map((e) => e.elo));

  const weights = elos.map(({ skillId, elo }) => ({
    skillId,
    weight: elo - minElo + STRENGTH_BASELINE,
  }));

  const totalWeight = weights.reduce((sum, w) => sum + w.weight, 0);
  let roll = rng.next() * totalWeight;

  for (const w of weights) {
    roll -= w.weight;
    if (roll <= 0) return w.skillId;
  }

  return weights[weights.length - 1].skillId;
}

/**
 * Returns the template with the lowest baseElo for a given skill.
 * Used for warmup/cooldown confidence-building problems.
 *
 * @param skillId - The skill to find the easiest template for
 * @returns The easiest problem template
 * @throws Error if no templates found for the skill
 */
export function selectEasiestTemplate(skillId: string) {
  const templates = getTemplatesBySkill(skillId);
  if (templates.length === 0) {
    throw new Error(`No templates found for skill: ${skillId}`);
  }
  return templates.reduce((a, b) => (a.baseElo <= b.baseElo ? a : b));
}

/**
 * Selects a template above the student's Elo for challenge problems.
 * Falls back to standard gaussian-targeted selection if no harder templates exist.
 *
 * @param skillId    - The skill to select a template for
 * @param studentElo - The student's current Elo rating
 * @param rng        - Seeded random number generator
 * @returns A problem template, preferring those above the student's Elo
 */
function selectChallengeTemplate(
  skillId: string,
  studentElo: number,
  rng: SeededRng,
) {
  const templates = getTemplatesBySkill(skillId);
  const harder = templates.filter((t) => t.baseElo > studentElo);

  if (harder.length === 0) {
    // No harder templates -- fall back to standard selection
    return selectTemplateForSkill(skillId, studentElo, rng);
  }

  // Use gaussian weighting centered above student Elo
  const weighted = weightBySuccessProbability(studentElo, harder);
  return weightedRandomSelect(weighted, rng);
}

/**
 * Selects up to `count` distinct skills, weighted toward strongest (highest Elo).
 * Falls back to cycling through available skills if fewer than `count` are available.
 */
function selectDistinctSkills(
  unlockedSkillIds: readonly string[],
  skillStates: Record<string, SkillState>,
  rng: SeededRng,
  count: number,
): string[] {
  const selected: string[] = [];
  const remaining = [...unlockedSkillIds];

  while (selected.length < count && remaining.length > 0) {
    const pick = selectStrongestSkill(remaining, skillStates, rng);
    selected.push(pick);
    const idx = remaining.indexOf(pick);
    if (idx !== -1) remaining.splice(idx, 1);
  }

  // If we need more than available skills, cycle through what we have
  while (selected.length < count && unlockedSkillIds.length > 0) {
    selected.push(unlockedSkillIds[selected.length % unlockedSkillIds.length]);
  }

  return selected;
}

/**
 * Generates the full 15-problem session queue.
 *
 * - Warmup (3 problems): strongest skill + easiest template
 * - Practice (9 problems): 60% review + 30% new + 10% challenge via practice mix
 * - Cooldown (3 problems): strongest skill + easiest template
 *
 * Practice problems are sourced from the practice mix algorithm which pulls from:
 *   - Review pool: Leitner-due skills (spaced repetition)
 *   - New pool: Outer fringe skills (next to learn)
 *   - Challenge pool: Mid-range P(L) skills (stretch problems above Elo)
 *
 * All 15 problems are pre-generated for simplicity. The minor Elo drift from
 * warmup answers (~5-15 points) barely shifts template selection.
 *
 * @param skillStates - Map of skillId -> SkillState with Elo ratings
 * @param config      - Session configuration (problem counts per phase)
 * @param seed        - Seed for deterministic random generation
 * @param childAge    - Child's age (6-9) for age-adjusted intervals, or null for defaults
 * @returns Array of 15 SessionProblem objects
 */
export function generateSessionQueue(
  skillStates: Record<string, SkillState>,
  config: SessionConfig = DEFAULT_SESSION_CONFIG,
  seed: number = Date.now(),
  childAge: number | null = null,
  confirmedMisconceptionSkillIds: readonly string[] = [],
  remediationOnly: boolean = false,
): SessionProblem[] {
  const rng = createRng(seed);
  const unlockedSkillIds = getUnlockedSkills(skillStates);
  const { warmupCount, practiceCount, cooldownCount } = config;
  const total = warmupCount + practiceCount + cooldownCount;
  const queue: SessionProblem[] = [];

  // Generate the practice mix
  let orderedMix: PracticeMixItem[];

  if (remediationOnly && confirmedMisconceptionSkillIds.length > 0) {
    // Pure remediation: all practice slots target misconception skills
    const selectedIds = selectRemediationSkillIds(
      confirmedMisconceptionSkillIds, skillStates, rng, practiceCount,
    );
    // Each selected skill gets at least 1 slot; fill remaining with weakest
    const mixItems: PracticeMixItem[] = selectedIds.map((skillId) => ({
      skillId,
      category: 'remediation' as const,
    }));
    // Fill remaining slots with inverse-BKT weighted selection from the confirmed set
    while (mixItems.length < practiceCount) {
      const extra = selectRemediationSkillIds(
        confirmedMisconceptionSkillIds, skillStates, rng, 1,
      );
      mixItems.push({ skillId: extra[0], category: 'remediation' as const });
    }
    orderedMix = constrainedShuffle(mixItems, rng);
  } else {
    // Standard 60/30/10 mix with optional remediation injection
    const practiceMix = generatePracticeMix(
      skillStates, childAge, rng, practiceCount, undefined, confirmedMisconceptionSkillIds,
    );
    orderedMix = constrainedShuffle(practiceMix, rng);
  }

  // Pre-select distinct bookend skills to ensure variety across warmup/cooldown
  const bookendSkills = selectDistinctSkills(
    unlockedSkillIds, skillStates, rng, warmupCount + cooldownCount,
  );
  let bookendIdx = 0;

  let practiceIdx = 0;
  const seenQuestions = new Set<string>();

  for (let i = 0; i < total; i++) {
    const phase = getSessionPhase(i, config);
    let skillId: string;
    let template;

    if (phase === 'warmup' || phase === 'cooldown') {
      // Confidence-building: rotate through distinct skills + easiest template
      skillId = bookendSkills[bookendIdx++ % bookendSkills.length];
      template = selectEasiestTemplate(skillId);
    } else {
      // Practice: sourced from practice mix with category-appropriate template selection
      const mixItem = orderedMix[practiceIdx++];
      skillId = mixItem.skillId;
      const skillState = getOrCreateSkillState(skillStates, skillId);

      if (mixItem.category === 'challenge') {
        // Challenge: prefer templates above student Elo
        template = selectChallengeTemplate(skillId, skillState.eloRating, rng);
      } else {
        // Review, new, and remediation: standard gaussian-targeted selection
        template = selectTemplateForSkill(skillId, skillState.eloRating, rng);
      }
    }

    // Generate the problem using a derived seed to avoid RNG state leaking.
    // Retry with offset seeds if the question text duplicates an earlier problem.
    const skillState = getOrCreateSkillState(skillStates, skillId);
    let problemSeed = seed + i * 31;
    let problem = generateProblem({ templateId: template.id, seed: problemSeed, elo: skillState.eloRating });

    for (let retry = 1; retry <= 5 && seenQuestions.has(problem.questionText); retry++) {
      problemSeed = seed + i * 31 + retry * 997;
      problem = generateProblem({ templateId: template.id, seed: problemSeed, elo: skillState.eloRating });
    }
    seenQuestions.add(problem.questionText);

    const presentation = selectAndFormatAnswer(problem, skillState.eloRating, problemSeed + 7);

    queue.push({
      problem,
      presentation,
      phase,
      skillId,
      templateBaseElo: template.baseElo,
      studentElo: skillState.eloRating,
    });
  }

  return queue;
}

/**
 * Commits accumulated session results to the store and returns structured feedback.
 * Called only on successful session completion (not on quit).
 *
 * Iterates pending Elo updates and applies them via updateSkillState,
 * adds total XP via addXp, detects level-ups, updates level if needed,
 * computes weekly streak update, and records the session date.
 *
 * @param pendingUpdates     - Map of skillId -> accumulated Elo/attempt/correct updates
 * @param totalXp            - Total XP earned during the session
 * @param updateSkillState   - Store action to update a single skill's state
 * @param addXp              - Store action to add XP to gamification state
 * @param currentTotalXp     - Total XP before this session
 * @param currentLevel       - Current level before this session
 * @param setLevel           - Store action to set the player's level
 * @param setLastSessionDate - Store action to record when the session happened
 * @param currentStreak      - Weekly streak count before this session
 * @param lastSessionDate    - ISO date string of the last session, or null if first
 * @param setWeeklyStreak    - Store action to set the weekly streak value
 * @returns SessionFeedback with XP earned, level info, level-up detection, and streak data
 */
export function commitSessionResults(
  pendingUpdates: Map<string, PendingSkillUpdate>,
  totalXp: number,
  updateSkillState: (skillId: string, update: Partial<SkillState>) => void,
  addXp: (amount: number) => void,
  currentTotalXp: number,
  currentLevel: number,
  setLevel: (level: number) => void,
  setLastSessionDate: (date: string) => void,
  currentStreak: number,
  lastSessionDate: string | null,
  setWeeklyStreak: (streak: number) => void,
): SessionFeedback {
  for (const [skillId, update] of pendingUpdates) {
    updateSkillState(skillId, {
      eloRating: update.newElo,
      attempts: update.attempts,
      correct: update.correct,
      lastPracticed: new Date().toISOString(),
      masteryProbability: update.newMasteryPL,
      consecutiveWrong: update.newConsecutiveWrong,
      masteryLocked: update.newMasteryLocked,
      leitnerBox: update.newLeitnerBox,
      nextReviewDue: update.newNextReviewDue,
      consecutiveCorrectInBox6: update.newConsecutiveCorrectInBox6,
      cpaLevel: update.newCpaLevel,
    });
  }
  addXp(totalXp);

  const newTotalXp = currentTotalXp + totalXp;
  const levelResult = detectLevelUp(currentTotalXp, newTotalXp);

  if (levelResult.leveledUp) {
    setLevel(levelResult.newLevel);
  }

  const streakResult = computeStreakUpdate(
    lastSessionDate,
    new Date(),
    currentStreak,
  );
  setWeeklyStreak(streakResult.newStreak);

  setLastSessionDate(new Date().toISOString());

  return {
    xpEarned: totalXp,
    newLevel: levelResult.newLevel,
    previousLevel: levelResult.previousLevel,
    leveledUp: levelResult.leveledUp,
    levelsGained: levelResult.levelsGained,
    streakCount: streakResult.newStreak,
    practicedThisWeek: streakResult.practicedThisWeek,
  };
}
