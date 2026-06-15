import { cssTokens } from './tokens'

const camelToKebab = (s: string) =>
  s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()

/**
 * Recursively flatten a nested token object into `--wc-a-b-c: value` pairs.
 * e.g. { color: { ink: { base: '#000' } } } -> '--wc-color-ink-base': '#000'
 */
function flatten(
  obj: Record<string, unknown>,
  path: string[] = [],
  out: Record<string, string> = {},
): Record<string, string> {
  for (const [key, value] of Object.entries(obj)) {
    const next = [...path, camelToKebab(key)]
    if (value && typeof value === 'object') {
      flatten(value as Record<string, unknown>, next, out)
    } else {
      out[`--wc-${next.join('-')}`] = String(value)
    }
  }
  return out
}

export const cssVarMap = flatten(cssTokens as Record<string, unknown>)

/** Inject all design tokens as :root CSS custom properties. Call once at startup. */
export function injectCssVars(target: HTMLElement = document.documentElement) {
  for (const [name, value] of Object.entries(cssVarMap)) {
    target.style.setProperty(name, value)
  }
}
