/**
 * Types for the Computerized Adaptive Testing (CAT) engine.
 *
 * Uses IRT 2PL (two-parameter logistic) model for item response,
 * EAP (Expected A Posteriori) for ability estimation, and
 * Fisher information for item selection.
 */

/** IRT 2PL item parameters */
export interface IrtItem {
  /** Unique item identifier (maps to a template or skill) */
  id: string;
  /** Discrimination parameter (a) — steepness of ICC curve, typically 0.5-2.5 */
  discrimination: number;
  /** Difficulty parameter (b) — ability level at 50% success, in logit scale */
  difficulty: number;
  /** Grade level this item targets */
  grade: number;
  /** Associated skill ID */
  skillId: string;
  /** Associated math domain */
  operation: string;
}

/** A single response in the CAT session */
export interface CatResponse {
  /** Item that was administered */
  item: IrtItem;
  /** Whether the response was correct */
  correct: boolean;
}

/** Current state of a CAT session */
export interface CatState {
  /** Current ability estimate (theta) in logit scale */
  theta: number;
  /** Standard error of ability estimate */
  standardError: number;
  /** Response history */
  responses: CatResponse[];
  /** Items already administered (avoid repeats) */
  administeredIds: Set<string>;
  /** Whether the test has terminated */
  terminated: boolean;
  /** Reason for termination */
  terminationReason?: 'se_threshold' | 'max_items' | 'no_items';
}

/** Configuration for a CAT session */
export interface CatConfig {
  /** Initial ability estimate (default 0 = average) */
  initialTheta?: number;
  /** Standard error threshold for stopping (default 0.30) */
  seThreshold?: number;
  /** Maximum number of items to administer (default 20) */
  maxItems?: number;
  /** Minimum number of items before checking SE threshold (default 5) */
  minItems?: number;
  /** Number of quadrature points for EAP estimation (default 49) */
  numQuadraturePoints?: number;
  /** Prior distribution standard deviation (default 1.0) */
  priorSd?: number;
}

/** Result of EAP estimation */
export interface EapResult {
  /** Estimated ability (theta) */
  theta: number;
  /** Standard error of the estimate */
  standardError: number;
}

/** Result of selecting the next item */
export interface ItemSelectionResult {
  /** The selected item */
  item: IrtItem;
  /** Fisher information at current theta */
  information: number;
}
