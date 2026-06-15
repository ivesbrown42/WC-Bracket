import type { StorageAdapter } from './StorageAdapter'

/**
 * FUTURE SEAM — account-backed persistence (e.g. Supabase).
 *
 * Implement `load`/`save`/`clear` against an authenticated backend, then swap
 * this in for `localStorageAdapter` in src/store/bracketStore.ts. Designed-for,
 * deliberately not built in v1.
 */
export const remoteAdapter: StorageAdapter = {
  load() {
    throw new Error('remoteAdapter not implemented — using localStorageAdapter in v1')
  },
  save() {
    throw new Error('remoteAdapter not implemented — using localStorageAdapter in v1')
  },
  clear() {
    throw new Error('remoteAdapter not implemented — using localStorageAdapter in v1')
  },
}
