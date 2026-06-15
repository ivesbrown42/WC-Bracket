import { useMemo } from 'react'
import { motion } from 'framer-motion'

export interface ConfettiProps {
  /** Number of pieces. */
  count?: number
  /** Set false to stop rendering (e.g. after the burst). */
  active?: boolean
}

const COLORS = [
  'var(--wc-color-accent-red)',
  'var(--wc-color-accent-blue)',
  'var(--wc-color-accent-mustard)',
  'var(--wc-color-accent-green)',
  'var(--wc-color-foil-gold)',
  'var(--wc-color-foil-light)',
]

/**
 * A celebratory confetti burst rendered with Framer Motion.
 * Fixed full-screen overlay; pointer-events disabled so it never blocks taps.
 */
export function Confetti({ count = 80, active = true }: ConfettiProps) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.25,
        duration: 1.6 + Math.random() * 1.4,
        drift: (Math.random() - 0.5) * 220,
        rotate: Math.random() * 720 - 360,
        size: 7 + Math.random() * 9,
        color: COLORS[i % COLORS.length],
        round: Math.random() > 0.6,
      })),
    [count],
  )

  if (!active) return null

  return (
    <div
      aria-hidden
      style={{
        position: 'fixed',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 50,
      }}
    >
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          initial={{ y: '-10vh', x: 0, opacity: 1, rotate: 0 }}
          animate={{ y: '110vh', x: p.drift, rotate: p.rotate, opacity: [1, 1, 0.9, 0] }}
          transition={{ duration: p.duration, delay: p.delay, ease: 'easeIn' }}
          style={{
            position: 'absolute',
            left: `${p.left}%`,
            top: 0,
            width: p.size,
            height: p.round ? p.size : p.size * 0.5,
            background: p.color,
            borderRadius: p.round ? '50%' : 2,
          }}
        />
      ))}
    </div>
  )
}
