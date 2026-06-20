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

// Teams listed group-by-group per the official 2026 FIFA World Cup draw.
// TLA codes match api.football-data.org exactly for results-grading integration.
export const teams: Team[] = [
  // Group A
  { id: 'MEX', name: 'Mexico',       code: 'mx',     flag: '🇲🇽', group: 'A', confederation: 'CONCACAF', colors: ['#165f2d', '#ffffff', '#c91c1c'] },
  { id: 'KOR', name: 'South Korea',  code: 'kr',     flag: '🇰🇷', group: 'A', confederation: 'AFC',      colors: ['#ffffff', '#c60c30', '#000000'] },
  { id: 'CZE', name: 'Czechia',      code: 'cz',     flag: '🇨🇿', group: 'A', confederation: 'UEFA',     colors: ['#d7141a', '#ffffff', '#003087'] },
  { id: 'RSA', name: 'South Africa', code: 'za',     flag: '🇿🇦', group: 'A', confederation: 'CAF',      colors: ['#007a4d', '#000000', '#ffb612', '#de3831'] },

  // Group B
  { id: 'CAN', name: 'Canada',              code: 'ca', flag: '🇨🇦', group: 'B', confederation: 'CONCACAF', colors: ['#ff0000', '#ffffff'] },
  { id: 'SUI', name: 'Switzerland',         code: 'ch', flag: '🇨🇭', group: 'B', confederation: 'UEFA',     colors: ['#ff0000', '#ffffff'] },
  { id: 'BIH', name: 'Bosnia-Herzegovina',  code: 'ba', flag: '🇧🇦', group: 'B', confederation: 'UEFA',     colors: ['#003087', '#fcd116', '#ffffff'] },
  { id: 'QAT', name: 'Qatar',               code: 'qa', flag: '🇶🇦', group: 'B', confederation: 'AFC',      colors: ['#8d1439', '#ffffff'] },

  // Group C
  { id: 'BRA', name: 'Brazil',    code: 'br', flag: '🇧🇷', group: 'C', confederation: 'CONMEBOL', colors: ['#009f3b', '#ffd700', '#002776'] },
  { id: 'MAR', name: 'Morocco',   code: 'ma', flag: '🇲🇦', group: 'C', confederation: 'CAF',      colors: ['#c60c30', '#007a5e'] },
  { id: 'SCO', name: 'Scotland',  code: 'gb-sct', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', group: 'C', confederation: 'UEFA', colors: ['#003087', '#ffffff'] },
  { id: 'HAI', name: 'Haiti',     code: 'ht', flag: '🇭🇹', group: 'C', confederation: 'CONCACAF', colors: ['#003087', '#ce1126', '#000000'] },

  // Group D
  { id: 'USA', name: 'USA',        code: 'us', flag: '🇺🇸', group: 'D', confederation: 'CONCACAF', colors: ['#0c2e7f', '#ffffff', '#ff3c00'] },
  { id: 'AUS', name: 'Australia',  code: 'au', flag: '🇦🇺', group: 'D', confederation: 'AFC',      colors: ['#003478', '#ffd700', '#ffffff'] },
  { id: 'PAR', name: 'Paraguay',   code: 'py', flag: '🇵🇾', group: 'D', confederation: 'CONMEBOL', colors: ['#003087', '#ffffff', '#ce1126'] },
  { id: 'TUR', name: 'Turkey',     code: 'tr', flag: '🇹🇷', group: 'D', confederation: 'UEFA',     colors: ['#c60c30', '#ffffff'] },

  // Group E
  { id: 'GER', name: 'Germany',     code: 'de', flag: '🇩🇪', group: 'E', confederation: 'UEFA',     colors: ['#000000', '#d00000', '#ffd700'] },
  { id: 'CIV', name: 'Ivory Coast', code: 'ci', flag: '🇨🇮', group: 'E', confederation: 'CAF',      colors: ['#ff8000', '#ffffff', '#00a651'] },
  { id: 'ECU', name: 'Ecuador',     code: 'ec', flag: '🇪🇨', group: 'E', confederation: 'CONMEBOL', colors: ['#ffce00', '#003478', '#ce1126'] },
  { id: 'CUW', name: 'Curaçao',     code: 'cw', flag: '🇨🇼', group: 'E', confederation: 'CONCACAF', colors: ['#002b7f', '#f9e814', '#ffffff'] },

  // Group F
  { id: 'NED', name: 'Netherlands', code: 'nl', flag: '🇳🇱', group: 'F', confederation: 'UEFA', colors: ['#ff6600', '#ffffff', '#0066cc'] },
  { id: 'SWE', name: 'Sweden',      code: 'se', flag: '🇸🇪', group: 'F', confederation: 'UEFA', colors: ['#006aa7', '#fecc02'] },
  { id: 'JPN', name: 'Japan',       code: 'jp', flag: '🇯🇵', group: 'F', confederation: 'AFC',  colors: ['#ffffff', '#dd0000'] },
  { id: 'TUN', name: 'Tunisia',     code: 'tn', flag: '🇹🇳', group: 'F', confederation: 'CAF',  colors: ['#d00000', '#ffffff'] },

  // Group G
  { id: 'NZL', name: 'New Zealand', code: 'nz', flag: '🇳🇿', group: 'G', confederation: 'OFC',  colors: ['#000000', '#ffffff'] },
  { id: 'IRN', name: 'Iran',        code: 'ir', flag: '🇮🇷', group: 'G', confederation: 'AFC',  colors: ['#006c35', '#ffffff', '#ce1126'] },
  { id: 'BEL', name: 'Belgium',     code: 'be', flag: '🇧🇪', group: 'G', confederation: 'UEFA', colors: ['#000000', '#ffd700', '#ce1126'] },
  { id: 'EGY', name: 'Egypt',       code: 'eg', flag: '🇪🇬', group: 'G', confederation: 'CAF',  colors: ['#ce1126', '#ffffff', '#000000'] },

  // Group H
  { id: 'URU', name: 'Uruguay',     code: 'uy', flag: '🇺🇾', group: 'H', confederation: 'CONMEBOL', colors: ['#0066cc', '#ffffff'] },
  { id: 'KSA', name: 'Saudi Arabia',code: 'sa', flag: '🇸🇦', group: 'H', confederation: 'AFC',      colors: ['#006c35', '#ffffff'] },
  { id: 'ESP', name: 'Spain',       code: 'es', flag: '🇪🇸', group: 'H', confederation: 'UEFA',     colors: ['#c60b1e', '#ffc400'] },
  { id: 'CPV', name: 'Cape Verde',  code: 'cv', flag: '🇨🇻', group: 'H', confederation: 'CAF',      colors: ['#003893', '#cf2027', '#f4bc00'] },

  // Group I
  { id: 'NOR', name: 'Norway', code: 'no', flag: '🇳🇴', group: 'I', confederation: 'UEFA',     colors: ['#ef2b2d', '#002868', '#ffffff'] },
  { id: 'FRA', name: 'France', code: 'fr', flag: '🇫🇷', group: 'I', confederation: 'UEFA',     colors: ['#002395', '#ffffff', '#ef4135'] },
  { id: 'SEN', name: 'Senegal',code: 'sn', flag: '🇸🇳', group: 'I', confederation: 'CAF',      colors: ['#007a5e', '#fcd116', '#ce1126'] },
  { id: 'IRQ', name: 'Iraq',   code: 'iq', flag: '🇮🇶', group: 'I', confederation: 'AFC',      colors: ['#000000', '#ffffff', '#ce1126'] },

  // Group J
  { id: 'ARG', name: 'Argentina', code: 'ar', flag: '🇦🇷', group: 'J', confederation: 'CONMEBOL', colors: ['#75aadb', '#ffffff', '#f6b40b'] },
  { id: 'AUT', name: 'Austria',   code: 'at', flag: '🇦🇹', group: 'J', confederation: 'UEFA',     colors: ['#ed2939', '#ffffff'] },
  { id: 'JOR', name: 'Jordan',    code: 'jo', flag: '🇯🇴', group: 'J', confederation: 'AFC',      colors: ['#007a3d', '#000000', '#ffffff', '#ce1126'] },
  { id: 'ALG', name: 'Algeria',   code: 'dz', flag: '🇩🇿', group: 'J', confederation: 'CAF',      colors: ['#006c35', '#ffffff', '#ce1126'] },

  // Group K
  { id: 'COL', name: 'Colombia', code: 'co', flag: '🇨🇴', group: 'K', confederation: 'CONMEBOL', colors: ['#ffcd00', '#003087', '#c60c30'] },
  { id: 'COD', name: 'Congo DR', code: 'cd', flag: '🇨🇩', group: 'K', confederation: 'CAF',      colors: ['#007fff', '#ce1126', '#f7d618'] },
  { id: 'POR', name: 'Portugal', code: 'pt', flag: '🇵🇹', group: 'K', confederation: 'UEFA',     colors: ['#005233', '#ffcc00', '#ff0000'] },
  { id: 'UZB', name: 'Uzbekistan',code: 'uz', flag: '🇺🇿', group: 'K', confederation: 'AFC',      colors: ['#0099da', '#ffffff', '#00a651'] },

  // Group L
  { id: 'ENG', name: 'England', code: 'gb-eng', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', group: 'L', confederation: 'UEFA',     colors: ['#ffffff', '#c8102e'] },
  { id: 'GHA', name: 'Ghana',   code: 'gh',     flag: '🇬🇭',         group: 'L', confederation: 'CAF',      colors: ['#ce1126', '#fcd116', '#007a59'] },
  { id: 'PAN', name: 'Panama',  code: 'pa',     flag: '🇵🇦',         group: 'L', confederation: 'CONCACAF', colors: ['#0066cc', '#ce1126', '#ffffff'] },
  { id: 'CRO', name: 'Croatia', code: 'hr',     flag: '🇭🇷',         group: 'L', confederation: 'UEFA',     colors: ['#c41c3b', '#ffffff', '#0052cc'] },
]

export const groups: Group[] = groupIds.map((id) => ({
  id,
  teamIds: teams.filter((t) => t.group === id).map((t) => t.id),
}))

const teamMap = new Map(teams.map((t) => [t.id, t]))
export const getTeam = (id: string | null | undefined): Team | undefined =>
  id ? teamMap.get(id) : undefined

/**
 * Round-of-32 seeding — the OFFICIAL FIFA 2026 bracket structure.
 *
 * Source: official knockout bracket (FIFA match numbers 73–88). The list is
 * ordered so that `buildKnockoutMatches`' consecutive-pair chaining reproduces
 * the exact real tree: R32 → R16 (89–96) → QF (97–100) → SF (101–102) →
 * Final (104). Each entry is annotated with its FIFA match number.
 *
 * Winner/runner pairings are exact. Third-place slots carry the real allowed
 * group-set (per FIFA's 495-combination table) in comments; for now they map
 * to the user's chosen thirds by index (`thirds 0–7`). Wiring the exact
 * group-set → slot assignment is the remaining finishing step.
 *
 * Host note: FIFA seeds Mexico into the Group A winner slot (M79) and the USA
 * into the Group D winner slot (M81) — encoded positionally as winner A / D.
 */
const r32Sources: [SlotSource, SlotSource][] = [
  [{ kind: 'winner', group: 'E' }, { kind: 'third', index: 0 }], // M74 · 3rd[A/B/C/D/F]
  [{ kind: 'winner', group: 'I' }, { kind: 'third', index: 1 }], // M77 · 3rd[C/D/F/G/H]
  [{ kind: 'runner', group: 'A' }, { kind: 'runner', group: 'B' }], // M73
  [{ kind: 'winner', group: 'F' }, { kind: 'runner', group: 'C' }], // M75
  [{ kind: 'runner', group: 'K' }, { kind: 'runner', group: 'L' }], // M83
  [{ kind: 'winner', group: 'H' }, { kind: 'runner', group: 'J' }], // M84
  [{ kind: 'winner', group: 'D' }, { kind: 'third', index: 2 }], // M81 · 3rd[B/E/F/I/J]
  [{ kind: 'winner', group: 'G' }, { kind: 'third', index: 3 }], // M82 · 3rd[A/E/H/I/J]
  [{ kind: 'winner', group: 'C' }, { kind: 'runner', group: 'F' }], // M76
  [{ kind: 'runner', group: 'E' }, { kind: 'runner', group: 'I' }], // M78
  [{ kind: 'winner', group: 'A' }, { kind: 'third', index: 4 }], // M79 · 3rd[C/E/F/H/I]
  [{ kind: 'winner', group: 'L' }, { kind: 'third', index: 5 }], // M80 · 3rd[E/H/I/J/K]
  [{ kind: 'winner', group: 'J' }, { kind: 'runner', group: 'H' }], // M86
  [{ kind: 'runner', group: 'D' }, { kind: 'runner', group: 'G' }], // M88
  [{ kind: 'winner', group: 'B' }, { kind: 'third', index: 6 }], // M85 · 3rd[E/F/G/I/J]
  [{ kind: 'winner', group: 'K' }, { kind: 'third', index: 7 }], // M87 · 3rd[D/E/I/J/L]
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
