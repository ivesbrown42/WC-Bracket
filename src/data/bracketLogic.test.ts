import { describe, it, expect } from 'vitest'
import type { BracketPicks, GroupId } from './types'
import { groups, groupIds, knockoutMatches } from './worldCup2026'
import {
  allGroupsComplete,
  getChampion,
  knockoutReady,
  orderedQualifiedThirds,
  resolveKnockout,
  thirdsComplete,
} from './bracketLogic'

/** Picks where every group is ranked in its given (seeded) order. */
function fullGroupRanks(): BracketPicks['groupRanks'] {
  const ranks: BracketPicks['groupRanks'] = {}
  for (const g of groups) ranks[g.id] = [...g.teamIds]
  return ranks
}

/** All groups ranked, first 8 groups' thirds qualify, every match won by home. */
function fullPicks(): BracketPicks {
  const knockoutPicks: Record<string, 'home' | 'away'> = {}
  for (const m of knockoutMatches) knockoutPicks[m.id] = 'home'
  return {
    groupRanks: fullGroupRanks(),
    qualifiedThirds: groupIds.slice(0, 8) as GroupId[],
    knockoutPicks,
  }
}

describe('group completion', () => {
  it('is incomplete until every group has a top two', () => {
    const picks: BracketPicks = {
      groupRanks: { A: ['MEX', 'CRO'] },
      qualifiedThirds: [],
      knockoutPicks: {},
    }
    expect(allGroupsComplete(picks)).toBe(false)
  })

  it('is complete when all 12 groups are ranked', () => {
    const picks = fullPicks()
    expect(allGroupsComplete(picks)).toBe(true)
  })
})

describe('best-thirds selection', () => {
  it('requires exactly 8 thirds', () => {
    const picks = fullPicks()
    expect(thirdsComplete(picks)).toBe(true)
    expect(thirdsComplete({ ...picks, qualifiedThirds: ['A'] })).toBe(false)
  })

  it('orders qualified thirds by group letter', () => {
    const picks = { ...fullPicks(), qualifiedThirds: ['H', 'B', 'D'] as GroupId[] }
    expect(orderedQualifiedThirds(picks)).toEqual(['B', 'D', 'H'])
  })
})

describe('knockout resolution', () => {
  it('seeds R32 from group picks (winner / runner / third)', () => {
    const resolved = resolveKnockout(fullPicks())
    const r32_1 = resolved.get('R32-1')!
    // Template R32-1 = winner(A) vs third[index 0]
    expect(r32_1.homeTeamId).toBe(groups[0].teamIds[0]) // MEX, winner of A
    expect(r32_1.awayTeamId).toBe(groups[0].teamIds[2]) // A's third (first qualified third)
  })

  it('propagates the home side all the way to a champion', () => {
    const picks = fullPicks()
    expect(knockoutReady(picks)).toBe(true)
    // Every match won by home -> champion is the home seed of R32-1 (winner A).
    expect(getChampion(picks)).toBe(groups[0].teamIds[0])
  })

  it('has no champion until the Final is decided', () => {
    const picks = fullPicks()
    delete picks.knockoutPicks['F-1']
    expect(getChampion(picks)).toBeNull()
  })

  it('builds a full 32-match knockout tree', () => {
    // 16 R32 + 8 R16 + 4 QF + 2 SF + 1 final + 1 third-place
    expect(knockoutMatches).toHaveLength(32)
  })
})
