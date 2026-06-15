import { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toPng } from 'html-to-image'
import { Screen } from '../components/layout/Screen'
import { Button, Chip, StickerCard } from '../components/ui'
import { useBracketStore } from '../store/bracketStore'
import { knockoutMatches, getTeam } from '../data/worldCup2026'
import { getChampion, resolveKnockout } from '../data/bracketLogic'
import type { BracketPicks, RoundId } from '../data/types'
import { buildShareUrl, decodePicks } from '../store/share'
import styles from './Summary.module.css'

const ROUND_LABEL: Record<RoundId, string> = {
  R32: 'R32',
  R16: 'R16',
  QF: 'QF',
  SF: 'SF',
  F: 'Final',
  TP: '3rd',
}

interface SummaryProps {
  /** Reading a friend's bracket from the URL hash (read-only). */
  shared?: boolean
}

export function Summary({ shared }: SummaryProps) {
  const navigate = useNavigate()
  const ownPicks = useBracketStore((s) => s.picks)

  // In shared mode, decode the bracket from the URL hash; else use the store.
  const sharedPicks = useMemo<BracketPicks | null>(() => {
    if (!shared) return null
    const hash = window.location.hash.slice(1)
    return hash ? decodePicks(hash) : null
  }, [shared])

  const picks = shared ? sharedPicks : ownPicks
  const cardRef = useRef<HTMLDivElement>(null)
  const [copied, setCopied] = useState(false)

  const data = useMemo(() => {
    if (!picks) return null
    const championId = getChampion(picks)
    if (!championId) return null
    const resolved = resolveKnockout(picks)
    const final = resolved.get('F-1')!
    const tp = resolved.get('TP-1')
    const runnerUpId =
      final.winnerTeamId === final.homeTeamId ? final.awayTeamId : final.homeTeamId

    // Champion's road: opponent beaten in each round.
    const order: RoundId[] = ['R32', 'R16', 'QF', 'SF', 'F']
    const path = order.flatMap((r) => {
      const m = knockoutMatches.find(
        (km) => km.round === r && resolved.get(km.id)?.winnerTeamId === championId,
      )
      if (!m) return []
      const rm = resolved.get(m.id)!
      const oppId = rm.homeTeamId === championId ? rm.awayTeamId : rm.homeTeamId
      return [{ round: r, opponent: getTeam(oppId) }]
    })

    return {
      champion: getTeam(championId)!,
      runnerUp: getTeam(runnerUpId),
      third: getTeam(tp?.winnerTeamId),
      path,
    }
  }, [picks])

  // ---- Empty / unfinished states ----
  if (shared && !picks) {
    return (
      <Screen title="Shared Bracket" back="/">
        <div className={styles.gate}>
          <div style={{ fontSize: 56 }}>🤔</div>
          <h2>That link looks broken</h2>
          <p style={{ color: 'var(--wc-color-ink-soft)' }}>
            We couldn't read this bracket. Why not make your own?
          </p>
          <Button variant="primary" size="lg" onClick={() => navigate('/')}>
            Make My Bracket
          </Button>
        </div>
      </Screen>
    )
  }

  if (!data) {
    return (
      <Screen title="Your Bracket" back="/">
        <div className={styles.gate}>
          <div style={{ fontSize: 56 }}>🧩</div>
          <h2>Bracket not finished yet</h2>
          <p style={{ color: 'var(--wc-color-ink-soft)' }}>
            Pick all the way through to a champion to unlock your shareable
            bracket card.
          </p>
          <Button variant="primary" size="lg" onClick={() => navigate('/bracket')}>
            Keep Picking
          </Button>
        </div>
      </Screen>
    )
  }

  const { champion, runnerUp, third, path } = data

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(buildShareUrl(picks!))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard blocked — ignore */
    }
  }

  const onDownload = async () => {
    if (!cardRef.current) return
    try {
      const url = await toPng(cardRef.current, { pixelRatio: 2, cacheBust: true })
      const a = document.createElement('a')
      a.href = url
      a.download = `sticker-cup-26-${champion.name.toLowerCase()}.png`
      a.click()
    } catch {
      /* export failed — ignore */
    }
  }

  return (
    <Screen title={shared ? 'Their Bracket' : 'Your Bracket'} back="/">
      <div className={styles.wrap}>
        {/* The exportable card */}
        <StickerCard ref={cardRef} foil className={styles.card}>
          <p className={`wc-eyebrow ${styles.brand}`}>★ Sticker Cup '26 ★</p>
          <div className={styles.trophy}>🏆</div>
          <p className={`wc-eyebrow ${styles.champLabel}`}>World Champions</p>
          <div className={styles.champFlag}>{champion.flag}</div>
          <h2 className={styles.champName}>{champion.name}</h2>

          <div className={styles.podium}>
            <div className={styles.podSlot}>
              <span className={styles.podRank} style={{ color: 'var(--wc-color-foil-deep)' }}>
                2nd
              </span>
              <span className={styles.podFlag}>{runnerUp?.flag ?? '—'}</span>
              <span className={styles.podName}>{runnerUp?.name ?? 'TBD'}</span>
            </div>
            <div className={styles.podSlot}>
              <span className={styles.podRank} style={{ color: 'var(--wc-color-accent-coral)' }}>
                3rd
              </span>
              <span className={styles.podFlag}>{third?.flag ?? '—'}</span>
              <span className={styles.podName}>{third?.name ?? 'TBD'}</span>
            </div>
          </div>
        </StickerCard>

        {/* Road to glory */}
        <span className={`wc-eyebrow ${styles.sectionLabel}`}>
          {champion.name}'s road to glory
        </span>
        <div className={styles.path}>
          {path.map((p) => (
            <div key={p.round} className={styles.pathRow}>
              <span className={styles.pathRound}>{ROUND_LABEL[p.round]}</span>
              <span className={styles.pathBeat}>
                beat <b>{p.opponent?.name ?? 'TBD'}</b> {p.opponent?.flag}
              </span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          {!shared && (
            <>
              <Button variant="primary" size="lg" block onClick={onCopy}>
                {copied ? '✓ Link copied!' : '🔗 Copy share link'}
              </Button>
              <Button variant="gold" block onClick={onDownload}>
                ⬇ Download image
              </Button>
              <Button variant="ghost" block onClick={() => navigate('/bracket')}>
                Edit picks
              </Button>
            </>
          )}
          {shared && (
            <>
              <Chip tone="gold">You're viewing a shared bracket</Chip>
              <Button variant="primary" size="lg" block onClick={() => navigate('/')}>
                Make My Own Bracket
              </Button>
            </>
          )}
        </div>

        <div style={{ height: 24 }} />
      </div>
    </Screen>
  )
}
