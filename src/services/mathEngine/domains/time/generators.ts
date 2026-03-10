/**
 * Time generators — grades 1-3.
 *
 * Covers: read clock (hour, half hour, quarter hour, 5-min, 1-min),
 * AM/PM understanding, and elapsed time.
 *
 * Clock-reading answers are the minute value (or hour for hour-only).
 * All answers are integers (NumericAnswer) for multiple-choice.
 */

import { numericAnswer } from '../../types';
import type { DomainProblemData, ProblemTemplate } from '../../types';
import type { SeededRng } from '../../seededRng';

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

/**
 * Read clock — dispatched by precision.
 * hour → answer is the hour (1-12)
 * half_hour → minutes are 0 or 30, answer is the minutes
 * quarter_hour → minutes are 0/15/30/45, answer is the minutes
 * five_minutes → minutes are multiples of 5, answer is the minutes
 * one_minute → any minute 0-59, answer is the minutes
 */
export function generateReadClock(
  template: ProblemTemplate,
  rng: SeededRng,
  precision: string,
): DomainProblemData {
  const ranges = template.operandRanges ?? [
    { min: 1, max: 12 },
    { min: 0, max: 59 },
  ];

  const hour = rng.intRange(ranges[0].min, ranges[0].max);

  let minutes: number;
  switch (precision) {
    case 'hour':
      minutes = 0;
      break;
    case 'half_hour':
      minutes = rng.next() < 0.5 ? 0 : 30;
      break;
    case 'quarter_hour': {
      const quarters = [0, 15, 30, 45];
      minutes = quarters[rng.intRange(0, 3)];
      break;
    }
    case 'five_minutes':
      minutes = rng.intRange(0, 11) * 5;
      break;
    default: // one_minute
      minutes = rng.intRange(ranges[1].min, ranges[1].max);
      break;
  }

  if (precision === 'hour') {
    return {
      operands: [hour, minutes],
      correctAnswer: numericAnswer(hour),
      questionText: `The clock shows ${hour}:${pad(minutes)}. What hour is it?`,
      metadata: {
        displayTime: { hours: hour, minutes },
        answerDisplay: `${hour}:${pad(minutes)}`,
      },
    };
  }

  return {
    operands: [hour, minutes],
    correctAnswer: numericAnswer(minutes),
    questionText: `The clock shows ${hour}:${pad(minutes)}. What are the minutes?`,
    metadata: {
      displayTime: { hours: hour, minutes },
      answerDisplay: `${hour}:${pad(minutes)}`,
    },
  };
}

/**
 * AM/PM — how many hours between two times crossing noon or midnight.
 * "How many hours from 9 AM to 2 PM?" → 5
 */
export function generateAmPm(
  template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  const ranges = template.operandRanges ?? [
    { min: 1, max: 12 },
    { min: 0, max: 59 },
  ];

  // Generate a start hour (AM) and elapsed hours that cross noon
  const startHour = rng.intRange(Math.max(ranges[0].min, 6), 11);
  const elapsed = rng.intRange(1, 6);
  const endHour24 = startHour + elapsed;
  const endHour12 = endHour24 > 12 ? endHour24 - 12 : endHour24;
  const crossesNoon = endHour24 > 12;

  const startLabel = `${startHour} AM`;
  const endLabel = crossesNoon ? `${endHour12} PM` : `${endHour24} AM`;

  return {
    operands: [startHour, elapsed],
    correctAnswer: numericAnswer(elapsed),
    questionText: `How many hours from ${startLabel} to ${endLabel}?`,
    metadata: {
      displayTime: { hours: startHour, minutes: 0 },
    },
  };
}

/**
 * Elapsed time — how many minutes between two times.
 * "It is 2:15. In 30 minutes, what will the minutes show?"
 */
export function generateElapsed(
  template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  const ranges = template.operandRanges ?? [
    { min: 1, max: 12 },
    { min: 5, max: 60 },
  ];

  const startHour = rng.intRange(ranges[0].min, ranges[0].max);
  const startMinutes = rng.intRange(0, 11) * 5; // start on 5-min mark
  const elapsed = rng.intRange(1, Math.floor(ranges[1].max / 5)) * 5; // elapsed in 5-min increments

  const totalMinutes = startMinutes + elapsed;
  const endMinutes = totalMinutes % 60;
  const endHour = startHour + Math.floor(totalMinutes / 60);
  const endHour12 = endHour > 12 ? endHour - 12 : endHour;

  return {
    operands: [startMinutes, elapsed],
    correctAnswer: numericAnswer(elapsed),
    questionText:
      `It is ${startHour}:${pad(startMinutes)}. ` +
      `The time changes to ${endHour12}:${pad(endMinutes)}. ` +
      `How many minutes passed?`,
    metadata: {
      displayTime: { hours: startHour, minutes: startMinutes },
      answerDisplay: `${elapsed} minutes`,
    },
  };
}
