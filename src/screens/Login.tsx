import { useState } from 'react'
import { Screen } from '../components/layout/Screen'
import { Button } from '../components/ui'
import { useAuthStore } from '../store/authStore'
import styles from './Login.module.css'

export function Login() {
  const signInWithEmail = useAuthStore((s) => s.signInWithEmail)
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error: err } = await signInWithEmail(email)
    setLoading(false)
    if (err) {
      setError(err)
    } else {
      setSent(true)
    }
  }

  if (sent) {
    return (
      <Screen title="Check your email" back="/">
        <div className={styles.center}>
          <div className={styles.icon}>📬</div>
          <h2 className={styles.heading}>Magic link sent!</h2>
          <p className={styles.sub}>
            We emailed a sign-in link to <strong>{email}</strong>.<br />
            Open it on this device to continue.
          </p>
          <Button variant="secondary" onClick={() => setSent(false)}>
            Use a different email
          </Button>
        </div>
      </Screen>
    )
  }

  return (
    <Screen title="Sign In" back="/">
      <div className={styles.center}>
        <div className={styles.icon}>⚽</div>
        <h2 className={styles.heading}>Join the competition</h2>
        <p className={styles.sub}>
          Enter your email — we'll send you a magic link. No password needed.
        </p>
        <form className={styles.form} onSubmit={handleSubmit}>
          <input
            type="email"
            className={styles.input}
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
          />
          {error && <p className={styles.error}>{error}</p>}
          <Button
            type="submit"
            variant="gold"
            size="lg"
            block
            disabled={loading || !email}
          >
            {loading ? 'Sending…' : 'Send magic link →'}
          </Button>
        </form>
      </div>
    </Screen>
  )
}
