import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Screen } from '../components/layout/Screen'
import { Avatar, Chip } from '../components/ui'
import { useAuthStore } from '../store/authStore'
import { getAllBrackets } from '../lib/db'
import { fetchResults } from '../lib/results'
import { scoreBracket } from '../data/scoring'
import { getChampion } from '../data/bracketLogic'
import { getTeam } from '../data/worldCup2026'
import styles from './Leaderboard.module.css'

const MEDALS = ['🥇', '🥈', '🥉']

interface Entry {
  userId: string
  displayName: string
  favoriteTeamId: string | null
  winnerPick: string | null
  score: number
}

export function Leaderboard() {
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)
  const [live, setLive] = useState(false)
  const [query, setQuery] = useState('')

  useEffect(() => {
    ;(async () => {
      const [brackets, results] = await Promise.all([
        getAllBrackets(),
        fetchResults(),
      ])
      setLive(results !== null)

      const scored: Entry[] = brackets.map((b) => {
        let score = 0
        let winnerPick: string | null = null
        try {
          if (results) score = scoreBracket(b.bracket, results).total
          winnerPick = getChampion(b.bracket)
        } catch {
          /* malformed bracket — leave at 0 */
        }
        return {
          userId: b.userId,
          displayName: b.displayName,
          favoriteTeamId: b.favoriteTeamId,
          winnerPick,
          score,
        }
      })

      scored.sort((a, b) => b.score - a.score || a.displayName.localeCompare(b.displayName))
      setEntries(scored)
      setLoading(false)
    })()
  }, [])

  return (
    <Screen title="Leaderboard" back="/">
      <p className={styles.eyebrow}>
        {live
          ? "Live scores — updates as matches finish"
          : "Scoring starts when the first group finishes"}
      </p>

      {loading && <p className={styles.empty}>Loading…</p>}

      {!loading && entries.length === 0 && (
        <p className={styles.empty}>No brackets submitted yet — be the first!</p>
      )}

      {!loading && entries.length > 0 && (
        <>
          <input
            type="text"
            className={styles.search}
            placeholder="Search players…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className={styles.feed}>
            {entries
              .filter((e) => e.displayName.toLowerCase().includes(query.trim().toLowerCase()))
              .map((entry) => {
                const winner = entry.winnerPick ? getTeam(entry.winnerPick) : undefined
                const isMe = entry.userId === user?.id
                const rank = entries.indexOf(entry)
                return (
                  <button
                    key={entry.userId}
                    className={[styles.card, isMe ? styles.cardMe : ''].join(' ')}
                    onClick={() => navigate(`/profile/${entry.userId}`)}
                  >
                    <span className={styles.medal}>{MEDALS[rank] ?? `#${rank + 1}`}</span>
                    <Avatar teamId={entry.favoriteTeamId} size={44} />
                    <div className={styles.info}>
                      <span className={styles.name}>
                        {entry.displayName}
                        {isMe && <span className={styles.you}> · you</span>}
                      </span>
                      {winner ? (
                        <span className={styles.pick}>
                          picks {winner.flag} {winner.name} to win
                        </span>
                      ) : (
                        <span className={styles.pick} style={{ opacity: 0.35 }}>
                          bracket not complete
                        </span>
                      )}
                    </div>
                    <Chip tone={entry.score > 0 ? 'green' : 'default'}>
                      {entry.score} pts
                    </Chip>
                  </button>
                )
              })}
          </div>
        </>
      )}
    </Screen>
  )
}
