import type { BracketPicks } from '../../data/types'

/**
 * The single seam between the app and where brackets are persisted.
 * v1 ships with a localStorage implementation; a remote/account-backed
 * adapter can be dropped in later without touching the store or UI.
 */
export interface StorageAdapter {
  load(): BracketPicks | null
  save(picks: BracketPicks): void
  clear(): void
}
