import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useBracketStore } from '../../store/bracketStore'
import { savePicks, loadPicks } from '../../lib/db'
import { getChampion } from '../../data/bracketLogic'

export function AuthSync() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const profile = useAuthStore((s) => s.profile)
  const picks = useBracketStore((s) => s.picks)
  const loadPicksAction = useBracketStore((s) => s.loadPicks)
  const prevUserRef = useRef<string | null>(null)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // On login: redirect to profile setup if not complete, else load DB picks
  useEffect(() => {
    if (!user || user.id === prevUserRef.current) return
    prevUserRef.current = user.id

    if (profile && !profile.favorite_team_id) {
      navigate('/profile-setup')
      return
    }

    loadPicks(user.id).then((dbPicks) => {
      if (dbPicks) {
        loadPicksAction(dbPicks)
      } else {
        savePicks(user.id, picks, getChampion(picks))
      }
    })
  }, [user?.id, profile?.favorite_team_id])

  // Debounce-save picks to DB on every change
  useEffect(() => {
    if (!user) return
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      savePicks(user.id, picks, getChampion(picks))
    }, 1200)
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
    }
  }, [user?.id, picks])

  return null
}
