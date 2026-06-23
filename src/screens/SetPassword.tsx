import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Screen } from '../components/layout/Screen'
import { Button } from '../components/ui'
import { useAuthStore } from '../store/authStore'
import styles from './Login.module.css'

export function SetPassword() {
  const navigate = useNavigate()
  const setPassword = useAuthStore((s) => s.setPassword)
  const [pw, setPw] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const pwError =
    pw.length > 0 && pw.length < 6
      ? 'Password must be at least 6 characters.'
      : confirm.length > 0 && pw !== confirm
        ? 'Passwords don’t match.'
        : null
  const pwMatch = pw.length >= 6 && confirm.length > 0 && pw === confirm

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (pw.length < 6) return setError('Password must be at least 6 characters.')
    if (pw !== confirm) return setError('Passwords don’t match.')
    setSaving(true)
    setError(null)
    const { error: err } = await setPassword(pw)
    setSaving(false)
    if (err) setError(err)
    else navigate('/')
  }

  return (
    <Screen title="Set a Password" back="/">
      <div className={styles.center}>
        <div className={styles.icon}>🔐</div>
        <h2 className={styles.heading}>Create a password</h2>
        <p className={styles.sub}>
          Set a password so you can sign in instantly next time — no email needed.
        </p>
        <form className={styles.form} onSubmit={handleSubmit}>
          <input
            type="password"
            className={styles.input}
            placeholder="New password (min 6 characters)"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            required
            autoFocus
          />
          <input
            type="password"
            className={styles.input}
            placeholder="Confirm password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
          {pwError && <p className={styles.error}>{pwError}</p>}
          {pwMatch && <p className={styles.ok}>Passwords match ✓</p>}
          {error && <p className={styles.error}>{error}</p>}
          <Button type="submit" variant="gold" size="lg" block disabled={saving || !pw || !confirm}>
            {saving ? 'Saving…' : 'Save password'}
          </Button>
          <button type="button" className={styles.skip} onClick={() => navigate('/')}>
            Skip for now
          </button>
        </form>
      </div>
    </Screen>
  )
}
