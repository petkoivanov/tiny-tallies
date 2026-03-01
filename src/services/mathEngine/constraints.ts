/** Returns true if adding a + b requires carrying in any column */
export function requiresCarry(a: number, b: number): boolean {
  let x = a;
  let y = b;
  while (x > 0 || y > 0) {
    if ((x % 10) + (y % 10) >= 10) return true;
    x = Math.floor(x / 10);
    y = Math.floor(y / 10);
  }
  return false;
}

/** Returns true if subtracting b from a requires borrowing in any column */
export function requiresBorrow(a: number, b: number): boolean {
  let x = a;
  let y = b;
  while (x > 0 || y > 0) {
    if ((x % 10) < (y % 10)) return true;
    x = Math.floor(x / 10);
    y = Math.floor(y / 10);
  }
  return false;
}

/** Validates that operands are non-negative integers */
export function validateOperands(a: number, b: number): void {
  if (!Number.isInteger(a) || !Number.isInteger(b)) {
    throw new Error(`Operands must be integers, got ${a} and ${b}`);
  }
  if (a < 0 || b < 0) {
    throw new Error(`Operands must be non-negative, got ${a} and ${b}`);
  }
}
