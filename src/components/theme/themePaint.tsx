/**
 * Render a theme's flag colors as SVG pattern fills (stripes, hoops, etc.).
 * Reused by the page border frame, studio preview, and any theme swatch.
 */
import { useId } from 'react'
import type { TeamTheme } from '../../data/theme'
import { themeColors } from '../../data/theme'

const INK = '#2B2218'

interface Rect {
  x: number
  y: number
  w: number
  h: number
}

/** Render colored pattern fills for a theme within a bounding box. */
export function PatternFills({
  theme,
  x,
  y,
  w,
  h,
}: {
  theme: TeamTheme
  x: number
  y: number
  w: number
  h: number
} & Rect) {
  const { colors } = themeColors(theme)
  const { pattern } = theme
  const primary = colors[0]
  const secondary = colors[1] ?? colors[0]

  const els: React.ReactNode[] = [
    <rect key="base" x={x} y={y} width={w} height={h} fill={primary} />,
  ]

  switch (pattern) {
    case 'stripes': {
      const bands = 7
      const bw = w / bands
      for (let i = 1; i < bands; i += 2) {
        els.push(<rect key={`s${i}`} x={x + i * bw} y={y} width={bw} height={h} fill={secondary} />)
      }
      break
    }
    case 'hoops': {
      const bands = 6
      const bh = h / bands
      for (let i = 1; i < bands; i += 2) {
        els.push(<rect key={`h${i}`} x={x} y={y + i * bh} width={w} height={bh} fill={secondary} />)
      }
      break
    }
    case 'halves': {
      els.push(<rect key="half" x={x + w / 2} y={y} width={w / 2} height={h} fill={secondary} />)
      break
    }
    case 'sash': {
      const t = w * 0.34
      els.push(
        <polygon
          key="sash"
          points={`${x},${y + h} ${x + t},${y + h} ${x + w},${y} ${x + w - t},${y}`}
          fill={secondary}
        />,
      )
      break
    }
    case 'chevron': {
      const midX = x + w / 2
      els.push(
        <polygon
          key="chev"
          points={`${x},${y + h * 0.28} ${midX},${y + h * 0.58} ${x + w},${y + h * 0.28} ${x + w},${y + h * 0.5} ${midX},${y + h * 0.8} ${x},${y + h * 0.5}`}
          fill={secondary}
        />,
      )
      break
    }
    case 'pinstripe': {
      const lines = 9
      const step = w / lines
      for (let i = 1; i < lines; i++) {
        els.push(
          <rect key={`p${i}`} x={x + i * step} y={y} width={Math.max(1, w * 0.012)} height={h} fill={secondary} />,
        )
      }
      break
    }
    case 'checkers': {
      const cols = 4
      const rows = 5
      const cw = w / cols
      const ch = h / rows
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if ((r + c) % 2 === 0) continue
          els.push(
            <rect key={`c${r}-${c}`} x={x + c * cw} y={y + r * ch} width={cw} height={ch} fill={secondary} />,
          )
        }
      }
      break
    }
    case 'solid':
    default:
      break
  }

  return <>{els}</>
}

/** A standalone rounded-rect swatch of a theme. */
export function ThemeSwatch({
  theme,
  size = 44,
  radius = 12,
}: {
  theme: TeamTheme
  size?: number
  radius?: number
}) {
  const clipId = useId()
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden>
      <defs>
        <clipPath id={clipId}>
          <rect x={4} y={4} width={92} height={92} rx={radius} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <PatternFills theme={theme} x={0} y={0} w={100} h={100} />
      </g>
      <rect x={4} y={4} width={92} height={92} rx={radius} fill="none" stroke={INK} strokeWidth={3} />
    </svg>
  )
}

export { INK as THEME_INK }
