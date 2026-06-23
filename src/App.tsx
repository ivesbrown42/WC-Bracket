import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useTeamTheme } from './components/theme'
import { AuthSync } from './components/auth/AuthSync'
import { useAuthStore } from './store/authStore'
import { Home } from './screens/Home'
import { Groups } from './screens/Groups'
import { Bracket } from './screens/Bracket'
import { Summary } from './screens/Summary'
import { TeamThemeStudio } from './screens/TeamThemeStudio'
import { Login } from './screens/Login'
import { Signup } from './screens/Signup'
import { Leaderboard } from './screens/Leaderboard'
import { ProfileSetup } from './screens/ProfileSetup'
import { ProfileView } from './screens/ProfileView'
import { SetPassword } from './screens/SetPassword'
import { HowScoring } from './screens/HowScoring'

function RequireAuth({ children }: { children: ReactNode }) {
  const user = useAuthStore((s) => s.user)
  const loading = useAuthStore((s) => s.loading)
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  useTeamTheme()
  const initialize = useAuthStore((s) => s.initialize)

  useEffect(() => {
    initialize()
  }, [])

  return (
    <>
      <AuthSync />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/share" element={<Summary shared />} />
        <Route path="/scoring" element={<HowScoring />} />
        <Route path="/groups"        element={<RequireAuth><Groups /></RequireAuth>} />
        <Route path="/bracket"       element={<RequireAuth><Bracket /></RequireAuth>} />
        <Route path="/summary"       element={<RequireAuth><Summary /></RequireAuth>} />
        <Route path="/theme"         element={<RequireAuth><TeamThemeStudio /></RequireAuth>} />
        <Route path="/profile-setup" element={<RequireAuth><ProfileSetup /></RequireAuth>} />
        <Route path="/set-password"  element={<RequireAuth><SetPassword /></RequireAuth>} />
        <Route path="/leaderboard"   element={<RequireAuth><Leaderboard /></RequireAuth>} />
        <Route path="/profile/:userId" element={<RequireAuth><ProfileView /></RequireAuth>} />
        <Route path="*" element={<Home />} />
      </Routes>
    </>
  )
}
