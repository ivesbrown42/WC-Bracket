import type { ResolvedMatch } from '../../data/types'
import { getTeam } from '../../data/worldCup2026'
import { StickerCard, TeamSticker } from '../ui'
import styles from './MatchCard.module.css'

export interface MatchCardProps {
  match: ResolvedMatch
  label?: string
  /** Slot labels shown when a side isn't resolved yet (e.g. "Winner R32-1"). */
  homePlaceholder?: string
  awayPlaceholder?: string
  onPick: (side: 'home' | 'away') => void
}

/** A single knockout fixture: tap a team to send it through. */
export function MatchCard({
  match,
  label,
  homePlaceholder = 'TBD',
  awayPlaceholder = 'TBD',
  onPick,
}: MatchCardProps) {
  const home = getTeam(match.homeTeamId)
  const away = getTeam(match.awayTeamId)
  const decided = match.winnerTeamId != null

  return (
    <StickerCard className={styles.card} foil={match.round === 'F' && decided}>
      {label && <span className={styles.label}>{label}</span>}
      <TeamSticker
        team={home}
        size="sm"
        emptyLabel={homePlaceholder}
        picked={decided && match.winnerTeamId === match.homeTeamId}
        eliminated={decided && match.winnerTeamId !== match.homeTeamId}
        onClick={home ? () => onPick('home') : undefined}
      />
      <span className={styles.vs}>vs</span>
      <TeamSticker
        team={away}
        size="sm"
        emptyLabel={awayPlaceholder}
        picked={decided && match.winnerTeamId === match.awayTeamId}
        eliminated={decided && match.winnerTeamId !== match.awayTeamId}
        onClick={away ? () => onPick('away') : undefined}
      />
    </StickerCard>
  )
}
