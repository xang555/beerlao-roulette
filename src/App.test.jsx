// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act, fireEvent } from '@testing-library/react'
import App from './App'

// --- environment stubs (module-level, applied once) ----------------------

class FakeAudioContext {
  constructor() { this.currentTime = 0; this.state = 'running'; this.destination = {} }
  createOscillator() {
    return { connect: vi.fn(), start: vi.fn(), stop: vi.fn(), type: 'sine', frequency: { value: 0 } }
  }
  createGain() {
    return {
      connect: vi.fn(),
      gain: {
        setValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
    }
  }
  resume() {}
}
vi.stubGlobal('AudioContext', FakeAudioContext)
vi.stubGlobal('webkitAudioContext', FakeAudioContext)

// RAF drives the Wheel SVG animation only; stub so the visual loop
// doesn't run in tests (state machine doesn't depend on it).
vi.stubGlobal('requestAnimationFrame', () => 0)
vi.stubGlobal('cancelAnimationFrame', () => {})

// WinnerReveal calls matchMedia for prefers-reduced-motion
vi.stubGlobal('matchMedia', () => ({ matches: false, addListener: () => {}, removeListener: () => {} }))

// localStorage (useNames + useSound read/write it)
const storageMock = (() => {
  let store = {}
  return {
    getItem:    vi.fn(key => store[key] ?? null),
    setItem:    vi.fn((key, val) => { store[key] = String(val) }),
    removeItem: vi.fn(key => { delete store[key] }),
    clear:      vi.fn(() => { store = {} }),
  }
})()
Object.defineProperty(globalThis, 'localStorage', { value: storageMock, writable: true })

// --- helpers ------------------------------------------------------------

// fireEvent is synchronous — no timer interaction, no async issues.
function addPlayer(name) {
  fireEvent.change(screen.getByLabelText('Player name'), { target: { value: name } })
  fireEvent.click(screen.getByLabelText('Add player'))
}

// Click SPIN and fast-forward through the spin duration.
// vi.runAllTimers() drains the useSpin completion timeout + the tick chain.
async function spinToReveal() {
  fireEvent.click(screen.getByRole('button', { name: 'Spin the wheel' }))
  await act(async () => { vi.runAllTimers() })
}

// -----------------------------------------------------------------------

describe('App state machine', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    storageMock.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('transitions to revealed state after spin completes', async () => {
    render(<App />)
    addPlayer('Alice')
    addPlayer('Bob')
    await spinToReveal()
    expect(screen.getByText('finishes the Beerlao!')).toBeInTheDocument()
  })

  it('spin-again re-spins the same roster without modifying names', async () => {
    render(<App />)
    addPlayer('Alice')
    addPlayer('Bob')
    await spinToReveal()

    // Names list is unchanged behind the overlay
    expect(screen.getAllByText('Alice').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Bob').length).toBeGreaterThan(0)

    // Spin Again dismisses the reveal immediately
    fireEvent.click(screen.getByRole('button', { name: 'SPIN AGAIN' }))
    await act(async () => {}) // flush batched state updates
    expect(screen.queryByText('finishes the Beerlao!')).not.toBeInTheDocument()

    // Complete the second spin — winner must come from the same roster
    await act(async () => { vi.runAllTimers() })
    expect(screen.getByText('finishes the Beerlao!')).toBeInTheDocument()
    expect(screen.getAllByText('Alice').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Bob').length).toBeGreaterThan(0)
  })

  it('reset returns to idle without modifying names', async () => {
    render(<App />)
    addPlayer('Alice')
    addPlayer('Bob')
    await spinToReveal()

    fireEvent.click(screen.getByRole('button', { name: 'Reset — return to idle' }))
    await act(async () => {})

    expect(screen.queryByText('finishes the Beerlao!')).not.toBeInTheDocument()
    expect(screen.getAllByText('Alice').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Bob').length).toBeGreaterThan(0)
    expect(screen.getByRole('button', { name: 'Spin the wheel' })).not.toBeDisabled()
  })

  it('Escape key resets from revealed to idle', async () => {
    render(<App />)
    addPlayer('Alice')
    addPlayer('Bob')
    await spinToReveal()

    fireEvent.keyDown(document, { key: 'Escape' })
    await act(async () => {})

    expect(screen.queryByText('finishes the Beerlao!')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Spin the wheel' })).not.toBeDisabled()
  })
})
