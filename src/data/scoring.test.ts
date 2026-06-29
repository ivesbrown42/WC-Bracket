import { describe, it, expect } from 'vitest'
import type { BracketPicks } from './types'
import { groups, groupIds, knockoutMatches } from './worldCup2026'
import {
  scoreBracket,
  reviewBracket,
  resultsFromPicks,
  type TournamentResults,
} from './scoring'

/** A fully-decided bracket: every group ranked, 8 distinct-group thirds, home wins. */
function fullPicks(): BracketPicks {
  const groupRanks: BracketPicks['groupRanks'] = {}
  for (const g of groups) groupRanks[g.id] = [...g.teamIds]
  const knockoutPicks: Record<string, 'home' | 'away'> = {}
  for (const m of knockoutMatches) knockoutPicks[m.id] = 'home'
  const qualifiedThirdTeamIds = groupIds
    .slice(0, 8)
    .map((gId) => groups.find((g) => g.id === gId)!.teamIds[2])
  return { groupRanks, qualifiedThirdTeamIds, knockoutPicks }
}

const EMPTY_RESULTS: TournamentResults = {
  groupAdvancers: {},
  bestThirds: [],
  reached: {},
  matchups: {},
}

describe('scoreBracket', () => {
  it('a perfect bracket scores the maximum 104 with correct breakdown', () => {
    const picks = fullPicks()
    const results = resultsFromPicks(picks)
    const s = scoreBracket(picks, results)

    expect(s.groupPoints).toBe(24) // 12 groups × 2 advancers
    expect(s.thirdsPoints).toBe(8) // 8 best-thirds
    expect(s.knockoutPoints).toBe(31) // 16+8+4+2+1 survival
    expect(s.bonusPoints).toBe(31) // 16+8+4+2+1 matchups
    expect(s.finalistPoints).toBe(10) // 2 finalists × 5
    expect(s.total).toBe(104)

    expect(s.reachedByStage).toEqual({ R16: 16, QF: 8, SF: 4, F: 2, CHAMP: 1 })
    expect(s.bonusByRound).toEqual({ R32: 16, R16: 8, QF: 4, SF: 2, F: 1 })
  })

  it('awards +5 per correct finalist, on top of the survival point', () => {
    const picks = fullPicks()
    const full = resultsFromPicks(picks)
    // Only the Final stage is known: the two real finalists reached it.
    const results: TournamentResults = {
      ...EMPTY_RESULTS,
      reached: { F: full.reached.F },
    }
    const s = scoreBracket(picks, results)
    expect(s.finalistPoints).toBe(10) // 2 finalists × 5
    expect(s.knockoutPoints).toBe(2) // +1 survival each
    expect(s.total).toBe(12)
  })

  it('scores nothing against empty results', () => {
    expect(scoreBracket(fullPicks(), EMPTY_RESULTS).total).toBe(0)
  })

  it('only scores groups that have actually finished', () => {
    const picks = fullPicks()
    const a = groups.find((g) => g.id === 'A')!
    const results: TournamentResults = {
      ...EMPTY_RESULTS,
      groupAdvancers: { A: a.teamIds.slice(0, 2) }, // only Group A is final
    }
    const s = scoreBracket(picks, results)
    expect(s.groupPoints).toBe(2)
    expect(s.total).toBe(2)
  })

  it('awards 1 pt per correct advancer when one is wrong', () => {
    const picks = fullPicks()
    const a = groups.find((g) => g.id === 'A')!
    // Reality: 1st correct, but the 3rd-place team advanced instead of the
    // predicted runner-up.
    const results: TournamentResults = {
      ...EMPTY_RESULTS,
      groupAdvancers: { A: [a.teamIds[0], a.teamIds[2]] },
    }
    expect(scoreBracket(picks, results).groupPoints).toBe(1)
  })

  it('counts a matchup bonus only when both teams match the real pairing', () => {
    const picks = fullPicks()
    const full = resultsFromPicks(picks)
    // Keep one real R32 pairing; the bonus should be exactly 1, survival 0.
    const oneR32 = full.matchups.R32!.slice(0, 1)
    const results: TournamentResults = {
      ...EMPTY_RESULTS,
      matchups: { R32: oneR32 },
    }
    const s = scoreBracket(picks, results)
    expect(s.bonusPoints).toBe(1)
    expect(s.knockoutPoints).toBe(0)
    expect(s.total).toBe(1)
  })

  it('gives no matchup bonus if only one of the two teams is right', () => {
    const picks = fullPicks()
    const full = resultsFromPicks(picks)
    const real = full.matchups.R32![0]
    // Swap the away team for an unrelated one — pairing no longer matches.
    const tampered = { home: real.home, away: 'ZZZ' }
    const results: TournamentResults = {
      ...EMPTY_RESULTS,
      matchups: { R32: [tampered] },
    }
    expect(scoreBracket(picks, results).bonusPoints).toBe(0)
  })
})

describe('reviewBracket', () => {
  it('marks group picks pending when unfinished, correct/wrong when final', () => {
    const picks = fullPicks()
    const a = groups.find((g) => g.id === 'A')!
    const results: TournamentResults = {
      ...EMPTY_RESULTS,
      // Group A final: 1st correct, runner-up is actually the 3rd-place team.
      groupAdvancers: { A: [a.teamIds[0], a.teamIds[2]] },
    }
    const review = reviewBracket(picks, results)

    const groupA = review.groups.find((g) => g.group === 'A')!
    expect(groupA.items[0].status).toBe('correct') // predicted winner advanced
    expect(groupA.items[1].status).toBe('wrong') // predicted runner-up did not

    // Group B hasn't finished → both picks pending.
    const groupB = review.groups.find((g) => g.group === 'B')!
    expect(groupB.items.every((i) => i.status === 'pending')).toBe(true)
  })

  it('reports total points and per-round matches with winner + matchup grading', () => {
    const picks = fullPicks()
    const review = reviewBracket(picks, resultsFromPicks(picks))
    expect(review.total).toBe(104)
    // The Final round has exactly one match; against its own results both the
    // winner pick and the matchup grade as correct.
    const final = review.rounds.find((r) => r.round === 'F')!
    expect(final.matches).toHaveLength(1)
    expect(final.matches[0].winnerStatus).toBe('correct')
    expect(final.matches[0].matchupStatus).toBe('correct')
    // R32 has 16 matches.
    expect(review.rounds.find((r) => r.round === 'R32')!.matches).toHaveLength(16)
  })
})
