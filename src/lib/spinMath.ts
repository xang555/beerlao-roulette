/**
 * Pure spin math for winner selection and rotation calculation.
 *
 * These functions are pure and have no side effects, making them
 * ideal for unit testing and verification.
 */

import type { RNG } from './random';

/**
 * The number of full wheel rotations to add for dramatic effect.
 * This can be adjusted for more or less "spin" before settling.
 */
const DRAMATIC_TURNS = 5;

/**
 * Picks a winner index uniformly at random from the given names array.
 *
 * @param names - Array of names to choose from
 * @param rng - Random number generator (defaults to Math.random)
 * @returns The index of the chosen winner, or -1 if names is empty
 *
 * @example
 * ```ts
 * const names = ['Alice', 'Bob', 'Charlie'];
 * const winnerIndex = pickWinnerIndex(names, Math.random);
 * // Returns 0, 1, or 2 with equal probability
 * ```
 */
export function pickWinnerIndex(names: readonly string[], rng: RNG = Math.random): number {
  const count = names.length;

  // Edge case: no names - cannot spin
  if (count === 0) {
    return -1;
  }

  // Edge case: only one name - trivial winner
  if (count === 1) {
    return 0;
  }

  // Uniform random selection: floor(random() * count)
  return Math.floor(rng() * count);
}

/**
 * Calculates the target wheel rotation to land a specific segment under the pointer.
 *
 * The wheel rotates clockwise. The pointer is fixed at the top (0 degrees).
 * Each segment spans an equal angle of 360/N degrees.
 *
 * Segment i's center is at: (i + 0.5) * (360 / N) degrees
 * To bring segment i to the top, we rotate clockwise by that amount.
 *
 * @param winnerIndex - The index of the winning segment (must be >= 0 and < totalNames)
 * @param totalNames - Total number of segments (names.length)
 * @param fullTurns - Number of complete rotations to add for drama (default: 5)
 * @returns Target rotation in degrees (always positive, clockwise)
 *
 * @example
 * ```ts
 * // With 3 segments, picking index 1
 * calculateTargetRotation(1, 3);
 * // = (1.5 / 3) * 360 + 5 * 360
 * // = 180 + 1800 = 1980 degrees
 * ```
 */
export function calculateTargetRotation(
  winnerIndex: number,
  totalNames: number,
  fullTurns: number = DRAMATIC_TURNS
): number {
  if (totalNames <= 0) {
    throw new Error('totalNames must be positive');
  }
  if (winnerIndex < 0 || winnerIndex >= totalNames) {
    throw new Error(`winnerIndex ${winnerIndex} out of bounds for ${totalNames} names`);
  }

  const segmentAngle = 360 / totalNames;
  // Center of segment winnerIndex: (winnerIndex + 0.5) * segmentAngle
  // To bring segment i to top (pointer at 0°), rotate counterclockwise by that amount
  // Since wheel rotates clockwise, we rotate by: 360 - segmentAngle
  const alignmentRotation = 360 - (winnerIndex + 0.5) * segmentAngle;

  // Add full turns for dramatic effect
  const dramaticRotation = fullTurns * 360;

  return alignmentRotation + dramaticRotation;
}

/**
 * Reverses the rotation calculation: determines which segment would be
 * under the pointer for a given final rotation.
 *
 * This is the inverse of calculateTargetRotation, used for testing
 * that rotation → index mapping is mathematically consistent.
 *
 * @param rotation - Final wheel rotation in degrees (must be >= 0)
 * @param totalNames - Total number of segments
 * @returns The index of the segment under the pointer
 *
 * @example
 * ```ts
 * // If we calculate rotation for winner 1 with 3 segments:
 * const rot = calculateTargetRotation(1, 3);
 * // Rotating back should give us the same index:
 * const recovered = indexFromRotation(rot, 3); // = 1
 * ```
 */
export function indexFromRotation(rotation: number, totalNames: number): number {
  if (totalNames <= 0) {
    throw new Error('totalNames must be positive');
  }
  if (rotation < 0) {
    throw new Error('rotation must be non-negative');
  }

  const segmentAngle = 360 / totalNames;

  // Remove full rotations to get the effective rotation
  const effectiveRotation = rotation % 360;

  // Inverse of: alignmentRotation = 360 - (i + 0.5) * segmentAngle
  // effectiveRotation = (360 - (i + 0.5) * segmentAngle) % 360
  // Solving for i: (i + 0.5) * segmentAngle = (360 - effectiveRotation) % 360
  // i = ((360 - effectiveRotation) % 360) / segmentAngle - 0.5
  // Using floor for integer index, with wraparound handling via modulo

  const normalizedAngle = (360 - effectiveRotation) % 360;
  const index = Math.floor(normalizedAngle / segmentAngle - 0.5);

  // Handle negative result (when normalizedAngle < segmentAngle / 2)
  return ((index % totalNames) + totalNames) % totalNames;
}
