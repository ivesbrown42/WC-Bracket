import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Screen } from '../components/layout/Screen'
import { Button, Chip, TeamSticker } from '../components/ui'
import { GroupCard } from '../components/bracket/GroupCard'
import { StageTabs, type StageTabItem, type StageTabState } from '../components/bracket/StageTabs'
import { useBracketStore } from '../store/bracketStore'
import { groups, groupIds, getTeam } from '../data/worldCup2026'
import {
  THIRDS_REQUIRED,
  allGroupsComplete,
  groupsCompletedCount,
  isGroupComplete,
  knockoutReady,
  thirdsComplete,
} from '../data/bracketLogic'

const KNOCKOUT_STAGES = [
  { id: 'R32', label: 'R32' },
  { id: 'R16', label: 'R16' },
  { id: 'QF', label: 'QF' },
  { id: 'SF', label: 'SF' },
  { id: 'F', label: 'Final' },
]
import { spring } from '../design/tokens'
import styles from './Groups.module.css'

export function Groups() {
  const navigate = useNavigate()
  const picks = useBracketStore((s) => s.picks)
  const cycleGroupPick = useBracketStore((s) => s.cycleGroupPick)
  const toggleThird = useBracketStore((s) => s.toggleThird)
  const submitted = useBracketStore((s) => s.submitted)

  const [step, setStep] = useState<'groups' | 'thirds'>('groups')
  // Start on the first incomplete group (or A if all are done).
  const [index, setIndex] = useState(() => {
    const f = groups.findIndex((g) => !isGroupComplete(picks, g.id))
    return f === -1 ? 0 : f
  })
  const [dir, setDir] = useState(1)

  const groupsDone = groupsCompletedCount(picks)
  const allDone = allGroupsComplete(picks)

  // Navigation gating: once every group is done you can roam freely; on the
  // first pass you can only revisit completed groups or open the next one.
  const freeRoam = allDone
  const frontier = groups.findIndex((g) => !isGroupComplete(picks, g.id))
  const canAccessGroup = (i: number) =>
    freeRoam || isGroupComplete(picks, groups[i].id) || i === frontier

  const go = (next: number) => {
    if (next < 0 || next > groupIds.length - 1) return
    if (!canAccessGroup(next)) return
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
      {/* Level 1 — stage nav (Groups · R32 · R16 · QF · SF · Final) */}
      <StageTabs
        items={[
          { key: 'groups', label: 'Groups', state: 'current' },
          ...KNOCKOUT_STAGES.map<StageTabItem>((s) => ({
            key: s.id,
            label: s.label,
            state: knockoutReady(picks) ? 'default' : 'locked',
            onClick: () => navigate('/bracket'),
          })),
        ]}
      />

      {/* Level 2 — group nav (A · B · C …) */}
      <StageTabs
        variant="text"
        items={groups.map<StageTabItem>((g, i) => {
          const complete = isGroupComplete(picks, g.id)
          const accessible = canAccessGroup(i)
          const state: StageTabState =
            i === index ? 'current' : !accessible ? 'locked' : complete ? 'done' : 'default'
          return { key: g.id, label: g.id, state, onClick: () => go(i) }
        })}
      />

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
          disabled={index === groupIds.length - 1 || !canAccessGroup(index + 1)}
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
