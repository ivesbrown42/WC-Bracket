import { getTeam } from '../../data/worldCup2026'

interface AvatarProps {
  teamId?: string | null
  size?: number
  className?: string
}

export function Avatar({ teamId, size = 40, className }: AvatarProps) {
  const team = getTeam(teamId ?? undefined)
  const bg = team?.colors[0] ?? '#888'

  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.5,
        flexShrink: 0,
        border: '2.5px solid rgba(0,0,0,0.12)',
        boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
        lineHeight: 1,
      }}
      title={team?.name}
    >
      {team?.flag ?? '⚽'}
    </div>
  )
}
