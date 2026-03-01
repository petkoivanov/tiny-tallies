export interface SeededRng {
  /** Returns a float in [0, 1) */
  next(): number;
  /** Returns an integer in [min, max] inclusive */
  intRange(min: number, max: number): number;
}

export function createRng(seed: number): SeededRng {
  let state = seed | 0;

  function next(): number {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  return {
    next,
    intRange(min: number, max: number): number {
      return min + Math.floor(next() * (max - min + 1));
    },
  };
}
