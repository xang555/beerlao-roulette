/**
 * useSpin - Selection logic and spin math hook.
 *
 * This hook is the SINGLE SOURCE of randomness in the application.
 * The Frontend Wheel component consumes winnerIndex and targetRotation
 * and must NOT reimplement selection logic.
 *
 * Logic owns: randomness, winner selection, rotation math.
 * Frontend owns: rendering, animation frame timing, DOM/canvas.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { pickWinnerIndex, calculateTargetRotation } from '../lib/spinMath';
import { defaultRNG, type RNG } from '../lib/random';

/**
 * Easing function for spin animation: fast start → slow ease-out with slight overshoot.
 *
 * Uses an out-cubic curve with configurable overshoot. The result is normalized
 * to [0, 1] where 0 = start of animation and 1 = end.
 *
 * @param t - Progress value in [0, 1]
 * @param overshoot - Amount to overshoot (0 = no overshoot, typical: 0.05-0.1)
 * @returns Eased progress value
 */
export function easeOutCubicWithOvershoot(t: number, overshoot: number = 0.05): number {
  // Clamp input
  const clampedT = Math.max(0, Math.min(1, t));

  // Out-cubic: 1 - (1 - t)^3
  const cubic = 1 - Math.pow(1 - clampedT, 3);

  // Add overshoot at end: peak slightly above 1, then settle back
  if (overshoot > 0 && clampedT > 0.7) {
    // Normalized position in the "overshoot zone" (0.7 to 1.0)
    const overshootT = (clampedT - 0.7) / 0.3;
    // Smooth sine-based overshoot that starts at 0, peaks around 0.95, returns to 0
    const overshootAmount = Math.sin(overshootT * Math.PI) * overshoot;
    return cubic + overshootAmount;
  }

  return cubic;
}

/**
 * Spin duration configuration.
 */
export interface SpinTiming {
  /** Total spin duration in milliseconds */
  duration: number;
  /** Easing function that takes progress [0,1] and returns eased progress */
  easing: (t: number) => number;
}

/**
 * Default spin timing: 3 seconds with overshoot easing.
 */
export const DEFAULT_SPIN_TIMING: SpinTiming = {
  duration: 3000,
  easing: (t) => easeOutCubicWithOvershoot(t, 0.05),
};

/**
 * State returned by useSpin hook.
 */
export interface SpinState {
  /** Is a spin currently in progress? */
  isSpinning: boolean;
  /** Index of the winning name (-1 means no winner yet or names was empty) */
  winnerIndex: number;
  /** Target wheel rotation in degrees (cumulative, includes all spins) */
  targetRotation: number;
}

/**
 * Result of a completed spin.
 */
export interface SpinResult {
  /** Index of the winning name */
  winnerIndex: number;
  /** Final rotation angle */
  targetRotation: number;
}

/**
 * Options for useSpin hook.
 */
export interface UseSpinOptions {
  /** RNG function (default: Math.random) */
  rng?: RNG;
  /** Spin timing configuration (default: 3 seconds with overshoot) */
  timing?: SpinTiming;
  /** Callback when spin completes (receives winner info) */
  onComplete?: (result: SpinResult) => void;
}

/**
 * Selection and spin math hook.
 *
 * Provides pure winner selection and rotation calculation.
 * The Frontend Wheel component consumes these values to render the animation.
 *
 * @param options - Optional RNG, timing, and completion callback
 * @returns Object with spin state and control function
 *
 * @example
 * ```ts
 * const { isSpinning, winnerIndex, targetRotation, spin } = useSpin({
 *   onComplete: (result) => console.log(`Winner: ${names[result.winnerIndex]}`),
 * });
 *
 * // Trigger a spin when user clicks
 * <button onClick={() => spin(names)}>Spin!</button>
 * ```
 */
export function useSpin(options: UseSpinOptions = {}): {
  /** Current spin state */
  state: SpinState;
  /** Start a spin - pass array of names to select from */
  spin: (names: readonly string[]) => void;
  /** Timing configuration (for frontend animation) */
  timing: SpinTiming;
} {
  const { rng = defaultRNG, timing = DEFAULT_SPIN_TIMING, onComplete } = options;

  // Track cumulative rotation across multiple spins
  const cumulativeRotationRef = useRef(0);

  // Track previous winner index for delta calculation
  const previousWinnerIndexRef = useRef(-1);

  // Track timeout for cleanup on unmount/re-spin
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const [state, setState] = useState<SpinState>({
    isSpinning: false,
    winnerIndex: -1,
    targetRotation: 0,
  });

  /**
   * Start a spin given an array of names.
   *
   * Edge cases:
   * - Empty names array: does nothing, no winner selected
   * - Single name: immediate trivial winner (no randomness needed)
   */
  const spin = useCallback((names: readonly string[]) => {
    const count = names.length;

    // Edge case: no names - cannot spin
    if (count === 0) {
      // Do nothing - remain in non-spinning state with no winner
      return;
    }

    // Clear any existing timeout (re-spin scenario)
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Select winner index
    const winnerIndex = pickWinnerIndex(names, rng);

    // Calculate target rotation
    // IMPORTANT: use absolute-rotation forward-distance approach
    // This ensures multi-spin scenarios land on the correct winner each time,
    // even when the roster changes between spins (count differs).
    const segmentAngle = 360 / count;
    const previousWinnerIndex = previousWinnerIndexRef.current;

    let deltaRotation: number;
    if (previousWinnerIndex === -1) {
      // First spin: use full target rotation
      deltaRotation = calculateTargetRotation(winnerIndex, count);
    } else {
      // Subsequent spins: calculate forward distance to new winner
      // using absolute rotation, not index delta. This is robust across
      // roster changes because we compute the desired alignment for the
      // current count and measure the clockwise gap from current position.
      const base = cumulativeRotationRef.current;

      // Desired rotation modulo: where should the winner segment be?
      // Winner index i has center at (i + 0.5) * segmentAngle.
      // To bring that segment to the top (0°), rotate clockwise by:
      const desiredMod = ((360 - (winnerIndex + 0.5) * segmentAngle) % 360 + 360) % 360;

      // Current rotation modulo: where are we now?
      const currentMod = ((base % 360) + 360) % 360;

      // Clockwise gap from current to desired
      const forward = ((desiredMod - currentMod) % 360 + 360) % 360;

      // Delta rotation: forward distance + dramatic turns (5 full turns)
      deltaRotation = forward + 5 * 360;
    }

    cumulativeRotationRef.current += deltaRotation;
    const targetRotation = cumulativeRotationRef.current;
    previousWinnerIndexRef.current = winnerIndex;

    // Update state
    setState({
      isSpinning: true,
      winnerIndex,
      targetRotation,
    });

    // Schedule completion after duration
    // Frontend will handle the actual animation frames
    // This just marks the spin as "done" logically
    timeoutRef.current = setTimeout(() => {
      setState(prev => ({
        ...prev,
        isSpinning: false,
      }));

      if (onComplete) {
        onComplete({ winnerIndex, targetRotation });
      }
      timeoutRef.current = null;
    }, timing.duration);
  }, [rng, timing, onComplete]);

  return {
    state,
    spin,
    timing,
  };
}

/**
 * Export the pure math functions for testing.
 * These allow direct assertions on selection consistency.
 */
export { pickWinnerIndex, calculateTargetRotation, indexFromRotation } from '../lib/spinMath';
export { createSeededRNG, defaultRNG } from '../lib/random';
