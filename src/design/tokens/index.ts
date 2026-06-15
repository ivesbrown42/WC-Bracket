/**
 * Aggregated design tokens — the single source of truth for the whole app.
 *
 * `cssTokens` are flattened into :root custom properties at startup
 * (see ../buildCssVars.ts). `spring` presets are imported directly by
 * components that drive Framer Motion. This object is shaped to be
 * exportable to a W3C / Tokens-Studio format later, for Figma sync.
 */
import { color } from './color'
import { typography } from './typography'
import { space } from './space'
import { radius } from './radius'
import { shadow } from './shadow'
import { motion } from './motion'

export { color, typography, space, radius, shadow, motion }
export { spring } from './motion'

/** Tokens that become CSS variables. Keys map to `--wc-<path>` (kebab-cased). */
export const cssTokens = {
  color,
  font: typography.family,
  text: typography.size,
  weight: typography.weight,
  leading: typography.leading,
  tracking: typography.tracking,
  space,
  radius,
  shadow,
  dur: motion.duration,
  ease: motion.ease,
} as const
