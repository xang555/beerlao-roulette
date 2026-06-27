import { useCallback } from 'react'
import { useSpin } from '../../hooks/useSpin'
import Wheel from '../Wheel/Wheel'

/**
 * WheelStage — orchestrates useSpin and renders the Wheel + SPIN button.
 *
 * Owns the useSpin hook so it is the single point that bridges the logic
 * layer (winnerIndex, targetRotation) with the visual layer (Wheel).
 * Never computes the winner itself — that lives exclusively in useSpin.
 */
export default function WheelStage({ players = [], onSpinComplete }) {
  const handleComplete = useCallback(
    (result) => {
      if (onSpinComplete) onSpinComplete(result)
    },
    [onSpinComplete],
  )

  const { state, spin, timing } = useSpin({ onComplete: handleComplete })
  const { isSpinning, targetRotation } = state

  const canSpin = players.length >= 2 && !isSpinning

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'var(--space-6)',
      }}
    >
      <Wheel
        names={players}
        isSpinning={isSpinning}
        targetRotation={targetRotation}
        timing={timing}
      />

      <button
        className="btn btn--primary"
        onClick={() => spin(players)}
        disabled={!canSpin}
        aria-label={
          isSpinning
            ? 'Spinning…'
            : players.length < 2
            ? 'Add at least 2 players to spin'
            : 'Spin the wheel'
        }
        style={{
          fontSize: 'var(--font-size-2xl)',
          padding: 'var(--space-4) var(--space-16)',
          borderRadius: 'var(--radius-full)',
          letterSpacing: 'var(--letter-spacing-widest)',
          boxShadow: canSpin ? 'var(--glow-cyan-md)' : 'none',
          transition:
            'box-shadow var(--duration-normal) var(--ease-default), opacity var(--duration-fast) var(--ease-default)',
        }}
      >
        {isSpinning ? 'SPINNING…' : 'SPIN'}
      </button>
    </div>
  )
}
