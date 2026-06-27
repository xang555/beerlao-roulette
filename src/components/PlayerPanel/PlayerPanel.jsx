import NameInput from '../NameInput/NameInput'

export default function PlayerPanel({ names, onAdd, onRemove, error, onClearError }) {
  return (
    <div
      className="card card--neon"
      style={{
        width: 'clamp(280px, 30vw, 360px)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)',
      }}
    >
      <h2
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--font-size-lg)',
          letterSpacing: 'var(--letter-spacing-wider)',
          color: 'var(--color-primary-light)',
          textShadow: 'var(--glow-amber-sm)',
          textTransform: 'uppercase',
        }}
      >
        Players
        {names.length > 0 && (
          <span
            style={{
              marginLeft: 'var(--space-2)',
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-text-muted)',
              fontFamily: 'var(--font-body)',
              fontWeight: 'var(--font-weight-normal)',
              letterSpacing: 'var(--letter-spacing-normal)',
            }}
          >
            ({names.length})
          </span>
        )}
      </h2>

      <NameInput
        names={names}
        onAdd={onAdd}
        onRemove={onRemove}
        error={error}
        onClearError={onClearError}
      />

      <p
        style={{
          fontSize: 'var(--font-size-xs)',
          color: names.length >= 2 ? 'var(--color-neon-lime)' : 'var(--color-text-muted)',
          textAlign: 'center',
          letterSpacing: 'var(--letter-spacing-wide)',
          transition: 'color var(--duration-normal) var(--ease-default)',
        }}
      >
        {names.length >= 2
          ? `${names.length} PLAYERS READY`
          : `MIN 2 PLAYERS TO SPIN · ${2 - names.length} MORE NEEDED`}
      </p>
    </div>
  )
}
