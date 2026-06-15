import type { ReactNode } from 'react'
import type { Team } from '../../data/types'
import { Flag } from './Flag'
import styles from './TeamSticker.module.css'

export interface TeamStickerProps {
  team?: Team
  /** Marks the team as advancing (green tint + check). */
  picked?: boolean
  /** Dims a knocked-out team. */
  eliminated?: boolean
  /** Small secondary text under/after the name (e.g. group, seed). */
  meta?: string
  /** Trailing content (badge, rank). Overrides the default check. */
  trailing?: ReactNode
  /** Placeholder text when no team is set yet. */
  emptyLabel?: string
  size?: 'sm' | 'md'
  onClick?: () => void
}

/**
 * The signature collectible: a team's flag + name as a peelable sticker.
 * Drives the group lists and the whole knockout bracket.
 */
export function TeamSticker({
  team,
  picked,
  eliminated,
  meta,
  trailing,
  emptyLabel = 'TBD',
  size = 'md',
  onClick,
}: TeamStickerProps) {
  const interactive = Boolean(onClick) && Boolean(team)

  if (!team) {
    return (
      <div className={[styles.sticker, styles.empty, styles[size]].join(' ')}>
        {emptyLabel}
      </div>
    )
  }

  const classes = [
    styles.sticker,
    styles[size],
    interactive && styles.button,
    picked && styles.picked,
    eliminated && styles.eliminated,
  ]
    .filter(Boolean)
    .join(' ')

  const content = (
    <>
      <Flag team={team} size={size === 'sm' ? 18 : 22} />
      <span className={styles.name}>{team.name}</span>
      <span className={styles.trailing}>
        {meta && <span className={styles.meta}>{meta}</span>}
        {trailing ?? (picked && <span className={styles.check}>✓</span>)}
      </span>
    </>
  )

  if (interactive) {
    return (
      <button type="button" className={classes} onClick={onClick} aria-pressed={picked}>
        {content}
      </button>
    )
  }
  return <div className={classes}>{content}</div>
}
