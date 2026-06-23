import { useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useBracketStore } from '../../store/bracketStore'
import { savePicks, loadPicks, getLockStatus } from '../../lib/db'
import { getChampion } from '../../data/bracketLogic'

export function AuthSync() {
  const navigate = useNavigate()
  const location = useLocation()
  const user = useAuthStore((s) => s.user)
  const profile = useAuthStore((s) => s.profile)
  const picks = useBracketStore((s) => s.picks)
  const submitted = useBracketStore((s) => s.submitted)
  const loadPicksAction = useBracketStore((s) => s.loadPicks)
  const setSubmitted = useBracketStore((s) => s.setSubmitted)
  const prevUserRef = useRef<string | null>(null)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // On login: redirect to profile setup if not complete, else load DB picks
  useEffect(() => {
    if (!user || user.id === prevUserRef.current) return
    prevUserRef.current = user.id

    // Safety net for accounts missing a team (e.g. magic-link recovery logins).
    // Only fire from the home screen so it never interrupts an intentional
    // navigation (signup → /groups, etc.) while the profile is still settling.
    if (profile && !profile.favorite_team_id && location.pathname === '/') {
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
    // Sync the locked/submitted flag from the server.
    getLockStatus(user.id).then((locked) => setSubmitted(locked))
  }, [user?.id, profile?.favorite_team_id])

  // Debounce-save picks to DB on every change — never after submission (locked).
  useEffect(() => {
    if (!user || submitted) return
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      savePicks(user.id, picks, getChampion(picks))
    }, 1200)
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
    }
  }, [user?.id, picks, submitted])

  return null
}
