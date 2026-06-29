import type {
  BracketPicks,
  GroupId,
  ResolvedMatch,
  SlotSource,
} from './types'
import { groupIds, knockoutMatches, getTeam } from './worldCup2026'
import { THIRD_PLACE_ALLOCATION } from './thirdPlaceAllocation'

export const THIRDS_REQUIRED = 8

/**
 * Allowed group-set for each of the 8 R32 third-place slots, indexed by the
 * `third` slot index (0–7) used in `r32Sources`. Mirrors the official 2026
 * bracket (FIFA match numbers in comments). This is the union of groups that
 * can occupy each slot across all 495 Annex C combinations — useful for
 * validation; the exact per-combination assignment lives in
 * `THIRD_PLACE_ALLOCATION`.
 */
export const THIRD_SLOT_GROUPS: GroupId[][] = [
  ['A', 'B', 'C', 'D', 'F'], // slot 0 · M74
  ['C', 'D', 'F', 'G', 'H'], // slot 1 · M77
  ['B', 'E', 'F', 'I', 'J'], // slot 2 · M81
  ['A', 'E', 'H', 'I', 'J'], // slot 3 · M82
  ['C', 'E', 'F', 'H', 'I'], // slot 4 · M79
  ['E', 'H', 'I', 'J', 'K'], // slot 5 · M80
  ['E', 'F', 'G', 'I', 'J'], // slot 6 · M85
  ['D', 'E', 'I', 'J', 'L'], // slot 7 · M87
]

/**
 * Assign the user's chosen best-thirds to the 8 R32 third slots using FIFA's
 * official allocation (Regulations Annex C). Returns slotIndex -> teamId.
 *
 * FIFA publishes a fixed 495-row table, one per combination of the 8 groups
 * whose third-placed team qualifies. The allocation is a property of the whole
 * combination — it is NOT decomposable into independent per-slot group-sets —
 * so we look up the combination directly (`THIRD_PLACE_ALLOCATION`) instead of
 * computing an arbitrary valid bijection. Each group sends at most one third
 * (enforced upstream), so the qualified groups form a unique lookup key.
 *
 * Returns an empty map until exactly 8 distinct groups have qualified, since
 * the table is only defined for a complete combination (knockout rendering is
 * gated on `thirdsComplete`).
 */
export function assignThirds(thirdTeamIds: string[]): Map<number, string> {
  const result = new Map<number, string>()

  // One qualified third per group → group -> teamId.
  const teamByGroup = new Map<GroupId, string>()
  for (const id of thirdTeamIds.slice(0, THIRDS_REQUIRED)) {
    const g = getTeam(id)?.group
    if (g) teamByGroup.set(g, id)
  }
  if (teamByGroup.size !== THIRDS_REQUIRED) return result

  const key = [...teamByGroup.keys()].sort().join('')
  const slotGroups = THIRD_PLACE_ALLOCATION[key]
  if (!slotGroups) return result // unreachable for any valid 8-group combination

  slotGroups.forEach((group, slot) => {
    const teamId = teamByGroup.get(group)
    if (teamId) result.set(slot, teamId)
  })
  return result
}

/** Team id at a given group rank (0 = winner, 1 = runner-up, 2 = third). */
export function groupRank(
  picks: BracketPicks,
  group: GroupId,
  rank: number,
): string | null {
  return picks.groupRanks[group]?.[rank] ?? null
}

/**
 * A group is "set" once its top two are ordered — the winner and runner-up
 * are all that's needed to seed the 32-team knockout.
 */
export function isGroupComplete(picks: BracketPicks, group: GroupId): boolean {
  return (picks.groupRanks[group]?.length ?? 0) >= 2
}

export function groupsCompletedCount(picks: BracketPicks): number {
  return groupIds.filter((g) => isGroupComplete(picks, g)).length
}

export function allGroupsComplete(picks: BracketPicks): boolean {
  return groupsCompletedCount(picks) === groupIds.length
}

export function thirdsComplete(picks: BracketPicks): boolean {
  return (picks.qualifiedThirdTeamIds?.length ?? 0) === THIRDS_REQUIRED
}

/** Group stage fully predicted and the 8 best-thirds chosen. */
export function knockoutReady(picks: BracketPicks): boolean {
  return allGroupsComplete(picks) && thirdsComplete(picks)
}

/**
 * Map each match to the matches that consume its winner/loser (direct
 * dependents). Built once from the static knockout tree.
 */
const directDependents: Map<string, string[]> = (() => {
  const map = new Map<string, string[]>()
  for (const m of knockoutMatches) {
    for (const src of [m.home, m.away]) {
      if (src.kind === 'matchWinner' || src.kind === 'matchLoser') {
        const arr = map.get(src.matchId) ?? []
        arr.push(m.id)
        map.set(src.matchId, arr)
      }
    }
  }
  return map
})()

/**
 * All matches downstream of `matchId` (transitively). When an earlier pick
 * changes the match winner, these later matches now have a different
 * participant and must be re-decided — so the store clears their picks.
 */
export function downstreamMatchIds(matchId: string): string[] {
  const out: string[] = []
  const seen = new Set<string>()
  const stack = [...(directDependents.get(matchId) ?? [])]
  while (stack.length) {
    const id = stack.pop()!
    if (seen.has(id)) continue
    seen.add(id)
    out.push(id)
    for (const d of directDependents.get(id) ?? []) stack.push(d)
  }
  return out
}

function resolveSource(
  source: SlotSource,
  resolved: Map<string, ResolvedMatch>,
  picks: BracketPicks,
  thirds: Map<number, string>,
): string | null {
  switch (source.kind) {
    case 'winner':
      return groupRank(picks, source.group, 0)
    case 'runner':
      return groupRank(picks, source.group, 1)
    case 'third':
      return thirds.get(source.index) ?? null
    case 'matchWinner':
      return resolved.get(source.matchId)?.winnerTeamId ?? null
    case 'matchLoser': {
      const m = resolved.get(source.matchId)
      if (!m || !m.winnerTeamId) return null
      return m.winnerTeamId === m.homeTeamId ? m.awayTeamId : m.homeTeamId
    }
  }
}

/**
 * Resolve every knockout match by threading the user's picks through the
 * bracket tree. Pure: same picks always give the same result.
 */
export function resolveKnockout(
  picks: BracketPicks,
): Map<string, ResolvedMatch> {
  const resolved = new Map<string, ResolvedMatch>()
  const thirds = assignThirds(picks.qualifiedThirdTeamIds ?? [])

  for (const match of knockoutMatches) {
    const homeTeamId = resolveSource(match.home, resolved, picks, thirds)
    const awayTeamId = resolveSource(match.away, resolved, picks, thirds)

    const pick = picks.knockoutPicks[match.id]
    let winnerTeamId: string | null = null
    if (pick === 'home') winnerTeamId = homeTeamId
    else if (pick === 'away') winnerTeamId = awayTeamId

    resolved.set(match.id, {
      id: match.id,
      round: match.round,
      homeTeamId,
      awayTeamId,
      winnerTeamId,
    })
  }

  return resolved
}

/** The predicted champion, or null if the Final isn't decided yet. */
export function getChampion(picks: BracketPicks): string | null {
  return resolveKnockout(picks).get('F-1')?.winnerTeamId ?? null
}

/** How many knockout matches have a winner chosen (for progress UI). */
export function knockoutPicksCount(picks: BracketPicks): number {
  const resolved = resolveKnockout(picks)
  let n = 0
  for (const m of resolved.values()) if (m.winnerTeamId) n++
  return n
}
