import type { BracketPicks, GroupId, RoundId } from './types'
import { groupIds } from './worldCup2026'
import { resolveKnockout } from './bracketLogic'

/**
 * SCORING ENGINE
 *
 * Grades a user's BracketPicks against real tournament results.
 *
 * Model (flat — 1 point per scoring opportunity, +1 matchup bonus):
 *  - Groups:    1 pt for each correctly-predicted top-2 advancer
 *  - Thirds:    1 pt for each correctly-predicted best-third that advances
 *  - Knockouts: 1 pt for each team you send to a round that actually reaches it
 *               (R16, QF, SF, Final, Champion)
 *  - Bonus:     +1 for each elimination matchup where you predicted BOTH teams
 *               (the exact pairing that actually happened)
 *
 * A perfect bracket scores 94: 24 group + 8 thirds + 31 survival + 31 bonus.
 */

export const POINTS = {
  groupAdvancer: 1,
  bestThird: 1,
  reachRound: 1,
  matchupBonus: 1,
} as const

/** Knockout "reached this round" stages, and the round whose winners reach it. */
export type KnockoutStage = 'R16' | 'QF' | 'SF' | 'F' | 'CHAMP'
const STAGE_SOURCE_ROUND: Record<KnockoutStage, RoundId> = {
  R16: 'R32', // teams in the R16 are the R32 winners
  QF: 'R16',
  SF: 'QF',
  F: 'SF', // finalists are the SF winners
  CHAMP: 'F', // champion is the Final winner
}

/** Elimination rounds eligible for the matchup bonus. */
const ELIM_ROUNDS: RoundId[] = ['R32', 'R16', 'QF', 'SF', 'F']

/** Reality, as far as it's currently known. Fields fill in as the tournament progresses. */
export interface TournamentResults {
  /** Actual top-2 (advancers) per completed group; absent until the group finishes. */
  groupAdvancers: Partial<Record<GroupId, string[]>>
  /** The 8 best-thirds that actually advanced (empty until the group stage ends). */
  bestThirds: string[]
  /** Teams that actually reached each knockout stage. */
  reached: Partial<Record<KnockoutStage, string[]>>
  /** Actual knockout matchups that have taken place, by round. */
  matchups: Partial<Record<RoundId, { home: string; away: string }[]>>
}

export interface ScoreBreakdown {
  total: number
  groupPoints: number
  thirdsPoints: number
  knockoutPoints: number
  bonusPoints: number
  /** Per-knockout-stage correct counts (for profile detail views). */
  reachedByStage: Record<KnockoutStage, number>
  /** Per-round correct matchup counts. */
  bonusByRound: Partial<Record<RoundId, number>>
}

/** Unordered pair key so {A,B} === {B,A}. */
const pairKey = (a: string, b: string) => [a, b].sort().join('|')

export function scoreBracket(
  picks: BracketPicks,
  results: TournamentResults,
): ScoreBreakdown {
  const resolved = resolveKnockout(picks)
  const resolvedList = [...resolved.values()]

  // --- Group advancers ---
  let groupPoints = 0
  for (const g of groupIds) {
    const actual = results.groupAdvancers[g]
    if (!actual) continue // group not finished yet
    const actualSet = new Set(actual)
    const predicted = (picks.groupRanks[g] ?? []).slice(0, 2)
    for (const teamId of predicted) {
      if (actualSet.has(teamId)) groupPoints += POINTS.groupAdvancer
    }
  }

  // --- Best thirds ---
  let thirdsPoints = 0
  if (results.bestThirds.length > 0) {
    const actualThirds = new Set(results.bestThirds)
    for (const teamId of picks.qualifiedThirdTeamIds ?? []) {
      if (actualThirds.has(teamId)) thirdsPoints += POINTS.bestThird
    }
  }

  // --- Knockout survival ---
  let knockoutPoints = 0
  const reachedByStage = { R16: 0, QF: 0, SF: 0, F: 0, CHAMP: 0 } as Record<
    KnockoutStage,
    number
  >
  for (const stage of Object.keys(STAGE_SOURCE_ROUND) as KnockoutStage[]) {
    const actual = results.reached[stage]
    if (!actual) continue
    const actualSet = new Set(actual)
    const round = STAGE_SOURCE_ROUND[stage]
    const predictedWinners = resolvedList
      .filter((m) => m.round === round && m.winnerTeamId)
      .map((m) => m.winnerTeamId!)
    for (const teamId of predictedWinners) {
      if (actualSet.has(teamId)) {
        knockoutPoints += POINTS.reachRound
        reachedByStage[stage]++
      }
    }
  }

  // --- Matchup bonus ---
  let bonusPoints = 0
  const bonusByRound: Partial<Record<RoundId, number>> = {}
  for (const round of ELIM_ROUNDS) {
    const actualPairs = results.matchups[round]
    if (!actualPairs) continue
    const actualKeys = new Set(actualPairs.map((p) => pairKey(p.home, p.away)))
    const predicted = resolvedList.filter((m) => m.round === round)
    let n = 0
    for (const m of predicted) {
      if (
        m.homeTeamId &&
        m.awayTeamId &&
        actualKeys.has(pairKey(m.homeTeamId, m.awayTeamId))
      ) {
        bonusPoints += POINTS.matchupBonus
        n++
      }
    }
    if (n > 0) bonusByRound[round] = n
  }

  return {
    total: groupPoints + thirdsPoints + knockoutPoints + bonusPoints,
    groupPoints,
    thirdsPoints,
    knockoutPoints,
    bonusPoints,
    reachedByStage,
    bonusByRound,
  }
}

/**
 * Derive a TournamentResults from a fully-decided bracket. Reality, once
 * complete, IS a filled bracket — so this is how a "truth" bracket becomes
 * gradeable results (used in tests and for what-if previews). The live results
 * adapter produces the same shape from the football-data.org API.
 */
export function resultsFromPicks(truth: BracketPicks): TournamentResults {
  const resolved = resolveKnockout(truth)
  const list = [...resolved.values()]
  const winnersOf = (round: RoundId) =>
    list.filter((m) => m.round === round && m.winnerTeamId).map((m) => m.winnerTeamId!)

  const groupAdvancers: Partial<Record<GroupId, string[]>> = {}
  for (const g of groupIds) {
    const ranks = truth.groupRanks[g]
    if (ranks && ranks.length >= 2) groupAdvancers[g] = ranks.slice(0, 2)
  }

  const reached: Partial<Record<KnockoutStage, string[]>> = {
    R16: winnersOf('R32'),
    QF: winnersOf('R16'),
    SF: winnersOf('QF'),
    F: winnersOf('SF'),
    CHAMP: winnersOf('F'),
  }

  const matchups: Partial<Record<RoundId, { home: string; away: string }[]>> = {}
  for (const round of ELIM_ROUNDS) {
    matchups[round] = list
      .filter((m) => m.round === round && m.homeTeamId && m.awayTeamId)
      .map((m) => ({ home: m.homeTeamId!, away: m.awayTeamId! }))
  }

  return {
    groupAdvancers,
    bestThirds: [...(truth.qualifiedThirdTeamIds ?? [])],
    reached,
    matchups,
  }
}
