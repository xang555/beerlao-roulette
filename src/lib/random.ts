/**
 * Random number generation utilities.
 *
 * The default RNG is Math.random for production use.
 * For testing, a seedable PRNG (Mulberry32) is provided for deterministic behavior.
 */

/**
 * A simple seeded random number generator using the Mulberry32 algorithm.
 *
 * Mulberry32 is a small, fast, and well-tested generator that produces
 * numbers in the range [0, 1). It has a period of 2^32 and good statistical
 * properties for casual use.
 *
 * @param seed - The seed value (positive integer)
 * @returns A function that returns random numbers in [0, 1)
 *
 * @example
 * ```ts
 * const rng = createSeededRNG(12345);
 * const value = rng(); // Always the same value for seed 12345
 * ```
 */
export function createSeededRNG(seed: number): () => number {
  // Ensure seed is a positive integer
  let state = Math.floor(Math.abs(seed)) || 1;

  return function mulberry32(): number {
    let t = state += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Default RNG using Math.random.
 * This is the production RNG for useSpin.
 */
export const defaultRNG = (): number => Math.random();

/**
 * Type alias for an RNG function.
 * Returns a random number in the range [0, 1).
 */
export type RNG = () => number;
