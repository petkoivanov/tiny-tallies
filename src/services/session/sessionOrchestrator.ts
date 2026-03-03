import type { SkillState } from '../../store/slices/skillStatesSlice';
import type { SeededRng } from '../mathEngine/seededRng';
import type { PendingSkillUpdate, SessionConfig, SessionFeedback, SessionPhase, SessionProblem } from './sessionTypes';
import { DEFAULT_SESSION_CONFIG } from './sessionTypes';
import { selectSkill } from '../adaptive/skillSelector';
import { selectTemplateForSkill } from '../adaptive/problemSelector';
import { getUnlockedSkills } from '../adaptive/prerequisiteGating';
import { getOrCreateSkillState } from '../../store/helpers/skillStateHelpers';
import { generateProblem, formatAsMultipleChoice, createRng, getTemplatesBySkill } from '../mathEngine';
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
 * Generates the full 15-problem session queue.
 *
 * - Warmup (3 problems): strongest skill + easiest template
 * - Practice (9 problems): weakness-weighted skill + gaussian-targeted template
 * - Cooldown (3 problems): strongest skill + easiest template
 *
 * All 15 problems are pre-generated for simplicity. The minor Elo drift from
 * warmup answers (~5-15 points) barely shifts template selection.
 *
 * @param skillStates - Map of skillId -> SkillState with Elo ratings
 * @param config      - Session configuration (problem counts per phase)
 * @param seed        - Seed for deterministic random generation
 * @returns Array of 15 SessionProblem objects
 */
export function generateSessionQueue(
  skillStates: Record<string, SkillState>,
  config: SessionConfig = DEFAULT_SESSION_CONFIG,
  seed: number = Date.now(),
): SessionProblem[] {
  const rng = createRng(seed);
  const unlockedSkillIds = getUnlockedSkills(skillStates);
  const { warmupCount, practiceCount, cooldownCount } = config;
  const total = warmupCount + practiceCount + cooldownCount;
  const queue: SessionProblem[] = [];

  for (let i = 0; i < total; i++) {
    const phase = getSessionPhase(i, config);
    let skillId: string;
    let template;

    if (phase === 'warmup' || phase === 'cooldown') {
      // Confidence-building: strongest skill + easiest template
      skillId = selectStrongestSkill(unlockedSkillIds, skillStates, rng);
      template = selectEasiestTemplate(skillId);
    } else {
      // Practice: weakness-weighted skill + gaussian-targeted template
      skillId = selectSkill(unlockedSkillIds, skillStates, rng);
      const skillState = getOrCreateSkillState(skillStates, skillId);
      template = selectTemplateForSkill(skillId, skillState.eloRating, rng);
    }

    // Generate the problem using a derived seed to avoid RNG state leaking
    const problemSeed = seed + i * 31;
    const problem = generateProblem({ templateId: template.id, seed: problemSeed });
    const presentation = formatAsMultipleChoice(problem, problemSeed + 7);

    queue.push({
      problem,
      presentation,
      phase,
      skillId,
      templateBaseElo: template.baseElo,
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
