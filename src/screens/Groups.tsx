import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Screen } from '../components/layout/Screen'
import { Button, Chip, TeamSticker } from '../components/ui'
import { GroupCard } from '../components/bracket/GroupCard'
import { useBracketStore } from '../store/bracketStore'
import { groups, groupIds, getTeam } from '../data/worldCup2026'
import {
  THIRDS_REQUIRED,
  allGroupsComplete,
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
  const toggleThird = useBracketStore((s) => s.toggleThird)
  const submitted = useBracketStore((s) => s.submitted)

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
    const selected = picks.qualifiedThirdTeamIds?.length ?? 0
    const ready = thirdsComplete(picks)

    // Pool: all non-top-2 teams from every complete group
    const thirdsPool = groups
      .filter((g) => isGroupComplete(picks, g.id))
      .flatMap((g) => {
        const top2 = new Set(picks.groupRanks[g.id]?.slice(0, 2) ?? [])
        return g.teamIds
          .filter((id) => !top2.has(id))
          .map((id) => ({ teamId: id, groupId: g.id }))
      })

    return (
      <Screen title="Best Thirds" back={() => setStep('groups')}>
        <div className={styles.thirdsHead}>
          <p className="wc-eyebrow">Final qualifying spots</p>
          <h2 className={styles.thirdsTitle}>Pick the 8 best 3rd-place teams</h2>
          <p className={styles.thirdsSub}>
            Teams that didn't finish in the top 2 of their group — pick the 8
            you think advance to the Round of 32 as best-thirds. Only one team
            per group can qualify.
          </p>
          <div className={styles.counter}>
            <Chip tone={ready ? 'green' : 'gold'}>
              {selected} / {THIRDS_REQUIRED} selected
            </Chip>
          </div>
        </div>

        <div className={styles.thirdsList}>
          {(() => {
            const pickedGroups = new Set(
              (picks.qualifiedThirdTeamIds ?? []).map((id) => getTeam(id)?.group),
            )
            return thirdsPool.map(({ teamId, groupId }) => {
              const team = getTeam(teamId)
              const picked = (picks.qualifiedThirdTeamIds ?? []).includes(teamId)
              // Disabled if the limit is reached, or this team's group already
              // has a best-third chosen (one per group).
              const groupTaken = !picked && pickedGroups.has(groupId)
              const disabled = (selected >= THIRDS_REQUIRED && !picked) || groupTaken
              return (
                <TeamSticker
                  key={teamId}
                  team={team}
                  picked={picked}
                  eliminated={disabled}
                  meta={`Grp ${groupId}`}
                  onClick={() => toggleThird(teamId)}
                />
              )
            })
          })()}
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
      {submitted && (
        <div style={{ marginBottom: 'var(--wc-space-3)', textAlign: 'center' }}>
          <Chip tone="green">🔒 Bracket submitted — picks are locked</Chip>
        </div>
      )}
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
          <p style={{ textAlign: 'center', color: 'var(--wc-color-ink-soft)', fontSize: 'var(--wc-text-sm)', marginTop: 'var(--wc-space-2)' }}>
            {12 - groupsDone} group{12 - groupsDone !== 1 ? 's' : ''} left to pick
          </p>
        )}
      </div>
    </Screen>
  )
}
