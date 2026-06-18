/**
 * Hook: apply the user's team theme to the entire app by overriding CSS vars.
 * Call once in App to make buttons, accents, etc. all follow the theme color.
 */
import { useEffect } from 'react'
import { useBracketStore } from '../../store/bracketStore'
import { normalizeTheme, themeColors } from '../../data/theme'

export function useTeamTheme() {
  const rawTheme = useBracketStore((s) => s.picks.theme)
  const theme = normalizeTheme(rawTheme)

  useEffect(() => {
    const { highlight } = themeColors(theme)
    document.documentElement.style.setProperty('--wc-color-accent-red', highlight)
    document.documentElement.style.setProperty('--wc-color-accent-green', highlight)
  }, [theme.teamId, theme.highlightIndex])
}
