import type { SkillWeight } from './types';
import type { SkillState } from '../../store/slices/skillStatesSlice';
import type { SeededRng } from '../mathEngine/seededRng';

/**
 * Baseline floor weight added to all skills, ensuring even the strongest
 * skill has a non-zero probability of being selected.
 */
export const WEAKNESS_BASELINE = 50;

/** Default Elo used when a skill has no entry in skillStates. */
const DEFAULT_ELO = 1000;

/**
 * Assigns weights to skills based on weakness: the lower the Elo, the higher the weight.
 *
 * Weight formula: (maxElo - skillElo) + WEAKNESS_BASELINE
 *
 * This ensures:
 * - Weakest skills (lowest Elo) get the highest weight
 * - All skills get at least WEAKNESS_BASELINE weight (non-zero)
 * - Equal Elo across all skills produces equal weights
 *
 * @param unlockedSkillIds - Array of skill IDs available for selection
 * @param skillStates      - Map of skillId -> SkillState with Elo ratings
 * @param defaultElo       - Elo to assume for skills not in skillStates (default 1000)
 * @returns Array of skill weights with skillId, weight, and current Elo
 */
export function weightSkillsByWeakness(
  unlockedSkillIds: readonly string[],
  skillStates: Record<string, SkillState>,
  defaultElo: number = DEFAULT_ELO,
): SkillWeight[] {
  const elos = unlockedSkillIds.map((id) => ({
    skillId: id,
    elo: skillStates[id]?.eloRating ?? defaultElo,
  }));
  const maxElo = Math.max(...elos.map((e) => e.elo));
  return elos.map(({ skillId, elo }) => ({
    skillId,
    elo,
    weight: maxElo - elo + WEAKNESS_BASELINE,
  }));
}

/**
 * Selects a skill to practice next using weakness-weighted random selection.
 *
 * Weaker skills (lower Elo) have a higher probability of being selected,
 * but all unlocked skills have a non-zero chance thanks to the baseline floor.
 * Uses cumulative distribution sampling with the provided SeededRng.
 *
 * @param unlockedSkillIds - Array of skill IDs available for selection
 * @param skillStates      - Map of skillId -> SkillState with Elo ratings
 * @param rng              - Seeded random number generator
 * @param defaultElo       - Elo to assume for skills not in skillStates (default 1000)
 * @returns The selected skill ID
 */
export function selectSkill(
  unlockedSkillIds: readonly string[],
  skillStates: Record<string, SkillState>,
  rng: SeededRng,
  defaultElo: number = DEFAULT_ELO,
): string {
  const weights = weightSkillsByWeakness(
    unlockedSkillIds,
    skillStates,
    defaultElo,
  );
  const totalWeight = weights.reduce((sum, w) => sum + w.weight, 0);
  let roll = rng.next() * totalWeight;
  for (const w of weights) {
    roll -= w.weight;
    if (roll <= 0) return w.skillId;
  }
  return weights[weights.length - 1].skillId;
}
