import { useState, useEffect, useRef, useCallback } from 'react'

const STORAGE_KEY = 'beerlao-roulette-names'

function readStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function useNames() {
  const [names, setNames] = useState(readStorage)
  const [error, setError] = useState('')

  // Keep a ref so add/remove callbacks can read latest names without stale closure
  const namesRef = useRef(names)
  namesRef.current = names

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(names))
    } catch {
      // quota exceeded or storage unavailable — swallow silently
    }
  }, [names])

  const add = useCallback((name) => {
    const trimmed = name.trim()
    if (!trimmed) {
      setError('Name cannot be empty.')
      return false
    }
    const lower = trimmed.toLowerCase()
    if (namesRef.current.some(n => n.toLowerCase() === lower)) {
      setError(`"${trimmed}" is already in the list.`)
      return false
    }
    setNames(prev => [...prev, trimmed])
    setError('')
    return true
  }, [])

  const remove = useCallback((index) => {
    setNames(prev => prev.filter((_, i) => i !== index))
    setError('')
  }, [])

  const clear = useCallback(() => {
    setNames([])
    setError('')
  }, [])

  const clearError = useCallback(() => setError(''), [])

  return { names, add, remove, clear, error, clearError }
}
