import type { MathDomain } from '@/services/mathEngine/types';

const INTROS: Record<MathDomain, string> = {
  addition: "This is an addition problem! Take a good look and tell me what you notice.",
  subtraction: "This is a subtraction problem! Read it carefully and tell me what you see.",
  multiplication: "This is a multiplication problem! Take a moment to look it over.",
  division: "This is a division problem! Read it carefully — what do you notice?",
  fractions: "This is a fractions problem! Take a good look and tell me what you see.",
  place_value: "This is a place value problem! Look at each number carefully.",
  time: "This is a time problem! Take a look and tell me what you notice.",
  money: "This is a money problem! Read it carefully — what do you see?",
  patterns: "This is a patterns problem! Look at the sequence and tell me what you notice.",
  measurement: "This is a measurement problem! Take a good look and tell me what you see.",
  ratios: "This is a ratios problem! Read it carefully — what do you notice?",
  exponents: "This is a powers problem! Take a moment to look it over.",
  expressions: "This is an expressions problem! Look carefully and tell me what you notice.",
  geometry: "This is a geometry problem! Take a good look at the shape or diagram.",
  probability: "This is a probability problem! Read it carefully — what do you notice?",
  number_theory: "This is a number theory problem! Take a moment to look it over.",
  basic_graphs: "This is a graph reading problem! Take a good look at the chart.",
  data_analysis: "This is a data problem! Look at the information carefully.",
};

const DEFAULT_INTRO = "Let's think through this problem together!";

export function getProblemIntro(operation: MathDomain | undefined): string {
  if (!operation) return DEFAULT_INTRO;
  return INTROS[operation] ?? DEFAULT_INTRO;
}
