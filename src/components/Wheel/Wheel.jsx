import { useRef, useEffect } from 'react'

/**
 * Segment colors mirror --wheel-color-1 … --wheel-color-8 from tokens.css.
 * Hardcoded here because SVG fill attributes don't resolve CSS custom properties.
 */
const SEGMENT_COLORS = [
  '#00e5ff', // --wheel-color-1 cyan
  '#ff007a', // --wheel-color-2 magenta
  '#39ff14', // --wheel-color-3 lime
  '#ffd700', // --wheel-color-4 gold
  '#bf00ff', // --wheel-color-5 purple
  '#ff6b00', // --wheel-color-6 orange
  '#ff69b4', // --wheel-color-7 pink
  '#0066ff', // --wheel-color-8 blue
]

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
    // Full circle as two semicircles (SVG can't arc 360° in one command)
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
  // Pull label inward more as count grows to avoid hitting the rim
  const ratio = n <= 3 ? 0.52 : n <= 6 ? 0.62 : n <= 10 ? 0.68 : 0.72
  const { x, y } = toPoint(mid, RADIUS * ratio)
  const fontSize = n <= 4 ? 15 : n <= 7 ? 12 : n <= 12 ? 10 : 8
  return { x, y, rotate: mid, fontSize }
}

function truncate(name, n) {
  const maxLen = n <= 4 ? 14 : n <= 8 ? 10 : 7
  return name.length > maxLen ? name.slice(0, maxLen - 1) + '…' : name
}

/**
 * Wheel — SVG roulette wheel.
 *
 * Consumes isSpinning / targetRotation / timing from useSpin.
 * Never computes the winner itself.
 */
export default function Wheel({ names = [], isSpinning, targetRotation, timing }) {
  const groupRef = useRef(null)
  const currentRotRef = useRef(0)
  const rafRef = useRef(null)

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
          <filter id="whl-ptr-glow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="whl-ring-glow" x="-15%" y="-15%" width="130%" height="130%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
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
            <circle cx={CX} cy={CY} r={RADIUS} fill="#111120" />
          ) : (
            names.map((name, i) => {
              const color = SEGMENT_COLORS[i % SEGMENT_COLORS.length]
              const d = segPath(i, n)
              const lp = labelProps(i, n)
              const label = truncate(name, n)
              return (
                <g key={i}>
                  {/* segment fill */}
                  <path d={d} fill={color} />
                  {/* dark divider */}
                  <path d={d} fill="none" stroke="rgba(0,0,0,0.4)" strokeWidth="1.5" />
                  {/* label — dark text with white outline for legibility on any color */}
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
                      fill: '#0a0a12',
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

          {/* center hub */}
          <circle cx={CX} cy={CY} r={18} fill="#08080f" stroke="#00e5ff" strokeWidth="2" />
          <circle cx={CX} cy={CY} r={7} fill="#00e5ff" filter="url(#whl-txt-glow)" />
        </g>

        {/* ── neon rim (not rotating) ── */}
        <circle
          cx={CX}
          cy={CY}
          r={RADIUS}
          fill="none"
          stroke="#00e5ff"
          strokeWidth="3"
          filter="url(#whl-ring-glow)"
          opacity="0.75"
        />

        {/* ── pointer (fixed at top) ── */}
        {/* glow layer */}
        <polygon
          points={`${CX},${PTR_TIP_Y} ${CX - PTR_HALF_W - 4},${PTR_BASE_Y - 4} ${CX + PTR_HALF_W + 4},${PTR_BASE_Y - 4}`}
          fill="#00e5ff"
          opacity="0.5"
          filter="url(#whl-ptr-glow)"
        />
        {/* solid triangle */}
        <polygon
          points={`${CX},${PTR_TIP_Y} ${CX - PTR_HALF_W},${PTR_BASE_Y} ${CX + PTR_HALF_W},${PTR_BASE_Y}`}
          fill="#00e5ff"
        />
        {/* white inner highlight */}
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
