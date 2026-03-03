export interface BktParams {
  /** Prior knowledge probability P(L0) */
  pL0: number;
  /** Learn rate P(T) — probability of learning per opportunity */
  pT: number;
  /** Slip rate P(S) — probability of wrong answer despite knowing */
  pS: number;
  /** Guess rate P(G) — probability of right answer without knowing */
  pG: number;
}

export interface BktUpdateResult {
  /** Updated mastery probability P(L) after this observation */
  newPL: number;
  /** Whether skill meets mastery threshold (>= 0.95) */
  isMastered: boolean;
  /** Whether skill needs re-teaching (< 0.40) */
  needsReteaching: boolean;
}
