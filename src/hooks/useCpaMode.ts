import { useAppStore } from '@/store/appStore';
import { getOrCreateSkillState } from '@/store/helpers/skillStateHelpers';
import { getPrimaryManipulative } from '@/services/cpa/skillManipulativeMap';
import type { CpaStage, ManipulativeType } from '@/services/cpa/cpaTypes';

/**
 * Resolved CPA mode info for a given skill.
 * - stage: persisted CPA level from the store (concrete/pictorial/abstract)
 * - manipulativeType: primary manipulative for the skill, or null if abstract/unmapped
 */
export interface CpaModeInfo {
  stage: CpaStage;
  manipulativeType: ManipulativeType | null;
}

/**
 * Resolves the CPA stage and primary manipulative type for a skill.
 *
 * Reads the PERSISTED cpaLevel from the store (does not derive from mastery live --
 * the store value respects the one-way advance constraint set by commitSessionResults).
 *
 * @param skillId - The skill identifier, or null for abstract-only mode
 * @returns CpaModeInfo with resolved stage and manipulative type
 */
export function useCpaMode(skillId: string | null): CpaModeInfo {
  const skillStates = useAppStore((s) => s.skillStates);

  // Null skillId = abstract mode (no manipulative)
  if (skillId === null) {
    return { stage: 'abstract', manipulativeType: null };
  }

  const skillState = getOrCreateSkillState(skillStates, skillId);
  const stage: CpaStage = skillState.cpaLevel ?? 'concrete';

  // Abstract stage never shows manipulatives
  if (stage === 'abstract') {
    return { stage, manipulativeType: null };
  }

  // Concrete and pictorial stages resolve the primary manipulative
  const manipulativeType = getPrimaryManipulative(skillId);
  return { stage, manipulativeType };
}
