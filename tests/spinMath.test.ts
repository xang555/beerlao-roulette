/**
 * Unit tests for selection logic and spin math.
 *
 * Tests cover:
 * 1. Fairness (uniform distribution) with seeded RNG
 * 2. Rotation→index mapping consistency
 * 3. Edge cases (0, 1, many names)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  pickWinnerIndex,
  calculateTargetRotation,
  indexFromRotation,
} from '../src/lib/spinMath';
import { createSeededRNG } from '../src/lib/random';

describe('spinMath', () => {
  describe('pickWinnerIndex', () => {
    describe('edge cases', () => {
      it('should return -1 for empty names array', () => {
        expect(pickWinnerIndex([])).toBe(-1);
      });

      it('should return 0 for single name (trivial winner)', () => {
        const names = ['OnlyOne'];
        expect(pickWinnerIndex(names)).toBe(0);
      });

      it('should handle 2 names edge case correctly', () => {
        // With 2 names, no-repeat constraint would mean alternating
        // But our selection is independent each spin - no repeat avoidance
        const names = ['Alice', 'Bob'];
        const rng = createSeededRNG(42);

        // Multiple independent selections - can repeat
        const results = new Set<number>();
        for (let i = 0; i < 20; i++) {
          results.add(pickWinnerIndex(names, rng));
        }
        // Should see both indices with enough samples
        expect(results.size).toBeGreaterThan(1);
      });
    });

    describe('randomness and fairness', () => {
      it('should select valid indices within range', () => {
        const names = ['a', 'b', 'c', 'd', 'e'];
        const rng = createSeededRNG(123);

        for (let i = 0; i < 100; i++) {
          const index = pickWinnerIndex(names, rng);
          expect(index).toBeGreaterThanOrEqual(0);
          expect(index).toBeLessThan(names.length);
        }
      });

      it('should be deterministic with seeded RNG', () => {
        const names = ['Alice', 'Bob', 'Charlie'];
        const rng1 = createSeededRNG(999);
        const rng2 = createSeededRNG(999);

        // Same seed should produce same results
        const result1 = pickWinnerIndex(names, rng1);
        const result2 = pickWinnerIndex(names, rng2);

        expect(result1).toBe(result2);
      });

      it('should produce uniform distribution across indices (fairness test)', () => {
        // Run statistical test with multiple seeds
        const names = ['a', 'b', 'c', 'd'];
        const bins = new Array(names.length).fill(0);
        const iterations = 10000;

        for (let i = 0; i < iterations; i++) {
          // Use different seeds for variety
          const rng = createSeededRNG(i + 1);
          bins[pickWinnerIndex(names, rng)]++;
        }

        // Expected count per bin = iterations / length
        const expected = iterations / names.length;

        // Chi-squared test for uniformity
        // Accept if chi-squared statistic is reasonable (p > 0.01)
        let chiSquared = 0;
        for (const count of bins) {
          const deviation = count - expected;
          chiSquared += (deviation * deviation) / expected;
        }

        // For 3 degrees of freedom (4 bins - 1), critical value at p=0.01 is ~11.3
        expect(chiSquared).toBeLessThan(11.3);

        // Each bin should have roughly expected count (within ±10% for large sample)
        for (const count of bins) {
          expect(count).toBeGreaterThanOrEqual(expected * 0.9);
          expect(count).toBeLessThanOrEqual(expected * 1.1);
        }
      });
    });
  });

  describe('calculateTargetRotation', () => {
    describe('validation', () => {
      it('should throw for zero totalNames', () => {
        expect(() => calculateTargetRotation(0, 0)).toThrow('totalNames must be positive');
      });

      it('should throw for negative totalNames', () => {
        expect(() => calculateTargetRotation(0, -1)).toThrow('totalNames must be positive');
      });

      it('should throw for winnerIndex out of bounds (negative)', () => {
        expect(() => calculateTargetRotation(-1, 5)).toThrow('winnerIndex -1 out of bounds');
      });

      it('should throw for winnerIndex >= totalNames', () => {
        expect(() => calculateTargetRotation(5, 5)).toThrow('winnerIndex 5 out of bounds');
      });
    });

    describe('calculation correctness', () => {
      it('should calculate correct rotation for index 0', () => {
        // 3 segments, index 0: center at 60 degrees
        const rotation = calculateTargetRotation(0, 3);
        // (0 + 0.5) * 120 + 5 * 360 = 60 + 1800 = 1860
        expect(rotation).toBe(1860);
      });

      it('should calculate correct rotation for middle index', () => {
        // 3 segments, index 1: center at 180 degrees
        const rotation = calculateTargetRotation(1, 3);
        // (1 + 0.5) * 120 + 5 * 360 = 180 + 1800 = 1980
        expect(rotation).toBe(1980);
      });

      it('should calculate correct rotation for last index', () => {
        // 3 segments, index 2: center at 300 degrees
        const rotation = calculateTargetRotation(2, 3);
        // (2 + 0.5) * 120 + 5 * 360 = 300 + 1800 = 2100
        expect(rotation).toBe(2100);
      });

      it('should support custom fullTurns parameter', () => {
        // Default 5 turns
        const defaultRotation = calculateTargetRotation(0, 3);
        // 10 turns
        const customRotation = calculateTargetRotation(0, 3, 10);

        // Difference should be exactly 5 full turns
        expect(customRotation - defaultRotation).toBe(5 * 360);
      });

      it('should always return positive rotation', () => {
        for (let n = 1; n <= 10; n++) {
          for (let i = 0; i < n; i++) {
            const rotation = calculateTargetRotation(i, n);
            expect(rotation).toBeGreaterThan(0);
          }
        }
      });
    });
  });

  describe('indexFromRotation (inverse function)', () => {
    describe('validation', () => {
      it('should throw for zero totalNames', () => {
        expect(() => indexFromRotation(100, 0)).toThrow('totalNames must be positive');
      });

      it('should throw for negative rotation', () => {
        expect(() => indexFromRotation(-10, 5)).toThrow('rotation must be non-negative');
      });
    });

    describe('roundtrip consistency', () => {
      it('should recover correct index for rotation (roundtrip test)', () => {
        for (let n = 1; n <= 20; n++) {
          for (let i = 0; i < n; i++) {
            const rotation = calculateTargetRotation(i, n);
            const recovered = indexFromRotation(rotation, n);
            expect(recovered).toBe(i);
          }
        }
      });

      it('should handle rotation with custom fullTurns', () => {
        const rotation = calculateTargetRotation(2, 5, 7);
        const recovered = indexFromRotation(rotation, 5);
        expect(recovered).toBe(2);
      });

      it('should handle rotations that exceed multiple full turns', () => {
        // Simulate accumulated rotations across multiple spins
        const rotation = calculateTargetRotation(1, 4) + calculateTargetRotation(3, 4);
        // After first spin: index 1 is under pointer
        // After second spin: index 3 is under pointer
        const final = indexFromRotation(rotation, 4);
        expect(final).toBe(3);
      });
    });

    describe('segment boundary cases', () => {
      it('should correctly identify segment at exact boundary (0 degrees)', () => {
        // 4 segments, each 90 degrees
        // At 0 rotation, segment 3's end is at 0
        const index = indexFromRotation(0, 4);
        expect(index).toBe(3);
      });

      it('should correctly identify segment at 90 degree boundary', () => {
        // 4 segments, each 90 degrees
        // At 90 degrees rotation, segment 2's end is at pointer
        const index = indexFromRotation(90, 4);
        expect(index).toBe(2);
      });
    });
  });

  describe('integration scenarios', () => {
    it('should handle typical roulette scenario (many names)', () => {
      const names = ['Alice', 'Bob', 'Charlie', 'Dana', 'Eve', 'Frank', 'Grace'];
      const rng = createSeededRNG(42);

      const winnerIndex = pickWinnerIndex(names, rng);
      const targetRotation = calculateTargetRotation(winnerIndex, names.length);
      const recovered = indexFromRotation(targetRotation, names.length);

      expect(recovered).toBe(winnerIndex);
      expect(names[winnerIndex]).toBeDefined();
    });

    it('should handle minimal 2-name scenario', () => {
      const names = ['Heads', 'Tails'];
      const rng = createSeededRNG(100);

      const winnerIndex = pickWinnerIndex(names, rng);
      const targetRotation = calculateTargetRotation(winnerIndex, names.length);
      const recovered = indexFromRotation(targetRotation, names.length);

      expect(recovered).toBe(winnerIndex);
      expect([0, 1]).toContain(winnerIndex);
    });

    it('should maintain fairness across different segment counts', () => {
      // Test uniform distribution for various segment counts
      const segmentCounts = [3, 5, 7, 10, 12];

      for (const count of segmentCounts) {
        const bins = new Array(count).fill(0);
        const samples = 1000;

        for (let i = 0; i < samples; i++) {
          const rng = createSeededRNG(i + count * 100);
          bins[pickWinnerIndex(Array(count).fill('name'), rng)]++;
        }

        // Each bin should have some hits (not all in one bin)
        const occupiedBins = bins.filter(c => c > 0).length;
        expect(occupiedBins).toBeGreaterThan(count / 2); // At least half the bins should be hit
      }
    });
  });

  describe('rotation accumulation scenario', () => {
    it('should handle multiple spins accumulating rotation', () => {
      // Simulate Frontend behavior: rotations accumulate
      const names = ['A', 'B', 'C'];
      let cumulativeRotation = 0;

      // First spin
      const rng1 = createSeededRNG(1);
      const winner1 = pickWinnerIndex(names, rng1);
      const rot1 = calculateTargetRotation(winner1, names.length);
      cumulativeRotation += rot1;
      expect(indexFromRotation(cumulativeRotation, names.length)).toBe(winner1);

      // Second spin (new spin adds to previous rotation)
      const rng2 = createSeededRNG(2);
      const winner2 = pickWinnerIndex(names, rng2);
      const rot2 = calculateTargetRotation(winner2, names.length);
      cumulativeRotation += rot2;
      // Final pointer should point to winner2
      expect(indexFromRotation(cumulativeRotation, names.length)).toBe(winner2);
    });
  });
});
