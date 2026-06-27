import { useEffect, useRef, useState } from 'react'

const SEGMENT_COLORS = [
  'var(--color-neon-cyan)',
  'var(--color-neon-magenta)',
  'var(--color-neon-lime)',
  'var(--color-neon-gold)',
  'var(--color-neon-purple)',
  'var(--color-neon-orange)',
  'var(--color-neon-pink)',
  'var(--color-neon-blue)',
]

function Confetti() {
  const [particles] = useState(() =>
    Array.from({ length: 70 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 1.2,
      duration: 1.8 + Math.random() * 1.5,
      color: SEGMENT_COLORS[i % SEGMENT_COLORS.length],
      width: 6 + Math.random() * 8,
      height: 5 + Math.random() * 5,
    })),
  )

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 201,
        overflow: 'hidden',
      }}
    >
      {particles.map(p => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: 0,
            width: `${p.width}px`,
            height: `${p.height}px`,
            background: p.color,
            borderRadius: '2px',
            boxShadow: `0 0 4px ${p.color}`,
            animation: `confetti-fall ${p.duration}s ${p.delay}s ease-in both`,
          }}
        />
      ))}
    </div>
  )
}

export default function WinnerReveal({ winner, onSpinAgain, onReset }) {
  const spinAgainRef = useRef(null)
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useEffect(() => {
    spinAgainRef.current?.focus()
  }, [])

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onReset() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onReset])

  if (!winner) return null

  return (
    <>
      {/* Layer 1 — backdrop scrim */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 200,
          background: 'var(--color-bg-overlay)',
        }}
      />

      {/* Layer 2 — confetti (above scrim, behind panel) */}
      {!reducedMotion && <Confetti />}

      {/* Layer 3 — winner panel (topmost) */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Winner announced"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 202,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'var(--space-8)',
          padding: 'var(--space-8)',
        }}
      >
        {/* Screen shake wrapper */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'var(--space-6)',
            animation: reducedMotion ? undefined : 'reveal-shake 0.6s ease-out',
          }}
        >
          {/* Zoom-in content */}
          <div
            style={{
              textAlign: 'center',
              animation: reducedMotion ? undefined : 'reveal-zoom 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) both',
            }}
          >
            {/* Live region for screen readers */}
            <div aria-live="assertive" aria-atomic="true" style={{ position: 'absolute', left: '-9999px' }}>
              {winner.name} finishes the Beerlao!
            </div>

            <div
              style={{
                fontSize: 'clamp(3rem, 12vmin, 7rem)',
                lineHeight: 1,
                marginBottom: 'var(--space-4)',
                filter: 'drop-shadow(0 0 20px rgba(255, 215, 0, 0.6))',
              }}
              aria-hidden="true"
            >
              🍺
            </div>

            <p
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(var(--font-size-3xl), 7vmin, var(--font-size-6xl))',
                fontWeight: 'var(--font-weight-black)',
                color: 'var(--color-text-winner)',
                textShadow: 'var(--glow-gold-lg)',
                letterSpacing: 'var(--letter-spacing-wide)',
                textTransform: 'uppercase',
                lineHeight: 'var(--line-height-tight)',
                marginBottom: 'var(--space-3)',
                animation: reducedMotion ? undefined : 'winner-pulse 2s ease-in-out infinite',
              }}
            >
              {winner.name}
            </p>

            <p
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(var(--font-size-lg), 3vmin, var(--font-size-2xl))',
                color: 'var(--color-text-secondary)',
                letterSpacing: 'var(--letter-spacing-wider)',
                textTransform: 'uppercase',
              }}
            >
              finishes the Beerlao!
            </p>
          </div>

          {/* Controls */}
          <div
            style={{
              display: 'flex',
              gap: 'var(--space-4)',
              flexWrap: 'wrap',
              justifyContent: 'center',
              animation: reducedMotion ? undefined : 'reveal-zoom 0.45s 0.15s cubic-bezier(0.34, 1.56, 0.64, 1) both',
            }}
          >
            <button
              ref={spinAgainRef}
              className="btn btn--primary"
              onClick={onSpinAgain}
              style={{
                fontSize: 'var(--font-size-xl)',
                padding: 'var(--space-4) var(--space-10)',
                borderRadius: 'var(--radius-full)',
                letterSpacing: 'var(--letter-spacing-widest)',
                boxShadow: 'var(--glow-cyan-md)',
              }}
            >
              SPIN AGAIN
            </button>
            <button
              className="btn btn--ghost"
              onClick={onReset}
              aria-label="Reset — return to idle"
              style={{
                fontSize: 'var(--font-size-lg)',
                padding: 'var(--space-4) var(--space-8)',
                borderRadius: 'var(--radius-full)',
                letterSpacing: 'var(--letter-spacing-widest)',
              }}
            >
              RESET
            </button>
          </div>

          <p
            style={{
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-text-muted)',
              letterSpacing: 'var(--letter-spacing-wide)',
            }}
          >
            Press Esc to reset
          </p>
        </div>
      </div>
    </>
  )
}
