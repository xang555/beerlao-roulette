import { forwardRef, useCallback, useImperativeHandle } from 'react'
import { useSpin } from '../../hooks/useSpin'
import Wheel from '../Wheel/Wheel'

/**
 * WheelStage — orchestrates useSpin and renders the Wheel + SPIN button.
 *
 * Exposes { spin } via a forwarded ref so App can trigger spin-again
 * without lifting useSpin out of this component. Both the internal button
 * and the imperative ref path go through triggerSpin so onSpinStart always fires.
 */
const WheelStage = forwardRef(function WheelStage(
  { players = [], onSpinComplete, onSpinStart },
  ref,
) {
  const handleComplete = useCallback(
    (result) => { if (onSpinComplete) onSpinComplete(result) },
    [onSpinComplete],
  )

  const { state, spin, timing } = useSpin({ onComplete: handleComplete })
  const { isSpinning, targetRotation } = state

  const canSpin = players.length >= 2 && !isSpinning

  const triggerSpin = useCallback(() => {
    if (!canSpin) return
    onSpinStart?.(timing.duration)
    spin(players)
  }, [canSpin, onSpinStart, timing.duration, spin, players])

  useImperativeHandle(ref, () => ({ spin: triggerSpin }), [triggerSpin])

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
        onClick={triggerSpin}
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
})

export default WheelStage
