import { useState, useRef, useCallback, useEffect } from 'react'

const STORAGE_KEY = 'beerlao-roulette-muted'

export function useSound() {
  const [muted, setMuted] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY) === 'true' } catch { return false }
  })

  const ctxRef = useRef(null)
  const tickTimerRef = useRef(null)
  const mutedRef = useRef(muted)

  useEffect(() => { mutedRef.current = muted }, [muted])

  useEffect(() => {
    return () => { if (tickTimerRef.current) clearTimeout(tickTimerRef.current) }
  }, [])

  function ensureCtx() {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || window.webkitAudioContext)()
    }
    if (ctxRef.current.state === 'suspended') ctxRef.current.resume()
    return ctxRef.current
  }

  const startTicks = useCallback((duration) => {
    if (tickTimerRef.current) clearTimeout(tickTimerRef.current)
    let elapsed = 0
    const step = () => {
      if (!mutedRef.current) {
        try {
          const ctx = ensureCtx()
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.connect(gain)
          gain.connect(ctx.destination)
          osc.type = 'sine'
          osc.frequency.value = 650 + Math.random() * 350
          gain.gain.setValueAtTime(0.12, ctx.currentTime)
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04)
          osc.start()
          osc.stop(ctx.currentTime + 0.04)
        } catch (_) {}
      }
      const progress = Math.min(elapsed / duration, 1)
      const interval = 70 + progress * progress * 350
      elapsed += interval
      if (elapsed < duration) {
        tickTimerRef.current = setTimeout(step, interval)
      } else {
        tickTimerRef.current = null
      }
    }
    step()
  }, [])

  const stopTicks = useCallback(() => {
    if (tickTimerRef.current) {
      clearTimeout(tickTimerRef.current)
      tickTimerRef.current = null
    }
  }, [])

  const playWin = useCallback(() => {
    if (mutedRef.current) return
    try {
      const ctx = ensureCtx()
      const notes = [523.25, 659.25, 783.99, 1046.5]
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.type = 'sine'
        osc.frequency.value = freq
        const t = ctx.currentTime + i * 0.12
        gain.gain.setValueAtTime(0, t)
        gain.gain.linearRampToValueAtTime(0.35, t + 0.04)
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5)
        osc.start(t)
        osc.stop(t + 0.5)
      })
    } catch (_) {}
  }, [])

  const toggleMute = useCallback(() => {
    setMuted(prev => {
      const next = !prev
      try { localStorage.setItem(STORAGE_KEY, String(next)) } catch {}
      // Resume the context when unmuting so playWin works without a new gesture
      if (!next && ctxRef.current?.state === 'suspended') {
        ctxRef.current.resume()
      }
      return next
    })
  }, [])

  return { muted, toggleMute, startTicks, stopTicks, playWin }
}
