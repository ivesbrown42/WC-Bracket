/**
 * Color tokens — retro sticker-album / Panini palette.
 * Warm aged paper, printed ink, slightly-faded primaries, and gold foil.
 * Single source of truth: edit here, everything (and later Figma) follows.
 */
export const color = {
  // Aged paper surfaces (the album page)
  paper: {
    base: '#F1E4C3', // main page tone
    raised: '#FBF4DF', // a sticker / card sitting on the page
    sunk: '#E4D2A8', // empty sticker slot
    edge: '#D8C295', // worn page edge
  },

  // Printed ink for text and linework
  ink: {
    base: '#2B2218',
    soft: '#6A5C46',
    faint: '#9D8C6E',
    inverse: '#FBF4DF',
  },

  // Faded primaries — bold but vintage, never neon
  accent: {
    red: '#C5443A', // vermilion
    blue: '#2E6F8E', // teal-blue
    mustard: '#E2A52C', // warm yellow
    coral: '#E07A5F',
    green: '#4E8B5B', // faded pitch grass
  },

  // Gold foil — special stickers, champion, shiny borders
  foil: {
    gold: '#C9A227',
    light: '#F1D27A',
    deep: '#9C7B1E',
  },

  // Semantic states
  state: {
    pick: '#4E8B5B', // a chosen team
    pickInk: '#1F3D27',
    eliminated: '#A8987B', // dimmed out
    danger: '#C5443A',
  },
} as const
