import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useNames } from './useNames'

// Mock localStorage
const storageMock = (() => {
  let store = {}
  return {
    getItem: vi.fn(key => store[key] ?? null),
    setItem: vi.fn((key, value) => { store[key] = String(value) }),
    removeItem: vi.fn(key => { delete store[key] }),
    clear: vi.fn(() => { store = {} }),
  }
})()

Object.defineProperty(globalThis, 'localStorage', { value: storageMock, writable: true })

beforeEach(() => {
  storageMock.clear()
  vi.clearAllMocks()
})

describe('useNames', () => {
  it('starts with an empty list', () => {
    const { result } = renderHook(() => useNames())
    expect(result.current.names).toEqual([])
    expect(result.current.error).toBe('')
  })

  it('adds a name', () => {
    const { result } = renderHook(() => useNames())
    act(() => { result.current.add('Alice') })
    expect(result.current.names).toEqual(['Alice'])
  })

  it('trims whitespace before adding', () => {
    const { result } = renderHook(() => useNames())
    act(() => { result.current.add('  Bob  ') })
    expect(result.current.names).toEqual(['Bob'])
  })

  it('rejects empty names', () => {
    const { result } = renderHook(() => useNames())
    let returnVal
    act(() => { returnVal = result.current.add('') })
    expect(returnVal).toBe(false)
    expect(result.current.names).toEqual([])
    expect(result.current.error).toBe('Name cannot be empty.')
  })

  it('rejects whitespace-only names', () => {
    const { result } = renderHook(() => useNames())
    act(() => { result.current.add('   ') })
    expect(result.current.names).toEqual([])
    expect(result.current.error).toBe('Name cannot be empty.')
  })

  it('rejects case-insensitive duplicates', () => {
    const { result } = renderHook(() => useNames())
    act(() => { result.current.add('Alice') })
    let returnVal
    act(() => { returnVal = result.current.add('alice') })
    expect(returnVal).toBe(false)
    expect(result.current.names).toEqual(['Alice'])
    expect(result.current.error).toBe('"alice" is already in the list.')
  })

  it('clears error after a successful add', () => {
    const { result } = renderHook(() => useNames())
    act(() => { result.current.add('') })
    expect(result.current.error).toBeTruthy()
    act(() => { result.current.add('Alice') })
    expect(result.current.error).toBe('')
  })

  it('removes a name by index', () => {
    const { result } = renderHook(() => useNames())
    act(() => { result.current.add('Alice') })
    act(() => { result.current.add('Bob') })
    act(() => { result.current.remove(0) })
    expect(result.current.names).toEqual(['Bob'])
  })

  it('removes the correct item when multiple names exist', () => {
    const { result } = renderHook(() => useNames())
    act(() => { result.current.add('Alice') })
    act(() => { result.current.add('Bob') })
    act(() => { result.current.add('Carol') })
    act(() => { result.current.remove(1) })
    expect(result.current.names).toEqual(['Alice', 'Carol'])
  })

  it('clears all names', () => {
    const { result } = renderHook(() => useNames())
    act(() => { result.current.add('Alice') })
    act(() => { result.current.add('Bob') })
    act(() => { result.current.clear() })
    expect(result.current.names).toEqual([])
  })

  it('persists names to localStorage on change', () => {
    const { result } = renderHook(() => useNames())
    act(() => { result.current.add('Alice') })
    expect(storageMock.setItem).toHaveBeenCalledWith(
      'beerlao-roulette-names',
      JSON.stringify(['Alice'])
    )
  })

  it('hydrates from localStorage on mount', () => {
    storageMock.getItem.mockReturnValueOnce(JSON.stringify(['Alice', 'Bob']))
    const { result } = renderHook(() => useNames())
    expect(result.current.names).toEqual(['Alice', 'Bob'])
  })

  it('handles corrupt localStorage data gracefully', () => {
    storageMock.getItem.mockReturnValueOnce('not-json{{')
    const { result } = renderHook(() => useNames())
    expect(result.current.names).toEqual([])
  })

  it('returns true on successful add', () => {
    const { result } = renderHook(() => useNames())
    let returnVal
    act(() => { returnVal = result.current.add('Alice') })
    expect(returnVal).toBe(true)
  })

  it('clearError resets the error message', () => {
    const { result } = renderHook(() => useNames())
    act(() => { result.current.add('') })
    expect(result.current.error).toBeTruthy()
    act(() => { result.current.clearError() })
    expect(result.current.error).toBe('')
  })
})
