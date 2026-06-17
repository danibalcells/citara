/** Positive modulo: result is always in [0, m). */
export function mod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

/** Rotate an array left by n positions (n may be negative or > length). */
export function rotate<T>(arr: readonly T[], n: number): T[] {
  const k = mod(n, arr.length);
  return [...arr.slice(k), ...arr.slice(0, k)];
}
