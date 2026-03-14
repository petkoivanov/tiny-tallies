import type { MathDomain } from '@/services/mathEngine/types';

const INTROS: Record<MathDomain, string> = {
  addition: "Think about the numbers you're adding together. How do they combine?",
  subtraction: "Think about what numbers are given and how they relate. What's being taken away?",
  multiplication: "Think about the two numbers here. How many groups, and how many in each group?",
  division: "Think about the numbers given. How would you split the big number into equal groups?",
  fractions: "Look at the fraction parts. What does the top number mean? What about the bottom?",
  place_value: "Think about what each digit is worth based on where it sits in the number.",
  time: "Think about the times or durations given. How do they relate to each other?",
  money: "Think about the amounts given. What do you need to do with them?",
  patterns: "Look at how the numbers change from one to the next. Can you spot the rule?",
  measurement: "Think about the units and numbers given. What are you being asked to find?",
  ratios: "Think about the two amounts and how they compare to each other.",
  exponents: "Think about the base number and how many times you multiply it by itself.",
  expressions: "Look at the numbers and operations. Think about which steps to do first.",
  geometry: "Think about the shape and the measurements given. What are you looking for?",
  probability: "Think about all the possible outcomes and which ones you're looking for.",
  number_theory: "Think about the properties of the number \u2014 is it even, odd, prime, or composite?",
  basic_graphs: "Look at the labels on the chart. What do the numbers and bars tell you?",
  data_analysis: "Think about what the numbers represent and what they tell you as a group.",
  linear_equations: "Think about the unknown value. What operation undoes what's been done to it?",
  coordinate_geometry: "Think about the coordinates given and how they relate on the grid.",
  sequences_series: "Look at how each term connects to the next. What rule ties them together?",
  statistics_hs: "Think about what the data values tell you and which measure fits the question.",
  systems_equations: "Think about which method \u2014 substitution or elimination \u2014 makes this system easier to solve.",
  quadratic_equations: "Think about the coefficients. Can you factor, or would the quadratic formula work better?",
  polynomials: "Think about the terms and their degrees. What operation are you being asked to do?",
  exponential_functions: "Think about the base and the exponent. Is this growth or decay?",
  logarithms: "Think about what power you need to raise the base to. What special values do you know?",
};

const DEFAULT_INTRO = "Think about what numbers are given and the relationship between them.";

export function getProblemIntro(operation: MathDomain | undefined): string {
  if (!operation) return DEFAULT_INTRO;
  return INTROS[operation] ?? DEFAULT_INTRO;
}
