import { useState } from 'react'
import type { Team } from '../../data/types'

export interface FlagProps {
  team?: Team
  /** Pixel height of the flag. Width follows 3:2. */
  size?: number
  className?: string
}

/**
 * Country flag. Uses flagcdn.com SVGs (crisp at any size), falling back to the
 * emoji flag if the image fails or the team is an unconfirmed placeholder.
 */
export function Flag({ team, size = 22, className }: FlagProps) {
  const [errored, setErrored] = useState(false)

  const frame: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: Math.round(size * 1.5),
    height: size,
    borderRadius: 4,
    overflow: 'hidden',
    border: '1.5px solid rgba(43, 34, 24, 0.25)',
    background: 'var(--wc-color-paper-sunk)',
    fontSize: size * 0.8,
    lineHeight: 1,
    flexShrink: 0,
  }

  if (!team || team.placeholder || !team.code || errored) {
    return (
      <span style={frame} className={className} aria-hidden>
        {team?.flag ?? '🏳️'}
      </span>
    )
  }

  return (
    <span style={frame} className={className}>
      <img
        src={`https://flagcdn.com/${team.code}.svg`}
        alt=""
        width={Math.round(size * 1.5)}
        height={size}
        style={{ objectFit: 'cover', width: '100%', height: '100%' }}
        loading="lazy"
        onError={() => setErrored(true)}
      />
    </span>
  )
}
