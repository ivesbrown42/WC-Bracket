import { describe, it, expect } from 'vitest'
import { parseResults, type ApiStanding, type ApiMatch } from './results'

/** A finished group: every team has played all 3 games. */
function finishedGroup(group: string, order: string[]): ApiStanding {
  return {
    group,
    type: 'TOTAL',
    table: order.map((tla, i) => ({
      position: i + 1,
      team: { tla },
      playedGames: 3,
      points: 9 - i * 3,
      goalDifference: 5 - i * 2,
      goalsFor: 6 - i,
    })),
  }
}

describe('parseResults', () => {
  it('extracts top-2 advancers only from completed groups', () => {
    const standings: ApiStanding[] = [
      finishedGroup('Group A', ['MEX', 'KOR', 'CZE', 'RSA']),
      {
        group: 'Group B',
        type: 'TOTAL',
        // Group B still in progress (only 1 game played)
        table: [
          { position: 1, team: { tla: 'CAN' }, playedGames: 1, points: 3, goalDifference: 2, goalsFor: 2 },
          { position: 2, team: { tla: 'SUI' }, playedGames: 1, points: 1, goalDifference: 0, goalsFor: 1 },
          { position: 3, team: { tla: 'BIH' }, playedGames: 1, points: 1, goalDifference: 0, goalsFor: 1 },
          { position: 4, team: { tla: 'QAT' }, playedGames: 1, points: 0, goalDifference: -2, goalsFor: 0 },
        ],
      },
    ]
    const r = parseResults(standings, [])
    expect(r.groupAdvancers.A).toEqual(['MEX', 'KOR'])
    expect(r.groupAdvancers.B).toBeUndefined() // not finished
    expect(r.bestThirds).toEqual([]) // not all 12 groups done
  })

  it('reads knockout matchups and reached stages from finished matches', () => {
    const matches: ApiMatch[] = [
      {
        stage: 'LAST_32',
        status: 'FINISHED',
        homeTeam: { tla: 'BRA' },
        awayTeam: { tla: 'SCO' },
        score: { winner: 'HOME_TEAM' },
      },
      {
        stage: 'LAST_32',
        status: 'TIMED', // scheduled, teams known, not played
        homeTeam: { tla: 'FRA' },
        awayTeam: { tla: 'SEN' },
        score: { winner: null },
      },
      {
        stage: 'FINAL',
        status: 'FINISHED',
        homeTeam: { tla: 'BRA' },
        awayTeam: { tla: 'FRA' },
        score: { winner: 'AWAY_TEAM' },
      },
    ]
    const r = parseResults([], matches)

    // Both R32 matchups are real (teams slotted), even the unplayed one.
    expect(r.matchups.R32).toEqual([
      { home: 'BRA', away: 'SCO' },
      { home: 'FRA', away: 'SEN' },
    ])
    expect(r.matchups.F).toEqual([{ home: 'BRA', away: 'FRA' }])

    // BRA won its R32 → reached R16. FRA won the final → champion.
    expect(r.reached.R16).toEqual(['BRA'])
    expect(r.reached.CHAMP).toEqual(['FRA'])
  })

  it('ignores group-stage and third-place matches for knockout scoring', () => {
    const matches: ApiMatch[] = [
      { stage: 'GROUP_STAGE', status: 'FINISHED', homeTeam: { tla: 'MEX' }, awayTeam: { tla: 'RSA' }, score: { winner: 'HOME_TEAM' } },
      { stage: 'THIRD_PLACE', status: 'FINISHED', homeTeam: { tla: 'NED' }, awayTeam: { tla: 'ESP' }, score: { winner: 'HOME_TEAM' } },
    ]
    const r = parseResults([], matches)
    expect(r.matchups).toEqual({})
    expect(r.reached).toEqual({})
  })
})
