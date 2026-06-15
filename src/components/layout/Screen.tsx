import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
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

  return (
    <div className={styles.screen}>
      {(title || back || action) && (
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
          </div>
        </header>
      )}
      <div className={[styles.column, wide && styles.wide].filter(Boolean).join(' ')}>
        {children}
      </div>
    </div>
  )
}
