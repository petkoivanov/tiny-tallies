import { createRng } from '../../services/mathEngine/seededRng';

describe('createRng', () => {
  it('produces deterministic sequence for same seed', () => {
    const rng1 = createRng(42);
    const rng2 = createRng(42);

    for (let i = 0; i < 10; i++) {
      expect(rng1.next()).toBe(rng2.next());
    }
  });

  it('produces different sequences for different seeds', () => {
    const rng1 = createRng(42);
    const rng2 = createRng(99);

    expect(rng1.next()).not.toBe(rng2.next());
  });

  it('next() returns values in [0, 1)', () => {
    const rng = createRng(123);

    for (let i = 0; i < 1000; i++) {
      const value = rng.next();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });

  it('intRange returns values within bounds', () => {
    const rng = createRng(456);

    for (let i = 0; i < 100; i++) {
      const value = rng.intRange(5, 15);
      expect(value).toBeGreaterThanOrEqual(5);
      expect(value).toBeLessThanOrEqual(15);
    }
  });

  it('intRange with equal min and max returns that value', () => {
    const rng = createRng(789);

    for (let i = 0; i < 10; i++) {
      expect(rng.intRange(7, 7)).toBe(7);
    }
  });
});
