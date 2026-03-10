import type { BugPattern } from './types';

export const TIME_BUGS: readonly BugPattern[] = [
  {
    id: 'time_hand_swap',
    operations: ['time'],
    description: 'Confuses hour and minute values (gives hour when asked for minutes)',
    minDigits: 1,
    compute(a, b) {
      // operands: [hour, minutes] — give the hour when minutes is asked
      if (b === 0 || a === b) return null;
      return a > 0 ? a : null;
    },
  },
  {
    id: 'time_off_by_five',
    operations: ['time'],
    description: 'Off by 5 minutes when reading clock',
    minDigits: 1,
    compute(a, b) {
      // operands: [hour, minutes] — off by 5 from the minutes
      const wrong = b + 5;
      return wrong <= 59 ? wrong : b - 5 > 0 ? b - 5 : null;
    },
  },
  {
    id: 'time_minute_as_number',
    operations: ['time'],
    description: 'Reads minute hand position number instead of minutes (3 instead of 15)',
    minDigits: 1,
    compute(a, b) {
      // operands: [hour, minutes]
      if (b === 0 || b % 5 !== 0) return null;
      const wrong = b / 5;
      return wrong !== b ? wrong : null;
    },
  },
  {
    id: 'time_hour_round_up',
    operations: ['time'],
    description: 'Rounds hour up instead of reading current hour',
    minDigits: 1,
    compute(a) {
      // operands: [hour, minutes] — gives next hour
      const wrong = a >= 12 ? 1 : a + 1;
      return wrong !== a ? wrong : null;
    },
  },
  {
    id: 'time_elapsed_off_by_hour',
    operations: ['time'],
    description: 'Forgets to account for hour boundary in elapsed time',
    minDigits: 1,
    compute(a, b) {
      // operands: [startMinutes, elapsed] for elapsed problems
      const total = a + b;
      if (total < 60) return null;
      // Gives remainder after subtracting 60 instead of full elapsed
      return total - 60;
    },
  },
  {
    id: 'time_am_pm_confusion',
    operations: ['time'],
    description: 'Off by 12 in AM/PM conversions',
    minDigits: 1,
    compute(a, b) {
      // operands: [startHour, elapsed] for AM/PM
      const wrong = b + 12;
      return wrong !== b ? wrong : null;
    },
  },
];
