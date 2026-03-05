import type { ChallengeTheme } from './challengeTypes';

export const CHALLENGE_THEMES: readonly ChallengeTheme[] = [
  {
    id: 'addition-adventure',
    name: 'Addition Adventure',
    emoji: '\u{1F680}',
    description: 'Practice your addition skills today!',
    skillFilter: { operations: ['addition'] },
    goals: { accuracyTarget: 8, streakTarget: 4 },
  },
  {
    id: 'subtraction-sprint',
    name: 'Subtraction Sprint',
    emoji: '\u{26A1}',
    description: 'Speed through subtraction problems!',
    skillFilter: { operations: ['subtraction'] },
    goals: { accuracyTarget: 8, streakTarget: 4 },
  },
  {
    id: 'number-bonds',
    name: 'Number Bonds',
    emoji: '\u{1F517}',
    description: 'Explore how numbers connect!',
    skillFilter: { operations: ['addition', 'subtraction'], grades: [1] },
    goals: { accuracyTarget: 7, streakTarget: 3 },
  },
  {
    id: 'place-value-power',
    name: 'Place Value Power',
    emoji: '\u{1F3DB}',
    description: 'Master bigger numbers with place value!',
    skillFilter: { operations: ['addition', 'subtraction'], grades: [2, 3] },
    goals: { accuracyTarget: 7, streakTarget: 3 },
  },
  {
    id: 'mixed-mastery',
    name: 'Mixed Mastery',
    emoji: '\u{2B50}',
    description: 'Show off all your math skills!',
    skillFilter: { operations: ['addition', 'subtraction'] },
    goals: { accuracyTarget: 8, streakTarget: 5 },
  },
];
