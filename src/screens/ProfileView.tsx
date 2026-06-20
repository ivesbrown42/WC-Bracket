import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Screen } from '../components/layout/Screen'
import { Avatar } from '../components/ui'
import { getProfile, type BracketRow } from '../lib/db'
import { fetchResults } from '../lib/results'
import { reviewBracket, type BracketReview, type ReviewItem, type KnockoutStage } from '../data/scoring'
import { getChampion } from '../data/bracketLogic'
import { getTeam } from '../data/worldCup2026'
import styles from './ProfileView.module.css'

const EMPTY_RESULTS = { groupAdvancers: {}, bestThirds: [], reached: {}, matchups: {} }

type TabId = 'groups' | 'R16' | 'QF' | 'SF' | 'final'
const TABS: { id: TabId; label: string }[] = [
  { id: 'groups', label: 'Groups' },
  { id: 'R16', label: 'Round of 16' },
  { id: 'QF', label: 'Quarters' },
  { id: 'SF', label: 'Semis' },
  { id: 'final', label: 'Final' },
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

function stageItems(review: BracketReview, stage: KnockoutStage): ReviewItem[] {
  return review.stages.find((s) => s.stage === stage)?.items ?? []
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

  return (
    <Screen title="Profile" back={() => navigate('/leaderboard')}>
      {/* Header */}
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

      {/* Sub-navigation */}
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

      {/* Content */}
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

        {(tab === 'R16' || tab === 'QF' || tab === 'SF') && (
          <div className={styles.section}>
            <p className={styles.sectionTitle}>Predicted to reach the {TABS.find((t) => t.id === tab)!.label}</p>
            {stageItems(review, tab).map((it, i) => <TeamRow key={i} item={it} />)}
            {stageItems(review, tab).length === 0 && (
              <p className={styles.empty}>No picks for this round yet.</p>
            )}
          </div>
        )}

        {tab === 'final' && (
          <>
            <div className={styles.section}>
              <p className={styles.sectionTitle}>Predicted finalists</p>
              {stageItems(review, 'F').map((it, i) => <TeamRow key={i} item={it} />)}
            </div>
            <div className={styles.section}>
              <p className={styles.sectionTitle}>Predicted champion</p>
              {stageItems(review, 'CHAMP').map((it, i) => <TeamRow key={i} item={it} />)}
              {stageItems(review, 'CHAMP').length === 0 && (
                <p className={styles.empty}>No champion picked yet.</p>
              )}
            </div>
          </>
        )}
      </div>
    </Screen>
  )
}
