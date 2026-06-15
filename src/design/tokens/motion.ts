/** Motion tokens — durations and easings for playful sticker animations. */
export const motion = {
  duration: {
    fast: '120ms',
    base: '220ms',
    slow: '420ms',
  },
  ease: {
    standard: 'cubic-bezier(0.2, 0, 0, 1)',
    // Overshoot — sticker "pops" into place
    bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
} as const

/** Framer Motion spring presets (consumed directly by components). */
export const spring = {
  pop: { type: 'spring', stiffness: 520, damping: 24, mass: 0.8 },
  soft: { type: 'spring', stiffness: 260, damping: 26 },
} as const
