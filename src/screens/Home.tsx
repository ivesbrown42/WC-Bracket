import { useNavigate } from 'react-router-dom'
import { Screen } from '../components/layout/Screen'
import { Button, Chip, ProgressBar } from '../components/ui'
import { useBracketStore } from '../store/bracketStore'
import {
  getChampion,
  groupsCompletedCount,
  knockoutReady,
} from '../data/bracketLogic'
import { getTeam } from '../data/worldCup2026'
import styles from './Home.module.css'

export function Home() {
  const navigate = useNavigate()
  const picks = useBracketStore((s) => s.picks)

  const groupsDone = groupsCompletedCount(picks)
  const champion = getTeam(getChampion(picks))
  const started = groupsDone > 0 || Object.keys(picks.knockoutPicks).length > 0
  const ready = knockoutReady(picks)

  return (
    <Screen>
      <div className={styles.hero}>
        <span className={styles.kicker}>★ Pick · Predict · Brag ★</span>

        <div className={styles.pack} aria-hidden>
          <div className={styles.packSticker}>🇧🇷</div>
          <div className={styles.packSticker}>🇫🇷</div>
          <div className={styles.packSticker}>🏆</div>
          <div className={styles.packSticker}>🇦🇷</div>
        </div>

        <h1 className={styles.title}>
          Sticker
          <span>Cup '26</span>
        </h1>
        <p className={styles.subtitle}>
          Fill out your World Cup 2026 bracket, pick a champion, and share your
          picks with friends. 48 teams, one shot at glory.
        </p>

        {started && (
          <div style={{ width: '100%', maxWidth: 320 }}>
            <ProgressBar total={12} completed={groupsDone} label="Groups picked" />
            {champion && (
              <div style={{ marginTop: 12 }}>
                <Chip tone="gold">🏆 Your pick: {champion.name}</Chip>
              </div>
            )}
          </div>
        )}

        <div className={styles.actions}>
          <Button
            variant="primary"
            size="lg"
            block
            onClick={() => navigate('/groups')}
          >
            {started ? 'Continue Bracket' : 'Start Your Bracket'}
          </Button>
          {ready && (
            <Button variant="gold" block onClick={() => navigate('/summary')}>
              🎉 View Your Bracket
            </Button>
          )}
        </div>
      </div>

      <div className={styles.footer}>
        <button className={styles.link} onClick={() => navigate('/style-guide')}>
          Design system
        </button>
        <span className={styles.foot}>Made for fun · not affiliated with FIFA</span>
      </div>
    </Screen>
  )
}
