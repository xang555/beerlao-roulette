import { useRef, useEffect } from 'react'

const SVG_W = 400
const SVG_H = 430 // extra 30px at top for the pointer
const CX = SVG_W / 2
const CY = SVG_H / 2 + 15 // shifted down to make room for pointer
const RADIUS = SVG_W / 2 - 6

// Pointer tip sits right at the wheel edge
const PTR_TIP_Y = CY - RADIUS
const PTR_BASE_Y = PTR_TIP_Y - 22
const PTR_HALF_W = 13

function toPoint(angleDeg, r) {
  const rad = (angleDeg * Math.PI) / 180
  return { x: CX + r * Math.sin(rad), y: CY - r * Math.cos(rad) }
}

function segPath(i, n) {
  if (n === 1) {
    return [
      `M ${CX} ${CY - RADIUS}`,
      `A ${RADIUS} ${RADIUS} 0 1 1 ${CX} ${CY + RADIUS}`,
      `A ${RADIUS} ${RADIUS} 0 1 1 ${CX} ${CY - RADIUS}`,
      'Z',
    ].join(' ')
  }
  const seg = 360 / n
  const p0 = toPoint(i * seg, RADIUS)
  const p1 = toPoint((i + 1) * seg, RADIUS)
  const large = seg > 180 ? 1 : 0
  return [
    `M ${CX} ${CY}`,
    `L ${p0.x.toFixed(3)} ${p0.y.toFixed(3)}`,
    `A ${RADIUS} ${RADIUS} 0 ${large} 1 ${p1.x.toFixed(3)} ${p1.y.toFixed(3)}`,
    'Z',
  ].join(' ')
}

function labelProps(i, n) {
  const seg = 360 / n
  const mid = (i + 0.5) * seg
  const ratio = n <= 3 ? 0.52 : n <= 6 ? 0.62 : n <= 10 ? 0.68 : 0.72
  const { x, y } = toPoint(mid, RADIUS * ratio)
  const fontSize = n <= 4 ? 15 : n <= 7 ? 12 : n <= 12 ? 10 : 8
  return { x, y, rotate: mid, fontSize }
}

function truncate(name, n) {
  const maxLen = n <= 4 ? 14 : n <= 8 ? 10 : 7
  return name.length > maxLen ? name.slice(0, maxLen - 1) + '…' : name
}

// Idle bezel shimmer arc — 40° arc at the top of the rim, animated to orbit
const SHIMMER_HALF = 20
const shP0 = toPoint(-SHIMMER_HALF, RADIUS + 1)
const shP1 = toPoint(SHIMMER_HALF, RADIUS + 1)
const SHIMMER_PATH = `M ${shP0.x.toFixed(2)} ${shP0.y.toFixed(2)} A ${RADIUS + 1} ${RADIUS + 1} 0 0 1 ${shP1.x.toFixed(2)} ${shP1.y.toFixed(2)}`

/**
 * Wheel — SVG roulette wheel.
 *
 * Consumes isSpinning / targetRotation / timing from useSpin.
 * Never computes the winner itself.
 *
 * Colors: segment fills use CSS vars (--wheel-color-1…8) via style property,
 * which resolves custom properties unlike SVG presentation attributes.
 * Gold chrome (bezel, hub, pointer) uses --color-gold-* via style property.
 * Neutral geometry overlays (gloss dome) use hardcoded white/black.
 */
