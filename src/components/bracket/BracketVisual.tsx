import type { ResolvedMatch } from '../../data/types'
import { getTeam } from '../../data/worldCup2026'
import styles from './BracketVisual.module.css'

interface BracketVisualProps {
  resolved: Map<string, ResolvedMatch>
}

// ─── Flag circle ────────────────────────────────────────────────────────────

function FlagCircle({
  teamId,
  dim,
  champion,
}: {
  teamId: string | null
  dim?: boolean
  champion?: boolean
}) {
  const team = teamId ? getTeam(teamId) : undefined
  return (
    <div
      className={[
        styles.flag,
        dim && styles.flagDim,
        champion && styles.flagChampion,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {team ? (
        <span className={styles.flagEmoji}>{team.flag}</span>
      ) : (
        <span className={styles.flagTbd}>?</span>
      )}
    </div>
  )
}

// ─── SVG bracket connectors ──────────────────────────────────────────────────

/** Left-side connector: arms on the left, exit goes right. */
function LeftConnector({ pairs }: { pairs: number }) {
  const viewH = pairs * 100
  const c = 'var(--vc-line)'
  return (
    <svg
      viewBox={`0 0 20 ${viewH}`}
      preserveAspectRatio="none"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
    >
      {Array.from({ length: pairs }, (_, i) => {
        const b = i * 100
        return (
          <g key={i}>
            <line x1="0" y1={b + 25} x2="10" y2={b + 25} stroke={c} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
            <line x1="10" y1={b + 25} x2="10" y2={b + 75} stroke={c} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
            <line x1="0" y1={b + 75} x2="10" y2={b + 75} stroke={c} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
            <line x1="10" y1={b + 50} x2="20" y2={b + 50} stroke={c} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
          </g>
        )
      })}
    </svg>
  )
}

/** Right-side connector: arms on the right, exit goes left. */
function RightConnector({ pairs }: { pairs: number }) {
  const viewH = pairs * 100
  const c = 'var(--vc-line)'
  return (
    <svg
      viewBox={`0 0 20 ${viewH}`}
      preserveAspectRatio="none"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
    >
      {Array.from({ length: pairs }, (_, i) => {
        const b = i * 100
        return (
          <g key={i}>
            <line x1="20" y1={b + 25} x2="10" y2={b + 25} stroke={c} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
            <line x1="10" y1={b + 25} x2="10" y2={b + 75} stroke={c} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
            <line x1="20" y1={b + 75} x2="10" y2={b + 75} stroke={c} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
            <line x1="10" y1={b + 50} x2="0"  y2={b + 50} stroke={c} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
          </g>
        )
      })}
    </svg>
  )
}

function Conn({ children }: { children: React.ReactNode }) {
  return <div className={styles.connSlot}>{children}</div>
}

// ─── Column helpers ──────────────────────────────────────────────────────────

/** Four-team QF column: two match-pairs. */
function QFColumn({
  matches,
}: {
  matches: [ResolvedMatch | undefined, ResolvedMatch | undefined]
}) {
  const [a, b] = matches
  return (
    <div className={styles.column}>
      <div className={styles.matchPair}>
        <FlagCircle teamId={a?.homeTeamId ?? null} dim={!!a?.winnerTeamId && a.winnerTeamId !== a.homeTeamId} />
        <FlagCircle teamId={a?.awayTeamId ?? null} dim={!!a?.winnerTeamId && a.winnerTeamId !== a.awayTeamId} />
      </div>
      <div className={styles.matchPair}>
        <FlagCircle teamId={b?.homeTeamId ?? null} dim={!!b?.winnerTeamId && b.winnerTeamId !== b.homeTeamId} />
        <FlagCircle teamId={b?.awayTeamId ?? null} dim={!!b?.winnerTeamId && b.winnerTeamId !== b.awayTeamId} />
      </div>
    </div>
  )
}

/** Two-team SF column. */
function SFColumn({ match }: { match: ResolvedMatch | undefined }) {
  return (
    <div className={styles.column}>
      <div className={styles.sfSlot}>
        <FlagCircle teamId={match?.homeTeamId ?? null} dim={!!match?.winnerTeamId && match.winnerTeamId !== match.homeTeamId} />
      </div>
      <div className={styles.sfSlot}>
        <FlagCircle teamId={match?.awayTeamId ?? null} dim={!!match?.winnerTeamId && match.winnerTeamId !== match.awayTeamId} />
      </div>
    </div>
  )
}

/** Single finalist flag (innermost column before center). */
function FinalistColumn({ teamId, isChampion }: { teamId: string | null; isChampion: boolean }) {
  return (
    <div className={styles.column}>
      <div className={styles.finalistSlot}>
        <FlagCircle teamId={teamId} champion={isChampion} />
      </div>
    </div>
  )
}

// ─── Main component ──────────────────────────────────────────────────────────

export function BracketVisual({ resolved }: BracketVisualProps) {
  const rm = (id: string) => resolved.get(id)

  const qf1 = rm('QF-1'), qf2 = rm('QF-2')
  const qf3 = rm('QF-3'), qf4 = rm('QF-4')
  const sf1 = rm('SF-1'), sf2 = rm('SF-2')
  const final = rm('F-1')

  const champion = final?.winnerTeamId ?? null
  const finalHome = final?.homeTeamId ?? null   // SF-1 winner
  const finalAway = final?.awayTeamId ?? null   // SF-2 winner

  const champTeam = champion ? getTeam(champion) : undefined

  return (
    <div className={styles.card}>
      <p className={styles.title}>World Cup 2026 — Your Bracket</p>

      <div className={styles.bracket}>

        {/* ── LEFT HALF (QF-1, QF-2 → SF-1 → Final-home) ── */}
        <div className={styles.half}>
          <QFColumn matches={[qf1, qf2]} />
          <Conn><LeftConnector pairs={2} /></Conn>
          <SFColumn match={sf1} />
          <Conn><LeftConnector pairs={1} /></Conn>
          <FinalistColumn teamId={finalHome} isChampion={champion === finalHome} />
        </div>

        {/* ── CENTER ── */}
        <div className={styles.center}>
          {champTeam ? (
            <>
              <div className={styles.trophy}>🏆</div>
              <span className={styles.champFlag}>{champTeam.flag}</span>
              <span className={styles.champName}>{champTeam.name}</span>
            </>
          ) : (
            <span className={styles.finalLabel}>FINAL</span>
          )}
        </div>

        {/* ── RIGHT HALF (Final-away → SF-2 → QF-3, QF-4) ── */}
        <div className={styles.half}>
          <FinalistColumn teamId={finalAway} isChampion={champion === finalAway} />
          <Conn><RightConnector pairs={1} /></Conn>
          <SFColumn match={sf2} />
          <Conn><RightConnector pairs={2} /></Conn>
          <QFColumn matches={[qf3, qf4]} />
        </div>

      </div>
    </div>
  )
}
