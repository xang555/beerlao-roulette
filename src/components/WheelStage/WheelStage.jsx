/**
 * WheelStage — placeholder for the spinning roulette wheel.
 *
 * Receives `winnerIndex` from the Logic module (not yet implemented).
 * Segment colors cycle through --wheel-color-1 … --wheel-color-8 (see tokens.css).
 *
 * Full implementation lives in the Wheel sub-issue.
 */
export default function WheelStage({ players = [], winnerIndex = null, onSpinComplete }) {
  const wheelSize = 'var(--wheel-size-lg)'

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'var(--space-6)',
      }}
    >
      {/* Wheel placeholder */}
      <div
        role="img"
        aria-label="Roulette wheel — implementation coming soon"
        style={{
          width: wheelSize,
          height: wheelSize,
          borderRadius: 'var(--radius-full)',
          background: 'var(--color-bg-surface)',
          border: '2px solid var(--color-border-neon-cyan)',
          boxShadow: 'var(--glow-cyan-md)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-muted)',
            letterSpacing: 'var(--letter-spacing-wider)',
            textAlign: 'center',
            padding: 'var(--space-4)',
          }}
        >
          WHEEL
          <br />
          COMING SOON
        </span>
      </div>

      {/* Spin button placeholder */}
      <button
        className="btn btn--primary"
        disabled
        style={{
          fontSize: 'var(--font-size-lg)',
          padding: 'var(--space-4) var(--space-12)',
          borderRadius: 'var(--radius-full)',
        }}
      >
        SPIN
      </button>
    </div>
  )
}