export default function Wheel({ names = [], isSpinning, targetRotation, timing }) {
  const groupRef = useRef(null)
  const currentRotRef = useRef(0)
  const rafRef = useRef(null)

  // Read inside component so the test stub (module-level matchMedia mock) applies
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useEffect(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }

    if (!isSpinning) {
      currentRotRef.current = targetRotation
      if (groupRef.current) {
        groupRef.current.style.transform = `rotate(${targetRotation}deg)`
      }
      return
    }

    const startRot = currentRotRef.current
    let startTime = null

    function frame(ts) {
      if (startTime === null) startTime = ts
      const rawT = Math.min((ts - startTime) / timing.duration, 1)
      const easedT = timing.easing(rawT)
      const rot = startRot + (targetRotation - startRot) * easedT
      currentRotRef.current = rot
      if (groupRef.current) {
        groupRef.current.style.transform = `rotate(${rot}deg)`
      }
      if (rawT < 1) {
        rafRef.current = requestAnimationFrame(frame)
      } else {
        rafRef.current = null
      }
    }

    rafRef.current = requestAnimationFrame(frame)

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
    }
  }, [isSpinning, targetRotation, timing])

  const n = names.length

  return (
    <div
      style={{
        width: 'var(--wheel-size-lg)',
        maxWidth: '100%',
        position: 'relative',
      }}
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width="100%"
        style={{ display: 'block', overflow: 'visible' }}
        aria-label={
          isSpinning
            ? 'Wheel is spinning'
            : n >= 2
            ? `Roulette wheel — ${n} players`
            : 'Add at least 2 players to spin'
        }
        role="img"
      >
        <defs>
          {/* Horizontal gold gradient — pointer and accent chrome */}
          <linearGradient id="whl-gold-h" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   style={{ stopColor: 'var(--color-gold-dark)' }} />
            <stop offset="50%"  style={{ stopColor: 'var(--color-gold-bright)' }} />
            <stop offset="100%" style={{ stopColor: 'var(--color-gold-dark)' }} />
          </linearGradient>

          {/* Radial gradient — center hub depth */}
          <radialGradient id="whl-hub-grad" cx="38%" cy="32%" r="62%">
            <stop offset="0%"   style={{ stopColor: 'var(--color-gold-bright)' }} />
            <stop offset="50%"  style={{ stopColor: 'var(--color-gold-lager)' }} />
            <stop offset="100%" style={{ stopColor: 'var(--color-gold-dark)' }} />
          </radialGradient>

          {/* Radial overlay — simulates glossy dome on wheel surface (neutral, no token needed) */}
          <radialGradient id="whl-gloss" cx="38%" cy="28%" r="55%">
            <stop offset="0%"   stopColor="#ffffff" stopOpacity="0.12" />
            <stop offset="75%"  stopColor="#ffffff" stopOpacity="0.02" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.06" />
          </radialGradient>

          <filter id="whl-ptr-glow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="whl-ring-glow" x="-15%" y="-15%" width="130%" height="130%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="whl-txt-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* ── rotating wheel group ── */}
        <g
          ref={groupRef}
          style={{
            transformOrigin: `${CX}px ${CY}px`,
            transform: `rotate(${currentRotRef.current}deg)`,
            willChange: 'transform',
          }}
        >
          {n === 0 ? (
            <circle cx={CX} cy={CY} r={RADIUS} style={{ fill: 'var(--color-bg-surface)' }} />
          ) : (
            names.map((name, i) => {
              const d = segPath(i, n)
              const lp = labelProps(i, n)
              const label = truncate(name, n)
              return (
                <g key={i}>
                  {/* segment fill via CSS var — resolves through SVG style property */}
                  <path d={d} style={{ fill: `var(--wheel-color-${(i % 8) + 1})` }} />
                  {/* divider — warm dark separator */}
                  <path d={d} style={{ fill: 'none', stroke: 'rgba(0,0,0,0.45)', strokeWidth: '1.5' }} />
                  {/* label — dark fill with white outline for legibility on any color */}
                  <text
                    x={lp.x}
                    y={lp.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={`rotate(${lp.rotate}, ${lp.x}, ${lp.y})`}
                    style={{
                      fontSize: `${lp.fontSize}px`,
                      fontFamily: 'var(--font-display)',
                      fontWeight: 700,
                      fill: 'var(--color-bg-base)',
                      paintOrder: 'stroke',
                      stroke: 'rgba(255,255,255,0.85)',
                      strokeWidth: '3px',
                      strokeLinejoin: 'round',
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                      userSelect: 'none',
                    }}
                  >
                    {label}
                  </text>
                </g>
              )
            })
          )}

          {/* Gloss dome overlay — subtle specular highlight across all segments */}
          {n > 0 && (
            <circle cx={CX} cy={CY} r={RADIUS} fill="url(#whl-gloss)" />
          )}

          {/* center hub — layered rings for depth */}
          <circle cx={CX} cy={CY} r={26} style={{ fill: 'var(--color-bg-base)' }} />
          <circle cx={CX} cy={CY} r={21} fill="url(#whl-hub-grad)" />
          <circle
            cx={CX} cy={CY} r={21}
            style={{ fill: 'none', stroke: 'var(--color-gold-bright)', strokeWidth: '1' }}
            opacity="0.65"
          />
          {/* Hub center gem */}
          <circle
            cx={CX} cy={CY} r={6}
            style={{ fill: 'var(--color-gold-bright)' }}
            filter="url(#whl-txt-glow)"
            opacity="0.95"
          />
        </g>

        {/* ── premium gold bezel (not rotating) ── */}
        {/* Outer shadow ring — depth behind the bezel */}
        <circle
          cx={CX} cy={CY} r={RADIUS + 5}
          style={{ fill: 'none', stroke: 'rgba(0,0,0,0.65)', strokeWidth: '10' }}
        />
        {/* Gold glow ring */}
        <circle
          cx={CX} cy={CY} r={RADIUS + 1}
          style={{ fill: 'none', stroke: 'var(--color-gold-lager)', strokeWidth: '6' }}
          filter="url(#whl-ring-glow)"
          opacity="0.85"
        />
        {/* Solid bezel highlight edge */}
        <circle
          cx={CX} cy={CY} r={RADIUS + 1}
          style={{ fill: 'none', stroke: 'var(--color-gold-bright)', strokeWidth: '1.5' }}
          opacity="0.55"
        />
        {/* Inner border — clean separation from segments */}
        <circle
          cx={CX} cy={CY} r={RADIUS - 1}
          style={{ fill: 'none', stroke: 'rgba(0,0,0,0.45)', strokeWidth: '1.5' }}
        />

        {/* ── idle shimmer arc — slowly orbits the bezel when not spinning ── */}
        <path
          d={SHIMMER_PATH}
          style={{
            fill: 'none',
            stroke: 'rgba(245, 200, 66, 0.65)',
            strokeWidth: '5',
            strokeLinecap: 'round',
            transformOrigin: `${CX}px ${CY}px`,
            animation:
              isSpinning || prefersReducedMotion
                ? 'none'
                : 'whl-bezel-shimmer 7s linear infinite',
          }}
        />

        {/* ── pointer (fixed at top) ── */}
        {/* Glow backing */}
        <polygon
          points={`${CX},${PTR_TIP_Y} ${CX - PTR_HALF_W - 4},${PTR_BASE_Y - 4} ${CX + PTR_HALF_W + 4},${PTR_BASE_Y - 4}`}
          style={{ fill: 'var(--color-gold-amber)' }}
          opacity="0.5"
          filter="url(#whl-ptr-glow)"
        />
        {/* Main pointer — gold gradient, tip at exactly PTR_TIP_Y = CY - RADIUS */}
        <polygon
          points={`${CX},${PTR_TIP_Y} ${CX - PTR_HALF_W},${PTR_BASE_Y} ${CX + PTR_HALF_W},${PTR_BASE_Y}`}
          fill="url(#whl-gold-h)"
          filter="url(#whl-ptr-glow)"
        />
        {/* Center highlight streak */}
        <polygon
          points={`${CX},${PTR_TIP_Y + 4} ${CX - 6},${PTR_BASE_Y + 4} ${CX + 6},${PTR_BASE_Y + 4}`}
          fill="white"
          opacity="0.55"
        />

        {/* empty-state label (visible when no names) */}
        {n === 0 && (
          <text
            x={CX}
            y={CY}
            textAnchor="middle"
            dominantBaseline="middle"
            style={{
              fontSize: '14px',
              fontFamily: 'var(--font-display)',
              fill: 'rgba(255,255,255,0.35)',
              letterSpacing: '0.15em',
            }}
          >
            ADD PLAYERS
          </text>
        )}
      </svg>
    </div>
  )
}
