import { useState, useCallback, useRef } from 'react'
import { useNames } from './hooks/useNames'
import { useSound } from './hooks/useSound'
import PlayerPanel from './components/PlayerPanel/PlayerPanel.jsx'
import WheelStage from './components/WheelStage/WheelStage.jsx'
import WinnerReveal from './components/WinnerReveal/WinnerReveal.jsx'

export default function App() {
  const { names, add, remove, error, clearError } = useNames()
  const { muted, toggleMute, startTicks, stopTicks, playWin } = useSound()
  const [phase, setPhase] = useState('idle') // 'idle' | 'spinning' | 'revealed'
  const [winner, setWinner] = useState(null)
  const wheelRef = useRef(null)

  const handleSpinStart = useCallback(
    (duration) => {
      setPhase('spinning')
      startTicks(duration)
    },
    [startTicks],
  )

  const handleSpinComplete = useCallback(
    ({ winnerIndex }) => {
      setWinner({ name: names[winnerIndex], index: winnerIndex })
      setPhase('revealed')
      stopTicks()
      playWin()
    },
    [names, stopTicks, playWin],
  )

  const handleSpinAgain = useCallback(() => {
    setWinner(null)
    // triggerSpin inside WheelStage fires onSpinStart, which sets phase → 'spinning'
    wheelRef.current?.spin()
  }, [])

  const handleReset = useCallback(() => {
    setWinner(null)
    setPhase('idle')
  }, [])

  return (
    <div className="game-layout">
      <header style={{ textAlign: 'center', position: 'relative' }}>
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

        <button
          onClick={toggleMute}
          aria-label={muted ? 'Unmute sounds' : 'Mute sounds'}
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            background: 'transparent',
            border: `1px solid ${muted ? 'var(--color-border)' : 'var(--color-border-neon-cyan)'}`,
            borderRadius: 'var(--radius-md)',
            color: muted ? 'var(--color-text-muted)' : 'var(--color-neon-cyan)',
            fontSize: 'var(--font-size-xl)',
            padding: 'var(--space-2) var(--space-3)',
            cursor: 'pointer',
            lineHeight: 1,
            transition:
              'color var(--duration-fast) var(--ease-default), border-color var(--duration-fast) var(--ease-default)',
          }}
        >
          {muted ? '🔇' : '🔊'}
        </button>
      </header>

      <main className="game-stage">
        <WheelStage
          ref={wheelRef}
          players={names}
          onSpinComplete={handleSpinComplete}
          onSpinStart={handleSpinStart}
        />
        <PlayerPanel
          names={names}
          onAdd={add}
          onRemove={remove}
          error={error}
          onClearError={clearError}
        />
      </main>

      {phase === 'revealed' && winner && (
        <WinnerReveal
          winner={winner}
          onSpinAgain={handleSpinAgain}
          onReset={handleReset}
        />
      )}

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
