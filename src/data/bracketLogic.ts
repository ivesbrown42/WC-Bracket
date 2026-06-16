import type {
  BracketPicks,
  GroupId,
  ResolvedMatch,
  SlotSource,
} from './types'
import { groupIds, knockoutMatches } from './worldCup2026'

export const THIRDS_REQUIRED = 8

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

function resolveSource(
  source: SlotSource,
  resolved: Map<string, ResolvedMatch>,
  picks: BracketPicks,
): string | null {
  switch (source.kind) {
    case 'winner':
      return groupRank(picks, source.group, 0)
    case 'runner':
      return groupRank(picks, source.group, 1)
    case 'third':
      return picks.qualifiedThirdTeamIds?.[source.index] ?? null
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

  for (const match of knockoutMatches) {
    const homeTeamId = resolveSource(match.home, resolved, picks)
    const awayTeamId = resolveSource(match.away, resolved, picks)

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
