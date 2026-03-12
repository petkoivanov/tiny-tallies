import type { MathDomain } from '@/services/mathEngine/types';

const INTROS: Record<MathDomain, string> = {
  addition: "This is an addition problem! We're going to put numbers together.",
  subtraction: "This is a subtraction problem! We're going to find what's left over.",
  multiplication: "This is a multiplication problem! We're adding equal groups of numbers.",
  division: "This is a division problem! We're splitting a number into equal groups.",
  fractions: "This is a fractions problem! We're working with parts of a whole.",
  place_value: "This is a place value problem! Each digit's position has a special meaning.",
  time: "This is a time problem! We're reading or calculating with clocks.",
  money: "This is a money problem! We're working with coins and bills.",
  patterns: "This is a patterns problem! We're finding what comes next in a sequence.",
  measurement: "This is a measurement problem! We're comparing lengths, weights, or amounts.",
  ratios: "This is a ratios problem! We're comparing two quantities to each other.",
  exponents: "This is a powers problem! The small number tells you how many times to multiply the big number by itself.",
  expressions: "This is an expressions problem! We're working with math statements using numbers and letters.",
  geometry: "This is a geometry problem! We're thinking about shapes, angles, and space.",
  probability: "This is a probability problem! We're figuring out how likely something is to happen.",
  number_theory: "This is a number theory problem! We're exploring special properties of numbers.",
  basic_graphs: "This is a graph reading problem! Let's look at the chart carefully to find the answer.",
  data_analysis: "This is a data problem! We're reading and making sense of information in a chart.",
};

const DEFAULT_INTRO = "Let's think through this problem together!";

export function getProblemIntro(operation: MathDomain | undefined): string {
  if (!operation) return DEFAULT_INTRO;
  return INTROS[operation] ?? DEFAULT_INTRO;
}
