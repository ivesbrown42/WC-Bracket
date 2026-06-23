import { Screen } from '../components/layout/Screen'
import { POINTS } from '../data/scoring'
import styles from './HowScoring.module.css'

export function HowScoring() {
  return (
    <Screen title="How Scoring Works" back={true}>
      <p className={styles.intro}>
        You earn points as the tournament plays out — for every team you send to
        the right place, plus a bonus for nailing an exact matchup. Scores update
        automatically as matches finish.
      </p>

      {/* Group stage */}
      <section className={styles.section}>
        <h3 className={styles.heading}>① Group stage</h3>
        <ul className={styles.rules}>
          <li className={styles.rule}>
            <span className={styles.pts}>+{POINTS.groupAdvancer}</span>
            <span className={styles.ruleText}>
              for each team you correctly pick to finish <strong>top 2</strong> of
              its group (they advance).
            </span>
          </li>
          <li className={styles.rule}>
            <span className={styles.pts}>+{POINTS.bestThird}</span>
            <span className={styles.ruleText}>
              for each <strong>best-third</strong> you pick that actually advances.
            </span>
          </li>
        </ul>
        <p className={styles.note}>A perfectly-called group = 2 points.</p>
      </section>

      {/* Knockouts */}
      <section className={styles.section}>
        <h3 className={styles.heading}>② Knockout rounds</h3>
        <ul className={styles.rules}>
          <li className={styles.rule}>
            <span className={styles.pts}>+{POINTS.reachRound}</span>
            <span className={styles.ruleText}>
              for each team you correctly pick to <strong>win its match</strong> and
              reach the next round — every round, all the way to the champion.
            </span>
          </li>
          <li className={styles.rule}>
            <span className={styles.pts}>+{POINTS.matchupBonus}</span>
            <span className={styles.ruleText}>
              <strong>bonus</strong> when you predicted <strong>both teams</strong> of
              an elimination match — i.e. you called the exact matchup.
            </span>
          </li>
        </ul>
        <p className={styles.note}>
          So getting both teams of a real quarter-final right is worth more than
          just picking one winner — you score for the matchup <em>and</em> the
          survivors.
        </p>
      </section>

      {/* Max */}
      <section className={styles.maxBox}>
        <span className={styles.maxNum}>94</span>
        <span className={styles.maxLabel}>
          points for a perfect bracket
          <span className={styles.maxBreak}>
            24 groups · 8 thirds · 31 winners · 31 matchups
          </span>
        </span>
      </section>

      <p className={styles.foot}>
        Nothing counts until a group or round actually finishes — pending picks
        show a ⚪ on your profile, then flip to ✅ or ❌ once results are in.
      </p>
    </Screen>
  )
}
