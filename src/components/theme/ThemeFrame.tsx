/**
 * A decorative wide border styled after the theme's flag colors and pattern.
 * Frames the entire page, leaving content on clean paper.
 *
 * Two modes:
 *  - default (no children): a fixed full-viewport frame overlay.
 *  - inline: wraps children in a framed card.
 */
import type { ReactNode } from 'react'
import type { TeamTheme } from '../../data/theme'
import { useBracketStore } from '../../store/bracketStore'
import { normalizeTheme, themeColors } from '../../data/theme'
import styles from './ThemeFrame.module.css'

/** Build a multi-color gradient that reads like the theme's flag pattern. */
export function themeFrameBackground(t: TeamTheme): string {
  const { colors } = themeColors(t)
  const { pattern } = t
  const band =
    pattern === 'pinstripe' ? 4 : pattern === 'checkers' || pattern === 'hoops' ? 10 : 14
  const angle =
    pattern === 'hoops'
      ? 0
      : pattern === 'sash' || pattern === 'chevron'
        ? 135
        : pattern === 'halves'
          ? 90
          : 45
  if (pattern === 'solid' || colors.length < 2) {
    return colors[0]
  }
  const c1 = colors[0]
  const c2 = colors[1] ?? c1
  return `repeating-linear-gradient(${angle}deg, ${c1} 0 ${band}px, ${c2} ${band}px ${band * 2}px)`
}

export function ThemeFrame({
  children,
  theme,
  inline,
}: {
  children?: ReactNode
  /** Override theme (defaults to store's saved theme). */
  theme?: TeamTheme
  inline?: boolean
}) {
  const storeTheme = useBracketStore((s) => s.picks.theme)
  const t = theme ?? normalizeTheme(storeTheme)
  const bg = themeFrameBackground(t)
  const { highlight } = themeColors(t)

  if (inline) {
    return (
      <div className={styles.inline} style={{ background: bg, borderColor: highlight }}>
        <div className={styles.inlineInner}>{children}</div>
      </div>
    )
  }

  // Fixed viewport frame: four bars.
  return (
    <div className={styles.screen} aria-hidden>
      <span className={styles.barTop} style={{ background: bg, boxShadow: `inset 0 -2px 0 ${highlight}` }} />
      <span className={styles.barBottom} style={{ background: bg, boxShadow: `inset 0 2px 0 ${highlight}` }} />
      <span className={styles.barLeft} style={{ background: bg, boxShadow: `inset -2px 0 0 ${highlight}` }} />
      <span className={styles.barRight} style={{ background: bg, boxShadow: `inset 2px 0 0 ${highlight}` }} />
    </div>
  )
}
