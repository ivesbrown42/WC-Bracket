/**
 * Typography tokens.
 * Display: "Anton" — tall condensed poster face for sticker-album headers.
 * Body: "DM Sans" — clean, friendly, highly legible at small sizes.
 * Fonts are loaded in index.html.
 */
export const typography = {
  family: {
    display: "'Anton', 'Arial Narrow', sans-serif",
    body: "'DM Sans', system-ui, -apple-system, sans-serif",
  },

  // Modular type scale (rem)
  size: {
    xs: '0.75rem', // 12
    sm: '0.875rem', // 14
    base: '1rem', // 16
    lg: '1.125rem', // 18
    xl: '1.375rem', // 22
    '2xl': '1.75rem', // 28
    '3xl': '2.25rem', // 36
    '4xl': '3rem', // 48
    '5xl': '4rem', // 64
  },

  weight: {
    regular: '400',
    medium: '500',
    bold: '700',
  },

  leading: {
    tight: '1.05',
    snug: '1.25',
    normal: '1.5',
  },

  tracking: {
    tight: '-0.01em',
    normal: '0',
    wide: '0.04em',
    wider: '0.12em', // for ALL-CAPS labels
  },
} as const
