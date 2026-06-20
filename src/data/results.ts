import type { GroupId, RoundId } from './types'
import type { KnockoutStage, TournamentResults } from './scoring'

/**
 * RESULTS ADAPTER
 *
 * Normalizes the football-data.org API into the engine's TournamentResults.
 * Team IDs in this app are the API's `tla` codes (aligned deliberately), so no
 * translation table is needed. Pure functions — the transport (Edge Function /
 * fetch) hands raw API arrays in; these turn them into gradeable results.
 */

// --- Minimal shapes of the API payloads we read ---
export interface ApiStandingTeam {
  tla: string | null
  position?: number
}
export interface ApiStandingRow {
  position: number
  team: { tla: string | null }
  playedGames: number
  points: number
  goalDifference: number
  goalsFor: number
}
export interface ApiStanding {
  group: string // "Group A"
  type: string // "TOTAL" | "HOME" | "AWAY"
  table: ApiStandingRow[]
}
export interface ApiMatch {
  stage: string // GROUP_STAGE | LAST_32 | LAST_16 | QUARTER_FINALS | SEMI_FINALS | THIRD_PLACE | FINAL
  status: string // SCHEDULED | TIMED | IN_PLAY | FINISHED ...
  homeTeam: { tla: string | null }
  awayTeam: { tla: string | null }
  score: { winner: 'HOME_TEAM' | 'AWAY_TEAM' | 'DRAW' | null }
}

const GROUP_GAMES_PER_TEAM = 3

const STAGE_TO_ROUND: Record<string, RoundId> = {
  LAST_32: 'R32',
  LAST_16: 'R16',
  QUARTER_FINALS: 'QF',
  SEMI_FINALS: 'SF',
  FINAL: 'F',
}

/** Which knockout stage's participants are the winners of a given round. */
const ROUND_FEEDS_STAGE: Partial<Record<RoundId, KnockoutStage>> = {
  R32: 'R16', // R32 winners reach the R16
  R16: 'QF',
  QF: 'SF',
  SF: 'F',
  F: 'CHAMP',
}

const winnerTla = (m: ApiMatch): string | null => {
  if (m.score.winner === 'HOME_TEAM') return m.homeTeam.tla
  if (m.score.winner === 'AWAY_TEAM') return m.awayTeam.tla
  return null
}

export function parseResults(
  standings: ApiStanding[],
  matches: ApiMatch[],
): TournamentResults {
  // --- Group advancers + best-thirds from the TOTAL standings ---
  const groupAdvancers: Partial<Record<GroupId, string[]>> = {}
  const completedThirds: { tla: string; pts: number; gd: number; gf: number }[] = []
  let allGroupsComplete = true

  for (const s of standings) {
    if (s.type !== 'TOTAL') continue
    const groupId = s.group.replace('Group ', '').trim() as GroupId
    const complete = s.table.every((r) => r.playedGames >= GROUP_GAMES_PER_TEAM)
    if (!complete) {
      allGroupsComplete = false
      continue
    }
    const ordered = [...s.table].sort((a, b) => a.position - b.position)
    const top2 = ordered.slice(0, 2).map((r) => r.team.tla).filter(Boolean) as string[]
    if (top2.length === 2) groupAdvancers[groupId] = top2

    const third = ordered[2]
    if (third?.team.tla) {
      completedThirds.push({
        tla: third.team.tla,
        pts: third.points,
        gd: third.goalDifference,
        gf: third.goalsFor,
      })
    }
  }

  // The 8 best thirds are only meaningful once every group has finished.
  let bestThirds: string[] = []
  if (allGroupsComplete && completedThirds.length === 12) {
    bestThirds = completedThirds
      .sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf)
      .slice(0, 8)
      .map((t) => t.tla)
  }

  // --- Knockout matchups + reached stages ---
  const matchups: Partial<Record<RoundId, { home: string; away: string }[]>> = {}
  const reachedSets: Partial<Record<KnockoutStage, Set<string>>> = {}

  for (const m of matches) {
    const round = STAGE_TO_ROUND[m.stage]
    if (!round) continue // GROUP_STAGE / THIRD_PLACE — not scored here

    // A matchup is "real" once both teams are slotted in.
    if (m.homeTeam.tla && m.awayTeam.tla) {
      ;(matchups[round] ??= []).push({ home: m.homeTeam.tla, away: m.awayTeam.tla })
    }

    // The winner of a finished match "reaches" the next stage.
    if (m.status === 'FINISHED') {
      const w = winnerTla(m)
      const stage = ROUND_FEEDS_STAGE[round]
      if (w && stage) (reachedSets[stage] ??= new Set()).add(w)
    }
  }

  const reached: Partial<Record<KnockoutStage, string[]>> = {}
  for (const stage of Object.keys(reachedSets) as KnockoutStage[]) {
    reached[stage] = [...reachedSets[stage]!]
  }

  return { groupAdvancers, bestThirds, reached, matchups }
}
