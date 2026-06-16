import { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toPng } from 'html-to-image'
import { Screen } from '../components/layout/Screen'
import { Button, Chip } from '../components/ui'
import { BracketVisual } from '../components/bracket/BracketVisual'
import { ThemeFrame } from '../components/theme'
import { useBracketStore } from '../store/bracketStore'
import { getChampion, knockoutReady, resolveKnockout } from '../data/bracketLogic'
import type { BracketPicks } from '../data/types'
import { buildShareUrl, decodePicks } from '../store/share'
import styles from './Summary.module.css'

interface SummaryProps {
  shared?: boolean
}

export function Summary({ shared }: SummaryProps) {
  const navigate = useNavigate()
  const ownPicks = useBracketStore((s) => s.picks)

  const sharedPicks = useMemo<BracketPicks | null>(() => {
    if (!shared) return null
    const hash = window.location.hash.slice(1)
    return hash ? decodePicks(hash) : null
  }, [shared])

  const picks = shared ? sharedPicks : ownPicks
  const cardRef = useRef<HTMLDivElement>(null)
  const [copied, setCopied] = useState(false)

  const resolved = useMemo(() => {
    if (!picks) return null
    return resolveKnockout(picks)
  }, [picks])

  const champion = resolved ? getChampion(picks!) : null
  const bracketReady = picks ? knockoutReady(picks) : false

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

  if (!bracketReady || !resolved) {
    return (
      <Screen title="Your Bracket" back="/">
        <div className={styles.gate}>
          <div style={{ fontSize: 56 }}>🧩</div>
          <h2>Bracket not finished yet</h2>
          <p style={{ color: 'var(--wc-color-ink-soft)' }}>
            Pick all the way through to a champion to unlock your shareable bracket.
          </p>
          <Button variant="primary" size="lg" onClick={() => navigate('/bracket')}>
            Keep Picking
          </Button>
        </div>
      </Screen>
    )
  }

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(buildShareUrl(picks!))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* clipboard blocked */ }
  }

  const onDownload = async () => {
    if (!cardRef.current) return
    try {
      const url = await toPng(cardRef.current, { pixelRatio: 2, cacheBust: true })
      const a = document.createElement('a')
      a.href = url
      a.download = champion
        ? `world-cup-2026-bracket.png`
        : 'world-cup-2026-bracket.png'
      a.click()
    } catch { /* export failed */ }
  }

  return (
    <Screen title={shared ? 'Their Bracket' : 'Your Bracket'} back="/" wide>
      <div className={styles.wrap}>
        {shared && (
          <div style={{ textAlign: 'center', marginBottom: 'var(--wc-space-3)' }}>
            <Chip tone="gold">You're viewing a shared bracket</Chip>
          </div>
        )}

        {/* The exportable bracket visual */}
        <div ref={cardRef}>
          <ThemeFrame inline>
            <BracketVisual resolved={resolved} />
          </ThemeFrame>
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          {!shared ? (
            <>
              <Button variant="primary" size="lg" block onClick={onCopy}>
                {copied ? '✓ Link copied!' : '🔗 Copy share link'}
              </Button>
              <Button variant="gold" block onClick={onDownload}>
                ⬇ Download bracket image
              </Button>
              <Button variant="ghost" block onClick={() => navigate('/bracket')}>
                Edit picks
              </Button>
            </>
          ) : (
            <Button variant="primary" size="lg" block onClick={() => navigate('/')}>
              Make My Own Bracket
            </Button>
          )}
        </div>

        <div style={{ height: 24 }} />
      </div>
    </Screen>
  )
}
