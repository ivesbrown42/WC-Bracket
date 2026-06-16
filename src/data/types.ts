/** Core domain types for the World Cup 2026 bracket. */

export type GroupId =
  | 'A' | 'B' | 'C' | 'D' | 'E' | 'F'
  | 'G' | 'H' | 'I' | 'J' | 'K' | 'L'

export type Confederation =
  | 'UEFA' | 'CONMEBOL' | 'CONCACAF' | 'CAF' | 'AFC' | 'OFC' | 'PLAYOFF'

export interface Team {
  id: string // short code, e.g. 'BRA'
  name: string // 'Brazil'
  code: string // ISO 3166-1 alpha-2 (lowercase) for flag images, e.g. 'br'
  flag: string // emoji flag fallback
  group: GroupId
  confederation: Confederation
  /** Slot not yet confirmed by the real draw — rendered as a placeholder. */
  placeholder?: boolean
  /** Flag colors (2–3 hex). Dominant/primary color first. */
  colors: string[]
}

export interface Group {
  id: GroupId
  /** Four team ids in seeded (pot) order. */
  teamIds: string[]
}

export type RoundId = 'R32' | 'R16' | 'QF' | 'SF' | 'F' | 'TP'

/** Where a knockout slot's team comes from. */
export type SlotSource =
  | { kind: 'winner'; group: GroupId } // 1st place of a group
  | { kind: 'runner'; group: GroupId } // 2nd place of a group
  | { kind: 'third'; index: number } // nth of the user's chosen best-thirds (0–7)
  | { kind: 'matchWinner'; matchId: string }
  | { kind: 'matchLoser'; matchId: string } // feeds the third-place playoff

export interface KnockoutMatch {
  id: string // e.g. 'R32-1'
  round: RoundId
  home: SlotSource
  away: SlotSource
}

/**
 * The user's predictions.
 * - `groupRanks`: per group, ordered team ids (index 0 = predicted winner).
 * - `qualifiedThirdTeamIds`: the 8 team ids (from non-top-2 pool) the user
 *    advances to the Round of 32 as best-thirds.
 * - `knockoutPicks`: matchId -> 'home' | 'away' winner.
 */
export interface BracketPicks {
  groupRanks: Partial<Record<GroupId, string[]>>
  qualifiedThirdTeamIds: string[]
  knockoutPicks: Record<string, 'home' | 'away'>
  /** The player's team theme (favorite team + border pattern + highlight color). Optional so old saves stay valid. */
  theme?: import('./theme').TeamTheme
}

/** A fully-resolved knockout match (after applying picks). */
export interface ResolvedMatch {
  id: string
  round: RoundId
  homeTeamId: string | null
  awayTeamId: string | null
  winnerTeamId: string | null
}
