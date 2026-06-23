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
  /** Once submitted, the bracket is locked — all edits are ignored. */
  submitted: boolean
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
  /** Lock the bracket — final, no further edits. */
  submit: () => void
  /** Set the locked flag (used to sync from the server's locked_at on load). */
  setSubmitted: (value: boolean) => void
  resetAll: () => void
}

function persist(picks: BracketPicks) {
  adapter.save(picks)
}

const SUBMITTED_KEY = 'wc-bracket-submitted'
function loadSubmitted(): boolean {
  try {
    return localStorage.getItem(SUBMITTED_KEY) === 'true'
  } catch {
    return false
  }
}
function saveSubmitted(value: boolean) {
  try {
    localStorage.setItem(SUBMITTED_KEY, String(value))
  } catch {
    /* ignore */
  }
}

/**
 * Keep each group's ranks to real members of that group, capped at the top 2.
 * Heals stale/corrupt data (older builds ranked 3rd/4th, or a stray team id
 * from a renamed team could linger). Without this a phantom team could flow
 * into the knockout bracket as a group's winner.
 */
function sanitizeGroupRanks(
  raw: BracketPicks['groupRanks'] | undefined,
): BracketPicks['groupRanks'] {
  const out: BracketPicks['groupRanks'] = {}
  for (const g of groups) {
    const members = new Set(g.teamIds)
    const ranks = (raw?.[g.id] ?? []).filter((id) => members.has(id)).slice(0, 2)
    if (ranks.length) out[g.id] = ranks
  }
  return out
}

function normalizePicks(raw: BracketPicks | null): BracketPicks {
  if (!raw) return emptyPicks()
  const groupTeamIds = new Set(groups.flatMap((g) => g.teamIds))
  return {
    ...emptyPicks(),
    ...raw,
    groupRanks: sanitizeGroupRanks(raw.groupRanks),
    // Thirds must be valid teams not promoted to a group's top 2.
    qualifiedThirdTeamIds: (raw.qualifiedThirdTeamIds ?? []).filter((id) =>
      groupTeamIds.has(id),
    ),
    theme: normalizeTheme(raw.theme),
  }
}

export const useBracketStore = create<BracketState>((set) => ({
  picks: normalizePicks(adapter.load()),
  submitted: loadSubmitted(),

  cycleGroupPick: (group, teamId) =>
    set((state) => {
      if (state.submitted) return {} // locked
      const groupTeamIds = new Set(groups.find((g) => g.id === group)!.teamIds)
      // Sanitize stored ranks: keep only real members of THIS group, capped at
      // the top 2. Heals stale data that ranked 3rd/4th or held a stray team id.
      const current = (state.picks.groupRanks[group] ?? [])
        .filter((id) => groupTeamIds.has(id))
        .slice(0, 2)
      let next: string[]

      if (current.includes(teamId)) {
        // Tapping a picked team removes just that one (freely editable).
        next = current.filter((id) => id !== teamId)
      } else if (current.length < 2) {
        next = [...current, teamId]
      } else {
        // Both slots full: swap the new team in for the current runner-up.
        next = [current[0], teamId]
      }

      // Keep qualifiedThirdTeamIds consistent with new top-2
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
      if (state.submitted) return {} // locked
      const current = state.picks.qualifiedThirdTeamIds ?? []
      const has = current.includes(teamId)
      let qualifiedThirdTeamIds: string[]
      if (has) {
        qualifiedThirdTeamIds = current.filter((id) => id !== teamId)
      } else if (current.length < THIRDS_REQUIRED) {
        // Reality: at most one best-third per group (only the 3rd-place team
        // advances). Block a second pick from a group already represented.
        const group = getTeam(teamId)?.group
        const groupTaken = current.some((id) => getTeam(id)?.group === group)
        qualifiedThirdTeamIds = groupTaken ? current : [...current, teamId]
      } else {
        qualifiedThirdTeamIds = current
      }
      const picks = { ...state.picks, qualifiedThirdTeamIds }
      persist(picks)
      return { picks }
    }),

  pickKnockout: (matchId, side) =>
    set((state) => {
      if (state.submitted) return {} // locked
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
      // Normalize on load (incl. data pulled from Supabase) so stale/corrupt
      // group ranks are healed before they reach scoring or the bracket tree.
      const normalized = normalizePicks(picks)
      persist(normalized)
      return { picks: normalized }
    }),

  submit: () =>
    set(() => {
      saveSubmitted(true)
      return { submitted: true }
    }),

  setSubmitted: (value) =>
    set(() => {
      saveSubmitted(value)
      return { submitted: value }
    }),

  resetAll: () =>
    set(() => {
      const picks = emptyPicks()
      adapter.clear()
      saveSubmitted(false)
      return { picks, submitted: false }
    }),
}))

export { getTeam }
