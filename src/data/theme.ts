/**
 * TeamTheme: a flag-derived color scheme + border pattern.
 * Directly inspired by the player's favorite team's colors.
 */
import { getTeam } from './worldCup2026'

export type BorderPattern = 'solid' | 'stripes' | 'hoops' | 'halves' | 'sash' | 'chevron' | 'pinstripe' | 'checkers'

export interface TeamTheme {
  /** Which team's colors to use. */
  teamId: string
  /** Border pattern matching the kit concept. */
  pattern: BorderPattern
  /** Which of the team's flag colors is the UI highlight/primary (0–2). */
  highlightIndex: number
}

export const PATTERNS: { id: BorderPattern; label: string }[] = [
  { id: 'solid', label: 'Solid' },
  { id: 'stripes', label: 'Stripes' },
  { id: 'hoops', label: 'Hoops' },
  { id: 'halves', label: 'Halves' },
  { id: 'sash', label: 'Sash' },
  { id: 'chevron', label: 'Chevron' },
  { id: 'pinstripe', label: 'Pinstripe' },
  { id: 'checkers', label: 'Checkers' },
]

// Neutral default: Brazil (universal appeal) with stripes, primary color.
export const DEFAULT_THEME: TeamTheme = {
  teamId: 'BRA',
  pattern: 'stripes',
  highlightIndex: 0,
}

/** Get the flag colors for a theme, with the highlight color identified. */
export function themeColors(theme: TeamTheme | undefined): {
  colors: string[]
  highlight: string
  all: string[]
} {
  const t = theme ?? DEFAULT_THEME
  const team = getTeam(t.teamId)
  const colors = team?.colors ?? ['#666666', '#ffffff']
  const highlight = colors[Math.min(t.highlightIndex, colors.length - 1)]
  return { colors, highlight, all: colors }
}

/** Normalize theme on load/share decode (handles old/missing data). */
export function normalizeTheme(raw: Partial<TeamTheme> | undefined | null): TeamTheme {
  if (!raw?.teamId) return DEFAULT_THEME
  return {
    teamId: raw.teamId,
    pattern: (raw.pattern as BorderPattern) || 'stripes',
    highlightIndex: raw.highlightIndex ?? 0,
  }
}

/** True if still the default theme (drives "pick your team" nudge). */
export function isDefaultTheme(t: TeamTheme | undefined): boolean {
  if (!t) return true
  return t.teamId === DEFAULT_THEME.teamId && t.pattern === DEFAULT_THEME.pattern && t.highlightIndex === DEFAULT_THEME.highlightIndex
}
