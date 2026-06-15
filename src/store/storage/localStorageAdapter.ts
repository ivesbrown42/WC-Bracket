import type { BracketPicks } from '../../data/types'
import type { StorageAdapter } from './StorageAdapter'

const KEY = 'sticker-cup-26:picks'

/** Persists the bracket in the browser. No account required. */
export const localStorageAdapter: StorageAdapter = {
  load() {
    try {
      const raw = localStorage.getItem(KEY)
      return raw ? (JSON.parse(raw) as BracketPicks) : null
    } catch {
      return null
    }
  },
  save(picks) {
    try {
      localStorage.setItem(KEY, JSON.stringify(picks))
    } catch {
      // Storage full / disabled — fail quietly; the in-memory store still works.
    }
  },
  clear() {
    try {
      localStorage.removeItem(KEY)
    } catch {
      /* ignore */
    }
  },
}
