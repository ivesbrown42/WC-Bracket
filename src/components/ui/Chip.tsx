import type { ReactNode } from 'react'
import styles from './Chip.module.css'

export interface ChipProps {
  children: ReactNode
  tone?: 'default' | 'solid' | 'gold' | 'green'
  className?: string
}

/** Pill label — round names, statuses, stage tags. */
export function Chip({ children, tone = 'default', className }: ChipProps) {
  const toneClass = tone === 'default' ? '' : styles[tone]
  return (
    <span className={[styles.chip, toneClass, className].filter(Boolean).join(' ')}>
      {children}
    </span>
  )
}
