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

describe('official FIFA 2026 bracket structure', () => {
  // Independent oracle: FIFA's official Round-of-32 slots (match numbers M73-M88),
  // transcribed from the published knockout bracket. winner=1X, runner=2X,
  // third=3#slotIndex. The code's r32Sources must reproduce this exactly.
  const OFFICIAL_R32: [string, string][] = [
    ['1E', '3#0'], // R32-1  · M74
    ['1I', '3#1'], // R32-2  · M77
    ['2A', '2B'], // R32-3  · M73
    ['1F', '2C'], // R32-4  · M75
    ['2K', '2L'], // R32-5  · M83
    ['1H', '2J'], // R32-6  · M84
    ['1D', '3#2'], // R32-7  · M81  (USA = 1D)
    ['1G', '3#3'], // R32-8  · M82
    ['1C', '2F'], // R32-9  · M76
    ['2E', '2I'], // R32-10 · M78
    ['1A', '3#4'], // R32-11 · M79  (Mexico = 1A)
    ['1L', '3#5'], // R32-12 · M80
    ['1J', '2H'], // R32-13 · M86
    ['2D', '2G'], // R32-14 · M88
    ['1B', '3#6'], // R32-15 · M85
    ['1K', '3#7'], // R32-16 · M87
  ]

  const describeSource = (s: { kind: string; group?: string; index?: number; matchId?: string }): string => {
    switch (s.kind) {
      case 'winner':
        return `1${s.group}`
      case 'runner':
        return `2${s.group}`
      case 'third':
        return `3#${s.index}`
      case 'matchWinner':
        return `W:${s.matchId}`
      case 'matchLoser':
        return `L:${s.matchId}`
      default:
        return '?'
    }
  }

  it('seeds all 16 Round-of-32 matches exactly as FIFA M73-M88', () => {
    OFFICIAL_R32.forEach(([home, away], i) => {
      const m = knockoutMatches.find((x) => x.id === `R32-${i + 1}`)!
      expect([describeSource(m.home), describeSource(m.away)]).toEqual([home, away])
    })
  })

  it('chains R16 from consecutive R32 winners (official W-pairings)', () => {
    // R16-1 = W74×W77, R16-2 = W73×W75, R16-3 = W83×W84, R16-4 = W81×W82,
    // R16-5 = W76×W78, R16-6 = W79×W80, R16-7 = W86×W88, R16-8 = W85×W87.
    for (let i = 1; i <= 8; i++) {
      const m = knockoutMatches.find((x) => x.id === `R16-${i}`)!
      expect(describeSource(m.home)).toBe(`W:R32-${i * 2 - 1}`)
      expect(describeSource(m.away)).toBe(`W:R32-${i * 2}`)
    }
  })

  it('chains QF/SF/Final from prior-round winners and the 3rd-place from SF losers', () => {
    const counts = { R32: 0, R16: 0, QF: 0, SF: 0, F: 0, TP: 0 } as Record<string, number>
    for (const m of knockoutMatches) counts[m.round]++
    expect(counts).toEqual({ R32: 16, R16: 8, QF: 4, SF: 2, F: 1, TP: 1 })

    const final = knockoutMatches.find((m) => m.id === 'F-1')!
    expect([describeSource(final.home), describeSource(final.away)]).toEqual(['W:SF-1', 'W:SF-2'])
    const third = knockoutMatches.find((m) => m.id === 'TP-1')!
    expect([describeSource(third.home), describeSource(third.away)]).toEqual(['L:SF-1', 'L:SF-2'])
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

  it('slots thirds by FIFA Annex C, not just any valid bijection', () => {
    // Reported symptom: with thirds qualifying from groups B,F,G,H,I,J,K,L,
    // FIFA Annex C sends Group B's third to slot 2 — the Round-of-32 match
    // against the Group D winner (the USA's seed). The previous "any valid
    // bijection" matcher instead dropped B into slot 0 (vs the Group E winner),
    // i.e. "Bosnia v Germany" instead of "Bosnia v USA".
    const combo = ['B', 'F', 'G', 'H', 'I', 'J', 'K', 'L']
    const expectedGroupBySlot = ['F', 'G', 'B', 'I', 'H', 'K', 'J', 'L']
    const thirdIds = combo.map((g) => groups.find((gr) => gr.id === g)!.teamIds[2])

    const assignment = assignThirds(thirdIds)
    const groupBySlot = Array.from({ length: 8 }, (_, s) =>
      getTeam(assignment.get(s)!)?.group,
    )
    expect(groupBySlot).toEqual(expectedGroupBySlot)
    // Specifically: the Group D winner (USA) faces Group B's third in slot 2.
    expect(getTeam(assignment.get(2)!)?.group).toBe('B')
  })
})
