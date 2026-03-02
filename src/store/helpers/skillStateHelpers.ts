// Stub — will be implemented in GREEN phase
import type { SkillState } from '../slices/skillStatesSlice';

export const DEFAULT_ELO = 0;

export function getOrCreateSkillState(
  _skillStates: Record<string, SkillState>,
  _skillId: string,
  _defaultElo: number = DEFAULT_ELO,
): SkillState {
  return { eloRating: 0, attempts: 0, correct: 0 };
}

export function isProfileComplete(_profile: {
  childName: string | null;
  childAge: number | null;
  childGrade: number | null;
  avatarId: string | null;
}): boolean {
  return false;
}
