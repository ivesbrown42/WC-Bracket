import type { ReactNode } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { Avatar } from '../ui'
import styles from './Screen.module.css'

export interface ScreenProps {
  children: ReactNode
  /** Optional sticky top bar with a title. */
  title?: string
  /**
   * Show a back button. A string navigates there, `true` goes back one entry,
   * a function runs custom logic (e.g. step back within a screen).
   */
  back?: string | boolean | (() => void)
  /** Right-aligned top bar content. */
  action?: ReactNode
  /** Use the wider column (for the knockout bracket). */
  wide?: boolean
}

export function Screen({ children, title, back, action, wide }: ScreenProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const user = useAuthStore((s) => s.user)
  const profile = useAuthStore((s) => s.profile)

  // Persistent nav to Leaderboard + own Profile, for signed-in users on any
  // in-app screen (hidden on the auth flow where there's no signed-in user).
  const showNav = Boolean(user)
  const hasBar = Boolean(title || back || action || showNav)

  return (
    <div className={styles.screen}>
      {hasBar && (
        <header className={styles.topbar}>
          <div className={styles.topbarInner}>
            {back && (
              <button
                type="button"
                className={styles.back}
                aria-label="Go back"
                onClick={() => {
                  if (typeof back === 'function') back()
                  else if (typeof back === 'string') navigate(back)
                  else navigate(-1)
                }}
              >
                ‹
              </button>
            )}
            {title && <h2 className={styles.title}>{title}</h2>}
            <span className={styles.spacer} />
            {action}
            {showNav && (
              <nav className={styles.nav}>
                <button
                  type="button"
                  className={styles.navBtn}
                  aria-label="How scoring works"
                  title="How scoring works"
                  data-active={location.pathname === '/scoring'}
                  onClick={() => navigate('/scoring')}
                >
                  ℹ️
                </button>
                <button
                  type="button"
                  className={styles.navBtn}
                  aria-label="Leaderboard"
                  title="Leaderboard"
                  data-active={location.pathname === '/leaderboard'}
                  onClick={() => navigate('/leaderboard')}
                >
                  🏆
                </button>
                <button
                  type="button"
                  className={styles.navAvatar}
                  aria-label="Your profile"
                  title="Your profile"
                  data-active={location.pathname.startsWith('/profile/')}
                  onClick={() => navigate(`/profile/${user!.id}`)}
                >
                  <Avatar teamId={profile?.favorite_team_id} size={32} />
                </button>
              </nav>
            )}
          </div>
        </header>
      )}
      <div className={[styles.column, wide && styles.wide].filter(Boolean).join(' ')}>
        {children}
      </div>
    </div>
  )
}
