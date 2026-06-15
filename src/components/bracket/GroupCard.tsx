import type { GroupId } from '../../data/types'
import { getTeam } from '../../data/worldCup2026'
import { StickerCard, TeamSticker, Badge, Button } from '../ui'
import styles from './GroupCard.module.css'

export interface GroupCardProps {
  groupId: GroupId
  teamIds: string[]
  /** Current ranking (ordered team ids). */
  ranks: string[]
  onPickTeam: (teamId: string) => void
  onClear: () => void
}

const rankMeta = ['1st', '2nd', '3rd', '4th']

/**
 * One group: tap teams in order of finish. 1st & 2nd advance (green),
 * 3rd may qualify (amber), 4th is out. Tapping a ranked team unranks it.
 */
export function GroupCard({
  groupId,
  teamIds,
  ranks,
  onPickTeam,
  onClear,
}: GroupCardProps) {
  return (
    <StickerCard className={styles.card}>
      <div className={styles.header}>
        <Badge tone="red">{groupId}</Badge>
        <span className={styles.groupLabel}>Group {groupId}</span>
        <span className={styles.hint}>
          {ranks.length >= 3 ? 'Tap to re-order' : 'Tap to rank →'}
        </span>
      </div>

      <div className={styles.list}>
        {teamIds.map((id) => {
          const team = getTeam(id)
          const rank = ranks.indexOf(id) // -1 if unranked
          const ranked = rank >= 0
          const advancing = rank === 0 || rank === 1
          const isThird = rank === 2
          const out = rank === 3

          const badgeClass = [
            styles.rankBadge,
            advancing && styles.qualify,
            isThird && styles.third,
            out && styles.out,
          ]
            .filter(Boolean)
            .join(' ')

          return (
            <TeamSticker
              key={id}
              team={team}
              picked={advancing}
              eliminated={out}
              onClick={() => onPickTeam(id)}
              trailing={
                ranked ? (
                  <span className={badgeClass}>{rank + 1}</span>
                ) : (
                  <span className={styles.rankBadge} style={{ background: 'transparent', color: 'var(--wc-color-ink-faint)', borderColor: 'var(--wc-color-paper-edge)' }}>
                    ＋
                  </span>
                )
              }
              meta={ranked ? rankMeta[rank] : undefined}
            />
          )
        })}
      </div>

      {ranks.length > 0 && (
        <div>
          <Button variant="ghost" size="sm" onClick={onClear}>
            ↺ Reset group
          </Button>
        </div>
      )}
    </StickerCard>
  )
}
