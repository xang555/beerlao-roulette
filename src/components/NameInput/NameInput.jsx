import { useState, useRef } from 'react'

export default function NameInput({ names, onAdd, onRemove, error, onClearError }) {
  const [value, setValue] = useState('')
  const inputRef = useRef(null)

  function handleSubmit() {
    const added = onAdd(value)
    if (added) setValue('')
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
    }
  }

  function handleChange(e) {
    setValue(e.target.value)
    if (error) onClearError()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      {/* Input row */}
      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
        <input
          ref={inputRef}
          className={`input${error ? ' input--error' : ''}`}
          type="text"
          placeholder="Add player name…"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          aria-label="Player name"
          aria-describedby={error ? 'name-error' : undefined}
          aria-invalid={!!error}
          style={error ? { borderColor: 'var(--color-neon-magenta)', boxShadow: 'var(--glow-magenta-sm)' } : undefined}
        />
        <button
          className="btn btn--primary"
          onClick={handleSubmit}
          aria-label="Add player"
          style={{ whiteSpace: 'nowrap', minWidth: '2.5rem' }}
        >
          +
        </button>
      </div>

      {/* Inline error */}
      {error && (
        <p
          id="name-error"
          role="alert"
          style={{
            fontSize: 'var(--font-size-xs)',
            color: 'var(--color-neon-magenta)',
            letterSpacing: 'var(--letter-spacing-wide)',
            marginTop: 'calc(-1 * var(--space-2))',
          }}
        >
          {error}
        </p>
      )}

      {/* Player chips / empty state */}
      {names.length === 0 ? (
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
          NO PLAYERS YET
          <br />
          ADD SOME NAMES
        </div>
      ) : (
        <ul
          aria-label="Player list"
          style={{
            listStyle: 'none',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-2)',
            maxHeight: '280px',
            overflowY: 'auto',
          }}
        >
          {names.map((name, index) => (
            <li
              key={`${name}-${index}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 'var(--space-2)',
                padding: 'var(--space-2) var(--space-3)',
                background: 'var(--color-bg-elevated)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                transition: 'border-color var(--duration-fast) var(--ease-default)',
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  width: '1.25rem',
                  fontSize: 'var(--font-size-xs)',
                  color: 'var(--color-text-muted)',
                  fontFamily: 'var(--font-display)',
                  flexShrink: 0,
                }}
              >
                {index + 1}
              </span>
              <span
                style={{
                  flex: 1,
                  fontSize: 'var(--font-size-md)',
                  color: 'var(--color-text-primary)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {name}
              </span>
              <button
                className="btn btn--ghost"
                onClick={() => onRemove(index)}
                aria-label={`Remove ${name}`}
                style={{
                  padding: 'var(--space-1) var(--space-2)',
                  fontSize: 'var(--font-size-xs)',
                  minWidth: 'unset',
                  lineHeight: 1,
                  flexShrink: 0,
                }}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
