import type { Team, Group, GroupId, KnockoutMatch, SlotSource } from './types'

/**
 * WORLD CUP 2026 — teams, groups, and knockout structure.
 *
 * ⚠️ EDIT-ME: The exact official draw was not fully confirmed when this was
 * written, so group assignments below are a plausible, illustrative seeding.
 * This file is the SINGLE place to correct team names, flags, and groups —
 * nothing else in the app hardcodes the tournament data.
 *
 * Format: 48 teams · 12 groups (A–L) of 4 · top 2 of each group + the 8 best
 * third-placed teams advance to a 32-team knockout.
 */

export const groupIds: GroupId[] = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L',
]

// Teams listed group-by-group in pot order (index 0 = top seed of the group).
export const teams: Team[] = [
  // Group A
  { id: 'MEX', name: 'Mexico', code: 'mx', flag: '🇲🇽', group: 'A', confederation: 'CONCACAF', colors: ['#165f2d', '#ffffff', '#c91c1c'] },
  { id: 'CRO', name: 'Croatia', code: 'hr', flag: '🇭🇷', group: 'A', confederation: 'UEFA', colors: ['#c41c3b', '#ffffff', '#0052cc'] },
  { id: 'AUT', name: 'Austria', code: 'at', flag: '🇦🇹', group: 'A', confederation: 'UEFA', colors: ['#ed2939', '#ffffff'] },
  { id: 'TUN', name: 'Tunisia', code: 'tn', flag: '🇹🇳', group: 'A', confederation: 'CAF', colors: ['#d00000', '#ffffff'] },

  // Group B
  { id: 'CAN', name: 'Canada', code: 'ca', flag: '🇨🇦', group: 'B', confederation: 'CONCACAF', colors: ['#ff0000', '#ffffff'] },
  { id: 'ITA', name: 'Italy', code: 'it', flag: '🇮🇹', group: 'B', confederation: 'UEFA', colors: ['#009246', '#ffffff', '#ff0000'] },
  { id: 'UKR', name: 'Ukraine', code: 'ua', flag: '🇺🇦', group: 'B', confederation: 'UEFA', colors: ['#0066cc', '#ffdd00'] },
  { id: 'GHA', name: 'Ghana', code: 'gh', flag: '🇬🇭', group: 'B', confederation: 'CAF', colors: ['#ce1126', '#fcd116', '#007a59'] },

  // Group C
  { id: 'USA', name: 'USA', code: 'us', flag: '🇺🇸', group: 'C', confederation: 'CONCACAF', colors: ['#0c2e7f', '#ffffff', '#ff3c00'] },
  { id: 'URU', name: 'Uruguay', code: 'uy', flag: '🇺🇾', group: 'C', confederation: 'CONMEBOL', colors: ['#0066cc', '#ffffff'] },
  { id: 'AUS', name: 'Australia', code: 'au', flag: '🇦🇺', group: 'C', confederation: 'AFC', colors: ['#003478', '#ffd700', '#ffffff'] },
  { id: 'CIV', name: 'Ivory Coast', code: 'ci', flag: '🇨🇮', group: 'C', confederation: 'CAF', colors: ['#ff8000', '#ffffff', '#00a651'] },

  // Group D
  { id: 'ARG', name: 'Argentina', code: 'ar', flag: '🇦🇷', group: 'D', confederation: 'CONMEBOL', colors: ['#75aadb', '#ffffff', '#f6b40b'] },
  { id: 'COL', name: 'Colombia', code: 'co', flag: '🇨🇴', group: 'D', confederation: 'CONMEBOL', colors: ['#ffcd00', '#003087', '#c60c30'] },
  { id: 'KSA', name: 'Saudi Arabia', code: 'sa', flag: '🇸🇦', group: 'D', confederation: 'AFC', colors: ['#006c35', '#ffffff'] },
  { id: 'CMR', name: 'Cameroon', code: 'cm', flag: '🇨🇲', group: 'D', confederation: 'CAF', colors: ['#007a5e', '#ce1126', '#fcd116'] },

  // Group E
  { id: 'FRA', name: 'France', code: 'fr', flag: '🇫🇷', group: 'E', confederation: 'UEFA', colors: ['#002395', '#ffffff', '#ef4135'] },
  { id: 'MAR', name: 'Morocco', code: 'ma', flag: '🇲🇦', group: 'E', confederation: 'CAF', colors: ['#c60c30', '#007a5e'] },
  { id: 'NGA', name: 'Nigeria', code: 'ng', flag: '🇳🇬', group: 'E', confederation: 'CAF', colors: ['#007a5e', '#ffffff'] },
  { id: 'IRQ', name: 'Iraq', code: 'iq', flag: '🇮🇶', group: 'E', confederation: 'AFC', colors: ['#000000', '#ffffff', '#ce1126'] },

  // Group F
  { id: 'ENG', name: 'England', code: 'gb-eng', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', group: 'F', confederation: 'UEFA', colors: ['#ffffff', '#c8102e'] },
  { id: 'JPN', name: 'Japan', code: 'jp', flag: '🇯🇵', group: 'F', confederation: 'AFC', colors: ['#ffffff', '#dd0000'] },
  { id: 'EGY', name: 'Egypt', code: 'eg', flag: '🇪🇬', group: 'F', confederation: 'CAF', colors: ['#ce1126', '#ffffff', '#000000'] },
  { id: 'UZB', name: 'Uzbekistan', code: 'uz', flag: '🇺🇿', group: 'F', confederation: 'AFC', colors: ['#0099da', '#ffffff', '#00a651'] },

  // Group G
  { id: 'ESP', name: 'Spain', code: 'es', flag: '🇪🇸', group: 'G', confederation: 'UEFA', colors: ['#c60b1e', '#ffc400'] },
  { id: 'SEN', name: 'Senegal', code: 'sn', flag: '🇸🇳', group: 'G', confederation: 'CAF', colors: ['#007a5e', '#fcd116', '#ce1126'] },
  { id: 'ALG', name: 'Algeria', code: 'dz', flag: '🇩🇿', group: 'G', confederation: 'CAF', colors: ['#006c35', '#ffffff', '#ce1126'] },
  { id: 'NZL', name: 'New Zealand', code: 'nz', flag: '🇳🇿', group: 'G', confederation: 'OFC', colors: ['#000000', '#ffffff'] },

  // Group H
  { id: 'POR', name: 'Portugal', code: 'pt', flag: '🇵🇹', group: 'H', confederation: 'UEFA', colors: ['#005233', '#ffcc00', '#ff0000'] },
  { id: 'SUI', name: 'Switzerland', code: 'ch', flag: '🇨🇭', group: 'H', confederation: 'UEFA', colors: ['#ff0000', '#ffffff'] },
  { id: 'SRB', name: 'Serbia', code: 'rs', flag: '🇷🇸', group: 'H', confederation: 'UEFA', colors: ['#c41e3a', '#ffffff', '#003678'] },
  { id: 'JAM', name: 'Jamaica', code: 'jm', flag: '🇯🇲', group: 'H', confederation: 'CONCACAF', colors: ['#009739', '#fcd116', '#000000'] },

  // Group I
  { id: 'BRA', name: 'Brazil', code: 'br', flag: '🇧🇷', group: 'I', confederation: 'CONMEBOL', colors: ['#009f3b', '#ffd700', '#002776'] },
  { id: 'DEN', name: 'Denmark', code: 'dk', flag: '🇩🇰', group: 'I', confederation: 'UEFA', colors: ['#c60c30', '#ffffff'] },
  { id: 'POL', name: 'Poland', code: 'pl', flag: '🇵🇱', group: 'I', confederation: 'UEFA', colors: ['#ffffff', '#c41e3a'] },
  { id: 'PAR', name: 'Paraguay', code: 'py', flag: '🇵🇾', group: 'I', confederation: 'CONMEBOL', colors: ['#003087', '#ffffff', '#ce1126'] },

  // Group J
  { id: 'NED', name: 'Netherlands', code: 'nl', flag: '🇳🇱', group: 'J', confederation: 'UEFA', colors: ['#ff6600', '#ffffff', '#0066cc'] },
  { id: 'KOR', name: 'South Korea', code: 'kr', flag: '🇰🇷', group: 'J', confederation: 'AFC', colors: ['#ffffff', '#c60c30', '#000000'] },
  { id: 'CRC', name: 'Costa Rica', code: 'cr', flag: '🇨🇷', group: 'J', confederation: 'CONCACAF', colors: ['#0066cc', '#ffffff', '#ce1126'] },
  { id: 'TUR', name: 'Turkey', code: 'tr', flag: '🇹🇷', group: 'J', confederation: 'UEFA', colors: ['#c60c30', '#ffffff'] },

  // Group K
  { id: 'BEL', name: 'Belgium', code: 'be', flag: '🇧🇪', group: 'K', confederation: 'UEFA', colors: ['#000000', '#ffd700', '#ce1126'] },
  { id: 'IRN', name: 'Iran', code: 'ir', flag: '🇮🇷', group: 'K', confederation: 'AFC', colors: ['#006c35', '#ffffff', '#ce1126'] },
  { id: 'PAN', name: 'Panama', code: 'pa', flag: '🇵🇦', group: 'K', confederation: 'CONCACAF', colors: ['#0066cc', '#ce1126', '#ffffff'] },
  { id: 'POA', name: 'Playoff A', code: '', flag: '🏳️', group: 'K', confederation: 'PLAYOFF', placeholder: true, colors: ['#999999', '#ffffff'] },

  // Group L
  { id: 'GER', name: 'Germany', code: 'de', flag: '🇩🇪', group: 'L', confederation: 'UEFA', colors: ['#000000', '#d00000', '#ffd700'] },
  { id: 'ECU', name: 'Ecuador', code: 'ec', flag: '🇪🇨', group: 'L', confederation: 'CONMEBOL', colors: ['#ffce00', '#003478', '#ce1126'] },
  { id: 'QAT', name: 'Qatar', code: 'qa', flag: '🇶🇦', group: 'L', confederation: 'AFC', colors: ['#8d1439', '#ffffff'] },
  { id: 'POB', name: 'Playoff B', code: '', flag: '🏳️', group: 'L', confederation: 'PLAYOFF', placeholder: true, colors: ['#999999', '#ffffff'] },
]

export const groups: Group[] = groupIds.map((id) => ({
  id,
  teamIds: teams.filter((t) => t.group === id).map((t) => t.id),
}))

const teamMap = new Map(teams.map((t) => [t.id, t]))
export const getTeam = (id: string | null | undefined): Team | undefined =>
  id ? teamMap.get(id) : undefined

/**
 * Round-of-32 seeding template (16 matches).
 * Pairs the 12 group winners, 12 runners-up and 8 best-thirds. This is a
 * valid, balanced bracket but a simplified slotting — the official FIFA
 * third-place lookup can be layered in later without changing the model.
 */
const r32Sources: [SlotSource, SlotSource][] = [
  [{ kind: 'winner', group: 'A' }, { kind: 'third', index: 0 }],
  [{ kind: 'runner', group: 'E' }, { kind: 'runner', group: 'J' }],
  [{ kind: 'winner', group: 'I' }, { kind: 'runner', group: 'A' }],
  [{ kind: 'runner', group: 'F' }, { kind: 'runner', group: 'I' }],
  [{ kind: 'winner', group: 'B' }, { kind: 'third', index: 1 }],
  [{ kind: 'runner', group: 'G' }, { kind: 'runner', group: 'L' }],
  [{ kind: 'winner', group: 'J' }, { kind: 'runner', group: 'B' }],
  [{ kind: 'runner', group: 'H' }, { kind: 'runner', group: 'K' }],
  [{ kind: 'winner', group: 'C' }, { kind: 'third', index: 2 }],
  [{ kind: 'winner', group: 'D' }, { kind: 'third', index: 3 }],
  [{ kind: 'winner', group: 'K' }, { kind: 'runner', group: 'C' }],
  [{ kind: 'winner', group: 'E' }, { kind: 'third', index: 4 }],
  [{ kind: 'winner', group: 'F' }, { kind: 'third', index: 5 }],
  [{ kind: 'winner', group: 'L' }, { kind: 'runner', group: 'D' }],
  [{ kind: 'winner', group: 'G' }, { kind: 'third', index: 6 }],
  [{ kind: 'winner', group: 'H' }, { kind: 'third', index: 7 }],
]

/**
 * Build the full knockout match list (R32 → R16 → QF → SF → Final + 3rd place).
 * Consecutive matches in each round feed the next round, forming the tree.
 */
export function buildKnockoutMatches(): KnockoutMatch[] {
  const matches: KnockoutMatch[] = []

  // Round of 32
  r32Sources.forEach(([home, away], i) => {
    matches.push({ id: `R32-${i + 1}`, round: 'R32', home, away })
  })

  // Helper to chain a round from the previous one.
  const chain = (
    round: KnockoutMatch['round'],
    count: number,
    prevPrefix: string,
  ) => {
    for (let i = 0; i < count; i++) {
      matches.push({
        id: `${round}-${i + 1}`,
        round,
        home: { kind: 'matchWinner', matchId: `${prevPrefix}-${i * 2 + 1}` },
        away: { kind: 'matchWinner', matchId: `${prevPrefix}-${i * 2 + 2}` },
      })
    }
  }

  chain('R16', 8, 'R32')
  chain('QF', 4, 'R16')
  chain('SF', 2, 'QF')

  // Final + third-place playoff
  matches.push({
    id: 'F-1',
    round: 'F',
    home: { kind: 'matchWinner', matchId: 'SF-1' },
    away: { kind: 'matchWinner', matchId: 'SF-2' },
  })
  matches.push({
    id: 'TP-1',
    round: 'TP',
    home: { kind: 'matchLoser', matchId: 'SF-1' },
    away: { kind: 'matchLoser', matchId: 'SF-2' },
  })

  return matches
}

export const knockoutMatches = buildKnockoutMatches()
