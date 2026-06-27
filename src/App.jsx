import { useNames } from './hooks/useNames'
import PlayerPanel from './components/PlayerPanel/PlayerPanel.jsx'
import WheelStage from './components/WheelStage/WheelStage.jsx'

export default function App() {
  const { names, add, remove, error, clearError } = useNames()

  return (
    <div className="game-layout">
      <header style={{ textAlign: 'center' }}>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--font-size-4xl)',
            letterSpacing: 'var(--letter-spacing-widest)',
            color: 'var(--color-neon-cyan)',
            textShadow: 'var(--glow-cyan-md)',
            textTransform: 'uppercase',
          }}
        >
          Beerlao Roulette
        </h1>
        <p
          style={{
            marginTop: 'var(--space-2)',
            color: 'var(--color-text-secondary)',
            fontSize: 'var(--font-size-sm)',
            letterSpacing: 'var(--letter-spacing-wide)',
          }}
        >
          Add names. Spin. The chosen one finishes the Beerlao.
        </p>
      </header>

      <main className="game-stage">
        <WheelStage players={names} />
        <PlayerPanel
          names={names}
          onAdd={add}
          onRemove={remove}
          error={error}
          onClearError={clearError}
        />
      </main>

      <footer
        style={{
          textAlign: 'center',
          color: 'var(--color-text-muted)',
          fontSize: 'var(--font-size-xs)',
          letterSpacing: 'var(--letter-spacing-wide)',
          paddingBottom: 'var(--space-4)',
        }}
      >
        BEERLAO ROULETTE · DRINK RESPONSIBLY
      </footer>
    </div>
  )
}
