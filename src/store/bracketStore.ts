import { create } from 'zustand'
import type { BracketPicks, GroupId } from '../data/types'
import type { TeamTheme } from '../data/theme'
import { DEFAULT_THEME, normalizeTheme } from '../data/theme'
import { groups, getTeam } from '../data/worldCup2026'
import { THIRDS_REQUIRED } from '../data/bracketLogic'
import { localStorageAdapter } from './storage/localStorageAdapter'
import type { StorageAdapter } from './storage/StorageAdapter'

const adapter: StorageAdapter = localStorageAdapter

export const emptyPicks = (): BracketPicks => ({
  groupRanks: {},
  qualifiedThirdTeamIds: [],
  knockoutPicks: {},
  theme: DEFAULT_THEME,
})

interface BracketState {
  picks: BracketPicks
  /**
   * Tap a team to rank it next in its group. Tapping a ranked team unranks
   * it (and anything after it). Group is complete after 2 picks.
   */
  cycleGroupPick: (group: GroupId, teamId: string) => void
  clearGroup: (group: GroupId) => void
  /** Toggle a non-top-2 team in/out of the 8 best-thirds (max 8). */
  toggleThird: (teamId: string) => void
  /** Choose the winner of a knockout match by side. */
  pickKnockout: (matchId: string, side: 'home' | 'away') => void
  /** Save the player's team theme. */
  setTheme: (theme: TeamTheme) => void
  /** Replace all picks (used when importing a shared bracket). */
  loadPicks: (picks: BracketPicks) => void
  resetAll: () => void
}

function persist(picks: BracketPicks) {
  adapter.save(picks)
}

function normalizePicks(raw: BracketPicks | null): BracketPicks {
  if (!raw) return emptyPicks()
  return {
    ...emptyPicks(),
    ...raw,
    qualifiedThirdTeamIds: raw.qualifiedThirdTeamIds ?? [],
    theme: normalizeTheme(raw.theme),
  }
}

export const useBracketStore = create<BracketState>((set) => ({
  picks: normalizePicks(adapter.load()),

  cycleGroupPick: (group, teamId) =>
    set((state) => {
      const current = state.picks.groupRanks[group] ?? []
      let next: string[]

      if (current.includes(teamId)) {
        next = current.slice(0, current.indexOf(teamId))
      } else if (current.length < 4) {
        next = [...current, teamId]
        if (next.length === 3) {
          const remaining = groups
            .find((g) => g.id === group)!
            .teamIds.filter((id) => !next.includes(id))
          if (remaining.length === 1) next = [...next, remaining[0]]
        }
      } else {
        next = current
      }

      // Keep qualifiedThirdTeamIds consistent with new top-2
      const groupTeamIds = new Set(groups.find((g) => g.id === group)!.teamIds)
      let qualifiedThirdTeamIds = state.picks.qualifiedThirdTeamIds ?? []

      if (next.length < 2) {
        // Group dropped below complete: remove all its teams from thirds pool
        qualifiedThirdTeamIds = qualifiedThirdTeamIds.filter((id) => !groupTeamIds.has(id))
      } else {
        // Remove any team now in the top-2 from thirds
        const top2 = new Set(next.slice(0, 2))
        qualifiedThirdTeamIds = qualifiedThirdTeamIds.filter((id) => !top2.has(id))
      }

      const picks: BracketPicks = {
        ...state.picks,
        groupRanks: { ...state.picks.groupRanks, [group]: next },
        qualifiedThirdTeamIds,
      }
      persist(picks)
      return { picks }
    }),

  clearGroup: (group) =>
    set((state) => {
      const groupRanks = { ...state.picks.groupRanks }
      delete groupRanks[group]
      const groupTeamIds = new Set(groups.find((g) => g.id === group)!.teamIds)
      const qualifiedThirdTeamIds = (state.picks.qualifiedThirdTeamIds ?? []).filter(
        (id) => !groupTeamIds.has(id),
      )
      const picks: BracketPicks = {
        ...state.picks,
        groupRanks,
        qualifiedThirdTeamIds,
      }
      persist(picks)
      return { picks }
    }),

  toggleThird: (teamId) =>
    set((state) => {
      const current = state.picks.qualifiedThirdTeamIds ?? []
      const has = current.includes(teamId)
      let qualifiedThirdTeamIds: string[]
      if (has) {
        qualifiedThirdTeamIds = current.filter((id) => id !== teamId)
      } else if (current.length < THIRDS_REQUIRED) {
        qualifiedThirdTeamIds = [...current, teamId]
      } else {
        qualifiedThirdTeamIds = current
      }
      const picks = { ...state.picks, qualifiedThirdTeamIds }
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

  setTheme: (theme) =>
    set((state) => {
      const picks: BracketPicks = { ...state.picks, theme }
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

export { getTeam }
