import type { ResolvedMatch } from '../../data/types'
import { knockoutMatches } from '../../data/worldCup2026'
import { MatchCard } from './MatchCard'
import styles from './BracketTree.module.css'

interface BracketTreeProps {
  resolved: Map<string, ResolvedMatch>
  onPick: (matchId: string, side: 'home' | 'away') => void
}

/**
 * Connector SVG drawn between two columns.
 * `vGroups` = number of V-shapes (2 for QF→SF, 1 for SF→F).
 * Uses preserveAspectRatio="none" so it stretches to any height while
 * vectorEffect="non-scaling-stroke" keeps the line width consistent.
 * Arms are at 25%/75% of each group (approximates match-card centers
 * when cards have uniform height and a small gap).
 */
function ConnectorSVG({ vGroups }: { vGroups: number }) {
  const viewH = vGroups * 100
  const color = 'var(--wc-color-ink-faint)'
  const sw = '1.5'
  return (
    <svg
      viewBox={`0 0 24 ${viewH}`}
      preserveAspectRatio="none"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}
    >
      {Array.from({ length: vGroups }, (_, i) => {
        const base = i * 100
        const topArm = base + 25
        const botArm = base + 75
        const exit = base + 50
        return (
          <g key={i}>
            {/* Top arm from match to vertical bar */}
            <line x1="0" y1={topArm} x2="12" y2={topArm} stroke={color} strokeWidth={sw} vectorEffect="non-scaling-stroke" />
            {/* Vertical bar */}
            <line x1="12" y1={topArm} x2="12" y2={botArm} stroke={color} strokeWidth={sw} vectorEffect="non-scaling-stroke" />
            {/* Bottom arm */}
            <line x1="0" y1={botArm} x2="12" y2={botArm} stroke={color} strokeWidth={sw} vectorEffect="non-scaling-stroke" />
            {/* Exit to next round */}
            <line x1="12" y1={exit} x2="24" y2={exit} stroke={color} strokeWidth={sw} vectorEffect="non-scaling-stroke" />
          </g>
        )
      })}
    </svg>
  )
}

export function BracketTree({ resolved, onPick }: BracketTreeProps) {
  const qfMatches = knockoutMatches.filter((m) => m.round === 'QF')
  const sfMatches = knockoutMatches.filter((m) => m.round === 'SF')
  const fMatch = knockoutMatches.find((m) => m.round === 'F')!

  return (
    <div className={styles.tree}>

      {/* Round labels */}
      <div className={styles.labels}>
        <span className={styles.roundLabel}>Quarter-finals</span>
        <div className={styles.connectorSpacer} />
        <span className={styles.roundLabel}>Semi-finals</span>
        <div className={styles.connectorSpacer} />
        <span className={styles.roundLabel}>Final</span>
      </div>

      {/* Match columns + connectors */}
      <div className={styles.columns}>

        {/* QF column */}
        <div className={styles.round}>
          {qfMatches.map((m, i) => {
            const rm = resolved.get(m.id)!
            return (
              <div key={m.id} className={styles.slot}>
                <MatchCard match={rm} label={`QF · ${i + 1}`} onPick={(side) => onPick(m.id, side)} />
              </div>
            )
          })}
        </div>

        {/* QF → SF connector */}
        <div className={styles.connector}>
          <ConnectorSVG vGroups={2} />
        </div>

        {/* SF column */}
        <div className={styles.round}>
          {sfMatches.map((m, i) => {
            const rm = resolved.get(m.id)!
            return (
              <div key={m.id} className={styles.sfSlot}>
                <MatchCard match={rm} label={`SF · ${i + 1}`} onPick={(side) => onPick(m.id, side)} />
              </div>
            )
          })}
        </div>

        {/* SF → Final connector */}
        <div className={styles.connector}>
          <ConnectorSVG vGroups={1} />
        </div>

        {/* Final column */}
        <div className={styles.finalCol}>
          {(() => {
            const rm = resolved.get(fMatch.id)!
            return (
              <div className={styles.finalSlot}>
                <MatchCard match={rm} label="Final" onPick={(side) => onPick(fMatch.id, side)} />
              </div>
            )
          })()}
        </div>

      </div>
    </div>
  )
}
