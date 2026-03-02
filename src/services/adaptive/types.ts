import type { ProblemTemplate } from '../mathEngine/types';

export interface EloUpdateResult {
  newElo: number;
  eloDelta: number;
  expectedScore: number;
}

export interface FrustrationState {
  /** Map of skillId -> consecutive wrong count */
  consecutiveWrong: Record<string, number>;
}

export interface WeightedTemplate {
  template: ProblemTemplate;
  weight: number;
  expectedSuccess: number;
}

export interface SkillWeight {
  skillId: string;
  weight: number;
  elo: number;
}
