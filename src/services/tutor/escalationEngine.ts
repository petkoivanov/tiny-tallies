import type { TutorMode } from './types';

/**
 * Input for the escalation state machine.
 * Pure data — no store dependencies.
 */
export interface EscalationInput {
  currentMode: TutorMode;
  hintCount: number;
  wrongAnswerCount: number;
}

/**
 * Result of an escalation check.
 * shouldTransition indicates whether the mode changed.
 */
export interface EscalationResult {
  nextMode: TutorMode;
  shouldTransition: boolean;
  transitionMessage: string | null;
}

/** Hint -> Teach requires at least this many hints given. */
const HINT_COUNT_THRESHOLD = 2;

/** Hint -> Teach also requires at least this many wrong answers. */
const WRONG_ANSWER_THRESHOLD_HINT = 1;

/** Teach -> Boost requires at least this many wrong answers. */
const WRONG_ANSWER_THRESHOLD_TEACH = 3;

/** Transition message when escalating from HINT to TEACH. */
const TEACH_TRANSITION_MESSAGE = 'Let me show you a different way!';

/** Transition message when escalating from TEACH to BOOST. */
const BOOST_TRANSITION_MESSAGE = 'Let me help you through this one!';

/**
 * Pure-function escalation state machine.
 *
 * HINT -> TEACH: hintCount >= 2 AND wrongAnswerCount >= 1
 * TEACH -> BOOST: wrongAnswerCount >= 3
 * BOOST: terminal (no further escalation)
 */
export function computeEscalation(input: EscalationInput): EscalationResult {
  const { currentMode, hintCount, wrongAnswerCount } = input;

  switch (currentMode) {
    case 'hint': {
      if (
        hintCount >= HINT_COUNT_THRESHOLD &&
        wrongAnswerCount >= WRONG_ANSWER_THRESHOLD_HINT
      ) {
        return {
          nextMode: 'teach',
          shouldTransition: true,
          transitionMessage: TEACH_TRANSITION_MESSAGE,
        };
      }
      return { nextMode: 'hint', shouldTransition: false, transitionMessage: null };
    }

    case 'teach': {
      if (wrongAnswerCount >= WRONG_ANSWER_THRESHOLD_TEACH) {
        return {
          nextMode: 'boost',
          shouldTransition: true,
          transitionMessage: BOOST_TRANSITION_MESSAGE,
        };
      }
      return { nextMode: 'teach', shouldTransition: false, transitionMessage: null };
    }

    case 'boost':
      // Terminal state — no further escalation
      return { nextMode: 'boost', shouldTransition: false, transitionMessage: null };
  }
}
