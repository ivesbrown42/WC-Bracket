import { create } from 'zustand'
import type { BracketPicks, GroupId } from '../data/types'
import { groups, getTeam } from '../data/worldCup2026'
import { THIRDS_REQUIRED } from '../data/bracketLogic'
import { localStorageAdapter } from './storage/localStorageAdapter'
import type { StorageAdapter } from './storage/StorageAdapter'

// Swap this single line for an account-backed adapter later (see remoteAdapter).
const adapter: StorageAdapter = localStorageAdapter

export const emptyPicks = (): BracketPicks => ({
  groupRanks: {},
  qualifiedThirds: [],
  knockoutPicks: {},
})

interface BracketState {
  picks: BracketPicks
  /**
   * Tap a team to rank it next in its group (1st → 2nd → 3rd). The 4th is
   * filled automatically once three are chosen. Tapping a ranked team unranks
   * it (and anything after it).
   */
  cycleGroupPick: (group: GroupId, teamId: string) => void
  clearGroup: (group: GroupId) => void
  /** Add/remove a group's third-placed team from the 8 best-thirds (max 8). */
  toggleThird: (group: GroupId) => void
  /** Choose the winner of a knockout match by side. */
  pickKnockout: (matchId: string, side: 'home' | 'away') => void
  /** Replace all picks (used when importing a shared bracket). */
  loadPicks: (picks: BracketPicks) => void
  resetAll: () => void
}

function persist(picks: BracketPicks) {
  adapter.save(picks)
}

export const useBracketStore = create<BracketState>((set) => ({
  picks: adapter.load() ?? emptyPicks(),

  cycleGroupPick: (group, teamId) =>
    set((state) => {
      const current = state.picks.groupRanks[group] ?? []
      let next: string[]

      if (current.includes(teamId)) {
        // Unrank this team and everything ranked after it.
        next = current.slice(0, current.indexOf(teamId))
      } else if (current.length < 4) {
        next = [...current, teamId]
        // Once three are ranked, auto-place the lone remaining team 4th.
        if (next.length === 3) {
          const remaining = groups
            .find((g) => g.id === group)!
            .teamIds.filter((id) => !next.includes(id))
          if (remaining.length === 1) next = [...next, remaining[0]]
        }
      } else {
        next = current
      }

      // If a group drops below complete, drop it from qualified-thirds.
      const qualifiedThirds =
        next.length < 3
          ? state.picks.qualifiedThirds.filter((g) => g !== group)
          : state.picks.qualifiedThirds

      const picks: BracketPicks = {
        ...state.picks,
        groupRanks: { ...state.picks.groupRanks, [group]: next },
        qualifiedThirds,
      }
      persist(picks)
      return { picks }
    }),

  clearGroup: (group) =>
    set((state) => {
      const groupRanks = { ...state.picks.groupRanks }
      delete groupRanks[group]
      const picks: BracketPicks = {
        ...state.picks,
        groupRanks,
        qualifiedThirds: state.picks.qualifiedThirds.filter((g) => g !== group),
      }
      persist(picks)
      return { picks }
    }),

  toggleThird: (group) =>
    set((state) => {
      const has = state.picks.qualifiedThirds.includes(group)
      let qualifiedThirds = state.picks.qualifiedThirds
      if (has) {
        qualifiedThirds = qualifiedThirds.filter((g) => g !== group)
      } else if (qualifiedThirds.length < THIRDS_REQUIRED) {
        // Only groups with a known third can qualify one.
        if ((state.picks.groupRanks[group]?.length ?? 0) >= 3) {
          qualifiedThirds = [...qualifiedThirds, group]
        }
      }
      const picks = { ...state.picks, qualifiedThirds }
      persist(picks)
      return { picks }
    }),

  pickKnockout: (matchId, side) =>
    set((state) => {
      const picks: BracketPicks = {
        ...state.picks,
        knockoutPicks: { ...state.picks.knockoutPicks, [matchId]: side },
      }
      persist(picks)
      return { picks }
    }),

  loadPicks: (picks) =>
    set(() => {
      persist(picks)
      return { picks }
    }),

  resetAll: () =>
    set(() => {
      const picks = emptyPicks()
      adapter.clear()
      return { picks }
    }),
}))

// Re-export for convenience in components.
export { getTeam }
