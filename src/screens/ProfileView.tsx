import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Screen } from '../components/layout/Screen'
import { Avatar } from '../components/ui'
import { getProfile, type BracketRow } from '../lib/db'
import { fetchResults } from '../lib/results'
import {
  reviewBracket,
  type BracketReview,
  type ReviewItem,
  type MatchReview,
} from '../data/scoring'
import type { RoundId } from '../data/types'
import { getChampion } from '../data/bracketLogic'
import { getTeam } from '../data/worldCup2026'
import styles from './ProfileView.module.css'

const EMPTY_RESULTS = { groupAdvancers: {}, bestThirds: [], reached: {}, matchups: {} }

type TabId = 'groups' | RoundId
const TABS: { id: TabId; label: string }[] = [
  { id: 'groups', label: 'Groups' },
  { id: 'R32', label: 'R32' },
  { id: 'R16', label: 'R16' },
  { id: 'QF', label: 'QF' },
  { id: 'SF', label: 'SF' },
  { id: 'F', label: 'Final' },
]

const STATUS_ICON: Record<ReviewItem['status'], string> = {
  correct: '✅',
  wrong: '❌',
  pending: '⚪',
}

function TeamRow({ item }: { item: ReviewItem }) {
  const team = getTeam(item.teamId)
  return (
    <div className={[styles.row, styles[`row_${item.status}`]].join(' ')}>
      <span className={styles.flag}>{team?.flag ?? '🏳️'}</span>
      <span className={styles.teamName}>{team?.name ?? item.teamId}</span>
      <span className={styles.status}>{STATUS_ICON[item.status]}</span>
    </div>
  )
}

function MatchCard({ m, label }: { m: MatchReview; label: string }) {
  const renderSide = (teamId: string | null) => {
    const team = getTeam(teamId ?? undefined)
    const isPick = teamId != null && m.pickedWinner === teamId
    // The picked winner row carries the winner-correct color; the other is neutral.
    const cls = [styles.row, isPick ? styles[`row_${m.winnerStatus}`] : '']
      .filter(Boolean)
      .join(' ')
    return (
      <div className={cls}>
        <span className={styles.flag}>{team?.flag ?? '🏳️'}</span>
        <span className={styles.teamName}>{team?.name ?? 'TBD'}</span>
        {isPick && <span className={styles.crown} title="Your pick to win">👑</span>}
        {isPick && <span className={styles.status}>{STATUS_ICON[m.winnerStatus]}</span>}
      </div>
    )
  }

  return (
    <div className={styles.matchCard}>
      <div className={styles.matchLabel}>{label}</div>
      {renderSide(m.home)}
      {renderSide(m.away)}
      <div className={styles.matchupLine}>
        Exact matchup {STATUS_ICON[m.matchupStatus]}
      </div>
    </div>
  )
}

export function ProfileView() {
  const { userId } = useParams<{ userId: string }>()
  const navigate = useNavigate()
  const [data, setData] = useState<BracketRow | null>(null)
  const [review, setReview] = useState<BracketReview | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<TabId>('groups')

  useEffect(() => {
    if (!userId) return
    ;(async () => {
      const [profile, results] = await Promise.all([getProfile(userId), fetchResults()])
      setData(profile)
      if (profile) setReview(reviewBracket(profile.bracket, results ?? EMPTY_RESULTS))
      setLoading(false)
    })()
  }, [userId])

  if (loading) {
    return <Screen title="Profile" back="/leaderboard"><p className={styles.empty}>Loading…</p></Screen>
  }
  if (!data || !review) {
    return <Screen title="Profile" back="/leaderboard"><p className={styles.empty}>No bracket found for this player.</p></Screen>
  }

  const supported = getTeam(data.favoriteTeamId)
  const champion = getTeam(getChampion(data.bracket))
  const roundData = tab !== 'groups' ? review.rounds.find((r) => r.round === tab) : null
  const roundLabel = TABS.find((t) => t.id === tab)!.label

  return (
    <Screen title="Profile" back={() => navigate('/leaderboard')}>
      <div className={styles.header}>
        <Avatar teamId={data.favoriteTeamId} size={72} />
        <div className={styles.headInfo}>
          <h2 className={styles.name}>{data.displayName}</h2>
          {supported && (
            <span className={styles.meta}>Supports {supported.flag} {supported.name}</span>
          )}
          {champion ? (
            <span className={styles.meta}>🏆 Picks {champion.flag} {champion.name}</span>
          ) : (
            <span className={styles.meta} style={{ opacity: 0.5 }}>No champion picked</span>
          )}
        </div>
        <div className={styles.scoreBox}>
          <span className={styles.scoreNum}>{review.total}</span>
          <span className={styles.scoreLabel}>pts</span>
        </div>
      </div>

      <div className={styles.tabs}>
        {TABS.map((t) => (
          <button
            key={t.id}
            className={[styles.tab, tab === t.id && styles.tabActive].filter(Boolean).join(' ')}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className={styles.content}>
        {tab === 'groups' && (
          <>
            {review.groups.map((g) => (
              <div key={g.group} className={styles.section}>
                <p className={styles.sectionTitle}>Group {g.group}</p>
                {g.items.map((it, i) => <TeamRow key={i} item={it} />)}
              </div>
            ))}
            {review.thirds.length > 0 && (
              <div className={styles.section}>
                <p className={styles.sectionTitle}>Best Thirds</p>
                {review.thirds.map((it, i) => <TeamRow key={i} item={it} />)}
              </div>
            )}
          </>
        )}

        {tab !== 'groups' && (
          <>
            {roundData && roundData.matches.some((m) => m.home || m.away) ? (
              roundData.matches.map((m, i) => (
                <MatchCard key={m.matchId} m={m} label={`${roundLabel} · ${i + 1}`} />
              ))
            ) : (
              <p className={styles.empty}>No picks for this round yet.</p>
            )}
          </>
        )}
      </div>
    </Screen>
  )
}
