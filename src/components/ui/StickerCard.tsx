import { forwardRef } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import styles from './StickerCard.module.css'

export interface StickerCardProps {
  children: ReactNode
  /** Gold foil border + glow, for special stickers (e.g. champion). */
  foil?: boolean
  /** Adds a peeled dog-ear corner. */
  peel?: boolean
  /** Hover/press affordances for clickable cards. */
  interactive?: boolean
  className?: string
  style?: CSSProperties
  onClick?: () => void
}

/**
 * Base surface for the whole app: a chunky paper sticker that sits on the
 * album page with an embossed shadow. Everything visual is built on this.
 */
export const StickerCard = forwardRef<HTMLDivElement, StickerCardProps>(
  function StickerCard(
    { children, foil, peel, interactive, className, style, onClick },
    ref,
  ) {
    const classes = [
      styles.card,
      foil && styles.foil,
      peel && styles.peel,
      interactive && styles.interactive,
      className,
    ]
      .filter(Boolean)
      .join(' ')

    return (
      <div
        ref={ref}
        className={classes}
        style={style}
        onClick={onClick}
        role={interactive ? 'button' : undefined}
        tabIndex={interactive ? 0 : undefined}
        onKeyDown={
          interactive
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onClick?.()
                }
              }
            : undefined
        }
      >
        {children}
      </div>
    )
  },
)
