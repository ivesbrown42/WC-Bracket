import { describe, it, expect } from 'vitest'
import type { BracketPicks } from './types'
import { groups, groupIds, knockoutMatches } from './worldCup2026'
import {
  allGroupsComplete,
  assignThirds,
  downstreamMatchIds,
  getChampion,
  knockoutReady,
  resolveKnockout,
  THIRD_SLOT_GROUPS,
  thirdsComplete,
} from './bracketLogic'
import { getTeam } from './worldCup2026'

/** Picks where every group is ranked in its given (seeded) order. */
function fullGroupRanks(): BracketPicks['groupRanks'] {
  const ranks: BracketPicks['groupRanks'] = {}
  for (const g of groups) ranks[g.id] = [...g.teamIds]
  return ranks
}

/** All groups ranked, first 8 groups' 3rd-place teams qualify, every match won by home. */
function fullPicks(): BracketPicks {
  const knockoutPicks: Record<string, 'home' | 'away'> = {}
  for (const m of knockoutMatches) knockoutPicks[m.id] = 'home'
  // Take the 3rd team from each of the first 8 groups as the qualified thirds
  const qualifiedThirdTeamIds = groupIds
    .slice(0, 8)
    .map((gId) => groups.find((g) => g.id === gId)!.teamIds[2])
  return {
    groupRanks: fullGroupRanks(),
    qualifiedThirdTeamIds,
    knockoutPicks,
  }
}

describe('group completion', () => {
  it('is incomplete until every group has a top two', () => {
    const picks: BracketPicks = {
      groupRanks: { A: ['MEX', 'CRO'] },
      qualifiedThirdTeamIds: [],
      knockoutPicks: {},
    }
    expect(allGroupsComplete(picks)).toBe(false)
  })

  it('is complete when all 12 groups have at least their top two ranked', () => {
    const picks = fullPicks()
    expect(allGroupsComplete(picks)).toBe(true)
  })
})

describe('best-thirds selection', () => {
  it('requires exactly 8 thirds', () => {
    const picks = fullPicks()
    expect(thirdsComplete(picks)).toBe(true)
    expect(thirdsComplete({ ...picks, qualifiedThirdTeamIds: ['AUT'] })).toBe(false)
  })
})

describe('knockout resolution', () => {
  it('seeds R32 from group picks (winner / runner / third)', () => {
    const resolved = resolveKnockout(fullPicks())
    const r32_1 = resolved.get('R32-1')!
    // Official bracket M74: R32-1 = winner(E) vs a best-third from slot 0.
    const groupE = groups.find((g) => g.id === 'E')!
    expect(r32_1.homeTeamId).toBe(groupE.teamIds[0]) // winner of Group E
    // Away is whichever third the slot-0 assignment placed — its group must be
    // allowed in slot 0's group-set {A,B,C,D,F}.
    const awayGroup = getTeam(r32_1.awayTeamId!)!.group
    expect(THIRD_SLOT_GROUPS[0]).toContain(awayGroup)
  })

  it('propagates the home side all the way to a champion', () => {
    const picks = fullPicks()
    expect(knockoutReady(picks)).toBe(true)
    // R32-1 (M74) home is the Group E winner; always-home carries them to the title.
    const groupE = groups.find((g) => g.id === 'E')!
    expect(getChampion(picks)).toBe(groupE.teamIds[0])
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

describe('downstream invalidation', () => {
  it('lists every later match that depends on a given match', () => {
    // R32-1 feeds R16-1 → QF-1 → SF-1 → Final, and SF-1's loser feeds 3rd-place.
    const down = downstreamMatchIds('R32-1')
    expect(down).toEqual(expect.arrayContaining(['R16-1', 'QF-1', 'SF-1', 'F-1', 'TP-1']))
    // It must not include unrelated branches (e.g. the other semi-final).
    expect(down).not.toContain('SF-2')
  })

  it('the Final has no downstream matches', () => {
    expect(downstreamMatchIds('F-1')).toEqual([])
  })
})

describe('best-thirds slot assignment', () => {
  it('assigns every chosen third to a slot whose group-set allows it', () => {
    // fullPicks qualifies groups A–H's third-place teams.
    const thirdIds = fullPicks().qualifiedThirdTeamIds
    const assignment = assignThirds(thirdIds)

    // All 8 slots filled (a valid bijection always exists).
    expect(assignment.size).toBe(8)

    // Each assigned team's group must be allowed in its slot.
    for (const [slot, teamId] of assignment) {
      const group = getTeam(teamId)!.group
      expect(THIRD_SLOT_GROUPS[slot]).toContain(group)
    }

    // No team assigned to two slots.
    const assignedTeams = [...assignment.values()]
    expect(new Set(assignedTeams).size).toBe(assignedTeams.length)
  })

  it('respects forced placements for single-slot groups (K, L)', () => {
    // K is only allowed in slot 5; L only in slot 7.
    const ids = ['A', 'B', 'C', 'D', 'E', 'K', 'L', 'F'].map(
      (g) => groups.find((gr) => gr.id === g)!.teamIds[2],
    )
    const assignment = assignThirds(ids)
    const kTeam = groups.find((g) => g.id === 'K')!.teamIds[2]
    const lTeam = groups.find((g) => g.id === 'L')!.teamIds[2]
    expect(assignment.get(5)).toBe(kTeam)
    expect(assignment.get(7)).toBe(lTeam)
  })
})
