import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Screen } from '../components/layout/Screen'
import { Button } from '../components/ui'
import { ThemeFrame, ThemeSwatch } from '../components/theme'
import { useBracketStore } from '../store/bracketStore'
import { teams } from '../data/worldCup2026'
import { PATTERNS, themeColors, normalizeTheme } from '../data/theme'
import type { TeamTheme, BorderPattern } from '../data/theme'
import { spring } from '../design/tokens'
import styles from './TeamThemeStudio.module.css'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className={styles.section}>
      <p className={`wc-eyebrow ${styles.sectionTitle}`}>{title}</p>
      <div className={styles.row}>{children}</div>
    </div>
  )
}

export function TeamThemeStudio() {
  const navigate = useNavigate()
  const saved = useBracketStore((s) => s.picks.theme)
  const setTheme = useBracketStore((s) => s.setTheme)

  const [working, setWorking] = useState<TeamTheme>(normalizeTheme(saved))
  const team = teams.find((t) => t.id === working.teamId)
  const { colors } = themeColors(working)

  const save = () => {
    setTheme(working)
    navigate(-1)
  }

  return (
    <Screen title="Choose Your Team" back="/">
      <div className={styles.wrap}>
        {/* Live preview frame */}
        <motion.div
          key={working.teamId}
          initial={{ scale: 0.96, opacity: 0.7 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={spring.soft}
          className={styles.preview}
        >
          <ThemeFrame inline theme={working}>
            <div className={styles.previewContent}>
              <div className={styles.flagBig}>{team?.flag || '🏳️'}</div>
              <div className={styles.teamName}>{team?.name || 'Select a team'}</div>
            </div>
          </ThemeFrame>
        </motion.div>

        {/* Team selector: 48 flags in grid */}
        <Section title="Your Team">
          <div className={styles.teamGrid}>
            {teams.map((t) => (
              <button
                key={t.id}
                className={[
                  styles.teamBtn,
                  working.teamId === t.id && styles.teamBtnActive,
                ].filter(Boolean).join(' ')}
                onClick={() => setWorking((w) => ({ ...w, teamId: t.id, highlightIndex: 0 }))}
                title={t.name}
              >
                {t.flag}
              </button>
            ))}
          </div>
        </Section>

        {/* Pattern selector */}
        <Section title="Border Pattern">
          <div className={styles.patternRow}>
            {PATTERNS.map((p) => (
              <button
                key={p.id}
                className={[styles.patternBtn, working.pattern === p.id && styles.patternBtnActive]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => setWorking((w) => ({ ...w, pattern: p.id as BorderPattern }))}
                title={p.label}
              >
                <ThemeSwatch theme={working} size={36} />
                <span className={styles.patternLabel}>{p.label}</span>
              </button>
            ))}
          </div>
        </Section>

        {/* Highlight color (from team's flag colors) */}
        {colors.length > 0 && (
          <Section title="Highlight Color">
            <div className={styles.colorRow}>
              {colors.map((c, i) => (
                <button
                  key={i}
                  className={[styles.colorBtn, working.highlightIndex === i && styles.colorBtnActive]
                    .filter(Boolean)
                    .join(' ')}
                  style={{ background: c }}
                  onClick={() => setWorking((w) => ({ ...w, highlightIndex: i }))}
                  title={`Color ${i + 1}`}
                />
              ))}
            </div>
          </Section>
        )}

        <div className={styles.actions}>
          <Button variant="primary" size="lg" block onClick={save}>
            ✓ Set My Theme
          </Button>
          <Button variant="ghost" block onClick={() => navigate(-1)}>
            Cancel
          </Button>
        </div>

        <div style={{ height: 24 }} />
      </div>
    </Screen>
  )
}
