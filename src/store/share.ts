import type { BracketPicks } from '../data/types'
import { normalizeTheme } from '../data/theme'

/**
 * Encode/decode a bracket into a compact, URL-safe string so a completed
 * bracket can be shared as a link with zero backend. Stored in the URL hash.
 */

function toUrlSafe(b64: string): string {
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}
function fromUrlSafe(s: string): string {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/')
  const pad = b64.length % 4 ? '='.repeat(4 - (b64.length % 4)) : ''
  return b64 + pad
}

export function encodePicks(picks: BracketPicks): string {
  const json = JSON.stringify(picks)
  // Unicode-safe base64
  const b64 = btoa(unescape(encodeURIComponent(json)))
  return toUrlSafe(b64)
}

export function decodePicks(encoded: string): BracketPicks | null {
  try {
    const json = decodeURIComponent(escape(atob(fromUrlSafe(encoded))))
    const parsed = JSON.parse(json)
    if (
      parsed &&
      typeof parsed === 'object' &&
      'groupRanks' in parsed &&
      'qualifiedThirdTeamIds' in parsed &&
      'knockoutPicks' in parsed
    ) {
      const picks = parsed as BracketPicks
      return { ...picks, theme: normalizeTheme(picks.theme) }
    }
    return null
  } catch {
    return null
  }
}

/** Build a full shareable URL for the given bracket. */
export function buildShareUrl(picks: BracketPicks): string {
  const base = `${window.location.origin}/share`
  return `${base}#${encodePicks(picks)}`
}
