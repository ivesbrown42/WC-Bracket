import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Screen } from '../components/layout/Screen'
import { Button, Chip, ProgressBar, TeamSticker } from '../components/ui'
import { GroupCard } from '../components/bracket/GroupCard'
import { useBracketStore } from '../store/bracketStore'
import { groups, groupIds, getTeam } from '../data/worldCup2026'
import {
  THIRDS_REQUIRED,
  allGroupsComplete,
  groupRank,
  groupsCompletedCount,
  isGroupComplete,
  thirdsComplete,
} from '../data/bracketLogic'
import { spring } from '../design/tokens'
import styles from './Groups.module.css'

export function Groups() {
  const navigate = useNavigate()
  const picks = useBracketStore((s) => s.picks)
  const cycleGroupPick = useBracketStore((s) => s.cycleGroupPick)
  const clearGroup = useBracketStore((s) => s.clearGroup)
  const toggleThird = useBracketStore((s) => s.toggleThird)

  const [step, setStep] = useState<'groups' | 'thirds'>('groups')
  const [index, setIndex] = useState(0)
  const [dir, setDir] = useState(1)

  const groupsDone = groupsCompletedCount(picks)
  const allDone = allGroupsComplete(picks)

  const go = (next: number) => {
    if (next < 0 || next > groupIds.length - 1) return
    setDir(next > index ? 1 : -1)
    setIndex(next)
  }

  // ---- Thirds step ----
  if (step === 'thirds') {
    const selected = picks.qualifiedThirds.length
    const ready = thirdsComplete(picks)
    return (
      <Screen title="Best Thirds" back={() => setStep('groups')}>
        <div className={styles.thirdsHead}>
          <p className="wc-eyebrow">Final qualifying spots</p>
          <h2 className={styles.thirdsTitle}>Pick the 8 best 3rd-place teams</h2>
          <p className={styles.thirdsSub}>
            12 teams finish 3rd in their group — only the 8 best advance to the
            Round of 32. You choose which.
          </p>
          <div className={styles.counter}>
            <Chip tone={ready ? 'green' : 'gold'}>
              {selected} / {THIRDS_REQUIRED} selected
            </Chip>
          </div>
        </div>

        <div className={styles.thirdsList}>
          {groupIds.map((g) => {
            const thirdId = groupRank(picks, g, 2)
            const team = getTeam(thirdId)
            const picked = picks.qualifiedThirds.includes(g)
            const atLimit = selected >= THIRDS_REQUIRED && !picked
            return (
              <TeamSticker
                key={g}
                team={team}
                picked={picked}
                eliminated={atLimit}
                meta={`3rd · Grp ${g}`}
                onClick={() => toggleThird(g)}
              />
            )
          })}
        </div>

        <div className={styles.stickyCta}>
          <Button
            variant="gold"
            size="lg"
            block
            disabled={!ready}
            onClick={() => navigate('/bracket')}
          >
            {ready ? 'Build My Bracket →' : `Pick ${THIRDS_REQUIRED - selected} more`}
          </Button>
        </div>
      </Screen>
    )
  }

  // ---- Groups step ----
  const current = groups[index]
  const currentRanks = picks.groupRanks[current.id] ?? []

  return (
    <Screen title="Group Stage" back="/">
      <ProgressBar total={12} completed={groupsDone} label="Groups picked" />

      <div className={styles.pills}>
        {groups.map((g, i) => (
          <button
            key={g.id}
            className={[
              styles.pill,
              i === index && styles.pillCurrent,
              isGroupComplete(picks, g.id) && styles.pillDone,
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={() => go(i)}
            aria-label={`Group ${g.id}`}
          >
            {g.id}
          </button>
        ))}
      </div>

      <div className={styles.stage}>
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={current.id}
            custom={dir}
            initial={{ opacity: 0, x: dir * 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dir * -60 }}
            transition={spring.soft}
          >
            <GroupCard
              groupId={current.id}
              teamIds={current.teamIds}
              ranks={currentRanks}
              onPickTeam={(id) => cycleGroupPick(current.id, id)}
              onClear={() => clearGroup(current.id)}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className={styles.nav}>
        <Button
          variant="secondary"
          onClick={() => go(index - 1)}
          disabled={index === 0}
        >
          ‹ Prev
        </Button>
        <span className={styles.navCount}>{index + 1} / 12</span>
        <Button
          variant="secondary"
          onClick={() => go(index + 1)}
          disabled={index === groupIds.length - 1}
        >
          Next ›
        </Button>
      </div>

      <div className={styles.cta}>
        {allDone ? (
          <Button variant="gold" size="lg" block onClick={() => setStep('thirds')}>
            Choose 8 Best Thirds →
          </Button>
        ) : (
          <Button
            variant="primary"
            size="lg"
            block
            onClick={() => {
              // Jump to the next unranked group to keep momentum.
              const nextOpen = groups.findIndex((g) => !isGroupComplete(picks, g.id))
              if (nextOpen >= 0) go(nextOpen)
            }}
          >
            {`${12 - groupsDone} groups left`}
          </Button>
        )}
      </div>
    </Screen>
  )
}
