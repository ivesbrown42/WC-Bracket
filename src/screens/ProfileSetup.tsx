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

export function ProfileSetup() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const profile = useAuthStore((s) => s.profile)
  const refreshProfile = useAuthStore((s) => s.refreshProfile)
  const setPassword = useAuthStore((s) => s.setPassword)

  const [name, setName] = useState(profile?.display_name ?? '')
  const [teamId, setTeamId] = useState<string | null>(null)
  const [pw, setPw] = useState('')
  const [confirm, setConfirm] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSave =
    name.trim().length > 0 && teamId !== null && pw.length >= 6 && pw === confirm

  const handleSave = async () => {
    if (!user || !canSave) return
    setSaving(true)
    setError(null)
    await saveProfile(user.id, name.trim(), teamId!)
    const { error: pwErr } = await setPassword(pw)
    await refreshProfile()
    setSaving(false)
    if (pwErr) {
      // Profile saved, but password failed — let them retry / set it later.
      setError(`Profile saved, but password could not be set: ${pwErr}`)
      return
    }
    navigate('/')
  }

  return (
    <Screen title="Set Up Your Profile">
      <div className={styles.wrap}>

        {/* Live avatar preview */}
        <motion.div
          key={teamId ?? 'default'}
          initial={{ scale: 0.85, opacity: 0.6 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={spring.soft}
          className={styles.avatarWrap}
        >
          <Avatar teamId={teamId} size={80} />
        </motion.div>

        {/* Name */}
        <div className={styles.field}>
          <label className={styles.label}>What should we call you?</label>
          <input
            type="text"
            className={styles.input}
            placeholder="Your name or nickname"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={20}
            autoFocus
          />
        </div>

        {/* Team picker */}
        <div className={styles.field}>
          <label className={styles.label}>Which team do you support?</label>
          <p className={styles.hint}>This sets your profile avatar — separate from who you pick to win.</p>
          <div className={styles.teamGrid}>
            {teams.map((t) => (
              <button
                key={t.id}
                className={[
                  styles.teamBtn,
                  teamId === t.id && styles.teamBtnActive,
                ].filter(Boolean).join(' ')}
                style={teamId === t.id ? { background: t.colors[0], borderColor: t.colors[0] } : {}}
                onClick={() => setTeamId(t.id)}
                title={t.name}
              >
                {t.flag}
              </button>
            ))}
          </div>
        </div>

        {/* Password */}
        <div className={styles.field}>
          <label className={styles.label}>Create a password</label>
          <p className={styles.hint}>So you can sign in instantly next time — no email needed.</p>
          <input
            type="password"
            className={styles.input}
            placeholder="Password (min 6 characters)"
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
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.actions}>
          <Button
            variant="gold"
            size="lg"
            block
            disabled={!canSave || saving}
            onClick={handleSave}
          >
            {saving ? 'Saving…' : "Let's go →"}
          </Button>
        </div>
      </div>
    </Screen>
  )
}
