/**
 * Hook: apply the user's team theme to the entire app by overriding CSS vars.
 * Call once in App to make buttons, accents, etc. all follow the theme color.
 */
import { useEffect } from 'react'
import { useBracketStore } from '../../store/bracketStore'
import { normalizeTheme, themeColors } from '../../data/theme'

export function useTeamTheme() {
  const theme = useBracketStore((s) => normalizeTheme(s.picks.theme))

  useEffect(() => {
    const { highlight } = themeColors(theme)
    // Override the primary accent color (used in buttons, progress, picked states).
    document.documentElement.style.setProperty('--wc-color-accent-red', highlight)
    // Also set a secondary accent for variety (picked teams, progress bar).
    document.documentElement.style.setProperty('--wc-color-accent-green', highlight)
  }, [theme])
}
