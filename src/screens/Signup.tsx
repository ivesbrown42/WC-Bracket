import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Screen } from '../components/layout/Screen'
import { Button, Avatar } from '../components/ui'
import { useAuthStore } from '../store/authStore'
import { saveProfile } from '../lib/db'
import { teams } from '../data/worldCup2026'
import { spring } from '../design/tokens'
import styles from './ProfileSetup.module.css'

const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim())

export function Signup() {
  const navigate = useNavigate()
  const signUp = useAuthStore((s) => s.signUp)
  const refreshProfile = useAuthStore((s) => s.refreshProfile)

  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [pw, setPw] = useState('')
  const [confirm, setConfirm] = useState('')
  const [teamId, setTeamId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const pwError =
    pw.length > 0 && pw.length < 6
      ? 'Password must be at least 6 characters.'
      : confirm.length > 0 && pw !== confirm
        ? 'Passwords don’t match.'
        : null
  const pwMatch = pw.length >= 6 && confirm.length > 0 && pw === confirm

  const canSave =
    email.trim().length > 0 &&
    name.trim().length > 0 &&
    pw.length >= 6 &&
    pw === confirm &&
    teamId !== null

  const handleSubmit = async () => {
    if (!canSave) return
    if (!isValidEmail(email)) return setError('Enter a valid email address.')
    setSaving(true)
    setError(null)
    const { error: signErr, userId } = await signUp(email.trim(), pw)
    if (signErr || !userId) {
      setSaving(false)
      setError(signErr ?? 'Could not create account.')
      return
    }
    await saveProfile(userId, name.trim(), teamId!)
    await refreshProfile()
    setSaving(false)
    navigate('/groups')
  }

  return (
    <Screen title="Create Account" back="/">
      <div className={styles.wrap}>
        <motion.div
          key={teamId ?? 'default'}
          initial={{ scale: 0.85, opacity: 0.6 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={spring.soft}
          className={styles.avatarWrap}
        >
          <Avatar teamId={teamId} size={80} />
        </motion.div>

        <div className={styles.field}>
          <label className={styles.label}>Email</label>
          <input
            type="email"
            className={styles.input}
            placeholder="you@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoFocus
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Username</label>
          <input
            type="text"
            className={styles.input}
            placeholder="Your name or nickname"
            value={name}
            maxLength={20}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Password</label>
          <input
            type="password"
            className={styles.input}
            placeholder="Min 6 characters"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
          />
          <input
            type="password"
            className={styles.input}
            placeholder="Confirm password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            style={{ marginTop: 'var(--wc-space-2)' }}
          />
          {pwError && <p className={`${styles.validation} ${styles.error}`}>{pwError}</p>}
          {pwMatch && <p className={`${styles.validation} ${styles.ok}`}>Passwords match ✓</p>}
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Which team do you support?</label>
          <p className={styles.hint}>Sets your avatar — separate from who you pick to win.</p>
          <div className={styles.teamGrid}>
            {teams.map((t) => (
              <button
                key={t.id}
                className={[styles.teamBtn, teamId === t.id && styles.teamBtnActive].filter(Boolean).join(' ')}
                style={teamId === t.id ? { background: t.colors[0], borderColor: t.colors[0] } : {}}
                onClick={() => setTeamId(t.id)}
                title={t.name}
              >
                {t.flag}
              </button>
            ))}
          </div>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.actions}>
          <Button variant="gold" size="lg" block disabled={!canSave || saving} onClick={handleSubmit}>
            {saving ? 'Creating…' : 'Create account →'}
          </Button>
          <button className={styles.linkBtn} onClick={() => navigate('/login')}>
            Already have an account? Sign in
          </button>
        </div>
      </div>
    </Screen>
  )
}
