/**
 * Shadows. The "sticker" shadow gives the embossed, peel-off-the-page look:
 * a soft drop plus a subtle inner highlight handled in component CSS.
 */
export const shadow = {
  none: 'none',
  sm: '0 1px 2px rgba(43, 34, 24, 0.12)',
  // Embossed sticker: lifts off the album page
  sticker: '0 4px 0 rgba(43, 34, 24, 0.18), 0 8px 16px rgba(43, 34, 24, 0.16)',
  // Pressed-in slot
  inset: 'inset 0 2px 6px rgba(43, 34, 24, 0.22)',
  // Glowing foil for the champion
  foil: '0 0 0 2px rgba(241, 210, 122, 0.9), 0 6px 20px rgba(201, 162, 39, 0.45)',
  lifted: '0 10px 0 rgba(43, 34, 24, 0.16), 0 16px 28px rgba(43, 34, 24, 0.22)',
} as const
