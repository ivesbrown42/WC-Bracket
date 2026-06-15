import type { ReactNode } from 'react'
import styles from './Badge.module.css'

export interface BadgeProps {
  children: ReactNode
  tone?: 'ink' | 'red' | 'blue' | 'gold' | 'green'
  className?: string
}

/** Small circular badge — group letters, seeds, match numbers. */
export function Badge({ children, tone = 'ink', className }: BadgeProps) {
  const toneClass = tone === 'ink' ? '' : styles[tone]
  return (
    <span className={[styles.badge, toneClass, className].filter(Boolean).join(' ')}>
      {children}
    </span>
  )
}
