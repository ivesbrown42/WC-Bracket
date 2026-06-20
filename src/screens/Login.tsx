import { useState } from 'react'
import { Screen } from '../components/layout/Screen'
import { Button } from '../components/ui'
import { useAuthStore } from '../store/authStore'
import styles from './Login.module.css'

type Mode = 'password' | 'magic'

export function Login() {
  const signInWithEmail = useAuthStore((s) => s.signInWithEmail)
  const signInWithPassword = useAuthStore((s) => s.signInWithPassword)

  const [mode, setMode] = useState<Mode>('password')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error: err } = await signInWithPassword(email, password)
    setLoading(false)
    if (err) setError(err)
    // On success, AuthSync + RequireAuth route the user onward automatically.
  }

  const handleMagic = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error: err } = await signInWithEmail(email)
    setLoading(false)
    if (err) setError(err)
    else setSent(true)
  }

  if (sent) {
    return (
      <Screen title="Check your email" back="/">
        <div className={styles.center}>
          <div className={styles.icon}>📬</div>
          <h2 className={styles.heading}>Magic link sent!</h2>
          <p className={styles.sub}>
            We emailed a sign-in link to <strong>{email}</strong>.<br />
            Open it on this device. You can set a password afterward so next time
            you can skip the email.
          </p>
          <Button variant="secondary" onClick={() => setSent(false)}>
            Back
          </Button>
        </div>
      </Screen>
    )
  }

  return (
    <Screen title="Sign In" back="/">
      <div className={styles.center}>
        <div className={styles.icon}>⚽</div>
        <h2 className={styles.heading}>
          {mode === 'password' ? 'Welcome back' : 'Get a magic link'}
        </h2>
        <p className={styles.sub}>
          {mode === 'password'
            ? 'Sign in with your email and password.'
            : "First time, or forgot your password? We'll email you a one-tap sign-in link."}
        </p>

        {mode === 'password' ? (
          <form className={styles.form} onSubmit={handlePassword}>
            <input
              type="email"
              className={styles.input}
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
            <input
              type="password"
              className={styles.input}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && <p className={styles.error}>{error}</p>}
            <Button type="submit" variant="gold" size="lg" block disabled={loading || !email || !password}>
              {loading ? 'Signing in…' : 'Sign In →'}
            </Button>
            <button type="button" className={styles.skip} onClick={() => { setMode('magic'); setError(null) }}>
              First time, or forgot password? Email me a link
            </button>
          </form>
        ) : (
          <form className={styles.form} onSubmit={handleMagic}>
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
            <Button type="submit" variant="gold" size="lg" block disabled={loading || !email}>
              {loading ? 'Sending…' : 'Send magic link →'}
            </Button>
            <button type="button" className={styles.skip} onClick={() => { setMode('password'); setError(null) }}>
              Sign in with a password instead
            </button>
          </form>
        )}
      </div>
    </Screen>
  )
}
