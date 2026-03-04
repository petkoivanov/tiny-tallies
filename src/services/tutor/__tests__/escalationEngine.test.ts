import { computeEscalation } from '../escalationEngine';
import type { EscalationInput, EscalationResult } from '../escalationEngine';

describe('computeEscalation', () => {
  describe('HINT mode transitions', () => {
    it('stays in hint when hintCount < 2 (even with wrong answers)', () => {
      const input: EscalationInput = {
        currentMode: 'hint',
        hintCount: 1,
        wrongAnswerCount: 1,
      };
      const result: EscalationResult = computeEscalation(input);
      expect(result).toEqual({
        nextMode: 'hint',
        shouldTransition: false,
        transitionMessage: null,
      });
    });

    it('transitions to teach when hintCount >= 2 AND wrongAnswerCount >= 1', () => {
      const input: EscalationInput = {
        currentMode: 'hint',
        hintCount: 2,
        wrongAnswerCount: 1,
      };
      const result = computeEscalation(input);
      expect(result).toEqual({
        nextMode: 'teach',
        shouldTransition: true,
        transitionMessage: 'Let me show you a different way!',
      });
    });

    it('stays in hint when hintCount >= 2 but wrongAnswerCount is 0 (needs both conditions)', () => {
      const input: EscalationInput = {
        currentMode: 'hint',
        hintCount: 2,
        wrongAnswerCount: 0,
      };
      const result = computeEscalation(input);
      expect(result).toEqual({
        nextMode: 'hint',
        shouldTransition: false,
        transitionMessage: null,
      });
    });

    it('transitions to teach with higher thresholds (hintCount=3, wrongAnswerCount=2)', () => {
      const input: EscalationInput = {
        currentMode: 'hint',
        hintCount: 3,
        wrongAnswerCount: 2,
      };
      const result = computeEscalation(input);
      expect(result).toEqual({
        nextMode: 'teach',
        shouldTransition: true,
        transitionMessage: 'Let me show you a different way!',
      });
    });
  });

  describe('TEACH mode transitions', () => {
    it('stays in teach when wrongAnswerCount < 3', () => {
      const input: EscalationInput = {
        currentMode: 'teach',
        hintCount: 2,
        wrongAnswerCount: 2,
      };
      const result = computeEscalation(input);
      expect(result).toEqual({
        nextMode: 'teach',
        shouldTransition: false,
        transitionMessage: null,
      });
    });

    it('transitions to boost when wrongAnswerCount >= 3', () => {
      const input: EscalationInput = {
        currentMode: 'teach',
        hintCount: 2,
        wrongAnswerCount: 3,
      };
      const result = computeEscalation(input);
      expect(result).toEqual({
        nextMode: 'boost',
        shouldTransition: true,
        transitionMessage: 'Let me help you through this one!',
      });
    });

    it('transitions to boost with higher wrongAnswerCount', () => {
      const input: EscalationInput = {
        currentMode: 'teach',
        hintCount: 5,
        wrongAnswerCount: 5,
      };
      const result = computeEscalation(input);
      expect(result).toEqual({
        nextMode: 'boost',
        shouldTransition: true,
        transitionMessage: 'Let me help you through this one!',
      });
    });
  });

  describe('BOOST mode (terminal)', () => {
    it('stays in boost regardless of counts (terminal state)', () => {
      const input: EscalationInput = {
        currentMode: 'boost',
        hintCount: 5,
        wrongAnswerCount: 5,
      };
      const result = computeEscalation(input);
      expect(result).toEqual({
        nextMode: 'boost',
        shouldTransition: false,
        transitionMessage: null,
      });
    });

    it('stays in boost even with zero counts', () => {
      const input: EscalationInput = {
        currentMode: 'boost',
        hintCount: 0,
        wrongAnswerCount: 0,
      };
      const result = computeEscalation(input);
      expect(result).toEqual({
        nextMode: 'boost',
        shouldTransition: false,
        transitionMessage: null,
      });
    });
  });
});
