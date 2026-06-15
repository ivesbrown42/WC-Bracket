import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Screen } from '../components/layout/Screen'
import { Button, Chip, Confetti, Flag } from '../components/ui'
import { MatchCard } from '../components/bracket/MatchCard'
import { useBracketStore } from '../store/bracketStore'
import { knockoutMatches, getTeam } from '../data/worldCup2026'
import { getChampion, knockoutReady, resolveKnockout } from '../data/bracketLogic'
import type { RoundId } from '../data/types'
import { spring } from '../design/tokens'
import styles from './Bracket.module.css'

const ROUNDS: { id: RoundId; label: string; short: string }[] = [
  { id: 'R32', label: 'Round of 32', short: 'R32' },
  { id: 'R16', label: 'Round of 16', short: 'R16' },
  { id: 'QF', label: 'Quarterfinals', short: 'QF' },
  { id: 'SF', label: 'Semifinals', short: 'SF' },
  { id: 'F', label: 'The Final', short: 'Final' },
]

export function Bracket() {
  const navigate = useNavigate()
  const picks = useBracketStore((s) => s.picks)
  const pickKnockout = useBracketStore((s) => s.pickKnockout)

  const ready = knockoutReady(picks)
  const resolved = useMemo(() => resolveKnockout(picks), [picks])
  const champion = getTeam(getChampion(picks))

  // Default to the earliest round that still has an undecided match.
  const initialRound = useMemo<RoundId>(() => {
    for (const r of ROUNDS) {
      const some = knockoutMatches.some(
        (m) => m.round === r.id && !resolved.get(m.id)?.winnerTeamId,
      )
      if (some) return r.id
    }
    return 'F'
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const [round, setRound] = useState<RoundId>(initialRound)

  // Fire confetti the moment a champion is first crowned.
  const [party, setParty] = useState(false)
  const prevChamp = useRef<string | null>(getChampion(picks))
  useEffect(() => {
    const champ = getChampion(picks)
    if (champ && champ !== prevChamp.current) {
      setParty(true)
      setRound('F')
      const t = setTimeout(() => setParty(false), 3500)
      return () => clearTimeout(t)
    }
    prevChamp.current = champ
  }, [picks])

  if (!ready) {
    return (
      <Screen title="Knockout" back="/groups">
        <div className={styles.gate}>
          <div style={{ fontSize: 56 }}>🔒</div>
          <h2 className={styles.roundTitle}>Finish the group stage first</h2>
          <p style={{ color: 'var(--wc-color-ink-soft)' }}>
            Rank all 12 groups and pick your 8 best third-placed teams to unlock
            the knockout bracket.
          </p>
          <Button variant="primary" size="lg" onClick={() => navigate('/groups')}>
            Back to Groups
          </Button>
        </div>
      </Screen>
    )
  }

  const roundMatches = knockoutMatches.filter((m) => m.round === round)
  const isFinal = round === 'F'
  const tpMatch = resolved.get('TP-1')

  const decidedCount = (rid: RoundId) =>
    knockoutMatches.filter(
      (m) => m.round === rid && resolved.get(m.id)?.winnerTeamId,
    ).length
  const totalIn = (rid: RoundId) =>
    knockoutMatches.filter((m) => m.round === rid).length

  return (
    <Screen title="Knockout" back="/groups" wide>
      {party && <Confetti />}

      <div className={styles.tabs}>
        {ROUNDS.map((r) => {
          const done = decidedCount(r.id) === totalIn(r.id)
          return (
            <button
              key={r.id}
              className={[
                styles.tab,
                r.id === round && styles.tabCurrent,
                done && styles.tabDone,
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => setRound(r.id)}
            >
              {r.short}
            </button>
          )
        })}
      </div>

      {isFinal && champion && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={spring.pop}
        >
          <div className={`${styles.champBanner}`}>
            <p className={`wc-eyebrow ${styles.champEyebrow}`}>🏆 World Champions</p>
            <h2 className={styles.champName}>
              <Flag team={champion} size={32} /> {champion.name}
            </h2>
            <Button variant="gold" onClick={() => navigate('/summary')}>
              View & Share Bracket →
            </Button>
          </div>
        </motion.div>
      )}

      <div className={styles.roundHead}>
        <h2 className={styles.roundTitle}>{ROUNDS.find((r) => r.id === round)!.label}</h2>
        <span className={styles.roundSub}>
          {decidedCount(round)} / {totalIn(round)} picked · tap a team to advance it
        </span>
      </div>

      <motion.div
        key={round}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={spring.soft}
        className={[styles.matches, roundMatches.length === 1 && styles.matchesSingle]
          .filter(Boolean)
          .join(' ')}
      >
        {roundMatches.map((m, i) => {
          const rm = resolved.get(m.id)!
          return (
            <MatchCard
              key={m.id}
              match={rm}
              label={`${ROUNDS.find((r) => r.id === round)!.short} · ${i + 1}`}
              onPick={(side) => pickKnockout(m.id, side)}
            />
          )
        })}
      </motion.div>

      {isFinal && tpMatch && (
        <div className={styles.tpWrap}>
          <div className={styles.tpLabel}>
            <Chip>3rd-place playoff</Chip>
          </div>
          <div className={`${styles.matches} ${styles.matchesSingle}`}>
            <MatchCard
              match={tpMatch}
              label="3rd place"
              homePlaceholder="Loser SF1"
              awayPlaceholder="Loser SF2"
              onPick={(side) => pickKnockout('TP-1', side)}
            />
          </div>
        </div>
      )}

      <div style={{ height: 32 }} />
    </Screen>
  )
}
