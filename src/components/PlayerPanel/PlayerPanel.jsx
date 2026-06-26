/**
 * PlayerPanel — placeholder for add-player UI and player list.
 *
 * Full implementation (add, remove, validation) lives in the PlayerPanel sub-issue.
 * Exposes `players` state upward so WheelStage can consume the list.
 */
export default function PlayerPanel({ players = [], onPlayersChange }) {
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
          color: 'var(--color-neon-cyan)',
          textShadow: 'var(--glow-cyan-sm)',
          textTransform: 'uppercase',
        }}
      >
        Players
      </h2>

      {/* Input placeholder */}
      <div
        style={{
          display: 'flex',
          gap: 'var(--space-2)',
        }}
      >
        <input
          className="input"
          type="text"
          placeholder="Add player name…"
          disabled
          aria-label="Player name (coming soon)"
        />
        <button className="btn btn--primary" disabled aria-label="Add player">
          +
        </button>
      </div>

      {/* Player list placeholder */}
      <div
        style={{
          minHeight: '120px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-text-muted)',
          fontSize: 'var(--font-size-sm)',
          letterSpacing: 'var(--letter-spacing-wide)',
          border: '1px dashed var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-4)',
          textAlign: 'center',
        }}
      >
        PLAYER LIST
        <br />
        COMING SOON
      </div>

      <p
        style={{
          fontSize: 'var(--font-size-xs)',
          color: 'var(--color-text-muted)',
          textAlign: 'center',
          letterSpacing: 'var(--letter-spacing-wide)',
        }}
      >
        MIN 2 PLAYERS TO SPIN
      </p>
    </div>
  )
}
