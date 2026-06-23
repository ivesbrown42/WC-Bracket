import type { GroupId } from '../../data/types'
import { getTeam } from '../../data/worldCup2026'
import { StickerCard, TeamSticker, Badge } from '../ui'
import styles from './GroupCard.module.css'

export interface GroupCardProps {
  groupId: GroupId
  teamIds: string[]
  /** Current ranking (ordered team ids). */
  ranks: string[]
  onPickTeam: (teamId: string) => void
}

const rankMeta = ['1st', '2nd']

/**
 * One group: tap to pick the two teams you think finish 1st & 2nd (they
 * advance). Tapping a ranked team unranks it. Best-third qualification for
 * the other teams is handled separately in the Best Thirds step.
 */
export function GroupCard({
  groupId,
  teamIds,
  ranks,
  onPickTeam,
}: GroupCardProps) {
  // The two advancing picks. Keep only real members of this group and cap at
  // two — guards against stale data (older builds ranked 3rd/4th, or held a
  // stray team id from a different group).
  const picks = ranks.filter((id) => teamIds.includes(id)).slice(0, 2)

  return (
    <StickerCard className={styles.card}>
      <div className={styles.header}>
        <Badge tone="red">{groupId}</Badge>
        <span className={styles.groupLabel}>Group {groupId}</span>
        <span className={styles.hint}>
          {picks.length >= 2 ? '✓ Top 2 picked' : 'Tap to pick your top 2'}
        </span>
      </div>

      <div className={styles.list}>
        {teamIds.map((id) => {
          const team = getTeam(id)
          // Only the first two ranks matter; ignore any stale extras.
          const rank = picks.indexOf(id)
          const advancing = rank >= 0

          return (
            <TeamSticker
              key={id}
              team={team}
              picked={advancing}
              onClick={() => onPickTeam(id)}
              trailing={
                advancing ? (
                  <span className={`${styles.rankBadge} ${styles.qualify}`}>{rank + 1}</span>
                ) : (
                  <span
                    className={styles.rankBadge}
                    style={{ background: 'transparent', color: 'var(--wc-color-ink-faint)', borderColor: 'var(--wc-color-paper-edge)' }}
                  >
                    ＋
                  </span>
                )
              }
              meta={advancing ? rankMeta[rank] : undefined}
            />
          )
        })}
      </div>
    </StickerCard>
  )
}
